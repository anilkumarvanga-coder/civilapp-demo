import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import api from './api'
import type { User } from './types'
import { Login, type AppWorkspace } from './AuthPages'
import { WorkspaceShell } from './WorkspacePage'

export default function App(){
  const [user,setUser]=useState<User|null>(null)
  const [workspace,setWorkspace]=useState<AppWorkspace|null>(null)
  const [ready,setReady]=useState(false)

  useEffect(()=>{
    const token=localStorage.getItem('civilapp_token')
    if(!token){setReady(true);return}
    api.get('/me').then(r=>{
      const u=r.data as User
      setUser(u)
      setWorkspace(u.workspace==='build'?'build':'infra')
    }).catch(()=>{
      localStorage.removeItem('civilapp_token')
      localStorage.removeItem('civilapp_workspace')
    }).finally(()=>setReady(true))
  },[])

  function loggedIn(u:User,w:AppWorkspace){
    setUser(u)
    setWorkspace(w)
  }

  function logout(){
    localStorage.removeItem('civilapp_token')
    localStorage.removeItem('civilapp_workspace')
    localStorage.removeItem('civilapp_demo_user')
    setUser(null)
    setWorkspace(null)
  }

  if(!ready)return null

  return <Routes>
    <Route path="/login" element={user&&workspace?<Navigate to={`/${workspace}`}/>:<Login onLogin={loggedIn}/>}/>
    <Route path="/infra/*" element={user&&workspace==='infra'?<WorkspaceShell user={user} workspace="infra" onLogout={logout}/>:<Navigate to="/login"/>}/>
    <Route path="/build/*" element={user&&workspace==='build'?<WorkspaceShell user={user} workspace="build" onLogout={logout}/>:<Navigate to="/login"/>}/>
    <Route path="*" element={<Navigate to={user&&workspace?`/${workspace}`:'/login'}/>}/>
  </Routes>
}
