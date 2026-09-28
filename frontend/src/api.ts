import axios from 'axios'

const useMock = !import.meta.env.VITE_API_URL

const projects = [
  {id:1,code:'RW-101',name:'East Corridor Railway Earthwork',project_type:'railway',client:'Metro Rail Infra',location:'Hyderabad',start_date:'2026-05-01',target_date:'2027-05-01',progress_percent:58},
  {id:2,code:'RW-102',name:'North Line Formation Works',project_type:'earthwork',client:'Rail Infra Corp',location:'Warangal',start_date:'2026-06-01',target_date:'2027-04-01',progress_percent:41},
  {id:3,code:'HW-201',name:'NH Link Road Package',project_type:'road',client:'Highways Authority',location:'Nalgonda',start_date:'2026-04-01',target_date:'2027-07-01',progress_percent:67},
  {id:4,code:'VL-301',name:'Green Meadows Villas',project_type:'villa',client:'Green Meadows Developers',location:'Kokapet',start_date:'2026-02-01',target_date:'2027-03-01',progress_percent:62},
  {id:5,code:'VL-302',name:'Lakeview Residences',project_type:'villa',client:'Lakeview Homes',location:'Tellapur',start_date:'2026-06-01',target_date:'2027-06-01',progress_percent:36},
  {id:6,code:'VL-303',name:'Palm County Villas',project_type:'villa',client:'Palm County',location:'Shankarpally',start_date:'2026-07-01',target_date:'2027-08-01',progress_percent:22},
]

const users:any = {
  md:{id:1,name:'Managing Director',email:'md@civilapp.local',role:'md'},
  manager:{id:2,name:'Project Manager',email:'manager@civilapp.local',role:'manager'},
  field:{id:3,name:'Field Supervisor',email:'field@civilapp.local',role:'field'},
}

const baseUpdates:any = {
  1:[
    {id:1,activity:'Grader Working',location_ref:'CH 19+500',clean_description:'Grader operation is in progress at CH 19+500. Six lorry loads of soil were reported as delivered.',manpower_total:18,machinery_count:2,lorry_trips:6,created_at:new Date().toISOString()},
    {id:2,activity:'Compaction',location_ref:'CH 20+100 to 20+300',clean_description:'Roller compaction is ongoing between CH 20+100 and CH 20+300.',manpower_total:11,machinery_count:1,lorry_trips:0,created_at:new Date().toISOString()},
  ],
  4:[{id:3,activity:'Blockwork',location_ref:'Villa 12 - First Floor',clean_description:'Blockwork has started on the first floor of Villa 12.',manpower_total:16,machinery_count:0,lorry_trips:0,created_at:new Date().toISOString()}],
}
const blockers:any = {
  1:[{id:1,project_id:1,category:'Machinery Breakdown',description:'Grader GR-04 hydraulic issue',impact:'Formation grading slowed',responsible_party:'Plant team',status:'open',days_open:2}],
  2:[{id:2,project_id:2,category:'Drawing Approval',description:'Drain detail drawing approval pending',impact:'Drain work cannot start',responsible_party:'Client/consultant',status:'open',days_open:3}],
  5:[{id:3,project_id:5,category:'Material Shortage',description:'AAC block delivery delayed',impact:'Blockwork sequence affected',responsible_party:'Procurement',status:'open',days_open:1}],
}
const labourTypes = [
  {id:1,name:'Mason',tracking_mode:'count_only'},{id:2,name:'Helper',tracking_mode:'count_only'},{id:3,name:'Carpenter',tracking_mode:'count_only'},
  {id:4,name:'Bar Bender',tracking_mode:'count_only'},{id:5,name:'Driver',tracking_mode:'individual'},{id:6,name:'Machine Operator',tracking_mode:'individual'},{id:7,name:'Survey Team',tracking_mode:'individual'}
]
const manpower:any={1:{project_id:1,work_date:new Date().toISOString().slice(0,10),total:76,items:[
  {labour_type_id:1,name:'Mason',tracking_mode:'count_only',count:12},{labour_type_id:2,name:'Helper',tracking_mode:'count_only',count:24},
  {labour_type_id:3,name:'Carpenter',tracking_mode:'count_only',count:8},{labour_type_id:4,name:'Bar Bender',tracking_mode:'count_only',count:9},
  {labour_type_id:5,name:'Driver',tracking_mode:'individual',count:14},{labour_type_id:6,name:'Machine Operator',tracking_mode:'individual',count:5},{labour_type_id:7,name:'Survey Team',tracking_mode:'individual',count:4}
]}}
const vehicles:any={1:[
  {id:1,vehicle_no:'GR-04',vehicle_type:'Grader',status:'breakdown',breakdown_reason:'Hydraulic pressure issue'},
  {id:2,vehicle_no:'EX-12',vehicle_type:'Excavator',status:'working',breakdown_reason:null},
  {id:3,vehicle_no:'TS09AB1234',vehicle_type:'Tipper',status:'working',breakdown_reason:null},
  {id:4,vehicle_no:'TS08CD4471',vehicle_type:'Water Tanker',status:'working',breakdown_reason:null},
]}
const personnel:any={1:[
  {id:1,name:'Ramesh Kumar',personnel_type:'Driver',vehicle_or_machine:'TS09AB1234 · Tipper',status:'working'},
  {id:2,name:'Suresh Yadav',personnel_type:'Driver',vehicle_or_machine:'TS08CD4471 · Water Tanker',status:'working'},
  {id:3,name:'Arun Naik',personnel_type:'Machine Operator',vehicle_or_machine:'EX-12 · Excavator',status:'working'},
  {id:4,name:'Mahesh',personnel_type:'Machine Operator',vehicle_or_machine:'GR-04 · Grader',status:'breakdown'},
]}
const managerFiles:any={1:[{id:1,title:'Weekly coordination meeting notes',category:'Client Correspondence',notes:'Demo private record visible only to Manager and MD.'}]}
const villaMap:any={4:Array.from({length:8},(_,i)=>({id:400+i,villa_no:`Villa ${String(i+1).padStart(2,'0')}`,progress:35+(i+1)*7,current_stage:i>3?'Internal Plaster':'Blockwork',status:'in_progress'}))}
const stageNames=['Site Preparation','Excavation','PCC','Foundation','Plinth','Ground Floor Structure','First Floor Structure','Roof Slab','Blockwork','MEP Rough-in','Internal Plaster','External Plaster','Waterproofing','Flooring/Tiling','Painting','Fixtures','External Works','Snagging','Final Inspection','Handover']

function role(){
  return localStorage.getItem('civilapp_demo_role') || 'md'
}
function assigned(){
  const r=role()
  if(r==='md'||r==='manager') return projects
  return projects.slice(0,4)
}

const mockApi:any = {
  async post(url:string,payload:any){
    if(url==='/auth/login'){
      const r = payload.email.startsWith('manager')?'manager':payload.email.startsWith('field')?'field':'md'
      localStorage.setItem('civilapp_demo_role',r)
      return {data:{access_token:`demo-${r}`}}
    }
    if(url==='/updates'){
      const arr=baseUpdates[payload.project_id]||(baseUpdates[payload.project_id]=[])
      arr.unshift({id:Date.now(),activity:payload.activity,location_ref:payload.location_ref,clean_description:payload.description,manpower_total:payload.manpower_total||0,machinery_count:payload.machinery_count||0,lorry_trips:payload.lorry_trips||0,created_at:new Date().toISOString()})
      return {data:arr[0]}
    }
    const b=url.match(/^\/projects\/(\d+)\/blockers$/)
    if(b){const id=+b[1];const arr=blockers[id]||(blockers[id]=[]);const row={id:Date.now(),project_id:id,...payload,status:'open',days_open:0};arr.unshift(row);return {data:row}}
    const m=url.match(/^\/projects\/(\d+)\/manpower$/)
    if(m){const id=+m[1];const items=payload.items.map((x:any)=>{const lt=labourTypes.find(l=>l.id===x.labour_type_id);return {...x,name:lt?.name,tracking_mode:lt?.tracking_mode}});manpower[id]={project_id:id,work_date:payload.work_date,total:items.reduce((a:number,b:any)=>a+b.count,0),items};return {data:manpower[id]}}
    if(url.includes('/site-visits')) return {data:{id:Date.now(),visited_at:new Date().toISOString()}}
    return {data:{}}
  },
  async get(url:string){
    if(url==='/me') return {data:users[role()]}
    if(url==='/projects') return {data:assigned()}
    if(url==='/labour-types') return {data:labourTypes}
    if(url==='/dashboard/md') return {data:{kpis:{total_projects:6,total_workforce:76,active_machinery:4,lorry_trips:6,active_blockers:3},projects,blockers:Object.values(blockers).flat()}}
    const pd=url.match(/^\/dashboard\/projects\/(\d+)$/)
    if(pd){const id=+pd[1];const p=projects.find(x=>x.id===id);return {data:{project:p,kpis:{updates:(baseUpdates[id]||[]).length,manpower:manpower[id]?.total||0,active_machinery:(vehicles[id]||[]).filter((v:any)=>v.status==='working').length,blockers:(blockers[id]||[]).filter((b:any)=>b.status==='open').length},recent_updates:baseUpdates[id]||[]}}}
    const u=url.match(/^\/projects\/(\d+)\/updates$/); if(u)return {data:baseUpdates[+u[1]]||[]}
    const b=url.match(/^\/projects\/(\d+)\/blockers$/); if(b)return {data:blockers[+b[1]]||[]}
    const m=url.match(/^\/projects\/(\d+)\/manpower$/); if(m)return {data:manpower[+m[1]]||{project_id:+m[1],work_date:new Date().toISOString().slice(0,10),total:0,items:[]}}
    const v=url.match(/^\/projects\/(\d+)\/vehicles$/); if(v)return {data:vehicles[+v[1]]||[]}
    const p=url.match(/^\/projects\/(\d+)\/personnel$/); if(p)return {data:personnel[+p[1]]||[]}
    const mf=url.match(/^\/projects\/(\d+)\/manager-files$/); if(mf)return {data:managerFiles[+mf[1]]||[]}
    const vl=url.match(/^\/projects\/(\d+)\/villas$/); if(vl)return {data:villaMap[+vl[1]]||[]}
    const st=url.match(/^\/villas\/(\d+)\/stages$/)
    if(st){return {data:stageNames.map((name,i)=>({id:+st[1]*100+i,stage_name:name,sequence:i+1,status:i<9?'completed':i===9?'in_progress':'not_started',progress:i<9?100:i===9?60:0,last_update:null}))}}
    return {data:null}
  }
}

const liveApi = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000' })
liveApi.interceptors.request.use((config)=>{
  const token=localStorage.getItem('civilapp_token')
  if(token) config.headers.Authorization=`Bearer ${token}`
  return config
})

export default useMock ? mockApi : liveApi
