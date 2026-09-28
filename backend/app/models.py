from datetime import date, datetime
from enum import Enum
from sqlalchemy import Boolean, Date, DateTime, Enum as SAEnum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base

class Role(str, Enum):
    MD = "md"
    MANAGER = "manager"
    FIELD = "field"

class ProjectType(str, Enum):
    RAILWAY = "railway"
    ROAD = "road"
    EARTHWORK = "earthwork"
    VILLA = "villa"

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(SAEnum(Role))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Project(Base):
    __tablename__ = "projects"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(40), unique=True)
    name: Mapped[str] = mapped_column(String(180))
    project_type: Mapped[ProjectType] = mapped_column(SAEnum(ProjectType))
    client: Mapped[str] = mapped_column(String(180))
    location: Mapped[str] = mapped_column(String(180))
    start_date: Mapped[date] = mapped_column(Date)
    target_date: Mapped[date] = mapped_column(Date)
    progress_percent: Mapped[float] = mapped_column(Float, default=0)

class ProjectUser(Base):
    __tablename__ = "project_users"
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

class SiteUpdate(Base):
    __tablename__ = "site_updates"
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    activity: Mapped[str] = mapped_column(String(120))
    location_ref: Mapped[str] = mapped_column(String(120))
    original_description: Mapped[str] = mapped_column(Text)
    clean_description: Mapped[str] = mapped_column(Text)
    manpower_total: Mapped[int] = mapped_column(Integer, default=0)
    machinery_count: Mapped[int] = mapped_column(Integer, default=0)
    lorry_trips: Mapped[int] = mapped_column(Integer, default=0)
    has_blocker: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Blocker(Base):
    __tablename__ = "blockers"
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    category: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(40), default="open")
    opened_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class LabourType(Base):
    __tablename__ = "labour_types"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    tracking_mode: Mapped[str] = mapped_column(String(40), default="count_only")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class DailyManpower(Base):
    __tablename__ = "daily_manpower"
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    labour_type_id: Mapped[int] = mapped_column(ForeignKey("labour_types.id"))
    work_date: Mapped[date] = mapped_column(Date)
    count: Mapped[int] = mapped_column(Integer)
    entered_by: Mapped[int] = mapped_column(ForeignKey("users.id"))

class Vehicle(Base):
    __tablename__ = "vehicles"
    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_no: Mapped[str] = mapped_column(String(60), unique=True)
    vehicle_type: Mapped[str] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(40))
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True)

class Villa(Base):
    __tablename__ = "villas"
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    villa_no: Mapped[str] = mapped_column(String(40))
    progress_percent: Mapped[float] = mapped_column(Float, default=0)
    current_stage: Mapped[str] = mapped_column(String(120))
    status: Mapped[str] = mapped_column(String(40), default="in_progress")
