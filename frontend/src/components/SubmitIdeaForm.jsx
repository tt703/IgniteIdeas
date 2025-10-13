// src/pages/SubmitIdeaForm.jsx
import React, { useEffect, useState } from 'react'
import API from '../api/client'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const MAX_TITLE = 200
const MAX_DESC = 4000

export default function SubmitIdeaForm({ onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(null)

  const [categories, setCategories] = useState([])
  const [catLoading, setCatLoading] = useState(true)
  const [catError, setCatError] = useState(null)

  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const nav = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const ac = new AbortController()
    let mounted = true

    async function loadCategories() {
      setCatLoading(true)
      setCatError(null)
      try {
        const res = await API.get('/api/categories/', { signal: ac.signal })
        if (!mounted) return
        setCategories(res.data || [])
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.message === 'canceled') return
        console.error('Failed to load categories', err)
        if (!mounted) return
        setCategories([])
        setCatError('Could not load categories. You can still submit (choose "None").')
      } finally {
        if (mounted) setCatLoading(false)
      }
    }

    loadCategories()
    return () => {
      mounted = false
      ac.abort()
    }
  }, [])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategoryId(null)
    setSubmitError(null)
  }

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setSubmitError(null)

    // basic auth check
    if (!user) {
      setSubmitError('You must sign in to submit an idea.')
      nav('/login')
      return
    }

    // client-side validation
    if (!title.trim()) {
      setSubmitError('Please enter a title for your idea.')
      return
    }
    if (title.trim().length > MAX_TITLE) {
      setSubmitError(`Title must be ${MAX_TITLE} characters or less.`)
      return
    }
    if (!description.trim()) {
      setSubmitError('Please add a description for the idea.')
      return
    }
    if (description.trim().length > MAX_DESC) {
      setSubmitError(`Description must be ${MAX_DESC} characters or less.`)
      return
    }

    // allow submit even if categories failed to load, but prefer a selection
    if (!categoryId && categories.length > 0) {
      // optional: force selection if categories exist
      // setSubmitError('Please select a category.')
      // return
    }

    setLoading(true)
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId ?? null
      }
      const res = await API.post('/api/ideas/', payload)
      // optimistic UI: clear form
      resetForm()

      if (onCreated && typeof onCreated === 'function') {
        try { onCreated(res.data) } catch (err) { console.warn('onCreated callback failed', err) }
      }

      // navigate to the idea detail page
      if (res?.data?.id) {
        nav(`/ideas/${res.data.id}`)
      } else {
        nav('/home')
      }
    } catch (err) {
      console.error('Submit idea error', err)
      // try to extract server message
      const serverMsg =
        err?.response?.data?.detail ||
        (err?.response?.data && typeof err.response.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Failed to submit idea.'
      setSubmitError(serverMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 p-4 bg-white rounded shadow-sm" aria-labelledby="submit-idea-heading">
      <div className="flex items-center">
          <h2 id="submit-idea-heading" className="text-lg font-semibold">Share an idea</h2>
          <button
             type="button"
             onClick={() => nav('/home')}
             className="ml-auto px-3 py-2 border rounded text-sm"
          >
          Back to Home
          </button>
      </div>

      {submitError && (
        <div role="alert" className="text-sm text-red-700 bg-red-100 p-2 rounded">
          {submitError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="idea-title">Title <span className="text-gray-400 text-xs">({title.length}/{MAX_TITLE})</span></label>
        <input
          id="idea-title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Brief, descriptive title"
          maxLength={MAX_TITLE}
          required
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="idea-description">Description <span className="text-gray-400 text-xs">({description.length}/{MAX_DESC})</span></label>
        <textarea
          id="idea-description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Explain the problem, your idea and why it matters"
          rows={6}
          maxLength={MAX_DESC}
          required
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-300 resize-y"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="idea-category">Category</label>
        {catLoading ? (
          <div className="text-sm text-gray-500 p-2">Loading categories…</div>
        ) : (
          <select
            id="idea-category"
            value={categoryId ?? ''}
            onChange={e => setCategoryId(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
            disabled={loading}
          >
            <option value="">— Select category —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        {catError && <div className="text-xs text-gray-500 mt-1">{catError}</div>}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-60"
        >
          {loading ? 'Submitting…' : 'Submit Idea'}
        </button>

        <button
          type="button"
          onClick={resetForm}
          className="px-3 py-2 border rounded text-sm"
          disabled={loading}
        >
          Reset
        </button>

        
      </div>
    </form>
  )
}
