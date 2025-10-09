import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage(){
  const { register } = useAuth()
  const nav = useNavigate()
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [err,setErr]=useState(null)

  const handle = async e => {
    e.preventDefault()
    setErr(null)
    try{
      await register(name,email,password)
      nav('/login')
    }catch(error){
      setErr(error.response?.data?.detail || error.message)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <form onSubmit={handle} className="space-y-3">
        <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full p-3 rounded border" />
        <input required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="w-full p-3 rounded border" />
        <input required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-3 rounded border" />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="w-full p-3 rounded bg-orange-600 text-white">Register</button>
      </form>
    </div>
  )
}
