export type User = { id:number; name:string; email:string; role:'md'|'manager'|'field' }
export type Project = { id:number; code:string; name:string; project_type:'railway'|'road'|'earthwork'|'villa'; client:string; location:string; start_date:string; target_date:string; progress_percent:number }
export type SiteUpdate = { id:number; activity:string; location_ref:string; clean_description:string; manpower_total:number; machinery_count:number; lorry_trips:number; created_at:string }
export type LabourType = { id:number; name:string; tracking_mode:'count_only'|'individual' }
