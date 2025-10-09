import React, { useEffect, useState } from 'react'
import API from '../api/client'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState({})
  const nav = useNavigate()
  const { user } = useAuth()

  const isAdmin = !!user && Array.isArray(user.roles) ? user.roles.includes('admin') : false

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!user) return
      setLoading(true)
      setError(null)
      try {
        const res = await API.get('/api/admin/categories/')
        if (!mounted) return
        setCategories(res.data || [])
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.detail || err.message || 'Failed to load categories')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [user])

  const addCategory = async () => {
    const trimmed = (name || '').trim()
    if (!trimmed) return alert('Enter a category name')
    setSavingId('new')
    try {
      const res = await API.post('/api/admin/categories/', { name: trimmed })
      setCategories(prev => [res.data, ...prev])
      setName('')
    } catch (err) {
      alert(err?.response?.data?.detail || err.message || 'Failed to add category')
    } finally {
      setSavingId(null)
    }
  }

  const startEdit = (id, currentName) => setEditing(prev => ({ ...prev, [id]: currentName }))
  const cancelEdit = (id) => setEditing(prev => { const copy = {...prev}; delete copy[id]; return copy })

  const saveEdit = async (id) => {
    const newName = (editing[id] || '').trim()
    if (!newName) return alert('Name cannot be empty')
    setSavingId(id)
    const previous = categories
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, name: newName } : c)))
    try {
      await API.patch(`/api/admin/categories/${id}`, { name: newName })
      cancelEdit(id)
    } catch (err) {
      alert(err?.response?.data?.detail || err.message || 'Failed to update category')
      setCategories(previous)
    } finally {
      setSavingId(null)
    }
  }

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return
    const previous = categories
    setCategories(prev => prev.filter(c => c.id !== id))
    try {
      await API.delete(`/api/admin/categories/${id}`)
    } catch (err) {
      alert(err?.response?.data?.detail || err.message || 'Failed to delete category')
      setCategories(previous)
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
        <Link to="/home" className="mt-3 inline-block px-3 py-2 border rounded">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-2xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Manage Categories</h2>
        <div>
          <button onClick={() => nav('/admin/adminLanding')} className="text-sm px-3 py-1 rounded border mr-2">Back</button>
        </div>
      </div>

      <div className="mb-4 bg-white p-3 rounded shadow-sm">
        <label className="block text-sm font-medium mb-2">Add new category</label>
        <div className="flex gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Category name"
                 className="flex-1 p-2 border rounded"
                 onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCategory() } }} />
          <button onClick={addCategory} disabled={savingId === 'new'} className="px-3 py-2 bg-orange-600 text-white rounded disabled:opacity-60">
            {savingId === 'new' ? 'Adding…' : 'Add'}
          </button>
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      <div className="bg-white p-3 rounded shadow-sm">
        <h3 className="font-medium mb-2">Existing categories</h3>
        {loading ? <div className="py-6 text-center text-gray-500">Loading categories…</div> :
         categories.length === 0 ? <div className="py-6 text-center text-gray-500">No categories yet.</div> :
         <ul className="space-y-2">
           {categories.map(cat => (
             <li key={cat.id} className="flex items-center gap-2">
               <div className="flex-1">
                 {editing[cat.id] != null ? (
                   <input className="w-full p-2 border rounded" value={editing[cat.id]} onChange={(e)=>setEditing(prev=>({...prev,[cat.id]:e.target.value}))}
                          onKeyDown={(e)=>{ if(e.key==='Enter') saveEdit(cat.id); if(e.key==='Escape') cancelEdit(cat.id) }} />
                 ) : (
                   <div className="flex items-center gap-3">
                     <span className="font-medium">{cat.name}</span>
                     <span className="text-xs text-gray-500">#{cat.id}</span>
                   </div>
                 )}
               </div>

               <div className="flex gap-2">
                 {editing[cat.id] != null ? (
                   <>
                     <button onClick={()=>saveEdit(cat.id)} disabled={savingId===cat.id} className="px-2 py-1 bg-green-600 text-white rounded text-sm">
                       {savingId===cat.id ? 'Saving…' : 'Save'}
                     </button>
                     <button onClick={()=>cancelEdit(cat.id)} className="px-2 py-1 border rounded text-sm">Cancel</button>
                   </>
                 ) : (
                   <>
                     <button onClick={()=>startEdit(cat.id, cat.name)} className="px-2 py-1 border rounded text-sm">Edit</button>
                     <button onClick={()=>deleteCategory(cat.id)} className="px-2 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
                   </>
                 )}
               </div>
             </li>
           ))}
         </ul>
        }
      </div>
    </div>
  )
}
