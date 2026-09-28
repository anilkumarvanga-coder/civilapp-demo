import axios from 'axios'

const useDemoAuth = import.meta.env.VITE_USE_DEMO_AUTH !== 'false'

const demoUsers = [
  {id:1,name:'Infra Managing Director',email:'infra.md@civilapp.local',password:'demo123',role:'md',workspace:'infra'},
  {id:2,name:'Infra Project Manager',email:'infra.manager@civilapp.local',password:'demo123',role:'manager',workspace:'infra'},
  {id:3,name:'Infra Field Supervisor',email:'infra.field@civilapp.local',password:'demo123',role:'field',workspace:'infra'},
  {id:4,name:'Build Managing Director',email:'build.md@civilapp.local',password:'demo123',role:'md',workspace:'build'},
  {id:5,name:'Build Project Manager',email:'build.manager@civilapp.local',password:'demo123',role:'manager',workspace:'build'},
  {id:6,name:'Build Field Supervisor',email:'build.field@civilapp.local',password:'demo123',role:'field',workspace:'build'},
]

const projects = [
  {id:1,code:'RW-101',name:'East Corridor Railway Earthwork',project_type:'railway',client:'Metro Rail Infra',location:'Hyderabad',start_date:'2026-05-01',target_date:'2027-05-01',progress_percent:58},
  {id:2,code:'RW-102',name:'North Line Formation Works',project_type:'earthwork',client:'Rail Infra Corp',location:'Warangal',start_date:'2026-06-01',target_date:'2027-04-01',progress_percent:41},
  {id:3,code:'HW-201',name:'NH Link Road Package',project_type:'road',client:'Highways Authority',location:'Nalgonda',start_date:'2026-04-01',target_date:'2027-07-01',progress_percent:67},
  {id:4,code:'VL-301',name:'Green Meadows Villas',project_type:'villa',client:'Green Meadows Developers',location:'Kokapet',start_date:'2026-02-01',target_date:'2027-03-01',progress_percent:62},
  {id:5,code:'VL-302',name:'Lakeview Residences',project_type:'villa',client:'Lakeview Homes',location:'Tellapur',start_date:'2026-06-01',target_date:'2027-06-01',progress_percent:36},
  {id:6,code:'VL-303',name:'Palm County Villas',project_type:'villa',client:'Palm County',location:'Shankarpally',start_date:'2026-07-01',target_date:'2027-08-01',progress_percent:22},
]

const updates:any = {
  1:[
    {id:1,activity:'Grader Working',location_ref:'CH 19+500',clean_description:'Grader operation is in progress at CH 19+500. Six lorry loads of soil were reported as delivered.',manpower_total:18,machinery_count:2,lorry_trips:6,created_at:new Date().toISOString()},
    {id:2,activity:'Compaction',location_ref:'CH 20+100 to 20+300',clean_description:'Roller compaction is ongoing between CH 20+100 and CH 20+300.',manpower_total:11,machinery_count:1,lorry_trips:0,created_at:new Date().toISOString()},
  ],
  4:[{id:3,activity:'Blockwork',location_ref:'Villa 12 · First Floor',clean_description:'Blockwork has started on the first floor of Villa 12.',manpower_total:16,machinery_count:0,lorry_trips:0,created_at:new Date().toISOString()}],
}
const blockers:any = {
  1:[{id:1,category:'Machinery Breakdown',description:'Grader GR-04 hydraulic issue',status:'open'}],
  2:[{id:2,category:'Drawing Approval',description:'Drain detail drawing approval pending',status:'open'}],
  5:[{id:3,category:'Material Shortage',description:'AAC block delivery delayed',status:'open'}],
}
const vehicles:any={1:[{id:1,vehicle_no:'GR-04',vehicle_type:'Grader',status:'breakdown',breakdown_reason:'Hydraulic pressure issue'},{id:2,vehicle_no:'EX-12',vehicle_type:'Excavator',status:'working',breakdown_reason:null},{id:3,vehicle_no:'TS09AB1234',vehicle_type:'Tipper',status:'working',breakdown_reason:null}]}
const villas:any={4:Array.from({length:8},(_,i)=>({id:400+i,villa_no:`Villa ${String(i+1).padStart(2,'0')}`,progress:35+(i+1)*7,current_stage:i>3?'Internal Plaster':'Blockwork',status:'in_progress'})),5:Array.from({length:6},(_,i)=>({id:500+i,villa_no:`Villa ${String(i+1).padStart(2,'0')}`,progress:18+(i+1)*4,current_stage:'Structure',status:'in_progress'}))}
const stageNames=['Site Preparation','Excavation','PCC','Foundation','Plinth','Ground Floor Structure','First Floor Structure','Roof Slab','Blockwork','MEP Rough-in','Internal Plaster','External Plaster','Waterproofing','Flooring/Tiling','Painting','Fixtures','External Works','Snagging','Final Inspection','Handover']

function currentUser(){
  const id=Number(localStorage.getItem('civilapp_demo_user'))
  return demoUsers.find(u=>u.id===id)
}

const demoApi:any={
  async post(url:string,payload:any){
    if(url==='/auth/login'){
      const user=demoUsers.find(u=>u.email.toLowerCase()===String(payload.email).toLowerCase()&&u.password===payload.password)
      if(!user) throw new Error('Invalid credentials')
      localStorage.setItem('civilapp_demo_user',String(user.id))
      return {data:{access_token:`demo-${user.id}`}}
    }
    return {data:{}}
  },
  async get(url:string){
    const user=currentUser()
    if(!user) throw new Error('Not authenticated')
    if(url==='/me'){
      const {password,...safe}=user
      return {data:safe}
    }
    if(url==='/projects'){
      const all=user.workspace==='infra'?projects.filter(p=>p.project_type!=='villa'):projects.filter(p=>p.project_type==='villa')
      if(user.role==='md'||user.role==='manager') return {data:all}
      return {data:all.slice(0,Math.min(2,all.length))}
    }
    if(url==='/dashboard/md'){
      const ids=user.workspace==='infra'?[1,2,3]:[4,5,6]
      const ps=projects.filter(p=>ids.includes(p.id))
      return {data:{kpis:{total_projects:ps.length,total_workforce:user.workspace==='infra'?126:186,active_machinery:user.workspace==='infra'?24:8,lorry_trips:user.workspace==='infra'?42:12,active_blockers:user.workspace==='infra'?2:1},projects:ps,blockers:ids.flatMap(id=>blockers[id]||[])}}
    }
    const pd=url.match(/^\/dashboard\/projects\/(\d+)$/)
    if(pd){const id=+pd[1];return {data:{kpis:{updates:(updates[id]||[]).length,manpower:id<4?87:64,active_machinery:id<4?6:4,blockers:(blockers[id]||[]).length}}}}
    const u=url.match(/^\/projects\/(\d+)\/updates$/);if(u)return {data:updates[+u[1]]||[]}
    const b=url.match(/^\/projects\/(\d+)\/blockers$/);if(b)return {data:blockers[+b[1]]||[]}
    const v=url.match(/^\/projects\/(\d+)\/vehicles$/);if(v)return {data:vehicles[+v[1]]||[]}
    const vl=url.match(/^\/projects\/(\d+)\/villas$/);if(vl)return {data:villas[+vl[1]]||[]}
    const st=url.match(/^\/villas\/(\d+)\/stages$/);if(st)return {data:stageNames.map((name,i)=>({id:+st[1]*100+i,stage_name:name,sequence:i+1,status:i<9?'completed':i===9?'in_progress':'not_started',progress:i<9?100:i===9?60:0}))}
    return {data:null}
  }
}

const liveApi=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:8000'})
liveApi.interceptors.request.use(config=>{
  const token=localStorage.getItem('civilapp_token')
  if(token) config.headers.Authorization=`Bearer ${token}`
  return config
})

export default useDemoAuth?demoApi:liveApi
