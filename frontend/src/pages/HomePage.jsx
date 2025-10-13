// src/pages/HomePage.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/client'
import IdeaList from '../components/IdeaList' // unchanged: expects ideas + onLike

function IconList() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="13" y="3" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="3" y="13" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="13" y="13" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  )
}
function IconCard() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="4" width="18" height="6" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="3" y="14" width="12" height="6" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  )
}

function safeDate(value) {
  const d = value ? new Date(value) : null
  return d && !Number.isNaN(d.getTime()) ? d : null
}


function IdeaItem({ idea, onLike, variant = 'list', onOpen }) {
  const created = safeDate(idea.created_at)
  const ownerInitial = idea.owner_name ? idea.owner_name[0]?.toUpperCase() : 'U'

  if (variant === 'grid') {
    return (
      <article
        tabIndex={0}
        className="bg-white p-4 rounded-lg shadow transition hover:shadow-md flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-orange-200"
        aria-labelledby={`idea-${idea.id}-title`}
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg text-gray-600 uppercase">
            {ownerInitial}
          </div>
          <div className="flex-1">
            <h3
              id={`idea-${idea.id}-title`}
              className="text-md font-semibold text-gray-800 truncate cursor-pointer"
              onClick={() => onOpen(idea.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(idea.id)}
              role="link"
              tabIndex={0}
            >
              {idea.title}
            </h3>
            <div className="text-xs text-gray-500 mt-1">{idea.category_name || 'General'} • {created ? created.toLocaleDateString() : '—'}</div>
          </div>
        </div>

        <p className="text-sm text-gray-700 mt-3 line-clamp-3">{idea.description}</p>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onLike(idea.id)}
              aria-label={`Like idea ${idea.title}`}
              className="inline-flex items-center gap-2 px-2 py-1 rounded bg-orange-600 text-white text-xs hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              👍 <span className="font-medium">{idea.score ?? 0}</span>
            </button>
            <div className="text-xs">{idea.comments_count ?? 0} comments</div>
          </div>
          <div className="text-xs text-gray-500">{idea.owner_name || 'Unknown'}</div>
        </div>
      </article>
    )
  }

  if (variant === 'card') {
    return (
      <div
        className="bg-white p-3 rounded-lg shadow transition hover:shadow-md flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-orange-200"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className="text-sm font-medium truncate text-gray-800 cursor-pointer"
              onClick={() => onOpen(idea.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(idea.id)}
              role="link"
              tabIndex={0}
            >
              {idea.title}
            </h4>
            <span className="text-xs text-gray-400">• {idea.category_name || 'General'}</span>
          </div>
          <div className="text-xs text-gray-500 truncate mt-1">{idea.description}</div>
        </div>
        <div className="ml-4 flex flex-col items-end gap-2">
          <button
            onClick={() => onLike(idea.id)}
            className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
            aria-label={`Like ${idea.title}`}
          >
            👍 {idea.score ?? 0}
          </button>
          <div className="text-xs text-gray-500">{idea.comments_count ?? 0}</div>
        </div>
      </div>
    )
  }

  return (
    <article className="bg-white p-4 rounded shadow-sm flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl text-gray-600">
        {ownerInitial}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              className="text-md font-semibold cursor-pointer"
              onClick={() => onOpen(idea.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(idea.id)}
              role="link"
              tabIndex={0}
            >
              {idea.title}
            </h3>
            <div className="text-xs text-gray-500 mt-1">
              {idea.owner_name || 'Unknown'} • {idea.category_name || 'General'} • {safeDate(idea.created_at)?.toLocaleString() ?? '—'}
            </div>
          </div>
          <div className="text-sm text-gray-600">{idea.score ?? 0} pts</div>
        </div>

        <p className="text-sm text-gray-700 mt-3">{idea.description}</p>

        <div className="mt-4 flex items-center gap-3 text-sm">
          <button
            onClick={() => onLike(idea.id)}
            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-orange-600 text-white hover:bg-orange-700"
            aria-label={`Like ${idea.title}`}
          >
            👍 Like
          </button>
          <div className="text-gray-500">{idea.comments_count ?? 0} comments</div>
        </div>
      </div>
    </article>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [ideas, setIdeas] = useState([])
  const [categories, setCategories] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('list') 

  const fetchCategories = useCallback(async () => {
    const ac = new AbortController()
    try {
      const res = await API.get('/api/categories/', { signal: ac.signal })
      setCategories(res.data || [])
    } catch (e) {
      if (e?.name === 'CanceledError' || e?.message === 'canceled') return
      console.error('Failed to load categories', e)
      setCategories([])
    }
    return () => ac.abort()
  }, [])

  const fetchIdeas = useCallback(async (categoryId = null) => {
    setLoading(true)
    setError(null)
    const ac = new AbortController()
    try {
      const params = {}
      if (categoryId != null) params.category_id = categoryId
      const res = await API.get('/api/ideas/', { params, signal: ac.signal })
      setIdeas(res.data || [])
    } catch (e) {
      if (e?.name === 'CanceledError' || e?.message === 'canceled') return
      console.error('Failed to fetch ideas', e)
      setIdeas([])
      setError('Failed to load ideas.')
    } finally {
      setLoading(false)
    }
    return () => ac.abort()
  }, [])

  useEffect(() => {
    const abortCats = fetchCategories()
    const abortIdeas = fetchIdeas(null)
    return () => {
      if (typeof abortCats === 'function') abortCats()
      if (typeof abortIdeas === 'function') abortIdeas()
    }
  }, [fetchCategories, fetchIdeas])

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

  const openIdea = (id) => {
    navigate(`/ideas/${id}`)
  }

  const categoryButtons = useMemo(() => {
    return (
      <>
        <button
          onClick={() => { setSelected(null); fetchIdeas(null) }}
          className={`px-3 py-2 rounded-full text-sm border ${selected === null ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-700'}`}
          aria-pressed={selected === null}
        >
          All
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => { setSelected(c.id); fetchIdeas(c.id) }}
            className={`px-3 py-2 rounded-full text-sm border ${selected === c.id ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-700'}`}
            aria-pressed={selected === c.id}
          >
            {c.name}
          </button>
        ))}
      </>
    )
  }, [categories, selected, fetchIdeas])

  const GridView = ({ items }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(idea => (
        <IdeaItem key={idea.id} idea={idea} onLike={handleLike} variant="grid" onOpen={openIdea} />
      ))}
    </div>
  )

  const CardView = ({ items }) => (
    <div className="space-y-3">
      {items.map(idea => (
        <IdeaItem key={idea.id} idea={idea} onLike={handleLike} variant="card" onOpen={openIdea} />
      ))}
    </div>
  )

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-bold mb-3">Ideas Menu</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* categories */}
        <div className="mb-4">
          <div className="flex gap-2 overflow-auto pb-3" role="tablist" aria-label="Categories">
            {categoryButtons}
          </div>
        </div>

        {/* toolbar */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="font-medium">View</div>
            <div className="flex items-center gap-2 bg-white border rounded px-2 py-1">
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                className={`p-1 rounded ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                aria-pressed={viewMode === 'list'}
              >
                <IconList />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                className={`p-1 rounded ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                aria-pressed={viewMode === 'grid'}
              >
                <IconGrid />
              </button>
              <button
                onClick={() => setViewMode('card')}
                title="Card view"
                className={`p-1 rounded ${viewMode === 'card' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                aria-pressed={viewMode === 'card'}
              >
                <IconCard />
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${ideas.length} idea${ideas.length === 1 ? '' : 's'}`}
          </div>
        </div>

        {/* content */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-600">
            <div>{error}</div>
            <div className="mt-3">
              <button onClick={() => fetchIdeas(selected)} className="px-3 py-1 border rounded bg-white">Retry</button>
            </div>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No ideas yet — be the first to submit one.</div>
        ) : (
          <>
            {viewMode === 'list' && (
              <div className="space-y-4">
                <IdeaList ideas={ideas} onLike={handleLike} />
              </div>
            )}
            {viewMode === 'grid' && <GridView items={ideas} />}
            {viewMode === 'card' && <CardView items={ideas} />}
          </>
        )}
      </main>
    </div>
  )
}
