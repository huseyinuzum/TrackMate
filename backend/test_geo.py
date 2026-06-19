import asyncio
import httpx

async def test():
    url = "https://api.geoapify.com/v2/places"
    params = {
        "categories": "catering.restaurant",
        "filter": "circle:28.9784,41.0082,15000",
        "limit": 10,
        "apiKey": "123", # We don't have the real API key, so we can't test directly without it.
        "lang": "tr"
    }
    print(params)

asyncio.run(test())
