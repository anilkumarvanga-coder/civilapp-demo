import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import api from './api'
import type { LabourType, Project, SiteUpdate, User } from './types'
import { AlertTriangle, ArrowLeft, Building2, HardHat, LayoutDashboard, LockKeyhole, LogOut, Plus, Truck, UsersRound, X } from 'lucide-react'

type ModalKind = 'update'|'blocker'|'manpower'|'visit'|null

function Login({onLogin}:{onLogin:(u:User)=>void}){
  const nav=useNavigate()
  const [loading,setLoading]=useState<string|null>(null)
  const [error,setError]=useState('')

  async function demoLogin(role:'md'|'manager'|'field'){
    const accounts={
      md:'md@civilapp.local',
      manager:'manager@civilapp.local',
      field:'field@civilapp.local',
    }
    setLoading(role); setError('')
    try{
      const {data}=await api.post('/auth/login',{email:accounts[role],password:'demo123'})
      localStorage.setItem('civilapp_token',data.access_token)
      const me=await api.get('/me')
      onLogin(me.data)
      nav('/')
    }catch{
      setError('Demo login could not connect to the backend. Please check the API deployment.')
    }finally{
      setLoading(null)
    }
  }

  return <div className="login-page">
    <div className="login-card">
      <div className="brand"><HardHat size={30}/><div><strong>CivilApp</strong><span>Construction Project Intelligence</span></div></div>
      <h1>Choose Demo View</h1>
      <p>Select the role you want to demonstrate. No email or password required.</p>
      {error&&<div className="error">{error}</div>}
      <div className="role-login-grid">
        <button className="role-login primary-role" onClick={()=>demoLogin('md')} disabled={!!loading}>
          <strong>{loading==='md'?'Opening…':'MD Demo'}</strong>
          <span>Company dashboard, all projects, reports & controls</span>
        </button>
        <button className="role-login" onClick={()=>demoLogin('manager')} disabled={!!loading}>
          <strong>{loading==='manager'?'Opening…':'Manager Demo'}</strong>
          <span>Assigned projects, site overview & private manager files</span>
        </button>
        <button className="role-login" onClick={()=>demoLogin('field')} disabled={!!loading}>
          <strong>{loading==='field'?'Opening…':'Field Demo'}</strong>
          <span>Site updates, manpower, blockers & field data collection</span>
        </button>
      </div>
      <div className="demo-note">Demo data only · production login will be configured after approval</div>
    </div>
  </div>
}

function Kpi({label,value}:{label:string,value:any}){return <div className="kpi"><span>{label}</span><strong>{value}</strong></div>}
function Progress({value}:{value:number}){return <div className="progress"><i style={{width:`${value}%`}}/></div>}

function MDDashboard({projects,onOpen}:{projects:Project[],onOpen:(p:Project)=>void}){
  const [data,setData]=useState<any>(null)
  useEffect(()=>{api.get('/dashboard/md').then(r=>setData(r.data))},[])
  const k=data?.kpis
  return <><header className="page-head"><div><h1>Company Dashboard</h1><p>Live view across all active projects</p></div><span className="pill">Demo data</span></header><div className="kpi-grid"><Kpi label="Total Projects" value={k?.total_projects??'—'}/><Kpi label="Workforce Today" value={k?.total_workforce??'—'}/><Kpi label="Active Machinery" value={k?.active_machinery??'—'}/><Kpi label="Lorry Trips Today" value={k?.lorry_trips??'—'}/><Kpi label="Active Blockers" value={k?.active_blockers??'—'}/></div><div className="two-col"><section className="panel"><h2>Project Progress</h2><div className="project-list">{projects.map(p=><button className="project-row clickable" onClick={()=>onOpen(p)} key={p.id}><div><b>{p.name}</b><span>{p.code} · {p.project_type} · {p.location}</span></div><div className="progress-wrap"><Progress value={p.progress_percent}/><b>{p.progress_percent}%</b></div></button>)}</div></section><section className="panel"><h2>Active Blockers</h2><div className="blockers">{data?.blockers?.map((b:any)=><div className="blocker" key={b.id}><AlertTriangle size={18}/><div><b>{b.category}</b><span>{b.description}</span></div></div>)}</div></section></div></>
}

function ActionModal({kind,project,onClose,onDone}:{kind:ModalKind,project:Project,onClose:()=>void,onDone:()=>void}){
  const [labour,setLabour]=useState<LabourType[]>([]); const [busy,setBusy]=useState(false); const [form,setForm]=useState<any>({activity:'Earthwork',location_ref:'CH 19+500',description:'',manpower_total:0,machinery_count:0,lorry_trips:0,category:'Machinery Breakdown',impact:'',responsible_party:'',visitor:'',observations:'',instructions:'',work_date:new Date().toISOString().slice(0,10),counts:{}})
  useEffect(()=>{if(kind==='manpower')api.get('/labour-types').then(r=>setLabour(r.data))},[kind])
  if(!kind)return null
  function set(k:string,v:any){setForm((f:any)=>({...f,[k]:v}))}
  async function save(e:React.FormEvent){e.preventDefault();setBusy(true);try{
    if(kind==='update')await api.post('/updates',{project_id:project.id,activity:form.activity,location_ref:form.location_ref,description:form.description,manpower_total:+form.manpower_total,machinery_count:+form.machinery_count,lorry_trips:+form.lorry_trips,has_blocker:false})
    if(kind==='blocker')await api.post(`/projects/${project.id}/blockers`,{category:form.category,description:form.description,impact:form.impact,responsible_party:form.responsible_party})
    if(kind==='visit')await api.post(`/projects/${project.id}/site-visits`,{visitor:form.visitor,location_ref:form.location_ref,observations:form.observations,instructions:form.instructions})
    if(kind==='manpower')await api.post(`/projects/${project.id}/manpower`,{work_date:form.work_date,items:labour.map(l=>({labour_type_id:l.id,count:+(form.counts[l.id]||0)}))})
    onDone();onClose()
  }finally{setBusy(false)}}
  return <div className="modal-backdrop"><form className="modal" onSubmit={save}><div className="modal-head"><div><b>{kind==='update'?'Upload Site Update':kind==='blocker'?'Raise Blocker':kind==='manpower'?'Daily Manpower':'Site Visit'}</b><span>{project.name}</span></div><button type="button" onClick={onClose}><X/></button></div>{kind==='update'&&<><label>Activity<select value={form.activity} onChange={e=>set('activity',e.target.value)}><option>Earthwork</option><option>Excavation</option><option>Grader Working</option><option>Compaction</option><option>Survey Work</option><option>Structure/Culvert</option><option>Blockwork</option><option>Painting</option></select></label><label>Chainage / Villa / Area<input value={form.location_ref} onChange={e=>set('location_ref',e.target.value)}/></label><label>Description<textarea required placeholder="Type Telugu, English, or mixed language…" value={form.description} onChange={e=>set('description',e.target.value)}/></label><div className="form-grid"><label>Manpower<input type="number" min="0" value={form.manpower_total} onChange={e=>set('manpower_total',e.target.value)}/></label><label>Machinery<input type="number" min="0" value={form.machinery_count} onChange={e=>set('machinery_count',e.target.value)}/></label><label>Lorry trips<input type="number" min="0" value={form.lorry_trips} onChange={e=>set('lorry_trips',e.target.value)}/></label></div></>}{kind==='blocker'&&<><label>Category<select value={form.category} onChange={e=>set('category',e.target.value)}><option>Machinery Breakdown</option><option>Drawing Approval</option><option>Material Shortage</option><option>Land Issue</option><option>Utility Shifting</option><option>Rain</option><option>Labour</option></select></label><label>Description<textarea required value={form.description} onChange={e=>set('description',e.target.value)}/></label><label>Impact<input value={form.impact} onChange={e=>set('impact',e.target.value)}/></label><label>Responsible party<input value={form.responsible_party} onChange={e=>set('responsible_party',e.target.value)}/></label></>}{kind==='manpower'&&<><label>Date<input type="date" value={form.work_date} onChange={e=>set('work_date',e.target.value)}/></label><div className="manpower-grid">{labour.map(l=><label key={l.id}>{l.name}<small>{l.tracking_mode==='individual'?'individual drill-down':'count only'}</small><input type="number" min="0" value={form.counts[l.id]||''} onChange={e=>setForm((f:any)=>({...f,counts:{...f.counts,[l.id]:e.target.value}}))}/></label>)}</div></>}{kind==='visit'&&<><label>Visitor<input required value={form.visitor} onChange={e=>set('visitor',e.target.value)}/></label><label>Location<input value={form.location_ref} onChange={e=>set('location_ref',e.target.value)}/></label><label>Observations<textarea required value={form.observations} onChange={e=>set('observations',e.target.value)}/></label><label>Instructions<textarea value={form.instructions} onChange={e=>set('instructions',e.target.value)}/></label></>}<button className="primary" disabled={busy}>{busy?'Saving…':'Save'}</button></form></div>
}

function VillaView({project}:{project:Project}){
  const [villas,setVillas]=useState<any[]>([]); const [selected,setSelected]=useState<any>(null); const [stages,setStages]=useState<any[]>([])
  useEffect(()=>{api.get(`/projects/${project.id}/villas`).then(r=>{setVillas(r.data);setSelected(r.data[0]||null)})},[project.id])
  useEffect(()=>{if(selected)api.get(`/villas/${selected.id}/stages`).then(r=>setStages(r.data))},[selected])
  return <div className="villa-layout"><section className="panel"><h2>Villa Development Progress</h2><div className="villa-grid">{villas.map(v=><button className={selected?.id===v.id?'villa-card selected':'villa-card'} onClick={()=>setSelected(v)} key={v.id}><b>{v.villa_no}</b><span>{v.current_stage}</span><Progress value={v.progress}/><strong>{v.progress}%</strong></button>)}</div></section><section className="panel"><h2>{selected?.villa_no||'Villa'} · Construction Journey</h2><div className="stage-track">{stages.map(s=><div className={`stage ${s.status}`} key={s.id}><i/><div><b>{s.stage_name}</b><span>{s.status.replace('_',' ')} · {s.progress}%</span></div></div>)}</div></section></div>
}

function ProjectWorkspace({project,user,onBack}:{project:Project,user:User,onBack:()=>void}){
  const [tab,setTab]=useState('overview'); const [modal,setModal]=useState<ModalKind>(null); const [refresh,setRefresh]=useState(0); const [dash,setDash]=useState<any>(null); const [updates,setUpdates]=useState<SiteUpdate[]>([]); const [blockers,setBlockers]=useState<any[]>([]); const [manpower,setManpower]=useState<any>(null); const [vehicles,setVehicles]=useState<any[]>([]); const [people,setPeople]=useState<any[]>([]); const [managerFiles,setManagerFiles]=useState<any[]>([])
  async function load(){const calls=[api.get(`/dashboard/projects/${project.id}`),api.get(`/projects/${project.id}/updates`),api.get(`/projects/${project.id}/blockers`),api.get(`/projects/${project.id}/manpower`),api.get(`/projects/${project.id}/vehicles`),api.get(`/projects/${project.id}/personnel`)];const [d,u,b,m,v,p]=await Promise.all(calls);setDash(d.data);setUpdates(u.data);setBlockers(b.data);setManpower(m.data);setVehicles(v.data);setPeople(p.data);if(user.role!=='field')api.get(`/projects/${project.id}/manager-files`).then(r=>setManagerFiles(r.data))}
  useEffect(()=>{load()},[project.id,refresh])
  const tabs=useMemo(()=>['overview','updates','manpower','vehicles',...(project.project_type==='villa'?['villas']:[]),...(user.role!=='field'?['manager files']:[])],[project.project_type,user.role])
  return <><button className="back" onClick={onBack}><ArrowLeft size={17}/>All projects</button><header className="page-head"><div><h1>{project.name}</h1><p>{project.code} · {project.client} · {project.location}</p></div><div className="header-actions"><button onClick={()=>setModal('update')} className="primary"><Plus size={16}/>Upload Update</button></div></header><div className="tabbar">{tabs.map(t=><button className={tab===t?'active':''} onClick={()=>setTab(t)} key={t}>{t}</button>)}</div>{tab==='overview'&&<><div className="kpi-grid compact"><Kpi label="Progress" value={`${project.progress_percent}%`}/><Kpi label="Recent Updates" value={dash?.kpis?.updates??'—'}/><Kpi label="Manpower Today" value={dash?.kpis?.manpower??'—'}/><Kpi label="Active Machinery" value={dash?.kpis?.active_machinery??'—'}/><Kpi label="Blockers" value={dash?.kpis?.blockers??'—'}/></div><section className="panel"><h2>Quick Actions</h2><div className="quick-actions"><button onClick={()=>setModal('update')}>Upload Update</button><button onClick={()=>setModal('manpower')}>Add Manpower</button><button onClick={()=>setModal('blocker')}>Raise Blocker</button><button onClick={()=>setModal('visit')}>Site Visit</button></div></section><div className="two-col"><section className="panel"><h2>Latest Site Activity</h2>{updates.slice(0,5).map(u=><div className="feed" key={u.id}><i/><div><b>{u.activity} · {u.location_ref}</b><p>{u.clean_description}</p><span>{new Date(u.created_at).toLocaleString()}</span></div></div>)}</section><section className="panel"><h2>Active Blockers</h2>{blockers.filter(b=>b.status==='open').map(b=><div className="blocker" key={b.id}><AlertTriangle size={18}/><div><b>{b.category}</b><span>{b.description}</span><small>{b.days_open} days open</small></div></div>)}</section></div></>}{tab==='updates'&&<section className="panel"><h2>Site Updates</h2>{updates.map(u=><div className="feed" key={u.id}><i/><div><b>{u.activity} · {u.location_ref}</b><p>{u.clean_description}</p><span>Manpower {u.manpower_total} · Machinery {u.machinery_count} · Trips {u.lorry_trips}</span></div></div>)}</section>}{tab==='manpower'&&<section className="panel"><div className="section-head"><h2>Daily Manpower · {manpower?.total||0}</h2><button onClick={()=>setModal('manpower')} className="primary">Update today</button></div><div className="manpower-summary">{manpower?.items?.map((m:any)=><div key={m.labour_type_id}><span>{m.name}</span><strong>{m.count}</strong><small>{m.tracking_mode==='individual'?'Names tracked':'Count only'}</small></div>)}</div>{people.length>0&&<><h3>Tracked Personnel</h3><div className="data-table">{people.map(p=><div key={p.id}><b>{p.name}</b><span>{p.personnel_type}</span><span>{p.vehicle_or_machine||'—'}</span><em>{p.status}</em></div>)}</div></>}</section>}{tab==='vehicles'&&<section className="panel"><h2>Vehicles & Machinery</h2><div className="data-table">{vehicles.map(v=><div key={v.id}><b>{v.vehicle_no}</b><span>{v.vehicle_type}</span><em>{v.status}</em><span>{v.breakdown_reason||'Operating normally'}</span></div>)}</div></section>}{tab==='villas'&&<VillaView project={project}/>} {tab==='manager files'&&<section className="panel"><h2><LockKeyhole size={18}/> Manager Files · Private</h2><p className="muted">Visible only to project managers and MD.</p><div className="data-table">{managerFiles.map(f=><div key={f.id}><b>{f.title}</b><span>{f.category}</span><span>{f.notes}</span></div>)}</div></section>}<ActionModal kind={modal} project={project} onClose={()=>setModal(null)} onDone={()=>setRefresh(v=>v+1)}/></>
}

function SiteHome({projects,onOpen}:{projects:Project[],onOpen:(p:Project)=>void}){
  return <><header className="page-head"><div><h1>My Projects</h1><p>Select a project to collect field data and review activity</p></div></header><div className="cards">{projects.map(p=><button className="project-card clickable" onClick={()=>onOpen(p)} key={p.id}><span>{p.project_type}</span><h3>{p.name}</h3><p>{p.code} · {p.client} · {p.location}</p><Progress value={p.progress_percent}/><b>{p.progress_percent}% complete</b></button>)}</div></>
}

function Dashboard({user}:{user:User}){const [projects,setProjects]=useState<Project[]>([]);const [selected,setSelected]=useState<Project|null>(null);useEffect(()=>{api.get('/projects').then(r=>setProjects(r.data))},[]);if(selected)return <ProjectWorkspace project={selected} user={user} onBack={()=>setSelected(null)}/>;return user.role==='md'?<MDDashboard projects={projects} onOpen={setSelected}/>:<SiteHome projects={projects} onOpen={setSelected}/>}

function Shell({user,onLogout}:{user:User,onLogout:()=>void}){return <div className="app-shell"><aside><div className="brand light"><HardHat/><strong>CivilApp</strong></div><nav><a className="active"><LayoutDashboard size={18}/>Dashboard</a><a><Building2 size={18}/>Projects</a><a><UsersRound size={18}/>Manpower</a><a><Truck size={18}/>Vehicles</a><a><AlertTriangle size={18}/>Blockers</a></nav><div className="sidebar-footer"><div><b>{user.name}</b><span>{user.role.toUpperCase()}</span></div><button onClick={onLogout}><LogOut size={16}/>Logout</button></div></aside><main><Dashboard user={user}/></main></div>}

export default function App(){const [user,setUser]=useState<User|null>(null);const [ready,setReady]=useState(false);useEffect(()=>{const token=localStorage.getItem('civilapp_token');if(!token){setReady(true);return}api.get('/me').then(r=>setUser(r.data)).catch(()=>localStorage.removeItem('civilapp_token')).finally(()=>setReady(true))},[]);function logout(){localStorage.removeItem('civilapp_token');setUser(null)}if(!ready)return null;return <Routes><Route path="/login" element={user?<Navigate to="/"/>:<Login onLogin={setUser}/>}/><Route path="*" element={user?<Shell user={user} onLogout={logout}/>:<Navigate to="/login"/>}/></Routes>}
