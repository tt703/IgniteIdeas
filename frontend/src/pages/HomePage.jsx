import React, { useEffect, useState } from 'react'
import API from '../api/client'
import IdeaList from '../components/IdeaList' // assumed component; receives ideas and onLike callback

export default function HomePage() {
  const [ideas, setIdeas] = useState([])
  const [categories, setCategories] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  async function fetchCategories() {
    try {
      const res = await API.get('/api/categories/')
      setCategories(res.data || [])
    } catch (e) {
      console.error('Failed to load categories', e.response || e)
      setCategories([])
    }
  }

  async function fetchIdeas(categoryId = null) {
    setLoading(true)
    try {
      const params = {}
      if (categoryId != null) params.category_id = categoryId
      const res = await API.get('/api/ideas/', { params })
      setIdeas(res.data || [])
    } catch (e) {
      console.error('Failed to fetch ideas', e.response || e)
      setIdeas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    fetchIdeas(null)
  }, [])

  const handleLike = async (id) => {
    try {
      await API.post(`/api/ideas/${id}/vote`, { type: 'up' })
      fetchIdeas(selected)
    } catch (e) {
      console.error('Vote error', e.response || e)
      if (e.response?.status === 401) {
        alert('Please login to like ideas')
      } else {
        alert(e.response?.data?.detail || 'Could not submit vote')
      }
    }
  }

  return (
    <div className="p-3 bg-gray-100 min-h-screen">
      <div className="flex gap-2 overflow-auto pb-3">
        <button onClick={() => { setSelected(null); fetchIdeas(null) }} className={`px-3 py-2 rounded ${selected === null ? 'bg-orange-600 text-white' : ''}`}>All</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => { setSelected(c.id); fetchIdeas(c.id) }} className={`px-3 py-2 rounded ${selected === c.id ? 'bg-orange-600 text-white' : ''}`}>{c.name}</button>
        ))}
      </div>

      {loading ? <div className="text-center py-10">Loading...</div> : <IdeaList ideas={ideas} onLike={handleLike} />}
    </div>
  )
}
