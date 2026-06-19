import asyncio
from app.services.maps_service import search_places, get_distance_matrix

async def test():
    query = "4 saat zamanım var. yemek yiyip bir müzeye gitmek istiyorum"
    lat = 41.0422  # roughly Besiktas
    lon = 29.0083
    
    # Simulate what routes.py does:
    # search_terms = categories if categories else [request.query]
    # Here let's assume NLP fails or categories is empty
    search_terms = [query]
    
    results = []
    for term in search_terms:
        res = await search_places(term, location=None, req_lat=lat, req_lon=lon)
        results.extend(res)
        
    print(f"Found {len(results)} places.")
    for r in results:
        print(r['name'], r['lat'], r['lon'])

asyncio.run(test())
