import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.schemas.route import RouteGenerateRequest, RouteResponse
from app.services.maps_service import search_places, get_or_create_places_from_search, get_city_district
from app.services.route_optimizer import generate_optimized_route, get_full_route

from app.services.nlp_service import parse_user_intent, generate_ai_response

router = APIRouter(prefix="/api/v1/routes", tags=["Routes"])

@router.post("/generate", response_model=RouteResponse)
async def generate_route(
    request: RouteGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Kullanıcının zaman, bütçe ve lokasyon isteğine göre:
    1. NLP ile isteği analiz edip temiz arama terimlerini ve filtreleri çıkarır.
    2. Geoapify'dan aday mekanları çeker.
    3. Geoapify Route Matrix ile mesafeleri hesaplar.
    4. NetworkX (Graf algoritması) ile optimizasyon yapar.
    5. En optimize rotayı veritabanına kaydeder ve döner.
    """
    
    # Varsayılan değerler
    clean_location = request.location
    lat, lon = request.lat, request.lon
    categories = list(request.categories)
    max_duration_mins = request.max_duration_mins
    max_budget = request.max_budget

    # Eğer sorgu doğal dilde yazılmışsa NLP servisiyle çözümleriz
    if len(request.query) > 10:
        try:
            nlp_result = await parse_user_intent(request.query)
            if nlp_result.location:
                clean_location = nlp_result.location
            if nlp_result.categories:
                # Gelen kategorileri mevcut kategori listesiyle birleştir
                categories = list(set(categories + nlp_result.categories))
            if nlp_result.max_duration_mins:
                max_duration_mins = nlp_result.max_duration_mins
            if nlp_result.max_budget:
                max_budget = nlp_result.max_budget
        except Exception as e:
            # NLP başarısız olursa varsayılan ayarlarla devam edilir
            print(f"NLP ayrıştırma hatası, varsayılanlar kullanılacak: {e}")

    # Aday mekanları topla
    results = []
    # Eğer kategoriler varsa her biri için ayrı arama yaparız, yoksa genel sorguyu ararız
    search_terms = categories if categories else [request.query]
    
    expanded_search = False
    
    for term in search_terms[:3]:  # API limitleri ve hız için en fazla 3 terim
        term_results = await search_places(term, location=clean_location, req_lat=lat, req_lon=lon, radius_meters=5000)
        results.extend(term_results)

    # Eğer 5 km içinde hiçbir şey bulamazsak, 15 km'ye genişletiyoruz.
    if not results:
        expanded_search = True
        for term in search_terms[:3]:
            term_results = await search_places(term, location=clean_location, req_lat=lat, req_lon=lon, radius_meters=15000)
            results.extend(term_results)

    # Dublikasyonları temizle (place_id bazında)
    seen_ids = set()
    unique_results = []
    for r in results:
        p_id = r.get("place_id")
        if p_id and p_id not in seen_ids:
            seen_ids.add(p_id)
            unique_results.append(r)
            
    # Randomize to get different results for same queries sometimes
    random.shuffle(unique_results)
    results = unique_results[:30] # Limit to top 30 to keep it manageable

    if not results:
        raise HTTPException(status_code=404, detail="Girdiğiniz kriterlere uygun mekan bulunamadı.")
        
    places = await get_or_create_places_from_search(db, results)
    
    # 2. Rota algoritmasını çalıştır
    try:
        route_id = await generate_optimized_route(
            db=db,
            user_id=current_user.id,
            places=places,
            max_duration_mins=max_duration_mins,
            max_budget=max_budget
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rota optimizasyonu başarısız: {str(e)}")
        
    # 3. Hazırlanan rotayı ilişkili verilerle beraber yükle ve gönder
    route = await get_full_route(db, route_id)
    
    # 4. Yapay zeka ile samimi sonuç metni (AI Response) oluştur ve kaydet
    if route:
        # İsimlendirme için Reverse Geocoding
        city, district = "Bilinmeyen Şehir", "Bilinmeyen İlçe"
        if len(route.places) > 0:
            first_place = route.places[0].place
            city, district = await get_city_district(first_place.latitude, first_place.longitude)
        
        route.name = f"{city}, {district} Rotası"

        place_names = [rp.place.name for rp in route.places]
        ai_resp = await generate_ai_response(request.query, place_names, max_budget=max_budget, expanded_search=expanded_search)
        
        route.user_prompt = request.query
        route.ai_response = ai_resp
        db.add(route)
        await db.commit()
        await db.refresh(route)
        
    return route

@router.get("", response_model=List[RouteResponse])
async def get_user_routes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy.orm import selectinload
    from app.models.route import Route, RoutePlace
    
    stmt = (
        select(Route)
        .options(selectinload(Route.places).selectinload(RoutePlace.place))
        .where(Route.user_id == current_user.id)
        .order_by(Route.created_at.desc())
    )
    result = await db.execute(stmt)
    routes = result.scalars().all()
    return routes
