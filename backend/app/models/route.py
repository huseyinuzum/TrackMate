import uuid
from datetime import datetime, timezone, date, time
from sqlalchemy import String, DateTime, Date, Numeric, Integer, ForeignKey, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class Route(Base):
    __tablename__ = "routes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    planned_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    total_duration_mins: Mapped[int] = mapped_column(Integer, nullable=False)
    total_cost_estimate: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relational link to route_places (order_by for correct sequencing)
    places = relationship("RoutePlace", back_populates="route", cascade="all, delete-orphan", order_by="RoutePlace.step_order")

class RoutePlace(Base):
    __tablename__ = "route_places"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("routes.id", ondelete="CASCADE"), nullable=False)
    place_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("places.id", ondelete="RESTRICT"), nullable=False)
    
    step_order: Mapped[int] = mapped_column(Integer, nullable=False)
    arrival_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    departure_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    travel_time_from_prev: Mapped[int | None] = mapped_column(Integer, nullable=True) # in minutes
    travel_mode: Mapped[str] = mapped_column(String(50), default="walking")

    route = relationship("Route", back_populates="places")
    place = relationship("Place")
