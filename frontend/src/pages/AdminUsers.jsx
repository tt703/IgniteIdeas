import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null) 
  const [rolesInput, setRolesInput] = useState('')
  const [error, setError] = useState(null)

  const nav = useNavigate()
  const { user } = useAuth()

  const isAdmin = !!user && Array.isArray(user.roles) ? user.roles.includes('admin') : false

  useEffect(() => {
    if (!user) return
    load()
  }, [user])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await API.get('/api/admin/users/')
      setUsers(res.data || [])
    } catch (e) {
      console.error('Could not load users', e)
      setError(e?.response?.data?.detail || e.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (u) => {
    setEditing(u)
    setRolesInput((u.roles || []).join(','))
  }

  const cancelEdit = () => {
    setEditing(null)
    setRolesInput('')
  }

  const saveEdit = async () => {
    if (!editing) return
    const roles = (rolesInput || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    try {
      await API.patch(`/api/admin/users/${editing.id}`, { roles })
      await load()
      cancelEdit()
    } catch (e) {
      console.error('Failed to save user', e)
      alert(e?.response?.data?.detail || e.message || 'Failed to save user')
    }
  }

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await API.delete(`/api/admin/users/${id}`)
      await load()
    } catch (e) {
      console.error('Delete failed', e)
      alert(e?.response?.data?.detail || e.message || 'Failed to delete user')
    }
  }

  if (!user) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-600">You must be signed in as an admin to view this page.</p>
        <button onClick={() => nav('/login')} className="mt-3 px-3 py-2 bg-orange-600 text-white rounded">Go to Login</button>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">Access denied</h2>
        <p className="text-sm text-gray-600">You are signed in but do not have admin privileges.</p>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-3xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Manage Users</h2>
        <div>
          <button onClick={() => nav('/admin/AdminLanding')} className="text-sm px-3 py-1 rounded border">Back</button>
        </div>
      </div>

      <div className="mb-4">
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {loading ? (
          <div className="py-6 text-center text-gray-500">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="py-6 text-center text-gray-500">No users found.</div>
        ) : (
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="bg-white p-3 rounded shadow flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.name || 'No name'}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                  <div className="text-xs text-gray-500 mt-1">Roles: {(u.roles || []).join(', ') || '—'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(u)}
                    className="px-3 py-1 rounded border bg-white-600 text-grey text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded w-full max-w-md shadow">
            <h3 className="font-semibold mb-2">Edit {editing.name || editing.email}</h3>
            <label className="text-sm text-gray-600 block mb-1">Roles (comma separated)</label>
            <input
              value={rolesInput}
              onChange={e => setRolesInput(e.target.value)}
              className="w-full p-2 border rounded mb-3"
              placeholder="e.g. user,evaluator,admin"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={cancelEdit} className="px-3 py-2 bg-gray-200 rounded border">Cancel</button>
              <button onClick={saveEdit} className="px-3 py-2 bg-gray-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
