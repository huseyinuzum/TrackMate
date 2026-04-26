import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.config import get_settings
from app.models.place import Place
from app.schemas.place import PlaceCreate

settings = get_settings()

async def search_google_places(query: str, location: str | None = None) -> list[dict]:
    if not settings.google_maps_api_key:
        raise HTTPException(status_code=500, detail="Google Maps API anahtarı eksik.")

    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": query,
        "key": settings.google_maps_api_key,
        "language": "tr"
    }
    
    if location:
        params["location"] = location # Note: Text search expects query. For strict location, nearbysearch is better, but textsearch is flexible.

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = response.json()
        
        if data.get("status") != "OK":
            if data.get("status") == "ZERO_RESULTS":
                return []
            raise HTTPException(status_code=500, detail=f"Google Places API hatası: {data.get('status')}")
            
        return data.get("results", [])

async def get_or_create_places_from_search(db: AsyncSession, search_results: list[dict]) -> list[Place]:
    saved_places = []
    
    for result in search_results:
        place_id = result.get("place_id")
        if not place_id:
            continue
            
        # Önce veritabanında var mı kontrol et
        stmt = select(Place).where(Place.external_id == place_id)
        existing_place = (await db.execute(stmt)).scalar_one_or_none()
        
        if existing_place:
            saved_places.append(existing_place)
            continue
            
        # Yoksa yeni oluştur
        location = result.get("geometry", {}).get("location", {})
        
        # Türleri belirleme (ilkini alıyoruz)
        types = result.get("types", [])
        category = types[0] if types else "point_of_interest"
        
        new_place = Place(
            external_id=place_id,
            name=result.get("name"),
            latitude=location.get("lat"),
            longitude=location.get("lng"),
            category=category,
            price_level=result.get("price_level"),
            rating=result.get("rating"),
            estimated_time_mins=60 # Varsayılan süre, NLP veya kategoriye göre ileride güncellenebilir
        )
        
        db.add(new_place)
        saved_places.append(new_place)
        
    await db.commit()
    return saved_places
