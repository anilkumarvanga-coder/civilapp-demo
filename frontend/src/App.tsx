import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import api from './api'
import type { Project, User } from './types'
import { Building2, HardHat, LayoutDashboard, LogOut, Truck, UsersRound, AlertTriangle } from 'lucide-react'

function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const nav = useNavigate()
  const [email,setEmail]=useState('md@civilapp.local')
  const [password,setPassword]=useState('demo123')
  const [error,setError]=useState('')
  async function submit(e:React.FormEvent){
    e.preventDefault(); setError('')
    try{
      const {data}=await api.post('/auth/login',{email,password})
      localStorage.setItem('civilapp_token',data.access_token)
      const me=await api.get('/me')
      onLogin(me.data); nav('/')
    }catch{setError('Login failed. Use the demo credentials shown below.')}
  }
  return <div className="login-page">
    <div className="login-card">
      <div className="brand"><HardHat size={30}/><div><strong>CivilApp</strong><span>Project Intelligence Demo</span></div></div>
      <h1>Welcome back</h1>
      <p>Sign in to your construction project workspace.</p>
      <form onSubmit={submit}>
        <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
        {error && <div className="error">{error}</div>}
        <button>Sign in</button>
      </form>
      <div className="demo-accounts">
        <b>Demo accounts</b><span>MD: md@civilapp.local</span><span>Manager: manager@civilapp.local</span><span>Field: field@civilapp.local</span><span>Password: demo123</span>
      </div>
    </div>
  </div>
}

function Kpi({label,value}:{label:string,value:any}){return <div className="kpi"><span>{label}</span><strong>{value}</strong></div>}

function MDDashboard({data,projects}:{data:any,projects:Project[]}){
  const k=data?.kpis
  return <div>
    <header className="page-head"><div><h1>Company Dashboard</h1><p>Live overview across all active projects</p></div><span className="pill">Demo data</span></header>
    <div className="kpi-grid">
      <Kpi label="Total Projects" value={k?.total_projects ?? '—'}/><Kpi label="Total Workforce" value={k?.total_workforce ?? '—'}/><Kpi label="Active Machinery" value={k?.active_machinery ?? '—'}/><Kpi label="Lorry Trips" value={k?.lorry_trips ?? '—'}/><Kpi label="Active Blockers" value={k?.active_blockers ?? '—'}/>
    </div>
    <div className="two-col">
      <section className="panel"><h2>Project Progress</h2><div className="project-list">{projects.map(p=><div className="project-row" key={p.id}><div><b>{p.name}</b><span>{p.code} · {p.project_type}</span></div><div className="progress-wrap"><div className="progress"><i style={{width:`${p.progress_percent}%`}}/></div><b>{p.progress_percent}%</b></div></div>)}</div></section>
      <section className="panel"><h2>Active Blockers</h2><div className="blockers">{data?.blockers?.map((b:any)=><div className="blocker" key={b.id}><AlertTriangle size={18}/><div><b>{b.category}</b><span>{b.description}</span></div></div>) || <p>Loading…</p>}</div></section>
    </div>
  </div>
}

function SiteDashboard({projects}:{user:User,projects:Project[]}){
  const p=projects[0]
  return <div>
    <header className="page-head"><div><h1>Site Dashboard</h1><p>{p ? `${p.name} · ${p.location}` : 'Loading assigned project…'}</p></div><button className="primary">+ Upload Update</button></header>
    <div className="kpi-grid compact"><Kpi label="Assigned Projects" value={projects.length}/><Kpi label="Today’s Updates" value="3"/><Kpi label="Manpower on Site" value="87"/><Kpi label="Active Machinery" value="6"/><Kpi label="Blockers" value="1"/></div>
    <section className="panel"><h2>Quick Actions</h2><div className="quick-actions"><button>Upload Update</button><button>Add Photos</button><button>Add Manpower</button><button>Raise Blocker</button><button>Site Visit</button></div></section>
    <section className="panel"><h2>My Projects</h2><div className="cards">{projects.map(p=><div className="project-card" key={p.id}><span>{p.project_type}</span><h3>{p.name}</h3><p>{p.code} · {p.client}</p><div className="progress"><i style={{width:`${p.progress_percent}%`}}/></div><b>{p.progress_percent}% complete</b></div>)}</div></section>
  </div>
}

function Dashboard({user}:{user:User}){
  const [projects,setProjects]=useState<Project[]>([])
  const [md,setMd]=useState<any>(null)
  useEffect(()=>{api.get('/projects').then(r=>setProjects(r.data)); if(user.role==='md') api.get('/dashboard/md').then(r=>setMd(r.data))},[user.role])
  return user.role==='md' ? <MDDashboard data={md} projects={projects}/> : <SiteDashboard user={user} projects={projects}/>
}

function Shell({user,onLogout}:{user:User,onLogout:()=>void}){
  return <div className="app-shell">
    <aside>
      <div className="brand light"><HardHat/><strong>CivilApp</strong></div>
      <nav><a className="active"><LayoutDashboard size={18}/>Dashboard</a><a><Building2 size={18}/>Projects</a><a><UsersRound size={18}/>Manpower</a><a><Truck size={18}/>Vehicles</a><a><AlertTriangle size={18}/>Blockers</a></nav>
      <div className="sidebar-footer"><div><b>{user.name}</b><span>{user.role.toUpperCase()}</span></div><button onClick={onLogout}><LogOut size={16}/>Logout</button></div>
    </aside>
    <main><Dashboard user={user}/></main>
  </div>
}

export default function App(){
  const [user,setUser]=useState<User|null>(null)
  const [ready,setReady]=useState(false)
  useEffect(()=>{const token=localStorage.getItem('civilapp_token'); if(!token){setReady(true);return} api.get('/me').then(r=>setUser(r.data)).finally(()=>setReady(true))},[])
  function logout(){localStorage.removeItem('civilapp_token');setUser(null)}
  if(!ready) return null
  return <Routes><Route path="/login" element={user?<Navigate to="/"/>:<Login onLogin={setUser}/>}/><Route path="*" element={user?<Shell user={user} onLogout={logout}/>:<Navigate to="/login"/>}/></Routes>
}
