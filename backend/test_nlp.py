import asyncio
from app.services.nlp_service import parse_user_intent

async def test():
    query = "4 saat zamanım var. yemek yiyip bir müzeye gitmek istiyorum"
    res = await parse_user_intent(query)
    print("NLP categories:", res.categories)
    print("NLP location:", res.location)

asyncio.run(test())
