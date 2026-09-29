import { useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, ArrowLeft, BarChart3, Bell, Building2, CalendarDays,
  Camera, CheckCircle2, ChevronRight, Circle, FileText, Gauge, HardHat, Image as ImageIcon,
  Layers3, LayoutDashboard, LockKeyhole, LogOut, Map as MapIcon, MapPinned, PlayCircle,
  Route, Search, ShieldCheck, TrainFront, TrendingUp, Truck, UsersRound, Wrench
} from 'lucide-react'
import { accounts, infraProjects, buildProjects, infraUpdates, villaStages } from './data'

function Progress({value,tone='blue'}) {
  return <div className={`progress ${tone}`}><i style={{width:`${value}%`}}/></div>
}

function Login({onLogin}) {
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  function submit(e){
    e.preventDefault()
    const account=accounts.find(a=>a.email.toLowerCase()===email.toLowerCase()&&a.password===password)
    if(!account){setError('Invalid demo email or password.');return}
    setError('')
    onLogin(account)
  }
  return <div className="demo-login">
    <div className="login-visual">
      <div className="visual-grid"/>
      <header className="login-brand">
        <div className="mark"><HardHat/></div>
        <div><strong>CivilApp</strong><span>Construction Intelligence Platform</span></div>
      </header>
      <div className="visual-copy">
        <span>CONSTRUCTION, MADE VISIBLE.</span>
        <h1>Field reality.<br/>Management clarity.</h1>
        <p>A decision layer for complex construction portfolios — connecting daily execution to progress, risk and capital visibility.</p>
        <div className="visual-pills">
          <div><Route/><b>Infra Intelligence</b><small>Roads · Railway · Earthwork</small></div>
          <div><Building2/><b>Build Intelligence</b><small>Villas · Buildings · Developments</small></div>
        </div>
      </div>
      <div className="floating-card fc-one">
        <span><TrendingUp size={15}/> Portfolio Progress</span><strong>68.4%</strong>
        <Progress value={68}/>
      </div>
      <div className="floating-card fc-two">
        <span><Activity size={15}/> Today on Site</span><strong>42 updates</strong><small>Across 6 active packages</small>
      </div>
      <footer><ShieldCheck size={14}/> Evidence-led progress · Role-based visibility · Investor-ready reporting</footer>
    </div>
    <div className="login-form-wrap">
      <form className="login-form" onSubmit={submit}>
        <div className="mobile-brand"><div className="mark"><HardHat/></div><div><strong>CivilApp</strong><span>Investor Demo</span></div></div>
        <span className="eyebrow">PRIVATE DEMO ACCESS</span>
        <h2>Welcome to CivilApp</h2>
        <p>Sign in to explore a complete construction intelligence experience.</p>
        <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required placeholder="Enter demo email"/></label>
        <label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" required placeholder="Enter password"/></label>
        {error&&<div className="form-error">{error}</div>}
        <button className="login-submit">Enter platform <span>→</span></button>
        <div className="demo-credentials">
          <b>Demo access</b>
          <span>Infra: infra@civilapp.demo</span>
          <span>Build: build@civilapp.demo</span>
          <small>Password: demo123</small>
        </div>
        <div className="login-trust"><LockKeyhole size={14}/> Standalone demo · no backend or live project data</div>
      </form>
    </div>
  </div>
}

function Sidebar({workspace,page,setPage,logout}) {
  const build=workspace==='build'
  const items=build?[
    ['overview',LayoutDashboard,'Development Overview'],
    ['projects',Building2,'Developments'],
    ['visuals',Camera,'Visual Progress'],
    ['issues',AlertTriangle,'Issues & Snagging'],
    ['reports',FileText,'Investor Reports']
  ]:[
    ['overview',LayoutDashboard,'Portfolio Overview'],
    ['projects',Route,'Projects'],
    ['chainage',Layers3,'Chainage & Layers'],
    ['fleet',Truck,'Fleet & Machinery'],
    ['people',UsersRound,'Workforce'],
    ['issues',AlertTriangle,'Blockers'],
    ['reports',FileText,'Reports']
  ]
  return <aside className={build?'sidebar build-side':'sidebar'}>
    <div className="side-brand"><div className="side-mark">{build?<Building2/>:<HardHat/>}</div><div><strong>CivilApp</strong><span>{build?'BUILD':'INFRA'}</span></div></div>
    <nav>{items.map(([id,Icon,label])=><button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}><Icon size={17}/><span>{label}</span></button>)}</nav>
    <div className="side-bottom"><div className="plan-badge"><ShieldCheck size={15}/><span><b>{build?'Build':'Infra'} Enterprise</b><small>Investor demo plan</small></span></div><button onClick={logout}><LogOut size={16}/>Sign out</button></div>
  </aside>
}

function Topbar({account,workspace}) {
  return <header className="topbar">
    <div><span className="top-context">{workspace==='infra'?'INFRA PORTFOLIO':'BUILD PORTFOLIO'}</span><b>{account.name}</b></div>
    <div className="top-actions"><button><Search size={18}/></button><button className="notification"><Bell size={18}/><i/></button><div className="avatar">{account.name.split(' ').slice(0,2).map(x=>x[0]).join('')}</div></div>
  </header>
}

function Kpi({icon:Icon,label,value,detail,tone}) {
  return <div className={`kpi ${tone||''}`}><div className="kpi-top"><span>{label}</span><div><Icon size={18}/></div></div><strong>{value}</strong><small>{detail}</small></div>
}

function InfraOverview({openProject}) {
  return <div className="page">
    <section className="page-title"><div><span className="eyebrow">PORTFOLIO COMMAND CENTER</span><h1>Infrastructure at a glance</h1><p>Live commercial and operational intelligence across roads, railway and earthwork.</p></div><button className="primary"><BarChart3 size={16}/>Executive report</button></section>
    <div className="kpi-row">
      <Kpi icon={Route} label="Active Projects" value="3" detail="₹2,170 Cr portfolio value"/>
      <Kpi icon={UsersRound} label="Workforce Today" value="1,248" detail="+6.4% vs last week"/>
      <Kpi icon={Truck} label="Active Equipment" value="84" detail="91% utilization"/>
      <Kpi icon={TrendingUp} label="Overall Progress" value="67.7%" detail="+2.8% this month"/>
      <Kpi icon={AlertTriangle} label="Critical Blockers" value="4" detail="2 require management action" tone="warning"/>
    </div>

    <div className="grid-main">
      <section className="card map-card">
        <div className="card-head"><div><span className="eyebrow">GEOGRAPHIC VIEW</span><h2>Portfolio map</h2></div><button className="ghost">Open map <ChevronRight size={15}/></button></div>
        <div className="map-visual">
          <div className="map-lines"/>
          <div className="map-pin p1"><i/><span><b>RL-EC-01</b>68%</span></div>
          <div className="map-pin p2"><i/><span><b>NH-167A</b>54%</span></div>
          <div className="map-pin p3"><i/><span><b>EW-09</b>81%</span></div>
          <div className="map-caption"><MapPinned size={15}/> Telangana project cluster · demo visualization</div>
        </div>
      </section>
      <section className="card risk-card">
        <div className="card-head"><div><span className="eyebrow">MANAGEMENT ATTENTION</span><h2>Critical issues</h2></div><span className="count-badge">4 open</span></div>
        <div className="issue-list">
          <div><span className="severity red">CRITICAL</span><b>Land handover pending</b><small>RL-EC-01 · CH 22+400–22+900</small><em>6 days</em></div>
          <div><span className="severity amber">HIGH</span><b>Drain drawing approval</b><small>NH-167A · Structure Zone 04</small><em>3 days</em></div>
          <div><span className="severity amber">HIGH</span><b>Grader hydraulic failure</b><small>EW-09 · GR-04</small><em>2 days</em></div>
          <div><span className="severity blue">WATCH</span><b>Utility shifting interface</b><small>RL-EC-01 · CH 18+700</small><em>1 day</em></div>
        </div>
      </section>
    </div>

    <section className="card portfolio-card">
      <div className="card-head"><div><span className="eyebrow">ACTIVE PACKAGES</span><h2>Project performance</h2></div><button className="ghost">View portfolio <ChevronRight size={15}/></button></div>
      <div className="project-grid">{infraProjects.map(p=><button className="project-tile" key={p.id} onClick={()=>openProject(p)}>
        <div className="project-image" style={{backgroundImage:`linear-gradient(to top,rgba(5,12,24,.8),transparent 65%),url("${p.image}")`}}><span>{p.code}</span><div><small>{p.location}</small><strong>{p.progress}%</strong></div></div>
        <div className="project-info"><h3>{p.name}</h3><p>{p.client}</p><Progress value={p.progress}/><div><span>{p.value}</span><b>Open command center →</b></div></div>
      </button>)}</div>
    </section>

    <div className="grid-half">
      <section className="card activity-card"><div className="card-head"><div><span className="eyebrow">FIELD SIGNALS</span><h2>Latest site intelligence</h2></div></div>{infraUpdates.map((u,i)=><div className="activity-item" key={i}><img src={u.image}/><div><span>{u.time} · {u.location}</span><b>{u.activity}</b><p>{u.text}</p></div></div>)}</section>
      <section className="card"><div className="card-head"><div><span className="eyebrow">PERFORMANCE</span><h2>Monthly progress trend</h2></div></div><div className="chart-bars">{[38,45,51,55,60,64,68].map((v,i)=><div key={i}><i style={{height:`${v*1.7}px`}}/><span>{['Mar','Apr','May','Jun','Jul','Aug','Sep'][i]}</span></div>)}</div><div className="chart-note"><TrendingUp size={16}/><span><b>+30 pts</b> portfolio progress since March</span></div></section>
    </div>
  </div>
}

function InfraProject({project,onBack}) {
  const layers=[
    ['Clearing & Grubbing',100,'complete'],
    ['Embankment',82,'active'],
    ['Subgrade',66,'active'],
    ['GSB',48,'active'],
    ['WMM',31,'active'],
    ['Structures',57,'active'],
    ['Drainage',43,'active']
  ]
  return <div className="page">
    <button className="back-button" onClick={onBack}><ArrowLeft size={16}/>Portfolio</button>
    <section className="project-hero" style={{backgroundImage:`linear-gradient(90deg,rgba(5,14,29,.94),rgba(5,14,29,.55)),url("${project.image}")`}}>
      <div><span className="project-code">{project.code}</span><h1>{project.name}</h1><p>{project.client} · {project.location}</p><div className="hero-meta"><span><CalendarDays/>Started {project.start}</span><span><Gauge/>Target {project.target}</span><span><TrendingUp/>{project.value}</span></div></div>
      <div className="hero-progress"><span>Physical progress</span><strong>{project.progress}%</strong><Progress value={project.progress}/><small>+2.6% this month</small></div>
    </section>

    <div className="kpi-row project-kpis">
      <Kpi icon={UsersRound} label="Workforce" value="426" detail="Today on site"/>
      <Kpi icon={Truck} label="Equipment" value="31" detail="28 operational"/>
      <Kpi icon={Activity} label="Today Updates" value="18" detail="Last at 11:05"/>
      <Kpi icon={AlertTriangle} label="Blockers" value="2" detail="1 critical" tone="warning"/>
      <Kpi icon={Gauge} label="Planned vs Actual" value="+1.8%" detail="Ahead of baseline"/>
    </div>

    <div className="grid-main">
      <section className="card chainage-card"><div className="card-head"><div><span className="eyebrow">LINEAR PROGRESS</span><h2>Chainage control strip</h2></div><button className="ghost"><MapIcon size={15}/>Map view</button></div>
        <div className="chainage-scale"><span>CH 10+000</span><span>CH 15+000</span><span>CH 20+000</span><span>CH 25+000</span></div>
        <div className="chainage-track"><div className="segment complete" style={{width:'34%'}}/><div className="segment active" style={{width:'34%'}}/><div className="segment blocked" style={{width:'8%'}}/><div className="segment pending" style={{width:'24%'}}/></div>
        <div className="chainage-legend"><span><i className="complete"/>Completed</span><span><i className="active"/>In progress</span><span><i className="blocked"/>Blocked</span><span><i className="pending"/>Pending</span></div>
        <div className="chainage-focus"><div><small>ACTIVE ZONE</small><b>CH 19+500 → 20+300</b><span>Grading · Compaction · Survey</span></div><strong>800 m</strong></div>
      </section>
      <section className="card"><div className="card-head"><div><span className="eyebrow">LAYER INTELLIGENCE</span><h2>BOQ / activity progress</h2></div></div><div className="layer-list">{layers.map(([name,pct,status])=><div key={name}><div><span>{name}</span><b>{pct}%</b></div><Progress value={pct} tone={status==='complete'?'green':'blue'}/></div>)}</div></section>
    </div>

    <div className="grid-half">
      <section className="card"><div className="card-head"><div><span className="eyebrow">VISUAL EVIDENCE</span><h2>Latest field photos</h2></div><button className="ghost"><ImageIcon size={15}/>Gallery</button></div><div className="photo-grid">{infraUpdates.map((u,i)=><div key={i} className="photo-tile" style={{backgroundImage:`url("${u.image}")`}}><span>{u.location}</span><div><Camera size={15}/>{u.activity}</div></div>)}</div></section>
      <section className="card"><div className="card-head"><div><span className="eyebrow">FLEET HEALTH</span><h2>Machinery status</h2></div></div><div className="fleet-list"><div><span className="fleet-icon"><Truck/></span><div><b>Excavators</b><small>8 of 9 operating</small></div><strong>89%</strong></div><div><span className="fleet-icon"><Wrench/></span><div><b>Graders</b><small>3 of 4 operating</small></div><strong>75%</strong></div><div><span className="fleet-icon"><Activity/></span><div><b>Rollers</b><small>6 of 6 operating</small></div><strong>100%</strong></div><div><span className="fleet-icon"><Truck/></span><div><b>Tippers</b><small>11 of 12 operating</small></div><strong>92%</strong></div></div></section>
    </div>
  </div>
}

function BuildOverview({openProject}) {
  return <div className="page build-page">
    <section className="build-title"><div><span className="eyebrow">DEVELOPMENT INTELLIGENCE</span><h1>See every asset move toward handover.</h1><p>Portfolio-level visibility down to individual villa, floor, stage and visual evidence.</p></div><button className="build-primary"><BarChart3 size={16}/>Investor view</button></section>
    <div className="build-kpi-row">
      <Kpi icon={Building2} label="Developments" value="3" detail="194 residential units"/>
      <Kpi icon={CheckCircle2} label="Units Completed" value="38" detail="19.6% handed over"/>
      <Kpi icon={Activity} label="Units In Progress" value="142" detail="Across 17 active stages"/>
      <Kpi icon={Camera} label="Visual Records" value="3,842" detail="Photos & drone evidence"/>
      <Kpi icon={AlertTriangle} label="Open Issues" value="12" detail="4 high priority" tone="warning"/>
    </div>

    <section className="development-feature">
      <div className="development-copy"><span className="eyebrow">SIGNATURE EXPERIENCE</span><h2>Construction becomes a visual journey.</h2><p>Move from portfolio → development → asset → stage → evidence. Investors see what changed, where it changed, and what is holding delivery back.</p><div className="feature-list"><span><CheckCircle2/>Stage-by-stage progress</span><span><CheckCircle2/>Before / during / after evidence</span><span><CheckCircle2/>Drone development timeline</span></div></div>
      <div className="development-visual"><img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85"/><div className="visual-overlay"><span>Green Meadows</span><strong>72%</strong><small>overall development progress</small></div><button><PlayCircle/>View construction journey</button></div>
    </section>

    <section className="card build-card-section"><div className="card-head"><div><span className="eyebrow">ACTIVE DEVELOPMENTS</span><h2>Portfolio</h2></div></div><div className="development-grid">{buildProjects.map(p=><button key={p.id} className="development-card" onClick={()=>openProject(p)}><div className="dev-image" style={{backgroundImage:`linear-gradient(to top,rgba(12,28,24,.82),transparent 60%),url("${p.image}")`}}><span>{p.location}</span><strong>{p.progress}%</strong></div><div className="dev-info"><small>{p.code}</small><h3>{p.name}</h3><p>{p.units} units · {p.value}</p><Progress value={p.progress} tone="green"/><div><span>{p.progress}% complete</span><b>Explore development →</b></div></div></button>)}</div></section>

    <div className="grid-half">
      <section className="card"><div className="card-head"><div><span className="eyebrow">DELIVERY MATRIX</span><h2>Unit status</h2></div></div><div className="status-donut"><div className="donut"><span><b>194</b><small>Total units</small></span></div><div className="donut-legend"><span><i className="lg1"/>Completed <b>38</b></span><span><i className="lg2"/>In progress <b>142</b></span><span><i className="lg3"/>Not started <b>14</b></span></div></div></section>
      <section className="card"><div className="card-head"><div><span className="eyebrow">TODAY</span><h2>Development pulse</h2></div></div><div className="pulse-list"><div><Camera/><span><b>146</b><small>New site photos</small></span></div><div><UsersRound/><span><b>386</b><small>Workforce on site</small></span></div><div><CheckCircle2/><span><b>11</b><small>Stage approvals</small></span></div><div><AlertTriangle/><span><b>4</b><small>Priority issues</small></span></div></div></section>
    </div>
  </div>
}

function BuildProject({project,onBack}) {
  const villas=Array.from({length:12},(_,i)=>({name:`Villa ${String(i+1).padStart(2,'0')}`,progress:Math.min(96,42+i*4),stage:i<3?'Blockwork':i<7?'MEP Rough-in':i<10?'Internal Finishes':'Snagging'}))
  const selected=villas[7]
  return <div className="page build-page">
    <button className="back-button build-back" onClick={onBack}><ArrowLeft size={16}/>Developments</button>
    <section className="build-project-hero" style={{backgroundImage:`linear-gradient(90deg,rgba(10,31,25,.93),rgba(10,31,25,.45)),url("${project.image}")`}}><div><span className="project-code">{project.code}</span><h1>{project.name}</h1><p>{project.client} · {project.location}</p><div className="hero-meta"><span><Building2/>{project.units} units</span><span><TrendingUp/>{project.value}</span><span><Camera/>1,284 visual records</span></div></div><div className="hero-progress build-progress"><span>Development progress</span><strong>{project.progress}%</strong><Progress value={project.progress} tone="green"/><small>18 units nearing completion</small></div></section>

    <div className="build-kpi-row">
      <Kpi icon={CheckCircle2} label="Completed" value="18" detail="Units handed over"/>
      <Kpi icon={Activity} label="In Progress" value="26" detail="Across 11 stages"/>
      <Kpi icon={UsersRound} label="Workforce" value="186" detail="Today on site"/>
      <Kpi icon={Camera} label="New Photos" value="64" detail="Last 24 hours"/>
      <Kpi icon={AlertTriangle} label="Open Issues" value="4" detail="1 high priority" tone="warning"/>
    </div>

    <section className="card villa-matrix-card"><div className="card-head"><div><span className="eyebrow">ASSET MATRIX</span><h2>Villa-by-villa progress</h2></div><div className="matrix-key"><span><i className="m1"/>Finishing</span><span><i className="m2"/>MEP</span><span><i className="m3"/>Structure</span></div></div><div className="villa-matrix">{villas.map((v,i)=><button key={v.name} className={i===7?'selected':''}><span>{v.name}</span><strong>{v.progress}%</strong><small>{v.stage}</small><Progress value={v.progress} tone="green"/></button>)}</div></section>

    <section className="journey-section">
      <div className="journey-header"><div><span className="eyebrow">VISUAL CONSTRUCTION JOURNEY</span><h2>{selected.name} · From empty plot to handover</h2><p>Real project evidence organized automatically by stage and date.</p></div><div className="view-switch"><button className="active"><Building2/>Villa view</button><button><Camera/>Drone view</button></div></div>
      <div className="journey-gallery">
        <div className="journey-main" style={{backgroundImage:'url("https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1500&q=85")'}}><div className="journey-date"><span>SEP 18, 2026</span><b>Internal Finishes</b><small>Latest verified site capture</small></div><button className="compare-btn"><ImageIcon/>Compare before</button></div>
        <div className="journey-side"><div style={{backgroundImage:'url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80")'}}><span>JUN 12</span><b>Structure</b></div><div style={{backgroundImage:'url("https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80")'}}><span>MAR 04</span><b>Foundation</b></div></div>
      </div>
      <div className="timeline-wrap"><div className="timeline-line">{villaStages.map((s,i)=><div key={s} className={i<13?'done':i===13?'current':''}><i>{i<13?<CheckCircle2 size={13}/>:<Circle size={11}/>}</i><span>{s}</span></div>)}</div></div>
    </section>

    <div className="grid-half">
      <section className="card"><div className="card-head"><div><span className="eyebrow">BEFORE / DURING / AFTER</span><h2>Stage evidence · Blockwork</h2></div></div><div className="evidence-grid"><div style={{backgroundImage:'url("https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80")'}}><span>BEFORE</span></div><div style={{backgroundImage:'url("https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80")'}}><span>DURING</span></div><div style={{backgroundImage:'url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80")'}}><span>AFTER</span></div></div></section>
      <section className="card"><div className="card-head"><div><span className="eyebrow">ISSUES & SNAGGING</span><h2>Open items</h2></div><span className="count-badge green">4 open</span></div><div className="snag-list"><div><span>01</span><div><b>External plaster touch-up</b><small>Villa 08 · East elevation</small></div><em>Assigned</em></div><div><span>02</span><div><b>Bathroom tile alignment</b><small>Villa 11 · First floor</small></div><em>In progress</em></div><div><span>03</span><div><b>Window seal inspection</b><small>Villa 06 · Bedroom 02</small></div><em>Pending</em></div></div></section>
    </div>
  </div>
}


function InfraProjectsPage({openProject}) {
  return <div className="page">
    <section className="page-title"><div><span className="eyebrow">PROJECT PORTFOLIO</span><h1>All infrastructure projects</h1><p>Compare schedule, value, progress, utilization and risk across active packages.</p></div><button className="primary"><FileText size={16}/>Portfolio report</button></section>
    <div className="project-table card">
      <div className="project-table-head"><span>Project</span><span>Progress</span><span>Value</span><span>Risk</span><span>Action</span></div>
      {infraProjects.map((p,i)=><div className="project-table-row" key={p.id}>
        <div className="project-table-name"><div className="mini-cover" style={{backgroundImage:`url("${p.image}")`}}/><span><b>{p.name}</b><small>{p.code} · {p.location}</small></span></div>
        <div><Progress value={p.progress}/><small>{p.progress}% complete</small></div>
        <b>{p.value}</b>
        <span className={i===0?'risk-pill red':'risk-pill green'}>{i===0?'2 active blockers':'On track'}</span>
        <button className="table-action" onClick={()=>openProject(p)}>Open <ChevronRight size={14}/></button>
      </div>)}
    </div>
  </div>
}

function ChainagePage() {
  const rows=[
    ['CH 10+000–12+500','Embankment','100%','Completed'],
    ['CH 12+500–15+000','Subgrade','86%','In progress'],
    ['CH 15+000–18+500','GSB','62%','In progress'],
    ['CH 18+500–20+300','Compaction','74%','In progress'],
    ['CH 20+300–22+400','Structures','51%','In progress'],
    ['CH 22+400–22+900','Land handover','0%','Blocked'],
    ['CH 22+900–25+000','Earthwork','18%','Started']
  ]
  return <div className="page">
    <section className="page-title"><div><span className="eyebrow">LINEAR PROJECT CONTROL</span><h1>Chainage & layer intelligence</h1><p>See exactly what is happening along the alignment and which layer is controlling progress.</p></div><button className="primary"><MapIcon size={16}/>Alignment map</button></section>
    <section className="card chainage-dashboard">
      <div className="card-head"><div><span className="eyebrow">CORRIDOR STATUS</span><h2>Package RL-EC-01 · CH 10+000 → 25+000</h2></div><span className="count-badge green">15.0 km</span></div>
      <div className="chainage-scale"><span>10+000</span><span>13+000</span><span>16+000</span><span>19+000</span><span>22+000</span><span>25+000</span></div>
      <div className="chainage-track large"><div className="segment complete" style={{width:'36%'}}/><div className="segment active" style={{width:'41%'}}/><div className="segment blocked" style={{width:'8%'}}/><div className="segment pending" style={{width:'15%'}}/></div>
      <div className="chainage-legend"><span><i className="complete"/>Completed</span><span><i className="active"/>In progress</span><span><i className="blocked"/>Blocked</span><span><i className="pending"/>Pending</span></div>
    </section>
    <div className="grid-half">
      <section className="card"><div className="card-head"><div><span className="eyebrow">LAYER MATRIX</span><h2>Progress by activity</h2></div></div>
        <div className="layer-matrix">{['Earthwork','Embankment','Subgrade','GSB','WMM','Drainage'].map((name,i)=><div key={name}><span>{name}</span>{[92,84,68,51,34,47][i]}%<Progress value={[92,84,68,51,34,47][i]}/></div>)}</div>
      </section>
      <section className="card"><div className="card-head"><div><span className="eyebrow">ACTIVE WORK FRONTS</span><h2>Field activity by chainage</h2></div></div>
        <div className="chainage-rows">{rows.map(([ch,act,pct,status])=><div key={ch}><span><b>{ch}</b><small>{act}</small></span><strong>{pct}</strong><em className={status==='Blocked'?'bad':''}>{status}</em></div>)}</div>
      </section>
    </div>
  </div>
}

function FleetPage() {
  const machines=[
    ['EX-12','Excavator','RL-EC-01','Working','92%'],
    ['GR-04','Grader','EW-09','Breakdown','0%'],
    ['RL-07','Roller','NH-167A','Working','88%'],
    ['DT-18','Tipper','RL-EC-01','Working','95%'],
    ['WT-03','Water Tanker','RL-EC-01','Working','79%'],
    ['DZ-02','Dozer','EW-09','Idle','42%']
  ]
  return <div className="page">
    <section className="page-title"><div><span className="eyebrow">FLEET INTELLIGENCE</span><h1>Fleet & machinery</h1><p>Utilization, breakdowns and deployment across every active project.</p></div><button className="primary"><Wrench size={16}/>Maintenance summary</button></section>
    <div className="kpi-row">
      <Kpi icon={Truck} label="Total Equipment" value="92" detail="Across 3 projects"/>
      <Kpi icon={Activity} label="Operating" value="84" detail="91% availability"/>
      <Kpi icon={Wrench} label="Breakdowns" value="3" detail="1 critical"/>
      <Kpi icon={Gauge} label="Avg Utilization" value="86%" detail="+4% vs last month"/>
      <Kpi icon={TrendingUp} label="Productive Hours" value="612h" detail="This week"/>
    </div>
    <div className="grid-half">
      <section className="card"><div className="card-head"><div><span className="eyebrow">UTILIZATION</span><h2>Equipment class performance</h2></div></div><div className="fleet-bars">{[['Excavators',91],['Graders',75],['Rollers',96],['Tippers',89],['Tankers',81],['Dozers',72]].map(([n,v])=><div key={n}><span>{n}</span><Progress value={v}/><b>{v}%</b></div>)}</div></section>
      <section className="card"><div className="card-head"><div><span className="eyebrow">BREAKDOWN WATCH</span><h2>Maintenance attention</h2></div><span className="count-badge">3 open</span></div><div className="issue-list"><div><span className="severity red">CRITICAL</span><b>GR-04 hydraulic pressure loss</b><small>EW-09 · Grader · Plant team assigned</small><em>2 days</em></div><div><span className="severity amber">HIGH</span><b>EX-21 bucket pin wear</b><small>RL-EC-01 · Excavator</small><em>6 hrs</em></div><div><span className="severity blue">WATCH</span><b>WT-03 service due</b><small>RL-EC-01 · Water tanker</small><em>Tomorrow</em></div></div></section>
    </div>
    <section className="card portfolio-card"><div className="card-head"><div><span className="eyebrow">LIVE FLEET REGISTER</span><h2>Equipment deployment</h2></div></div><div className="data-grid fleet-table">{machines.map(m=><div key={m[0]}><b>{m[0]}</b><span>{m[1]}</span><span>{m[2]}</span><em className={m[3]==='Breakdown'?'bad':''}>{m[3]}</em><strong>{m[4]}</strong></div>)}</div></section>
  </div>
}

function WorkforcePage() {
  return <div className="page">
    <section className="page-title"><div><span className="eyebrow">WORKFORCE INTELLIGENCE</span><h1>People on site</h1><p>Daily manpower, tracked personnel and productivity visibility across projects.</p></div><button className="primary"><UsersRound size={16}/>Daily manpower sheet</button></section>
    <div className="kpi-row">
      <Kpi icon={UsersRound} label="Total Workforce" value="1,248" detail="Today"/>
      <Kpi icon={HardHat} label="Skilled Labour" value="428" detail="34% of workforce"/>
      <Kpi icon={Truck} label="Drivers" value="118" detail="Names tracked"/>
      <Kpi icon={Wrench} label="Operators" value="76" detail="Machine linked"/>
      <Kpi icon={Activity} label="Attendance" value="96.8%" detail="Across active projects"/>
    </div>
    <div className="grid-half">
      <section className="card"><div className="card-head"><div><span className="eyebrow">MANPOWER MIX</span><h2>Today by labour type</h2></div></div><div className="workforce-grid">{[['Helpers',356],['Masons',184],['Carpenters',96],['Bar Benders',88],['Drivers',118],['Operators',76],['Survey Teams',24],['Supervisors',31]].map(([n,v])=><div key={n}><span>{n}</span><strong>{v}</strong><small>{Math.round(v/12.48)}% of total</small></div>)}</div></section>
      <section className="card"><div className="card-head"><div><span className="eyebrow">TREND</span><h2>7-day workforce trend</h2></div></div><div className="chart-bars">{[1080,1124,1168,1206,1194,1232,1248].map((v,i)=><div key={i}><i style={{height:`${(v-980)/1.6}px`}}/><span>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span></div>)}</div></section>
    </div>
    <section className="card portfolio-card"><div className="card-head"><div><span className="eyebrow">TRACKED PERSONNEL</span><h2>Drivers & operators</h2></div></div><div className="data-grid people-table">{[['Ramesh Kumar','Driver','Tipper TS09AB1234','RL-EC-01','Working'],['Suresh Yadav','Driver','Water Tanker WT-03','RL-EC-01','Working'],['Arun Naik','Operator','Excavator EX-12','RL-EC-01','Working'],['Mahesh','Operator','Grader GR-04','EW-09','Breakdown'],['Praveen Reddy','Survey','Total Station','NH-167A','Working']].map(r=><div key={r[0]}><b>{r[0]}</b><span>{r[1]}</span><span>{r[2]}</span><span>{r[3]}</span><em className={r[4]==='Breakdown'?'bad':''}>{r[4]}</em></div>)}</div></section>
  </div>
}

function IssuesPage({workspace}) {
  const build=workspace==='build'
  const items=build?[
    ['High','Villa 08 · External plaster touch-up','Quality','Assigned','2 days'],
    ['High','Villa 11 · Bathroom tile alignment','Finishes','In progress','1 day'],
    ['Medium','Villa 06 · Window seal inspection','QA/QC','Pending','3 days'],
    ['Medium','Villa 14 · MEP ceiling clash','Coordination','Assigned','4 hrs'],
    ['Low','Clubhouse · Paint touch-up','Finishes','Pending','1 day']
  ]:[
    ['Critical','RL-EC-01 · Land handover CH 22+400–22+900','Land','Open','6 days'],
    ['High','NH-167A · Drain drawing approval','Drawing','Open','3 days'],
    ['High','EW-09 · GR-04 hydraulic failure','Machinery','Open','2 days'],
    ['Medium','RL-EC-01 · Utility shifting interface','Utility','Monitoring','1 day'],
    ['Low','NH-167A · Aggregate delivery variance','Material','Monitoring','8 hrs']
  ]
  return <div className="page">
    <section className="page-title"><div><span className="eyebrow">{build?'QUALITY & DELIVERY':'RISK CONTROL'}</span><h1>{build?'Issues & snagging':'Blocker management'}</h1><p>{build?'Track defects, rectification and closure evidence.':'See every constraint, ownership and days open across the portfolio.'}</p></div><button className={build?'build-primary':'primary'}><AlertTriangle size={16}/>New issue</button></section>
    <div className={build?'build-kpi-row':'kpi-row'}>
      <Kpi icon={AlertTriangle} label="Open Items" value={build?'12':'9'} detail="Across active projects"/>
      <Kpi icon={Activity} label="High Priority" value={build?'4':'3'} detail="Management attention"/>
      <Kpi icon={UsersRound} label="Assigned" value={build?'9':'7'} detail="Owner identified"/>
      <Kpi icon={CheckCircle2} label="Closed This Week" value={build?'18':'11'} detail="With evidence"/>
      <Kpi icon={Gauge} label="Avg Closure" value={build?'2.4d':'3.1d'} detail="Last 30 days"/>
    </div>
    <section className="card portfolio-card"><div className="card-head"><div><span className="eyebrow">ACTIVE REGISTER</span><h2>{build?'Snagging & issues':'Project blockers'}</h2></div></div><div className="issues-table">{items.map((r,i)=><div key={i}><span className={r[0]==='Critical'||r[0]==='High'?'severity red':'severity amber'}>{r[0]}</span><b>{r[1]}</b><span>{r[2]}</span><em>{r[3]}</em><small>{r[4]}</small></div>)}</div></section>
  </div>
}

function ReportsPage({workspace}) {
  const build=workspace==='build'
  const cards=build?[
    ['Investor Monthly Report','Portfolio progress, unit delivery, photos and risks','Monthly'],
    ['Development Progress Pack','Development-by-development progress and stages','Weekly'],
    ['Visual Evidence Report','Before/during/after and drone comparison','On demand'],
    ['Snagging Closure Report','Open, assigned, rectified and closed issues','Weekly']
  ]:[
    ['Executive Portfolio Report','Progress, value, productivity, risk and blockers','Monthly'],
    ['Project Progress Report','Chainage, BOQ, machinery, manpower and updates','Weekly'],
    ['Fleet Utilization Report','Equipment deployment and breakdown trends','Weekly'],
    ['Blocker Escalation Report','Open constraints, ownership and ageing','Daily']
  ]
  return <div className="page">
    <section className="page-title"><div><span className="eyebrow">REPORTING LAYER</span><h1>{build?'Investor reports':'Management reports'}</h1><p>Turn structured field data into presentation-ready reports without duplicate data entry.</p></div><button className={build?'build-primary':'primary'}><FileText size={16}/>Generate report</button></section>
    <div className="report-grid">{cards.map((r,i)=><section className="report-card" key={r[0]}><div className="report-icon"><FileText/></div><span>{r[2]}</span><h3>{r[0]}</h3><p>{r[1]}</p><button>Preview report <ChevronRight size={14}/></button></section>)}</div>
    <div className="grid-half">
      <section className="card"><div className="card-head"><div><span className="eyebrow">RECENTLY GENERATED</span><h2>Report history</h2></div></div><div className="report-history">{['September Portfolio Review','Week 38 Progress Pack','Board Risk Summary','Visual Progress Pack'].map((x,i)=><div key={x}><span><FileText size={16}/><b>{x}</b></span><small>{['28 Sep 2026','22 Sep 2026','18 Sep 2026','12 Sep 2026'][i]}</small><button>Open</button></div>)}</div></section>
      <section className="card"><div className="card-head"><div><span className="eyebrow">REPORT AUTOMATION</span><h2>Scheduled delivery</h2></div></div><div className="schedule-list"><div><span><b>Weekly project summary</b><small>Every Monday · 8:00 AM</small></span><em>Active</em></div><div><span><b>Monthly investor pack</b><small>1st of every month</small></span><em>Active</em></div><div><span><b>Critical blocker digest</b><small>When high priority issue opens</small></span><em>Active</em></div></div></section>
    </div>
  </div>
}

function VisualProgressPage() {
  const shots=[
    ['Foundation','04 Mar 2026','https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80'],
    ['Structure','12 Jun 2026','https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80'],
    ['Blockwork','21 Jul 2026','https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80'],
    ['Internal Finishes','18 Sep 2026','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80']
  ]
  return <div className="page build-page">
    <section className="build-title"><div><span className="eyebrow">VISUAL INTELLIGENCE</span><h1>Visual progress</h1><p>Construction history organized by development, asset, stage and capture date.</p></div><button className="build-primary"><Camera size={16}/>Upload capture</button></section>
    <section className="visual-hero-card"><div><span className="eyebrow">GREEN MEADOWS · VILLA 08</span><h2>From first excavation to finishing</h2><p>Move through time to compare what changed on site.</p></div><strong>72%</strong></section>
    <div className="visual-progress-grid">{shots.map((s,i)=><div key={s[0]} className="visual-shot" style={{backgroundImage:`linear-gradient(to top,rgba(8,27,21,.75),transparent 60%),url("${s[2]}")`}}><span>{s[1]}</span><b>{s[0]}</b><small>{i===shots.length-1?'Latest capture':'Verified evidence'}</small></div>)}</div>
    <section className="card portfolio-card"><div className="card-head"><div><span className="eyebrow">DRONE TIMELINE</span><h2>Development overview by month</h2></div><button className="ghost"><PlayCircle size={15}/>Play timeline</button></div><div className="drone-timeline">{['Jan','Mar','May','Jul','Sep'].map((m,i)=><div key={m}><i className={i===4?'active':''}/><span>{m}</span><b>{[18,29,43,58,72][i]}%</b></div>)}</div></section>
  </div>
}

function GenericPage({workspace,page,openProject}) {
  if(workspace==='infra'){
    if(page==='projects') return <InfraProjectsPage openProject={openProject}/>
    if(page==='chainage') return <ChainagePage/>
    if(page==='fleet') return <FleetPage/>
    if(page==='people') return <WorkforcePage/>
    if(page==='issues') return <IssuesPage workspace="infra"/>
    if(page==='reports') return <ReportsPage workspace="infra"/>
  } else {
    if(page==='projects') return <BuildOverview openProject={openProject}/>
    if(page==='visuals') return <VisualProgressPage/>
    if(page==='issues') return <IssuesPage workspace="build"/>
    if(page==='reports') return <ReportsPage workspace="build"/>
  }
  return null
}

function Platform({account,logout}) {
  const workspace=account.workspace
  const [page,setPage]=useState('overview')
  const [project,setProject]=useState(null)
  function navigate(id){setProject(null);setPage(id)}
  const body=useMemo(()=>{
    if(project) return workspace==='infra'?<InfraProject project={project} onBack={()=>setProject(null)}/>:<BuildProject project={project} onBack={()=>setProject(null)}/>
    if(page==='overview') return workspace==='infra'?<InfraOverview openProject={setProject}/>:<BuildOverview openProject={setProject}/>
    return <GenericPage workspace={workspace} page={page} openProject={setProject}/>
  },[workspace,page,project])
  return <div className={workspace==='build'?'platform build-platform':'platform'}><Sidebar workspace={workspace} page={page} setPage={navigate} logout={logout}/><div className="workspace"><Topbar account={account} workspace={workspace}/><main>{body}</main></div></div>
}

export default function App(){
  const [account,setAccount]=useState(null)
  return account?<Platform account={account} logout={()=>setAccount(null)}/>:<Login onLogin={setAccount}/>
}
