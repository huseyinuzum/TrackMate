import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from app.models.route import Route, RoutePlace
from app.models.place import Place

async def check():
    engine = create_async_engine("sqlite+aiosqlite:///./trackmate.db")
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        stmt = select(Route).order_by(Route.created_at.desc()).limit(1)
        route = (await session.execute(stmt)).scalar_one_or_none()
        if route:
            print(f"Latest Route ID: {route.id}")
            # wait, the route failed, so it might not be in DB!
            # The matrix API failed during generate_optimized_route, so the route wasn't saved!
            
        # Let's check the places table for anything weird
        stmt = select(Place).order_by(Place.id.desc()).limit(20)
        places = (await session.execute(stmt)).scalars().all()
        for p in places:
            print(f"Place: {p.name}, Lat: {p.latitude}, Lon: {p.longitude}")

asyncio.run(check())
