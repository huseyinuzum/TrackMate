import asyncio
import httpx

async def test():
    async with httpx.AsyncClient() as client:
        # Generate route with lat and lon
        payload = {
            "query": "yemek",
            "lat": 41.0082,
            "lon": 28.9784
        }
        resp = await client.post("http://127.0.0.1:8000/api/v1/routes/generate", json=payload, timeout=30.0)
        print("Status:", resp.status_code)
        print("Body:", resp.text)

asyncio.run(test())
