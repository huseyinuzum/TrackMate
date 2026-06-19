import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.config import get_settings
from app.models.place import Place
from app.schemas.place import PlaceCreate

settings = get_settings()

def map_text_to_geoapify_category(term: str) -> str:
    term_lower = term.lower().strip()
    mapping = {
        "kahve": "catering.cafe",
        "cafe": "catering.cafe",
        "kafe": "catering.cafe",
        "yemek": "catering.restaurant",
        "restoran": "catering.restaurant",
        "lokanta": "catering.restaurant",
        "food": "catering.restaurant",
        "tarih": "tourism.attraction,tourism.sights",
        "tarihi": "tourism.attraction,tourism.sights",
        "tarihi yerler": "tourism.attraction,tourism.sights",
        "tarihi yer": "tourism.attraction,tourism.sights",
        "museum": "entertainment.museum",
        "müze": "entertainment.museum",
        "park": "leisure.park",
        "doğa": "leisure.park",
        "bahçe": "leisure.park",
        "historic": "tourism.attraction,tourism.sights",
        "sightseeing": "tourism.attraction,tourism.sights",
    }
    return mapping.get(term_lower, "tourism.attraction,tourism.sights,leisure.park,catering.cafe")

async def get_city_district(lat: float, lon: float) -> tuple[str, str]:
    """Koordinatlara göre İl ve İlçe bilgisini döndürür."""
    if not settings.geoapify_api_key:
        return "Bilinmeyen Şehir", "Bilinmeyen İlçe"
        
    url = "https://api.geoapify.com/v1/geocode/reverse"
    params = {
        "lat": lat,
        "lon": lon,
        "apiKey": settings.geoapify_api_key,
        "lang": "tr"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                features = data.get("features", [])
                if features:
                    props = features[0].get("properties", {})
                    city = props.get("state") or props.get("city") or "Bilinmeyen Şehir"
                    district = props.get("county") or props.get("suburb") or props.get("district") or "Bilinmeyen İlçe"
                    return city, district
        except Exception as e:
            print(f"Reverse geocoding hatası: {e}")
            
    return "Bilinmeyen Şehir", "Bilinmeyen İlçe"

async def search_places(query: str, location: str | None = None, req_lat: float | None = None, req_lon: float | None = None, radius_meters: int = 5000) -> list[dict]:
    if not settings.geoapify_api_key:
        raise HTTPException(status_code=500, detail="Geoapify API anahtarı eksik.")

    lat, lon = req_lat, req_lon
    if location and (lat is None or lon is None):
        url = "https://api.geoapify.com/v1/geocode/search"
        params = {
            "text": location,
            "format": "json",
            "apiKey": settings.geoapify_api_key,
            "limit": 1
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    results = data.get("results", [])
                    if results:
                        lat = float(results[0]["lat"])
                        lon = float(results[0]["lon"])
            except Exception as e:
                print(f"Geocoding hatası: {e}")

    if lat is not None and lon is not None:
        category = map_text_to_geoapify_category(query)
        url = "https://api.geoapify.com/v2/places"
        params = {
            "categories": category,
            "filter": f"circle:{lon},{lat},{radius_meters}",
            "limit": 10,
            "apiKey": settings.geoapify_api_key,
            "lang": "tr"
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    features = data.get("features", [])
                    results = []
                    for f in features:
                        props = f.get("properties", {})
                        if props.get("place_id") and props.get("lat") and props.get("lon"):
                            results.append({
                                "place_id": props.get("place_id"),
                                "name": props.get("name") or props.get("formatted"),
                                "lat": props.get("lat"),
                                "lon": props.get("lon"),
                                "result_type": props.get("categories", ["point_of_interest"])[0]
                            })
                    return results
                else:
                    print(f"Places API hatası: {response.status_code} - {response.text}")
                    return []
            except Exception as e:
                print(f"Places API hatası: {e}")
                return []

    url = "https://api.geoapify.com/v1/geocode/search"
    search_text = query
    if location:
        search_text = f"{query}, {location}"

    params = {
        "text": search_text,
        "format": "json",
        "apiKey": settings.geoapify_api_key,
        "lang": "tr"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Geoapify API hatası: {response.text}")
        data = response.json()
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
        lat = result.get("lat")
        lon = result.get("lon")
        if lat is None or lon is None:
            continue

        name = result.get("name") or result.get("formatted") or "Bilinmeyen Mekan"
        category = result.get("result_type") or "point_of_interest"
        
        new_place = Place(
            external_id=place_id,
            name=name,
            latitude=float(lat),
            longitude=float(lon),
            category=category,
            price_level=None,
            rating=None,
            estimated_time_mins=60
        )
        
        db.add(new_place)
        saved_places.append(new_place)
        
    await db.commit()
    return saved_places

async def get_distance_matrix(origins: list[str], destinations: list[str], mode: str = "walking") -> dict:
    """Belirtilen koordinatlar arası mesafe ve süre matrisini getirir."""
    if not settings.geoapify_api_key:
        raise HTTPException(status_code=500, detail="Geoapify API anahtarı eksik.")
        
    sources = []
    for origin in origins:
        lat, lon = map(float, origin.split(","))
        sources.append({"location": [lon, lat]})

    targets = []
    for dest in destinations:
        lat, lon = map(float, dest.split(","))
        targets.append({"location": [lon, lat]})

    # Map Google modes to Geoapify modes
    geoapify_mode = "walk"
    if mode in ("driving", "drive"):
        geoapify_mode = "drive"
    elif mode in ("walking", "walk"):
        geoapify_mode = "walk"
    elif mode in ("bicycling", "bike"):
        geoapify_mode = "bike"
    elif mode == "transit":
        geoapify_mode = "transit"

    url = f"https://api.geoapify.com/v1/routematrix?apiKey={settings.geoapify_api_key}"
    payload = {
        "mode": geoapify_mode,
        "sources": sources,
        "targets": targets
    }
    headers = {"Content-Type": "application/json"}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Geoapify Matrix API hatası: {response.text}")
            
        return response.json()
