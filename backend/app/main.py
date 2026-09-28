from datetime import date, datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, func, delete
from sqlalchemy.orm import Session
from .db import get_db
from .models import (
    User, Project, ProjectUser, SiteUpdate, Blocker, DailyManpower, LabourType,
    Personnel, Vehicle, Villa, VillaStage, SiteVisit, ManagerDocument, Role, Workspace, ProjectType,
)
from .schemas import (
    LoginRequest, TokenResponse, UserOut, ProjectOut, ProjectCreate,
    SiteUpdateCreate, SiteUpdateOut, BlockerCreate, ManpowerCreate,
    SiteVisitCreate, ManagerDocumentCreate,
)
from .security import verify_password, create_access_token, get_current_user
from .seed import seed

app = FastAPI(title="CivilApp API", version="0.2.0")

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

def require_md(user: User):
    if user.role != Role.MD:
        raise HTTPException(status_code=403, detail="MD access required")

def require_manager_or_md(user: User):
    if user.role not in (Role.MD, Role.MANAGER):
        raise HTTPException(status_code=403, detail="Manager access required")

def project_matches_workspace(project: Project, user: User) -> bool:
    if user.workspace == Workspace.BOTH:
        return True
    if user.workspace == Workspace.BUILD:
        return project.project_type == ProjectType.VILLA
    return project.project_type != ProjectType.VILLA

def workspace_project_ids(db: Session, user: User) -> list[int]:
    stmt = select(Project.id).where(Project.is_active.is_(True))
    if user.workspace == Workspace.BUILD:
        stmt = stmt.where(Project.project_type == ProjectType.VILLA)
    elif user.workspace == Workspace.INFRA:
        stmt = stmt.where(Project.project_type != ProjectType.VILLA)
    return list(db.scalars(stmt).all())

def require_project_access(project_id: int, user: User, db: Session) -> Project:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not project_matches_workspace(project, user):
        raise HTTPException(status_code=403, detail="Project belongs to a different CivilApp workspace")
    if user.role == Role.MD:
        return project
    assigned = db.scalar(select(ProjectUser.id).where(ProjectUser.project_id == project_id, ProjectUser.user_id == user.id))
    if not assigned:
        raise HTTPException(status_code=403, detail="Project access denied")
    return project

@app.get("/health")
def health():
    return {"status": "ok", "version": "0.2.0"}

@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return TokenResponse(access_token=create_access_token(user.id))

@app.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user

@app.get("/users", response_model=list[UserOut])
def users(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_md(user)
    stmt = select(User).where(User.is_active.is_(True))
    if user.workspace != Workspace.BOTH:
        stmt = stmt.where(User.workspace.in_([user.workspace, Workspace.BOTH]))
    return db.scalars(stmt.order_by(User.name)).all()

@app.get("/projects", response_model=list[ProjectOut])
def projects(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    stmt = select(Project).where(Project.is_active.is_(True))
    if user.workspace == Workspace.BUILD:
        stmt = stmt.where(Project.project_type == ProjectType.VILLA)
    elif user.workspace == Workspace.INFRA:
        stmt = stmt.where(Project.project_type != ProjectType.VILLA)
    if user.role != Role.MD:
        stmt = stmt.join(ProjectUser, ProjectUser.project_id == Project.id).where(ProjectUser.user_id == user.id)
    return db.scalars(stmt.order_by(Project.name)).all()

@app.post("/projects", response_model=ProjectOut)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_md(user)
    if db.scalar(select(Project.id).where(Project.code == payload.code.strip())):
        raise HTTPException(status_code=409, detail="Project code already exists")
    try:
        project_type = ProjectType(payload.project_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Unsupported project type")
    if user.workspace == Workspace.INFRA and project_type == ProjectType.VILLA:
        raise HTTPException(status_code=403, detail="Villa/building projects must be created from CivilApp Build")
    if user.workspace == Workspace.BUILD and project_type != ProjectType.VILLA:
        raise HTTPException(status_code=403, detail="Road/rail/earthwork projects must be created from CivilApp Infra")
    project = Project(code=payload.code.strip(), name=payload.name.strip(), project_type=project_type, client=payload.client.strip(), location=payload.location.strip(), start_date=payload.start_date, target_date=payload.target_date, progress_percent=0)
    db.add(project); db.flush()
    valid_users = set(db.scalars(select(User.id).where(User.id.in_(payload.assigned_user_ids))).all()) if payload.assigned_user_ids else set()
    for uid in valid_users:
        db.add(ProjectUser(project_id=project.id, user_id=uid))
    db.commit(); db.refresh(project)
    return project

@app.post("/projects/{project_id}/assign-users")
def assign_users(project_id: int, user_ids: list[int], db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_md(user); require_project_access(project_id, user, db)
    db.execute(delete(ProjectUser).where(ProjectUser.project_id == project_id))
    valid_users = set(db.scalars(select(User.id).where(User.id.in_(user_ids))).all()) if user_ids else set()
    for uid in valid_users:
        db.add(ProjectUser(project_id=project_id, user_id=uid))
    db.commit()
    return {"project_id": project_id, "assigned_user_ids": sorted(valid_users)}

@app.get("/projects/{project_id}", response_model=ProjectOut)
def project_detail(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return require_project_access(project_id, user, db)

@app.get("/projects/{project_id}/updates", response_model=list[SiteUpdateOut])
def project_updates(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(project_id, user, db)
    return db.scalars(select(SiteUpdate).where(SiteUpdate.project_id == project_id).order_by(SiteUpdate.created_at.desc())).all()

@app.post("/updates", response_model=SiteUpdateOut)
def create_update(payload: SiteUpdateCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(payload.project_id, user, db)
    clean = " ".join(payload.description.strip().split())
    record = SiteUpdate(project_id=payload.project_id, user_id=user.id, activity=payload.activity, location_ref=payload.location_ref, original_description=payload.description, clean_description=clean, quantity=payload.quantity, unit=payload.unit, manpower_total=payload.manpower_total, machinery_count=payload.machinery_count, lorry_trips=payload.lorry_trips, has_blocker=payload.has_blocker)
    db.add(record); db.commit(); db.refresh(record)
    return record

@app.get("/labour-types")
def labour_types(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.scalars(select(LabourType).where(LabourType.is_active.is_(True)).order_by(LabourType.name)).all()
    return [{"id": r.id, "name": r.name, "tracking_mode": r.tracking_mode} for r in rows]

@app.get("/projects/{project_id}/manpower")
def project_manpower(project_id: int, work_date: date | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(project_id, user, db)
    target = work_date or date.today()
    rows = db.execute(select(DailyManpower, LabourType).join(LabourType, LabourType.id == DailyManpower.labour_type_id).where(DailyManpower.project_id == project_id, DailyManpower.work_date == target).order_by(LabourType.name)).all()
    items = [{"labour_type_id": m.labour_type_id, "name": lt.name, "tracking_mode": lt.tracking_mode, "count": m.count, "entered_by": m.entered_by} for m, lt in rows]
    return {"project_id": project_id, "work_date": target, "total": sum(i["count"] for i in items), "items": items}

@app.post("/projects/{project_id}/manpower")
def save_manpower(project_id: int, payload: ManpowerCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(project_id, user, db)
    labour_ids = {r.id for r in db.scalars(select(LabourType).where(LabourType.is_active.is_(True))).all()}
    incoming_ids = {i.labour_type_id for i in payload.items}
    if not incoming_ids.issubset(labour_ids):
        raise HTTPException(status_code=400, detail="Invalid labour type")
    db.execute(delete(DailyManpower).where(DailyManpower.project_id == project_id, DailyManpower.work_date == payload.work_date))
    for item in payload.items:
        db.add(DailyManpower(project_id=project_id, labour_type_id=item.labour_type_id, work_date=payload.work_date, count=item.count, entered_by=user.id))
    db.commit()
    return project_manpower(project_id, payload.work_date, db, user)

@app.get("/projects/{project_id}/personnel")
def project_personnel(project_id: int, personnel_type: str | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(project_id, user, db)
    stmt = select(Personnel).where(Personnel.project_id == project_id)
    if personnel_type:
        stmt = stmt.where(func.lower(Personnel.personnel_type) == personnel_type.lower())
    rows = db.scalars(stmt.order_by(Personnel.personnel_type, Personnel.name)).all()
    return [{"id": p.id, "name": p.name, "personnel_type": p.personnel_type, "vehicle_or_machine": p.vehicle_or_machine, "status": p.status} for p in rows]

@app.get("/projects/{project_id}/vehicles")
def project_vehicles(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(project_id, user, db)
    rows = db.scalars(select(Vehicle).where(Vehicle.project_id == project_id).order_by(Vehicle.vehicle_no)).all()
    return [{"id": v.id, "vehicle_no": v.vehicle_no, "vehicle_type": v.vehicle_type, "status": v.status, "breakdown_since": v.breakdown_since, "breakdown_reason": v.breakdown_reason} for v in rows]

@app.get("/projects/{project_id}/blockers")
def project_blockers(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(project_id, user, db)
    rows = db.scalars(select(Blocker).where(Blocker.project_id == project_id).order_by(Blocker.opened_at.desc())).all()
    return [{"id": b.id, "project_id": b.project_id, "category": b.category, "description": b.description, "impact": b.impact, "responsible_party": b.responsible_party, "status": b.status, "opened_at": b.opened_at, "days_open": max(0, (datetime.utcnow().date() - b.opened_at.date()).days)} for b in rows]

@app.post("/projects/{project_id}/blockers")
def create_blocker(project_id: int, payload: BlockerCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(project_id, user, db)
    row = Blocker(project_id=project_id, category=payload.category, description=payload.description, impact=payload.impact, responsible_party=payload.responsible_party, entered_by=user.id)
    db.add(row); db.commit(); db.refresh(row)
    return {"id": row.id, "status": row.status}

@app.patch("/blockers/{blocker_id}/close")
def close_blocker(blocker_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    row = db.get(Blocker, blocker_id)
    if not row:
        raise HTTPException(status_code=404, detail="Blocker not found")
    require_project_access(row.project_id, user, db)
    row.status = "closed"; row.closed_at = datetime.utcnow(); db.commit()
    return {"id": row.id, "status": row.status}

@app.get("/projects/{project_id}/site-visits")
def site_visits(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(project_id, user, db)
    rows = db.scalars(select(SiteVisit).where(SiteVisit.project_id == project_id).order_by(SiteVisit.visited_at.desc())).all()
    return [{"id": r.id, "visitor": r.visitor, "location_ref": r.location_ref, "observations": r.observations, "instructions": r.instructions, "target_date": r.target_date, "visited_at": r.visited_at} for r in rows]

@app.post("/projects/{project_id}/site-visits")
def create_site_visit(project_id: int, payload: SiteVisitCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(project_id, user, db)
    row = SiteVisit(project_id=project_id, visitor=payload.visitor, location_ref=payload.location_ref, observations=payload.observations, instructions=payload.instructions, target_date=payload.target_date, entered_by=user.id)
    db.add(row); db.commit(); db.refresh(row)
    return {"id": row.id, "visited_at": row.visited_at}

@app.get("/projects/{project_id}/manager-files")
def manager_files(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_manager_or_md(user); require_project_access(project_id, user, db)
    rows = db.scalars(select(ManagerDocument).where(ManagerDocument.project_id == project_id).order_by(ManagerDocument.created_at.desc())).all()
    return [{"id": r.id, "category": r.category, "title": r.title, "notes": r.notes, "uploaded_by": r.uploaded_by, "created_at": r.created_at} for r in rows]

@app.post("/projects/{project_id}/manager-files")
def add_manager_file(project_id: int, payload: ManagerDocumentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_manager_or_md(user); require_project_access(project_id, user, db)
    row = ManagerDocument(project_id=project_id, category=payload.category, title=payload.title, notes=payload.notes, uploaded_by=user.id)
    db.add(row); db.commit(); db.refresh(row)
    return {"id": row.id, "created_at": row.created_at}

@app.get("/projects/{project_id}/villas")
def villas(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_project_access(project_id, user, db)
    rows = db.scalars(select(Villa).where(Villa.project_id == project_id).order_by(Villa.villa_no)).all()
    return [{"id": v.id, "villa_no": v.villa_no, "progress": v.progress_percent, "current_stage": v.current_stage, "status": v.status} for v in rows]

@app.get("/villas/{villa_id}/stages")
def villa_stages(villa_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    villa = db.get(Villa, villa_id)
    if not villa:
        raise HTTPException(status_code=404, detail="Villa not found")
    require_project_access(villa.project_id, user, db)
    rows = db.scalars(select(VillaStage).where(VillaStage.villa_id == villa_id).order_by(VillaStage.sequence)).all()
    return [{"id": s.id, "stage_name": s.stage_name, "sequence": s.sequence, "status": s.status, "progress": s.progress_percent, "last_update": s.last_update} for s in rows]

@app.get("/dashboard/md")
def md_dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_md(user)
    ids = workspace_project_ids(db, user)
    total_projects = len(ids)
    today = date.today()
    workforce = db.scalar(select(func.coalesce(func.sum(DailyManpower.count), 0)).where(DailyManpower.work_date == today, DailyManpower.project_id.in_(ids))) or 0 if ids else 0
    active_machinery = db.scalar(select(func.count(Vehicle.id)).where(Vehicle.status == "working", Vehicle.project_id.in_(ids))) or 0 if ids else 0
    active_blockers = db.scalar(select(func.count(Blocker.id)).where(Blocker.status == "open", Blocker.project_id.in_(ids))) or 0 if ids else 0
    trips = db.scalar(select(func.coalesce(func.sum(SiteUpdate.lorry_trips), 0)).where(func.date(SiteUpdate.created_at) == today, SiteUpdate.project_id.in_(ids))) or 0 if ids else 0
    projects = db.scalars(select(Project).where(Project.id.in_(ids)).order_by(Project.progress_percent.desc())).all() if ids else []
    blockers = db.scalars(select(Blocker).where(Blocker.status == "open", Blocker.project_id.in_(ids)).order_by(Blocker.opened_at.desc()).limit(8)).all() if ids else []
    return {
        "kpis": {"total_projects": total_projects, "total_workforce": workforce, "active_machinery": active_machinery, "lorry_trips": trips, "active_blockers": active_blockers},
        "projects": [{"id": p.id, "name": p.name, "code": p.code, "type": p.project_type.value, "progress": p.progress_percent} for p in projects],
        "blockers": [{"id": b.id, "project_id": b.project_id, "category": b.category, "description": b.description, "status": b.status} for b in blockers],
    }

@app.get("/dashboard/projects/{project_id}")
def project_dashboard(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = require_project_access(project_id, user, db)
    today = date.today()
    updates = db.scalars(select(SiteUpdate).where(SiteUpdate.project_id == project_id).order_by(SiteUpdate.created_at.desc()).limit(8)).all()
    manpower = db.scalar(select(func.coalesce(func.sum(DailyManpower.count), 0)).where(DailyManpower.project_id == project_id, DailyManpower.work_date == today)) or 0
    machinery = db.scalar(select(func.count(Vehicle.id)).where(Vehicle.project_id == project_id, Vehicle.status == "working")) or 0
    blockers = db.scalar(select(func.count(Blocker.id)).where(Blocker.project_id == project_id, Blocker.status == "open")) or 0
    return {"project": {"id": project.id, "name": project.name, "type": project.project_type.value, "progress": project.progress_percent}, "kpis": {"updates": len(updates), "manpower": manpower, "active_machinery": machinery, "blockers": blockers}, "recent_updates": [{"id": u.id, "activity": u.activity, "location_ref": u.location_ref, "description": u.clean_description, "created_at": u.created_at} for u in updates]}
