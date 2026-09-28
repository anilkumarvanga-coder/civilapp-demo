from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from .db import get_db
from .models import User, Project, ProjectUser, SiteUpdate, Blocker, DailyManpower, Vehicle, Villa, Role
from .schemas import LoginRequest, TokenResponse, UserOut, ProjectOut, SiteUpdateCreate, SiteUpdateOut
from .security import verify_password, create_access_token, get_current_user
from .seed import seed

app = FastAPI(title="CivilApp API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    seed()

def require_project_access(project_id: int, user: User, db: Session) -> Project:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if user.role == Role.MD:
        return project
    assigned = db.scalar(
        select(ProjectUser.id).where(
            ProjectUser.project_id == project_id,
            ProjectUser.user_id == user.id,
        )
    )
    if not assigned:
        raise HTTPException(status_code=403, detail="Project access denied")
    return project

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return TokenResponse(access_token=create_access_token(user.id))

@app.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user

@app.get("/projects", response_model=list[ProjectOut])
def projects(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role == Role.MD:
        return db.scalars(select(Project).order_by(Project.name)).all()
    stmt = (
        select(Project)
        .join(ProjectUser, ProjectUser.project_id == Project.id)
        .where(ProjectUser.user_id == user.id)
        .order_by(Project.name)
    )
    return db.scalars(stmt).all()

@app.get("/projects/{project_id}", response_model=ProjectOut)
def project_detail(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return require_project_access(project_id, user, db)

@app.get("/projects/{project_id}/updates", response_model=list[SiteUpdateOut])
def project_updates(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(project_id, user, db)
    return db.scalars(
        select(SiteUpdate)
        .where(SiteUpdate.project_id == project_id)
        .order_by(SiteUpdate.created_at.desc())
    ).all()

@app.post("/updates", response_model=SiteUpdateOut)
def create_update(payload: SiteUpdateCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(payload.project_id, user, db)
    clean = " ".join(payload.description.strip().split())
    record = SiteUpdate(
        project_id=payload.project_id,
        user_id=user.id,
        activity=payload.activity,
        location_ref=payload.location_ref,
        original_description=payload.description,
        clean_description=clean,
        manpower_total=payload.manpower_total,
        machinery_count=payload.machinery_count,
        lorry_trips=payload.lorry_trips,
        has_blocker=payload.has_blocker,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@app.get("/projects/{project_id}/blockers")
def project_blockers(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(project_id, user, db)
    rows = db.scalars(
        select(Blocker)
        .where(Blocker.project_id == project_id)
        .order_by(Blocker.opened_at.desc())
    ).all()
    return [
        {
            "id": b.id,
            "project_id": b.project_id,
            "category": b.category,
            "description": b.description,
            "status": b.status,
            "opened_at": b.opened_at,
        }
        for b in rows
    ]

@app.get("/projects/{project_id}/manpower")
def project_manpower(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(project_id, user, db)
    total = db.scalar(
        select(func.coalesce(func.sum(DailyManpower.count), 0))
        .where(DailyManpower.project_id == project_id)
    ) or 0
    return {"project_id": project_id, "total": total}

@app.get("/projects/{project_id}/vehicles")
def project_vehicles(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(project_id, user, db)
    rows = db.scalars(
        select(Vehicle).where(Vehicle.project_id == project_id).order_by(Vehicle.vehicle_no)
    ).all()
    return [
        {
            "id": v.id,
            "vehicle_no": v.vehicle_no,
            "vehicle_type": v.vehicle_type,
            "status": v.status,
        }
        for v in rows
    ]

@app.get("/dashboard/md")
def md_dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role != Role.MD:
        raise HTTPException(status_code=403, detail="MD access required")
    total_projects = db.scalar(select(func.count(Project.id))) or 0
    workforce = db.scalar(select(func.coalesce(func.sum(DailyManpower.count), 0))) or 0
    active_machinery = db.scalar(select(func.count(Vehicle.id)).where(Vehicle.status == "working")) or 0
    active_blockers = db.scalar(select(func.count(Blocker.id)).where(Blocker.status == "open")) or 0
    trips = db.scalar(select(func.coalesce(func.sum(SiteUpdate.lorry_trips), 0))) or 0
    projects = db.scalars(select(Project).order_by(Project.progress_percent.desc())).all()
    blockers = db.scalars(
        select(Blocker).where(Blocker.status == "open").order_by(Blocker.opened_at.desc())
    ).all()
    return {
        "kpis": {
            "total_projects": total_projects,
            "total_workforce": workforce,
            "active_machinery": active_machinery,
            "lorry_trips": trips,
            "active_blockers": active_blockers,
        },
        "projects": [
            {
                "id": p.id,
                "name": p.name,
                "code": p.code,
                "type": p.project_type.value,
                "progress": p.progress_percent,
            }
            for p in projects
        ],
        "blockers": [
            {
                "id": b.id,
                "project_id": b.project_id,
                "category": b.category,
                "description": b.description,
                "status": b.status,
            }
            for b in blockers
        ],
    }

@app.get("/projects/{project_id}/villas")
def villas(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(project_id, user, db)
    rows = db.scalars(
        select(Villa).where(Villa.project_id == project_id).order_by(Villa.villa_no)
    ).all()
    return [
        {
            "id": v.id,
            "villa_no": v.villa_no,
            "progress": v.progress_percent,
            "current_stage": v.current_stage,
            "status": v.status,
        }
        for v in rows
    ]
