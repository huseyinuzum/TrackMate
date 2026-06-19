import asyncio
import httpx
from app.config import get_settings

settings = get_settings()

async def test():
    url = "https://api.geoapify.com/v2/places"
    params = {
        "categories": "entertainment.culture.museum",
        "filter": "circle:29.0083,41.0422,15000",
        "limit": 10,
        "apiKey": settings.geoapify_api_key,
        "lang": "tr"
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        print("Status v2:", resp.status_code)
        
        # Test fallback
        url_fb = "https://api.geoapify.com/v1/geocode/search"
        params_fb = {
            "text": "müze",
            "format": "json",
            "apiKey": settings.geoapify_api_key,
            "lang": "tr"
        }
        resp_fb = await client.get(url_fb, params=params_fb)
        print("Status fallback:", resp_fb.status_code)

asyncio.run(test())
