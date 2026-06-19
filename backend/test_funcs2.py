import asyncio
from app.services.maps_service import search_places

async def test():
    lat = 41.0422  # roughly Besiktas
    lon = 29.0083
    
    search_terms = ['yemek', 'müze']
    
    results = []
    for term in search_terms:
        res = await search_places(term, location=None, req_lat=lat, req_lon=lon)
        results.extend(res)
        
    print(f"Found {len(results)} places.")
    for r in results:
        print(r['name'], r['lat'], r['lon'])

asyncio.run(test())
