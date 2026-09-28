from datetime import date, datetime
from pydantic import BaseModel, EmailStr

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

class SiteUpdateCreate(BaseModel):
    project_id: int
    activity: str
    location_ref: str
    description: str
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
    manpower_total: int
    machinery_count: int
    lorry_trips: int
    has_blocker: bool
    created_at: datetime
    model_config = {"from_attributes": True}
