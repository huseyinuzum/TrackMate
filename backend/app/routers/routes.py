from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.schemas.route import RouteGenerateRequest, RouteResponse
from app.services.maps_service import search_google_places, get_or_create_places_from_search
from app.services.route_optimizer import generate_optimized_route, get_full_route

router = APIRouter(prefix="/api/v1/routes", tags=["Routes"])

@router.post("/generate", response_model=RouteResponse)
async def generate_route(
    request: RouteGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Kullanıcının zaman, bütçe ve lokasyon isteğine göre:
    1. Google Places'ten mekanları çeker.
    2. Google Distance Matrix ile mesafeleri hesaplar.
    3. NetworkX (Graf algoritması) ile optimizasyon yapar.
    4. En optimize rotayı veritabanına kaydeder ve döner.
    """
    
    # 1. Aday mekanları API'den (veya DB cache'den) topla
    search_query = request.query
    if request.categories:
        search_query += " " + " ".join(request.categories)
        
    results = await search_google_places(search_query, request.location)
    
    if not results:
        raise HTTPException(status_code=404, detail="Girdiğiniz kriterlere uygun mekan bulunamadı.")
        
    places = await get_or_create_places_from_search(db, results)
    
    # 2. Rota algoritmasını çalıştır
    try:
        route_id = await generate_optimized_route(
            db=db,
            user_id=current_user.id,
            places=places,
            max_duration_mins=request.max_duration_mins,
            max_budget=request.max_budget
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rota optimizasyonu başarısız: {str(e)}")
        
    # 3. Hazırlanan rotayı ilişkili verilerle beraber yükle ve gönder
    route = await get_full_route(db, route_id)
    return route
