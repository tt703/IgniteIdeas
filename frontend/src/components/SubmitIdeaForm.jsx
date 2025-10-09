import React, { useEffect, useState } from 'react'
import API from '../api/client'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SubmitIdeaForm({ onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const nav = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        // public categories endpoint
        const res = await API.get('/api/categories/')
        if (!mounted) return
        setCategories(res.data || [])
      } catch (err) {
        console.error('Failed to load categories', err.response || err)
        setCategories([])
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const submit = async (e) => {
    e?.preventDefault()
    if (!user) {
      alert('Please login to submit an idea')
      nav('/login')
      return
    }
    if (!categoryId) {
      alert('Please select a category')
      return
    }

    setLoading(true)
    try {
      const payload = { title, description, category_id: categoryId }
      const res = await API.post('/api/ideas/', payload)
      setTitle(''); setDescription(''); setCategoryId(null)
      if (onCreated) onCreated(res.data)
      nav(`/ideas/${res.data.id}`)
    } catch (err) {
      console.error('Submit idea error', err.response || err)
      alert(err.response?.data?.detail || err.response?.data || err.message || 'Failed to submit idea')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 p-3 bg-white rounded shadow-sm">
      <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Idea Title" className="w-full p-3 border rounded" />
      <textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your idea" className="w-full p-3 border rounded" rows={6} />
      <select value={categoryId ?? ''} onChange={e => setCategoryId(e.target.value ? parseInt(e.target.value, 10) : null)} className="w-full p-3 border rounded">
        <option value="">Select category</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <div className="flex gap-3">
        <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded">{loading ? 'Submitting..' : 'Submit Idea'}</button>
      </div>
    </form>
  )
}
