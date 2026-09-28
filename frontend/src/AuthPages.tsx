import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, HardHat, LockKeyhole } from 'lucide-react'
import api from './api'
import type { User } from './types'

export type AppWorkspace = 'infra'|'build'

export function Landing(){
  const nav=useNavigate()
  return <div className="product-gateway"><div className="gateway-inner">
    <div className="gateway-brand"><HardHat size={34}/><div><strong>CivilApp</strong><span>Construction Intelligence Platform</span></div></div>
    <div className="gateway-copy"><span className="eyebrow">ONE PLATFORM · TWO SPECIALIZED EXPERIENCES</span><h1>See construction progress as it happens.</h1><p>Choose the workspace designed for your project type.</p></div>
    <div className="product-cards">
      <button className="product-card infra-card" onClick={()=>nav('/infra/login')}><div className="product-icon"><HardHat size={30}/></div><span className="eyebrow">CIVILAPP INFRA</span><h2>Roads · Railway · Earthwork</h2><p>Chainage, layers, quantities, machinery, manpower, blockers and daily field intelligence.</p><b>Enter Infra →</b></button>
      <button className="product-card build-card" onClick={()=>nav('/build/login')}><div className="product-icon"><Building2 size={30}/></div><span className="eyebrow">CIVILAPP BUILD</span><h2>Villas · Buildings · Developments</h2><p>Asset-by-asset construction journeys, stages, floors, photos, snagging and development progress.</p><b>Enter Build →</b></button>
    </div>
    <div className="gateway-foot">Secure access only · Contact the CivilApp administrator for an account</div>
  </div></div>
}

export function Login({workspace,onLogin}:{workspace:AppWorkspace,onLogin:(u:User,w:AppWorkspace)=>void}){
  const nav=useNavigate();const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('')
  const title=workspace==='infra'?'CivilApp Infra':'CivilApp Build'
  async function submit(e:React.FormEvent){
    e.preventDefault();setLoading(true);setError('')
    try{
      const {data}=await api.post('/auth/login',{email,password})
      localStorage.setItem('civilapp_token',data.access_token)
      const me=await api.get('/me');const user=me.data as User
      if(user.workspace!=='both'&&user.workspace!==workspace){localStorage.removeItem('civilapp_token');setError(`This account belongs to CivilApp ${user.workspace==='build'?'Build':'Infra'}.`);return}
      localStorage.setItem('civilapp_workspace',workspace);onLogin(user,workspace);nav(`/${workspace}`)
    }catch{localStorage.removeItem('civilapp_token');setError('Invalid email or password, or the API is not available.')}finally{setLoading(false)}
  }
  return <div className={workspace==='build'?'login-page build-login':'login-page infra-login'}><div className="login-card secure-login">
    <button className="back gateway-back" onClick={()=>nav('/')}><ArrowLeft size={16}/>Back to CivilApp</button>
    <div className="brand"><div className="login-mark">{workspace==='infra'?<HardHat/>:<Building2/>}</div><div><strong>{title}</strong><span>{workspace==='infra'?'Roads · Railway · Earthwork':'Villas · Buildings · Developments'}</span></div></div>
    <h1>Sign in</h1><p>Use the account provided by your CivilApp administrator.</p>
    <form onSubmit={submit}><label>Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.com"/></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></label>{error&&<div className="error">{error}</div>}<button disabled={loading}>{loading?'Signing in…':`Sign in to ${title}`}</button></form>
    <div className="secure-note"><LockKeyhole size={15}/> No login credentials are published on this site.</div>
  </div></div>
}
