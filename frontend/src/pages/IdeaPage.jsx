import React, { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import API from '../api/client'
import { useAuth } from '../context/AuthContext'

const MAX_COMMENT_LENGTH = 1000

export default function IdeaPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()

  const [idea, setIdea] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [voting, setVoting] = useState(false)
  const [error, setError] = useState(null)

  const commentsContainerRef = useRef(null)
  const textareaRef = useRef(null)

  const fmt = (s) => {
    try { return s ? new Date(s).toLocaleString() : '' } catch { return '' }
  }

  useEffect(() => {
    let mounted = true
    async function loadAll() {
      setLoading(true)
      setError(null)
      try {
        const ideaRes = await API.get(`/api/ideas/${id}`)
        let commentsRes = []
        try {
          const cRes = await API.get(`/api/ideas/${id}/comments`)
          commentsRes = cRes.data || []
        } catch (err) {
          if (err?.response?.status === 404) {
            commentsRes = []
          } else {
            throw err
          }
        }

        if (!mounted) return
        setIdea(ideaRes.data || null)
        setComments((commentsRes || []).slice().reverse())
      } catch (err) {
        console.error('Failed to load idea or comments', err)
        if (!mounted) return
        setError(err?.response?.data?.detail || err.message || 'Failed to load idea')
        setIdea(null)
        setComments([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadAll()
    return () => { mounted = false }
  }, [id])

  const scrollCommentsToTop = () => {
    try {
      if (commentsContainerRef.current) {
        commentsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (e) { /* ignore */ }
  }

  const handlePostComment = async () => {
    if (!user) {
      alert('Please login to comment.')
      return
    }
    const content = (commentText || '').trim()
    if (!content) return

    setPosting(true)
    const tempId = `temp-${Date.now()}`
    const tempComment = {
      id: tempId,
      user_name: user.name || user.email || 'You',
      content,
      created_at: new Date().toISOString(),
      optimistic: true,
    }

    setComments(prev => [tempComment, ...prev])
    setCommentText('')
    scrollCommentsToTop()

    try {
      const res = await API.post(`/api/ideas/${id}/comments`, { content })
      if (res?.data?.id) {
        // replace temp with server comment
        setComments(prev => prev.map(c => (String(c.id) === tempId ? res.data : c)))
      } else {
        // fallback: reload comments
        const cRes = await API.get(`/api/ideas/${id}/comments`)
        setComments((cRes.data || []).slice().reverse())
      }
    } catch (err) {
      console.error('Comment post failed', err)
      alert(err?.response?.data?.detail || 'Failed to post comment')
      // remove optimistic temp
      setComments(prev => prev.filter(c => String(c.id) !== tempId))
    } finally {
      setPosting(false)
    }
  }

  // Ctrl/Cmd+Enter to post
  const onTextareaKeyDown = (e) => {
    const isCmdEnter = (e.ctrlKey || e.metaKey) && e.key === 'Enter'
    if (isCmdEnter) {
      e.preventDefault()
      if (!posting && commentText.trim()) handlePostComment()
    }
  }

  // Thumb-up like (optimistic)
  const handleLike = async () => {
    if (!user) {
      alert('Please login to like this idea.')
      return
    }
    if (voting) return
    setVoting(true)
    const prev = idea
    try {
      // optimistic increment
      const optimistic = { ...idea, score: (idea?.score ?? 0) + 1 }
      setIdea(optimistic)
      await API.post(`/api/ideas/${id}/vote`, { type: 'up' })
      // authoritative reload
      const res = await API.get(`/api/ideas/${id}`)
      setIdea(res.data)
    } catch (err) {
      console.error('Vote failed', err)
      alert(err?.response?.data?.detail || 'Failed to like')
      setIdea(prev)
    } finally {
      setVoting(false)
    }
  }

  if (loading) return <div className="p-4">Loading…</div>

  if (error) return (
    <div className="p-4">
      <div className="mb-3 text-red-600">Error: {String(error)}</div>
      <button onClick={() => window.location.reload()} className="px-3 py-1 border rounded">Retry</button>
    </div>
  )

  if (!idea) return <div className="p-4">Idea not found.</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-4 grid md:grid-cols-3 gap-6">
        {/* LEFT: Main post (col-span 2 on md) */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => nav(-1)} className="px-3 py-1 rounded border text-sm">Back</button>
            <Link to="/home" className="text-sm text-gray-600 hover:underline">Home</Link>
          </div>

          <article className="bg-white rounded shadow-sm p-4 mb-4">
            {/* Author header (LinkedIn-like) */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl text-gray-600">
                  {idea.owner_name ? (idea.owner_name[0] || 'U').toUpperCase() : 'U'}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{idea.owner_name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{idea.owner_title || 'Member'}</div>
                    <div className="text-xs text-gray-400 mt-1">{idea.category_name || idea.category || 'General'} • {fmt(idea.created_at)}</div>
                  </div>
                  {/* more actions icon or menu could go here */}
                </div>

                {/* content */}
                <div className="mt-3 text-gray-800 whitespace-pre-wrap leading-relaxed">
                  <h2 className="text-lg font-semibold mb-2">{idea.title}</h2>
                  <div className="text-sm">{idea.description || 'No description provided.'}</div>
                </div>

                {/* attachments (if any) */}
                {idea.attachments && idea.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {idea.attachments.map((a, i) => (
                      <a key={i} href={a.url} target="_blank" rel="noreferrer" className="text-sm text-orange-600 underline block">{a.name || a.url}</a>
                    ))}
                  </div>
                )}

                {/* actions row */}
                <div className="mt-4 border-t pt-3 flex items-center gap-3">
                  <button
                    onClick={handleLike}
                    disabled={voting}
                    aria-pressed="false"
                    aria-label="Like this idea"
                    className="inline-flex items-center gap-2 px-3 py-1 rounded bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60"
                  >
                    <span aria-hidden>👍</span>
                    <span className="text-sm">{voting ? '...' : 'Like'}</span>
                  </button>

                  <button
                    onClick={() => textareaRef.current?.focus()}
                    className="px-3 py-1 rounded border text-sm"
                  >
                    Comment
                  </button>

                  <button
                    onClick={() => alert('Share is not implemented yet')}
                    className="px-3 py-1 rounded border text-sm"
                  >
                    Share
                  </button>

                  <div className="ml-auto text-sm text-gray-600">Score: <span className="font-medium">{idea.score ?? 0}</span></div>
                </div>
              </div>
            </div>
          </article>

          {/* Comments section */}
          <section className="mb-20">
            <h3 className="text-lg font-semibold mb-3">Comments ({comments.length})</h3>

            {comments.length === 0 ? (
              <div className="text-gray-500 mb-4">No comments yet — be the first to comment.</div>
            ) : (
              <div ref={commentsContainerRef} className="space-y-3 mb-4 max-h-[60vh] overflow-auto">
                {comments.map(c => (
                  <div key={c.id} className={`bg-white p-3 rounded shadow-sm ${c.optimistic ? 'opacity-70' : ''}`}>
                    <div className="flex items-baseline justify-between">
                      <div className="text-sm font-medium">{c.user_name || 'Anonymous'}</div>
                      <div className="text-xs text-gray-400">{fmt(c.created_at)}</div>
                    </div>
                    <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{c.content}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT: Sidebar */}
        <aside className="hidden md:block">
          <div className="sticky top-6 space-y-4">
            <div className="bg-white p-4 rounded shadow-sm">
              <div className="text-sm text-gray-500">About</div>
              <div className="mt-2 text-sm text-gray-800">
                <div><strong>Category:</strong> {idea.category_name || idea.category || 'General'}</div>
                <div className="mt-1"><strong>Status:</strong> {idea.status || 'Submitted'}</div>
                <div className="mt-1"><strong>Owner:</strong> {idea.owner_name || 'Unknown'}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm">
              <div className="text-sm text-gray-500">Related</div>
              <div className="mt-3 text-sm text-gray-700">
                {/* placeholder related ideas — hook up when /api/ideas?related available */}
                <div className="mb-2">— Related idea A</div>
                <div className="mb-2">— Related idea B</div>
                <div className="mb-2">— Related idea C</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Fixed comment input bar (mobile & desktop) */}
      <div className="fixed left-0 right-0 bottom-25 bg-white border-t p-3">
        <div className="max-w-6xl mx-auto flex items-start gap-3">
          <textarea
            ref={textareaRef}
            value={commentText}
            onChange={(e) => {
              if (e.target.value.length <= MAX_COMMENT_LENGTH) setCommentText(e.target.value)
            }}
            onKeyDown={onTextareaKeyDown}
            rows={1}
            placeholder={comments.length === 0 ? 'Be the first to comment… ' : 'Add a comment… '}
            className="flex-1 p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
            disabled={posting}
            aria-label="Comment text"
          />
          <div className="flex flex-col items-end gap-2">
            <div className="text-xs text-gray-500">{commentText.length}/{MAX_COMMENT_LENGTH}</div>
            <button
              onClick={handlePostComment}
              disabled={!commentText.trim() || posting}
              className="px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-60"
            >
              {posting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
