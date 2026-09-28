import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import api from './api'
import type { User } from './types'
import { Landing, Login, type AppWorkspace } from './AuthPages'
import { WorkspaceShell } from './WorkspacePage'

function allowed(user:User|null,workspace:AppWorkspace){
  return !!user && (user.workspace==='both' || user.workspace===workspace)
}

export default function App(){
  const [user,setUser]=useState<User|null>(null)
  const [workspace,setWorkspace]=useState<AppWorkspace|null>(null)
  const [ready,setReady]=useState(false)

  useEffect(()=>{
    const token=localStorage.getItem('civilapp_token')
    const saved=localStorage.getItem('civilapp_workspace') as AppWorkspace|null
    if(!token){setReady(true);return}
    api.get('/me').then(r=>{
      const u=r.data as User
      setUser(u)
      setWorkspace(saved || (u.workspace==='build'?'build':'infra'))
    }).catch(()=>{
      localStorage.removeItem('civilapp_token')
      localStorage.removeItem('civilapp_workspace')
    }).finally(()=>setReady(true))
  },[])

  function loggedIn(u:User,w:AppWorkspace){setUser(u);setWorkspace(w)}
  function logout(){
    localStorage.removeItem('civilapp_token')
    localStorage.removeItem('civilapp_workspace')
    setUser(null);setWorkspace(null)
  }

  if(!ready)return null
  const home=user&&workspace?`/${workspace}`:'/'

  return <Routes>
    <Route path="/" element={user?<Navigate to={home}/>:<Landing/>}/>
    <Route path="/infra/login" element={allowed(user,'infra')?<Navigate to="/infra"/>:<Login workspace="infra" onLogin={loggedIn}/>}/>
    <Route path="/build/login" element={allowed(user,'build')?<Navigate to="/build"/>:<Login workspace="build" onLogin={loggedIn}/>}/>
    <Route path="/infra/*" element={allowed(user,'infra')?<WorkspaceShell user={user!} workspace="infra" onLogout={logout}/>:<Navigate to="/infra/login"/>}/>
    <Route path="/build/*" element={allowed(user,'build')?<WorkspaceShell user={user!} workspace="build" onLogout={logout}/>:<Navigate to="/build/login"/>}/>
    <Route path="*" element={<Navigate to={home}/>}/>
  </Routes>
}
