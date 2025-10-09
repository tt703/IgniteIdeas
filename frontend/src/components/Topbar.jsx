import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => {
    logout()
    navigate('/')
}
    return (
        <header className="w-full bg-white shadow p-3 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
             <Link to="/" className="flex items-center gap-2">
               <img src="../assets//react.png" alt="Logo" className="img-fluid rounded" />
              <span className="font-semibold text-lg">IgniteIdeas</span>
             </Link>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                  <>
                    <span className="hidden sm:inline text-sm">Hi, {user.name}</span>
                    {user.roles && user.roles.includes('admin') && (
                      <Link to="/admin/adminLanding" className="text-sm px-3 py-1 rounded bg-gray-200">Admin</Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1 rounded bg-red-500 text-white text-sm"
                    > Logout
                    </button>
                 </>
                ) : (
                <>
                     <Link to="/login" className="text-sm px-3 py-1">
                       Login
                     </Link>
                    <Link to="/register" className="text-sm px-3 py-1">
                     Register
                    </Link>
                </>
            )}
        </div>
    </header>
    )
}

