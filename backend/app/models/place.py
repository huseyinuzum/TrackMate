import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Numeric, Integer
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class Place(Base):
    __tablename__ = "places"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    external_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True) # Google Place ID
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[float] = mapped_column(Numeric(10, 8), nullable=False)
    longitude: Mapped[float] = mapped_column(Numeric(11, 8), nullable=False)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    price_level: Mapped[int | None] = mapped_column(Integer, nullable=True) # 0-4
    rating: Mapped[float | None] = mapped_column(Numeric(3, 2), nullable=True)
    estimated_time_mins: Mapped[int] = mapped_column(Integer, default=60) # Ortalama harcanacak süre
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
