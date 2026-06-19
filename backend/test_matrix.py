import asyncio
from app.services.maps_service import get_distance_matrix

async def test():
    origins = ["40.984578,28.8551181", "40.9881757,28.8532698"]
    destinations = origins
    try:
        res = await get_distance_matrix(origins, destinations, "walking")
        print("Success!")
    except Exception as e:
        print("Error:", e)

asyncio.run(test())
