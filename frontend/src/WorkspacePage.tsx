import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, Building2, HardHat, LayoutDashboard, LockKeyhole, LogOut, Truck, UsersRound } from 'lucide-react'
import api from './api'
import type { Project, User } from './types'
import type { AppWorkspace } from './AuthPages'

function Progress({value}:{value:number}){return <div className="progress"><i style={{width:`${value}%`}}/></div>}
function Kpi({label,value}:{label:string,value:any}){return <div className="kpi"><span>{label}</span><strong>{value}</strong></div>}

function InfraDashboard({projects,onOpen}:{projects:Project[],onOpen:(p:Project)=>void}){
  const [data,setData]=useState<any>(null)
  useEffect(()=>{api.get('/dashboard/md').then(r=>setData(r.data))},[])
  const k=data?.kpis
  return <><header className="page-head hero-head"><div><span className="eyebrow">INFRA PORTFOLIO CONTROL</span><h1>Road & Railway Command Center</h1><p>Chainage progress, field productivity and risk across active packages.</p></div><span className="pill">Live portfolio</span></header>
    <div className="kpi-grid"><Kpi label="Active Projects" value={k?.total_projects??'—'}/><Kpi label="Workforce Today" value={k?.total_workforce??'—'}/><Kpi label="Active Machinery" value={k?.active_machinery??'—'}/><Kpi label="Lorry Trips" value={k?.lorry_trips??'—'}/><Kpi label="Blockers" value={k?.active_blockers??'—'}/></div>
    <div className="infra-strip"><span>CH 10+000</span><div><i style={{width:'68%'}}/></div><span>CH 25+000</span></div>
    <div className="two-col"><section className="panel"><h2>Project Progress</h2>{projects.map(p=><button className="project-row clickable" onClick={()=>onOpen(p)} key={p.id}><div><b>{p.name}</b><span>{p.code} · {p.project_type} · {p.location}</span></div><div className="progress-wrap"><Progress value={p.progress_percent}/><b>{p.progress_percent}%</b></div></button>)}</section><section className="panel"><h2>Critical Issues</h2>{data?.blockers?.map((b:any)=><div className="blocker" key={b.id}><AlertTriangle size={18}/><div><b>{b.category}</b><span>{b.description}</span></div></div>)}</section></div></>
}

function BuildDashboard({projects,onOpen}:{projects:Project[],onOpen:(p:Project)=>void}){
  const avg=projects.length?Math.round(projects.reduce((a,p)=>a+p.progress_percent,0)/projects.length):0
  return <div className="build-dashboard"><header className="build-hero"><div><span className="eyebrow">BUILD DEVELOPMENT INTELLIGENCE</span><h1>Every asset. Every stage. Visually clear.</h1><p>Track villa and building progress from excavation to handover.</p></div><div className="build-score"><span>Portfolio completion</span><strong>{avg}%</strong></div></header>
    <div className="build-kpis"><div><span>Developments</span><b>{projects.length}</b></div><div><span>Portfolio Progress</span><b>{avg}%</b></div><div><span>Visual Journeys</span><b>Active</b></div><div><span>Stage Tracking</span><b>Live</b></div></div>
    <section className="build-projects"><div className="section-title"><div><span className="eyebrow">DEVELOPMENTS</span><h2>Construction portfolio</h2></div><span>Open a development to explore the construction journey</span></div><div className="build-project-grid">{projects.map((p,i)=><button className="build-project-card" onClick={()=>onOpen(p)} key={p.id}><div className={`build-cover cover-${i%3+1}`}><span>{p.location}</span><strong>{p.progress_percent}%</strong></div><div className="build-card-body"><span>{p.code}</span><h3>{p.name}</h3><p>{p.client}</p><Progress value={p.progress_percent}/><div><b>{p.progress_percent}% complete</b><em>View journey →</em></div></div></button>)}</div></section>
  </div>
}

function VillaJourney({project}:{project:Project}){
  const [villas,setVillas]=useState<any[]>([]);const [selected,setSelected]=useState<any>(null);const [stages,setStages]=useState<any[]>([])
  useEffect(()=>{api.get(`/projects/${project.id}/villas`).then(r=>{setVillas(r.data);setSelected(r.data[0]||null)})},[project.id])
  useEffect(()=>{if(selected)api.get(`/villas/${selected.id}/stages`).then(r=>setStages(r.data))},[selected])
  return <><section className="panel build-panel"><span className="eyebrow">ASSET MATRIX</span><h2>Villa Progress</h2><div className="villa-grid">{villas.map(v=><button key={v.id} className={selected?.id===v.id?'villa-card selected':'villa-card'} onClick={()=>setSelected(v)}><b>{v.villa_no}</b><span>{v.current_stage}</span><Progress value={v.progress}/><strong>{v.progress}%</strong></button>)}</div></section><section className="panel build-panel"><span className="eyebrow">CONSTRUCTION JOURNEY</span><h2>{selected?.villa_no||'Villa'} · Stage Timeline</h2><div className="journey-placeholder"><Building2 size={42}/><span>Stage photos and drone comparisons will appear here</span></div><div className="stage-track">{stages.map(s=><div className={`stage ${s.status}`} key={s.id}><i/><div><b>{s.stage_name}</b><span>{s.status.replace('_',' ')} · {s.progress}%</span></div></div>)}</div></section></>
}

function ProjectDetail({project,workspace,onBack}:{project:Project,workspace:AppWorkspace,onBack:()=>void}){
  const [dash,setDash]=useState<any>(null);const [updates,setUpdates]=useState<any[]>([]);const [blockers,setBlockers]=useState<any[]>([]);const [vehicles,setVehicles]=useState<any[]>([]);const [tab,setTab]=useState('overview')
  useEffect(()=>{Promise.all([api.get(`/dashboard/projects/${project.id}`),api.get(`/projects/${project.id}/updates`),api.get(`/projects/${project.id}/blockers`),api.get(`/projects/${project.id}/vehicles`)]).then(([d,u,b,v])=>{setDash(d.data);setUpdates(u.data);setBlockers(b.data);setVehicles(v.data)})},[project.id])
  const tabs=useMemo(()=>['overview','updates',...(workspace==='infra'?['vehicles']:['journey'])],[workspace])
  return <><button className="back" onClick={onBack}><ArrowLeft size={17}/>All projects</button><header className="page-head"><div><span className="eyebrow">{workspace==='infra'?'INFRA PROJECT':'BUILD DEVELOPMENT'}</span><h1>{project.name}</h1><p>{project.code} · {project.client} · {project.location}</p></div></header><div className="tabbar">{tabs.map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</div>
    {tab==='overview'&&<><div className="kpi-grid compact"><Kpi label="Progress" value={`${project.progress_percent}%`}/><Kpi label="Recent Updates" value={dash?.kpis?.updates??'—'}/><Kpi label="Manpower" value={dash?.kpis?.manpower??'—'}/><Kpi label={workspace==='infra'?'Active Machinery':'Active Areas'} value={dash?.kpis?.active_machinery??'—'}/><Kpi label="Blockers" value={dash?.kpis?.blockers??'—'}/></div><div className="two-col"><section className="panel"><h2>Latest Site Activity</h2>{updates.slice(0,6).map(u=><div className="feed" key={u.id}><i/><div><b>{u.activity} · {u.location_ref}</b><p>{u.clean_description}</p><span>{new Date(u.created_at).toLocaleString()}</span></div></div>)}</section><section className="panel"><h2>Active Blockers</h2>{blockers.filter(b=>b.status==='open').map(b=><div className="blocker" key={b.id}><AlertTriangle size={18}/><div><b>{b.category}</b><span>{b.description}</span></div></div>)}</section></div></>}
    {tab==='updates'&&<section className="panel"><h2>Site Updates</h2>{updates.map(u=><div className="feed" key={u.id}><i/><div><b>{u.activity} · {u.location_ref}</b><p>{u.clean_description}</p></div></div>)}</section>}
    {tab==='vehicles'&&<section className="panel"><h2>Vehicles & Machinery</h2><div className="data-table">{vehicles.map(v=><div key={v.id}><b>{v.vehicle_no}</b><span>{v.vehicle_type}</span><em>{v.status}</em><span>{v.breakdown_reason||'Operating normally'}</span></div>)}</div></section>}
    {tab==='journey'&&<VillaJourney project={project}/>}
  </>
}

function WorkspaceDashboard({user,workspace}:{user:User,workspace:AppWorkspace}){
  const [projects,setProjects]=useState<Project[]>([]);const [selected,setSelected]=useState<Project|null>(null)
  useEffect(()=>{api.get('/projects').then(r=>setProjects(r.data))},[workspace])
  if(selected)return <ProjectDetail project={selected} workspace={workspace} onBack={()=>setSelected(null)}/>
  if(user.role!=='md')return <><header className="page-head"><div><span className="eyebrow">MY PROJECTS</span><h1>{workspace==='infra'?'Infra Projects':'Build Developments'}</h1></div></header><div className="cards">{projects.map(p=><button className="project-card clickable" onClick={()=>setSelected(p)} key={p.id}><span>{p.project_type}</span><h3>{p.name}</h3><p>{p.code} · {p.location}</p><Progress value={p.progress_percent}/><b>{p.progress_percent}% complete</b></button>)}</div></>
  return workspace==='infra'?<InfraDashboard projects={projects} onOpen={setSelected}/>:<BuildDashboard projects={projects} onOpen={setSelected}/>
}

export function WorkspaceShell({user,workspace,onLogout}:{user:User,workspace:AppWorkspace,onLogout:()=>void}){
  const build=workspace==='build'
  return <div className={build?'app-shell build-shell':'app-shell infra-shell'}><aside><div className="brand light">{build?<Building2/>:<HardHat/>}<div><strong>CivilApp</strong><span>{build?'BUILD':'INFRA'}</span></div></div><nav><a className="active"><LayoutDashboard size={18}/>{build?'Development':'Command Center'}</a><a>{build?<Building2 size={18}/>:<HardHat size={18}/>}Projects</a><a><UsersRound size={18}/>{build?'Teams':'Manpower'}</a>{!build&&<a><Truck size={18}/>Fleet</a>}<a><AlertTriangle size={18}/>{build?'Snagging & Issues':'Blockers'}</a></nav><div className="sidebar-footer"><div><b>{user.name}</b><span>{user.role.toUpperCase()}</span></div><button onClick={onLogout}><LogOut size={16}/>Logout</button></div></aside><main><WorkspaceDashboard user={user} workspace={workspace}/></main></div>
}
