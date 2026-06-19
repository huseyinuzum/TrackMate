import networkx as nx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from datetime import datetime, date, timedelta
from uuid import UUID

from app.models.place import Place
from app.models.route import Route, RoutePlace
from app.services.maps_service import get_distance_matrix

async def generate_optimized_route(
    db: AsyncSession, user_id: UUID, places: list[Place], max_duration_mins: int, max_budget: float | None
) -> UUID:
    if not places:
        raise ValueError("Rota oluşturmak için mekan bulunamadı.")
        
    # Performans ve API limiti için en iyi eşleşen 10 mekanı alalım
    places = places[:10]
    coordinates = [f"{p.latitude},{p.longitude}" for p in places]
    
    # 1. Geoapify Route Matrix API'den mekanlar arası süreleri al
    matrix_data = await get_distance_matrix(origins=coordinates, destinations=coordinates, mode="walking")
    
    # 2. Yönlü Graf (DiGraph) Oluştur
    G = nx.DiGraph()
    for i, place in enumerate(places):
        G.add_node(i, place=place, time=place.estimated_time_mins, cost=place.price_level or 0)
        
    results = matrix_data.get("sources_to_targets", [])
    for row in results:
        if isinstance(row, list):
            for item in row:
                u = item.get("source_index")
                v = item.get("target_index")
                travel_time_secs = item.get("time")
                if u is not None and v is not None and u != v and travel_time_secs is not None:
                    travel_time_mins = travel_time_secs // 60
                    G.add_edge(u, v, weight=travel_time_mins)
        elif isinstance(row, dict):
            u = row.get("source_index")
            v = row.get("target_index")
            travel_time_secs = row.get("time")
            if u is not None and v is not None and u != v and travel_time_secs is not None:
                travel_time_mins = travel_time_secs // 60
                G.add_edge(u, v, weight=travel_time_mins)
                
    # 3. Greedy Yaklaşımı (Açgözlü Algoritma) ile süre kısıtına uyan rota çıkarımı
    # Başlangıç noktasını rastgele/ilk eleman seçiyoruz
    current_node = 0
    route_indices = [current_node]
    current_time = G.nodes[current_node]['time']
    
    unvisited = set(range(1, len(places)))
    
    while unvisited:
        best_next = None
        best_score = -1.0
        
        def estimate_cost(price_level):
            if not price_level: return 100
            if price_level == 1: return 150
            if price_level == 2: return 350
            if price_level == 3: return 700
            if price_level >= 4: return 1500
            return 100
            
        current_total_cost = sum(estimate_cost(G.nodes[idx]['cost']) for idx in route_indices)
        
        for neighbor in unvisited:
            if G.has_edge(current_node, neighbor):
                travel_time = G[current_node][neighbor]['weight']
                visit_time = G.nodes[neighbor]['time']
                
                # Toplam Süre Limitini (Kısıt) Geçmemeliyiz
                if current_time + travel_time + visit_time <= max_duration_mins:
                    # Bütçe kontrolü
                    neighbor_cost = estimate_cost(G.nodes[neighbor]['cost'])
                    if max_budget is not None and (current_total_cost + neighbor_cost) > max_budget:
                        continue
                        
                    # Değer Skoru = Rating / (Yolculuk Süresi + 1)
                    rating = float(G.nodes[neighbor]['place'].rating or 3.0)
                    score = rating / (travel_time + 1)
                    
                    if score > best_score:
                        best_score = score
                        best_next = neighbor
                        
        if best_next is not None:
            travel_time = G[current_node][best_next]['weight']
            visit_time = G.nodes[best_next]['time']
            current_time += travel_time + visit_time
            route_indices.append(best_next)
            unvisited.remove(best_next)
            current_node = best_next
        else:
            # Süre kısıtına uyan veya gidilebilecek başka yer kalmadı
            break
            
    # 4. Veritabanına Rota ve Rota Adımlarını (RoutePlaces) Kaydet
    new_route = Route(
        user_id=user_id,
        name=f"Yapay Zeka Optimize Rotası ({date.today()})",
        planned_date=date.today(),
        total_duration_mins=current_time,
        total_cost_estimate=0 # İleride hesaplanabilir
    )
    db.add(new_route)
    await db.flush() # ID'yi alabilmek için
    
    start_dt = datetime.combine(date.today(), datetime.min.time()) + timedelta(hours=9) # Sabah 09:00 başlangıç
    
    for order, idx in enumerate(route_indices):
        place = places[idx]
        travel_time = 0
        if order > 0:
            prev_idx = route_indices[order - 1]
            travel_time = G[prev_idx][idx]['weight']
            
        arrival_time = start_dt + timedelta(minutes=travel_time)
        departure_time = arrival_time + timedelta(minutes=place.estimated_time_mins)
        
        rp = RoutePlace(
            route_id=new_route.id,
            place_id=place.id,
            step_order=order + 1,
            arrival_time=arrival_time.time(),
            departure_time=departure_time.time(),
            travel_time_from_prev=travel_time,
            travel_mode="walking"
        )
        db.add(rp)
        start_dt = departure_time
        
    await db.commit()
    return new_route.id

async def get_full_route(db: AsyncSession, route_id: UUID) -> Route:
    """Veritabanından ilişkisel datalarla (RoutePlace -> Place) birlikte rotayı çeker."""
    stmt = (
        select(Route)
        .options(selectinload(Route.places).selectinload(RoutePlace.place))
        .where(Route.id == route_id)
    )
    result = await db.execute(stmt)
    route = result.scalar_one_or_none()
    if not route:
        raise HTTPException(status_code=404, detail="Rota bulunamadı.")
    return route
