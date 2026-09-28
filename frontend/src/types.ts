export type User = {
  id: number
  name: string
  email: string
  role: 'md' | 'manager' | 'field'
}

export type Project = {
  id: number
  code: string
  name: string
  project_type: 'railway' | 'road' | 'earthwork' | 'villa'
  client: string
  location: string
  start_date: string
  target_date: string
  progress_percent: number
}
