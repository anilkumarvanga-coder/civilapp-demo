from datetime import date, datetime
from enum import Enum
from sqlalchemy import Boolean, Date, DateTime, Enum as SAEnum, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
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
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class ProjectUser(Base):
    __tablename__ = "project_users"
    __table_args__ = (UniqueConstraint("project_id", "user_id", name="uq_project_user"),)
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
    quantity: Mapped[float | None] = mapped_column(Float, nullable=True)
    unit: Mapped[str | None] = mapped_column(String(30), nullable=True)
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
    impact: Mapped[str | None] = mapped_column(String(120), nullable=True)
    responsible_party: Mapped[str | None] = mapped_column(String(120), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="open")
    entered_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    opened_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

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
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Personnel(Base):
    __tablename__ = "personnel"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    personnel_type: Mapped[str] = mapped_column(String(80))
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    vehicle_or_machine: Mapped[str | None] = mapped_column(String(80), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="working")

class Vehicle(Base):
    __tablename__ = "vehicles"
    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_no: Mapped[str] = mapped_column(String(60), unique=True)
    vehicle_type: Mapped[str] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(40))
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    breakdown_since: Mapped[date | None] = mapped_column(Date, nullable=True)
    breakdown_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

class SiteVisit(Base):
    __tablename__ = "site_visits"
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    visitor: Mapped[str] = mapped_column(String(120))
    location_ref: Mapped[str] = mapped_column(String(120))
    observations: Mapped[str] = mapped_column(Text)
    instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    entered_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    visited_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class ManagerDocument(Base):
    __tablename__ = "manager_documents"
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    category: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(180))
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    uploaded_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Villa(Base):
    __tablename__ = "villas"
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    villa_no: Mapped[str] = mapped_column(String(40))
    progress_percent: Mapped[float] = mapped_column(Float, default=0)
    current_stage: Mapped[str] = mapped_column(String(120))
    status: Mapped[str] = mapped_column(String(40), default="in_progress")

class VillaStage(Base):
    __tablename__ = "villa_stages"
    id: Mapped[int] = mapped_column(primary_key=True)
    villa_id: Mapped[int] = mapped_column(ForeignKey("villas.id"))
    stage_name: Mapped[str] = mapped_column(String(120))
    sequence: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(40), default="not_started")
    progress_percent: Mapped[float] = mapped_column(Float, default=0)
    last_update: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
