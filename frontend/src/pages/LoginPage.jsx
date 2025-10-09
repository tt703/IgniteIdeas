import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LoginPage(){
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)

  const handle = async (e) => {
    e.preventDefault()
    setErr(null)
    try {
      await login(email, password)
      nav('/home')
    } catch (error) {
      setErr(error.response?.data?.detail || error.message)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={handle} className="space-y-3">
        <input required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="w-full p-3 rounded border" />
        <input required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-3 rounded border" />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="w-full p-3 rounded bg-orange-600 text-white">Login</button>
      </form>
    </div>
  )
}
