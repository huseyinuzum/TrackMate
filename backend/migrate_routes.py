import asyncio
import sys
import os

# Ensure backend directory is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.route import Route, RoutePlace
from app.services.maps_service import get_city_district

async def run_migration():
    print("Migration started...")
    async with AsyncSessionLocal() as db:
        stmt = select(Route).options(selectinload(Route.places).selectinload(RoutePlace.place))
        result = await db.execute(stmt)
        routes = result.scalars().all()
        
        updated_count = 0
        for route in routes:
            if len(route.places) > 0:
                first_place = route.places[0].place
                city, district = await get_city_district(first_place.latitude, first_place.longitude)
                new_name = f"{city}, {district} Rotası"
                
                if route.name != new_name:
                    print(f"Updating route {route.id}: {route.name} -> {new_name}")
                    route.name = new_name
                    db.add(route)
                    updated_count += 1
        
        if updated_count > 0:
            await db.commit()
            print(f"Migration completed. Updated {updated_count} routes.")
        else:
            print("No routes needed updating.")

if __name__ == "__main__":
    asyncio.run(run_migration())
