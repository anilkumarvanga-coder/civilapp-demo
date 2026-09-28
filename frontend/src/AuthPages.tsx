import { useState } from 'react'
import { BarChart3, Building2, HardHat, LockKeyhole, ShieldCheck, Sparkles, TrainFront, Route } from 'lucide-react'
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

  return <div className="investor-login">
    <section className="login-showcase">
      <div className="showcase-grid"/>
      <div className="showcase-orbit orbit-one"/>
      <div className="showcase-orbit orbit-two"/>

      <div className="showcase-top">
        <div className="civilapp-logo">
          <div className="civilapp-logo-mark"><HardHat size={24}/></div>
          <div><strong>CivilApp</strong><span>Construction Intelligence Platform</span></div>
        </div>
        <div className="investor-chip"><Sparkles size={14}/> Built for real-time project intelligence</div>
      </div>

      <div className="showcase-copy">
        <span className="showcase-kicker">FROM FIELD ACTIVITY TO BOARDROOM CLARITY</span>
        <h1>One operating system for construction progress.</h1>
        <p>Turn site updates, quantities, manpower, machinery and visual evidence into decision-ready intelligence.</p>

        <div className="product-pill-row">
          <div className="product-pill"><Route size={17}/><span><b>Infra</b><small>Roads · Railway · Earthwork</small></span></div>
          <div className="product-pill"><Building2 size={17}/><span><b>Build</b><small>Villas · Buildings · Developments</small></span></div>
        </div>

        <div className="investor-metrics">
          <div><strong>Live</strong><span>Project visibility</span></div>
          <div><strong>Role-based</strong><span>Access control</span></div>
          <div><strong>Evidence-led</strong><span>Progress tracking</span></div>
        </div>
      </div>

      <div className="signal-card signal-a">
        <div><TrainFront size={18}/><span>Railway Package A</span></div>
        <b>68%</b>
        <small>Formation progress</small>
        <i><em style={{width:'68%'}}/></i>
      </div>

      <div className="signal-card signal-b">
        <div><BarChart3 size={18}/><span>Portfolio Intelligence</span></div>
        <b>24</b>
        <small>Active machines · 3 blockers</small>
      </div>

      <div className="showcase-foot">
        <span><ShieldCheck size={15}/> Controlled company access</span>
        <span>Investor-ready project visibility</span>
      </div>
    </section>

    <section className="login-access">
      <div className="login-access-inner">
        <div className="mobile-logo">
          <div className="civilapp-logo-mark"><HardHat size={22}/></div>
          <div><strong>CivilApp</strong><span>Construction Intelligence Platform</span></div>
        </div>

        <div className="access-heading">
          <span className="access-eyebrow">SECURE ACCESS</span>
          <h2>Welcome back</h2>
          <p>Sign in with your company account. CivilApp automatically opens the product and projects included in your plan.</p>
        </div>

        <form className="premium-login-form" onSubmit={submit}>
          <label>
            <span>Email address</span>
            <input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.com"/>
          </label>
          <label>
            <span>Password</span>
            <input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/>
          </label>
          {error&&<div className="error">{error}</div>}
          <button className="premium-signin" disabled={loading}>
            <span>{loading?'Signing in…':'Enter CivilApp'}</span>
            {!loading&&<span className="signin-arrow">→</span>}
          </button>
        </form>

        <div className="access-trust">
          <div><LockKeyhole size={15}/><span>Your company plan controls product access.</span></div>
          <div><ShieldCheck size={15}/><span>Role-based permissions protect project information.</span></div>
        </div>

        <div className="login-footer-copy">CivilApp · Construction progress, structured for decisions.</div>
      </div>
    </section>
  </div>
}
