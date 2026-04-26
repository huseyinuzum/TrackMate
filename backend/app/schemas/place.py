from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

class PlaceBase(BaseModel):
    external_id: str = Field(..., description="Google Place ID")
    name: str = Field(..., description="Mekan Adı")
    latitude: float = Field(...)
    longitude: float = Field(...)
    category: Optional[str] = None
    price_level: Optional[int] = Field(None, ge=0, le=4)
    rating: Optional[float] = Field(None, ge=0.0, le=5.0)
    estimated_time_mins: int = Field(60, description="Mekanda harcanacak ortalama süre (dk)")

class PlaceCreate(PlaceBase):
    pass

class PlaceResponse(PlaceBase):
    id: UUID

    class Config:
        from_attributes = True

class PlaceSearchRequest(BaseModel):
    query: str = Field(..., description="Arama sorgusu, örn: 'Kadıköy tarihi yerler'")
    location: Optional[str] = Field(None, description="Koordinat (lat,lng) veya şehir adı")
