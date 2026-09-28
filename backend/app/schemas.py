from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    model_config = {"from_attributes": True}

class ProjectOut(BaseModel):
    id: int
    code: str
    name: str
    project_type: str
    client: str
    location: str
    start_date: date
    target_date: date
    progress_percent: float
    model_config = {"from_attributes": True}

class ProjectCreate(BaseModel):
    code: str = Field(min_length=2, max_length=40)
    name: str = Field(min_length=2, max_length=180)
    project_type: str
    client: str
    location: str
    start_date: date
    target_date: date
    assigned_user_ids: list[int] = []

class SiteUpdateCreate(BaseModel):
    project_id: int
    activity: str
    location_ref: str
    description: str
    quantity: float | None = None
    unit: str | None = None
    manpower_total: int = 0
    machinery_count: int = 0
    lorry_trips: int = 0
    has_blocker: bool = False

class SiteUpdateOut(BaseModel):
    id: int
    project_id: int
    user_id: int
    activity: str
    location_ref: str
    original_description: str
    clean_description: str
    quantity: float | None = None
    unit: str | None = None
    manpower_total: int
    machinery_count: int
    lorry_trips: int
    has_blocker: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class BlockerCreate(BaseModel):
    category: str
    description: str
    impact: str | None = None
    responsible_party: str | None = None

class ManpowerItem(BaseModel):
    labour_type_id: int
    count: int = Field(ge=0)

class ManpowerCreate(BaseModel):
    work_date: date
    items: list[ManpowerItem]

class SiteVisitCreate(BaseModel):
    visitor: str
    location_ref: str
    observations: str
    instructions: str | None = None
    target_date: date | None = None

class ManagerDocumentCreate(BaseModel):
    category: str
    title: str
    notes: str | None = None
