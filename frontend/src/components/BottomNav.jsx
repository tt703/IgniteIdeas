import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FaHome, FaPlus, FaTrello, FaUser } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

export default function BottomNav() {
  const { user } = useAuth()
  const nav = useNavigate()

  const handleAdd = () => {
    if (!user) nav('/login')
    else nav('/submit')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 flex justify-around z-30 sm:justify-evenly md:px-16 lg:px-32 xl:px-48">
      <NavLink to="/home" className="flex flex-col items-center text-xs">
        <FaHome className="w-5 h-5" />
        <span>Home</span>
      </NavLink>

      <button onClick={handleAdd} className="flex flex-col items-center text-xs">
        <div className="w-12 h-12 bg-orange-600 text-white p-2 rounded-full -mt-3 flex items-center justify-center">
          <FaPlus />
        </div>
        <span>Add</span>
      </button>

      <NavLink to="/dashboard" className="flex flex-col items-center text-xs">
        <FaTrello className="w-5 h-5" />
        <span>Board</span>
      </NavLink>

      <NavLink to={user ? "/dashboard" : "/login"} className="flex flex-col items-center text-xs">
        <FaUser className="w-5 h-5" />
        <span>Me</span>
      </NavLink>
    </nav>
  )
}
