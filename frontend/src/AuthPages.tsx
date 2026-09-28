import { useState } from 'react'
import { Building2, HardHat, LockKeyhole } from 'lucide-react'
import api from './api'
import type { User } from './types'

export type AppWorkspace = 'infra'|'build'

export function Login({onLogin}:{onLogin:(u:User,w:AppWorkspace)=>void}){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  async function submit(e:React.FormEvent){
    e.preventDefault()
    setLoading(true)
    setError('')
    try{
      const {data}=await api.post('/auth/login',{email,password})
      localStorage.setItem('civilapp_token',data.access_token)
      const me=await api.get('/me')
      const user=me.data as User
      const workspace:AppWorkspace=user.workspace==='build'?'build':'infra'
      localStorage.setItem('civilapp_workspace',workspace)
      onLogin(user,workspace)
    }catch{
      localStorage.removeItem('civilapp_token')
      localStorage.removeItem('civilapp_workspace')
      setError('Invalid email or password.')
    }finally{
      setLoading(false)
    }
  }

  return <div className="login-page unified-login">
    <div className="login-card secure-login">
      <div className="brand">
        <div className="login-mark"><HardHat/></div>
        <div><strong>CivilApp</strong><span>Construction Intelligence Platform</span></div>
      </div>
      <h1>Sign in</h1>
      <p>Your company plan decides which CivilApp experience you can access.</p>
      <div className="plan-hint">
        <div><HardHat size={18}/><span>Infra plan</span><small>Roads · Railway · Earthwork</small></div>
        <div><Building2 size={18}/><span>Build plan</span><small>Villas · Buildings · Developments</small></div>
      </div>
      <form onSubmit={submit}>
        <label>Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.com"/></label>
        <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></label>
        {error&&<div className="error">{error}</div>}
        <button disabled={loading}>{loading?'Signing in…':'Sign in'}</button>
      </form>
      <div className="secure-note"><LockKeyhole size={15}/> Access is controlled by your company subscription.</div>
    </div>
  </div>
}
