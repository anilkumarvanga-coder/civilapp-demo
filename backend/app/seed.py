from datetime import date, datetime, timedelta
from sqlalchemy import select
from .db import Base, engine, SessionLocal
from .models import User, Role, Project, ProjectType, ProjectUser, SiteUpdate, Blocker, LabourType, DailyManpower, Vehicle, Villa
from .security import hash_password

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.scalar(select(User.id).limit(1)):
            return

        users = [
            User(name="Managing Director", email="md@civilapp.local", password_hash=hash_password("demo123"), role=Role.MD),
            User(name="Project Manager", email="manager@civilapp.local", password_hash=hash_password("demo123"), role=Role.MANAGER),
            User(name="Field Supervisor", email="field@civilapp.local", password_hash=hash_password("demo123"), role=Role.FIELD),
        ]
        db.add_all(users); db.flush()

        today = date.today()
        projects = [
            Project(code="RW-101", name="East Corridor Railway Earthwork", project_type=ProjectType.RAILWAY, client="Metro Rail Infra", location="Hyderabad", start_date=today-timedelta(days=120), target_date=today+timedelta(days=240), progress_percent=58),
            Project(code="RW-102", name="North Line Formation Works", project_type=ProjectType.EARTHWORK, client="Rail Infra Corp", location="Warangal", start_date=today-timedelta(days=90), target_date=today+timedelta(days=210), progress_percent=41),
            Project(code="HW-201", name="NH Link Road Package", project_type=ProjectType.ROAD, client="Highways Authority", location="Nalgonda", start_date=today-timedelta(days=150), target_date=today+timedelta(days=300), progress_percent=67),
            Project(code="VL-301", name="Green Meadows Villas", project_type=ProjectType.VILLA, client="Green Meadows Developers", location="Kokapet", start_date=today-timedelta(days=200), target_date=today+timedelta(days=180), progress_percent=62),
            Project(code="VL-302", name="Lakeview Residences", project_type=ProjectType.VILLA, client="Lakeview Homes", location="Tellapur", start_date=today-timedelta(days=100), target_date=today+timedelta(days=260), progress_percent=36),
            Project(code="VL-303", name="Palm County Villas", project_type=ProjectType.VILLA, client="Palm County", location="Shankarpally", start_date=today-timedelta(days=60), target_date=today+timedelta(days=340), progress_percent=22),
        ]
        db.add_all(projects); db.flush()

        for p in projects:
            db.add(ProjectUser(project_id=p.id, user_id=users[1].id))
        for p in projects[:4]:
            db.add(ProjectUser(project_id=p.id, user_id=users[2].id))

        labour = [
            LabourType(name="Mason", tracking_mode="count_only"),
            LabourType(name="Helper", tracking_mode="count_only"),
            LabourType(name="Carpenter", tracking_mode="count_only"),
            LabourType(name="Bar Bender", tracking_mode="count_only"),
            LabourType(name="Driver", tracking_mode="individual"),
            LabourType(name="Machine Operator", tracking_mode="individual"),
            LabourType(name="Survey Team", tracking_mode="individual"),
        ]
        db.add_all(labour); db.flush()

        counts=[12,24,8,9,14,5,4]
        for lt,c in zip(labour,counts):
            db.add(DailyManpower(project_id=projects[0].id, labour_type_id=lt.id, work_date=today, count=c, entered_by=users[2].id))

        updates=[
            SiteUpdate(project_id=projects[0].id,user_id=users[2].id,activity="Grader Working",location_ref="CH 19+500",original_description="19+500 daggara grader work chestundi 6 lorry soil vachindi",clean_description="Grader operation is in progress at CH 19+500. Six lorry loads of soil were reported as delivered.",manpower_total=18,machinery_count=2,lorry_trips=6,has_blocker=False),
            SiteUpdate(project_id=projects[0].id,user_id=users[2].id,activity="Compaction",location_ref="CH 20+100 to 20+300",original_description="roller compaction ongoing",clean_description="Roller compaction is ongoing between CH 20+100 and CH 20+300.",manpower_total=11,machinery_count=1,lorry_trips=0,has_blocker=False),
            SiteUpdate(project_id=projects[3].id,user_id=users[2].id,activity="Blockwork",location_ref="Villa 12 - First Floor",original_description="villa 12 block work start",clean_description="Blockwork has started on the first floor of Villa 12.",manpower_total=16,machinery_count=0,lorry_trips=0,has_blocker=False),
        ]
        db.add_all(updates)
        db.add_all([
            Blocker(project_id=projects[0].id,category="Machinery Breakdown",description="Grader GR-04 hydraulic issue",status="open"),
            Blocker(project_id=projects[1].id,category="Drawing Approval",description="Drain detail drawing approval pending",status="open"),
            Blocker(project_id=projects[4].id,category="Material Shortage",description="AAC block delivery delayed",status="open"),
        ])
        db.add_all([
            Vehicle(vehicle_no="GR-04",vehicle_type="Grader",status="breakdown",project_id=projects[0].id),
            Vehicle(vehicle_no="EX-12",vehicle_type="Excavator",status="working",project_id=projects[0].id),
            Vehicle(vehicle_no="TS09AB1234",vehicle_type="Tipper",status="working",project_id=projects[0].id),
            Vehicle(vehicle_no="RL-07",vehicle_type="Roller",status="working",project_id=projects[2].id),
        ])
        for i in range(1,9):
            db.add(Villa(project_id=projects[3].id,villa_no=f"Villa {i:02d}",progress_percent=min(92,35+i*7),current_stage="Plaster" if i>4 else "Blockwork",status="in_progress"))
        for i in range(1,7):
            db.add(Villa(project_id=projects[4].id,villa_no=f"Villa {i:02d}",progress_percent=18+i*4,current_stage="Structure",status="in_progress"))
        db.commit()
    finally:
        db.close()
