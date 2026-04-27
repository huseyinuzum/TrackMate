from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, time
from uuid import UUID
from app.schemas.place import PlaceResponse

class RouteGenerateRequest(BaseModel):
    query: str = Field(..., description="Mekan araması için kelime veya NLP sonucu metin")
    location: str = Field(..., description="Hangi lokasyonda aranacak?")
    max_duration_mins: int = Field(240, description="Kullanıcının rotaya ayırdığı toplam süre (dk)")
    max_budget: Optional[float] = Field(None, description="Maksimum bütçe kısıtlaması")
    categories: List[str] = Field(default_factory=list, description="Kategori filtreleri")

class RoutePlaceResponse(BaseModel):
    id: UUID
    place: PlaceResponse
    step_order: int
    arrival_time: Optional[time]
    departure_time: Optional[time]
    travel_time_from_prev: Optional[int]
    travel_mode: str

    class Config:
        from_attributes = True

class RouteResponse(BaseModel):
    id: UUID
    name: Optional[str]
    planned_date: date
    total_duration_mins: int
    total_cost_estimate: Optional[float]
    places: List[RoutePlaceResponse]

    class Config:
        from_attributes = True
