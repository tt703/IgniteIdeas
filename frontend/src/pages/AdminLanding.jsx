import React from 'react'
import {Link, useNavigate} from 'react-router-dom'

export default function AdminLanding(){
  const nav = useNavigate()
    return(
        <div className="p-4">
            <h1 className="text-2xl text-center font-semibold mb-3">Admin Dashboard</h1>
            <p className="text-center text-gray-600 mb-4">Welcome to the Admin Dashboard. Use the links below.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to = "/admin/AdminCategories" className="p-4 bg-white rounded shadow hover:shadow-md">
                  <h3 className="font-semibold">Manage Categories</h3>
                  <p className="text-sm text-gray-500">Add, edit, or remove idea categories.</p>
                </Link>
                <Link to = "/admin/AdminUsers" className="p-4 bg-white rounded shadow hover:shadow-md">
                  <h3 className="font-semibold">Manage Users</h3>
                  <p className="text-sm text-gray-500">View and manage user accounts and roles.</p>
                </Link>
                <Link to = "/admin/reports" className="p-4 bg-white rounded shadow hover:shadow-md">
                  <h3 className="font-semibold">View Reports</h3>
                  <p className="text-sm text-gray-500">View website metrics and exports "Coming Soon".</p>
                </Link>
                <Link to = "/admin/settings" className="p-4 bg-white rounded shadow hover:shadow-md">
                  <h3 className="font-semibold">System Settings</h3>
                  <p className="text-sm text-gray-500">Configure system-wide settings "Coming Soon".</p>
                </Link>   
            </div>
        </div>
    )
}