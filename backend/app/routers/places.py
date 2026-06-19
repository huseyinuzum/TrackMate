from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.schemas.place import PlaceSearchRequest, PlaceResponse
from app.services.maps_service import search_places, get_or_create_places_from_search

router = APIRouter(prefix="/api/v1/places", tags=["Places"])

@router.post("/search", response_model=List[PlaceResponse])
async def search_and_save_places(
    request: PlaceSearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Kullanıcının sorgusuna göre Geoapify API'de arama yapar.
    Bulunan sonuçları TrackMate veritabanına kaydeder (veya varsa çeker) 
    ve standart formatta geri döndürür.
    """
    # 1. Geoapify'dan arama yap
    results = await search_places(request.query, request.location)
    
    if not results:
        return []
        
    # 2. DB'ye kaydet / Cache'den al
    places = await get_or_create_places_from_search(db, results)
    
    return places
