from datetime import date, timedelta
from sqlalchemy import select
from .db import Base, engine, SessionLocal
from .models import (
    User, Role, Project, ProjectType, ProjectUser, SiteUpdate, Blocker, LabourType,
    DailyManpower, Personnel, Vehicle, Villa, VillaStage, SiteVisit, ManagerDocument,
)
from .security import hash_password

STAGES = [
    "Site Preparation", "Excavation", "PCC", "Foundation", "Plinth",
    "Ground Floor Structure", "First Floor Structure", "Roof Slab", "Blockwork",
    "MEP Rough-in", "Internal Plaster", "External Plaster", "Waterproofing",
    "Flooring/Tiling", "Ceiling", "Doors & Windows", "Electrical", "Plumbing/Sanitary",
    "Painting", "Fixtures", "External Works", "Snagging", "Final Inspection", "Handover",
]

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
        for lt,c in zip(labour,[12,24,8,9,14,5,4]):
            db.add(DailyManpower(project_id=projects[0].id, labour_type_id=lt.id, work_date=today, count=c, entered_by=users[2].id))

        db.add_all([
            Personnel(name="Ramesh Kumar", personnel_type="Driver", project_id=projects[0].id, vehicle_or_machine="TS09AB1234 · Tipper", status="working"),
            Personnel(name="Suresh Yadav", personnel_type="Driver", project_id=projects[0].id, vehicle_or_machine="TS08CD4471 · Water Tanker", status="working"),
            Personnel(name="Arun Naik", personnel_type="Machine Operator", project_id=projects[0].id, vehicle_or_machine="EX-12 · Excavator", status="working"),
            Personnel(name="Mahesh", personnel_type="Machine Operator", project_id=projects[0].id, vehicle_or_machine="GR-04 · Grader", status="breakdown"),
            Personnel(name="Praveen Reddy", personnel_type="Survey Team", project_id=projects[0].id, vehicle_or_machine=None, status="working"),
        ])
        db.add_all([
            SiteUpdate(project_id=projects[0].id,user_id=users[2].id,activity="Grader Working",location_ref="CH 19+500",original_description="19+500 daggara grader work chestundi 6 lorry soil vachindi",clean_description="Grader operation is in progress at CH 19+500. Six lorry loads of soil were reported as delivered.",quantity=620,unit="m³",manpower_total=18,machinery_count=2,lorry_trips=6,has_blocker=False),
            SiteUpdate(project_id=projects[0].id,user_id=users[2].id,activity="Compaction",location_ref="CH 20+100 to 20+300",original_description="roller compaction ongoing",clean_description="Roller compaction is ongoing between CH 20+100 and CH 20+300.",quantity=200,unit="m",manpower_total=11,machinery_count=1,lorry_trips=0,has_blocker=False),
            SiteUpdate(project_id=projects[3].id,user_id=users[2].id,activity="Blockwork",location_ref="Villa 12 - First Floor",original_description="villa 12 block work start",clean_description="Blockwork has started on the first floor of Villa 12.",manpower_total=16,machinery_count=0,lorry_trips=0,has_blocker=False),
        ])
        db.add_all([
            Blocker(project_id=projects[0].id,category="Machinery Breakdown",description="Grader GR-04 hydraulic issue",impact="Formation grading slowed",responsible_party="Plant team",status="open",entered_by=users[2].id),
            Blocker(project_id=projects[1].id,category="Drawing Approval",description="Drain detail drawing approval pending",impact="Drain work cannot start",responsible_party="Client/consultant",status="open",entered_by=users[1].id),
            Blocker(project_id=projects[4].id,category="Material Shortage",description="AAC block delivery delayed",impact="Blockwork sequence affected",responsible_party="Procurement",status="open",entered_by=users[1].id),
        ])
        db.add_all([
            Vehicle(vehicle_no="GR-04",vehicle_type="Grader",status="breakdown",project_id=projects[0].id,breakdown_since=today-timedelta(days=2),breakdown_reason="Hydraulic pressure issue"),
            Vehicle(vehicle_no="EX-12",vehicle_type="Excavator",status="working",project_id=projects[0].id),
            Vehicle(vehicle_no="TS09AB1234",vehicle_type="Tipper",status="working",project_id=projects[0].id),
            Vehicle(vehicle_no="TS08CD4471",vehicle_type="Water Tanker",status="working",project_id=projects[0].id),
            Vehicle(vehicle_no="RL-07",vehicle_type="Roller",status="working",project_id=projects[2].id),
        ])
        db.add(SiteVisit(project_id=projects[0].id,visitor="Chief Project Manager",location_ref="CH 19+500 to 20+300",observations="Formation activity progressing; improve water tanker cycle during compaction.",instructions="Close GR-04 repair and maintain layer-wise survey records.",target_date=today+timedelta(days=2),entered_by=users[1].id))
        db.add(ManagerDocument(project_id=projects[0].id,category="Client Correspondence",title="Weekly coordination meeting notes",notes="Demo private record visible only to Manager and MD.",uploaded_by=users[1].id))

        for project,count in [(projects[3],8),(projects[4],6),(projects[5],5)]:
            for i in range(1,count+1):
                progress=min(92, 20+i*7 if project.id==projects[3].id else 10+i*5)
                stage="Internal Plaster" if progress>=60 else "Blockwork" if progress>=40 else "Structure"
                villa=Villa(project_id=project.id,villa_no=f"Villa {i:02d}",progress_percent=progress,current_stage=stage,status="in_progress")
                db.add(villa); db.flush()
                completed_count=max(1, round(progress/100*len(STAGES)))
                for seq,name in enumerate(STAGES,1):
                    if seq < completed_count:
                        status,pct="completed",100
                    elif seq == completed_count:
                        status,pct="in_progress",max(10,min(90,int(progress%10)*10 or 60))
                    else:
                        status,pct="not_started",0
                    db.add(VillaStage(villa_id=villa.id,stage_name=name,sequence=seq,status=status,progress_percent=pct))
        db.commit()
    finally:
        db.close()
