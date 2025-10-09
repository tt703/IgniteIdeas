import React, { useEffect, useState } from 'react'
import KanbanBoard from '../components/KanbanBoard'
import API from '../api/client'
import { useAuth } from '../context/AuthContext'

const STATUSES = ["Submitted", "Under Review", "Approved", "In Progress", "Implemented", "Archived"]

export default function DashboardPage() {
  const [columns, setColumns] = useState({})
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const emptyColumns = () => {
    const m = {}
    STATUSES.forEach(s => (m[s] = []))
    return m
  }

  const load = async () => {
    if (!user) {
      setColumns(emptyColumns())
      return
    }

    setLoading(true)
    try {
      // Correct param usage: pass owner_id as query param (number)
      const res = await API.get('/api/ideas/', { params: { owner_id: user.id } })
      const data = res.data || []

      const map = emptyColumns()
      data.forEach(i => {
        const status = i.status || 'Submitted'
        // ensure array exists
        if (!map[status]) map[status] = []
        // normalize owner_name
        const owner_name = i.owner_name || user.name || ''
        map[status].push({ ...i, owner_name })
      })

      setColumns(map)
    } catch (e) {
      console.error('Failed to load ideas for user', e.response || e)
      setColumns(emptyColumns())
    } finally {
      setLoading(false)
    }
  }

  const onDragEnd = async (result) => {
    // result = { draggableId, source, destination, ... }
    const { source, destination, draggableId } = result
    if (!destination) return
    const from = source.droppableId
    const to = destination.droppableId
    if (from === to) return

    // optimistic UI: move the card locally before API call
    const cardId = Number(draggableId)
    const newColumns = { ...columns }
    // remove from source
    newColumns[from] = newColumns[from].filter(c => Number(c.id) !== cardId)
    // find the moved card to add to destination (we can augment with status)
    const movedCard = { ...(columns[from].find(c => Number(c.id) === cardId) || { id: cardId, title: 'Untitled' }) }
    movedCard.status = to
    newColumns[to] = [...newColumns[to]]
    // insert at destination.index if available
    const destIndex = destination.index ?? newColumns[to].length
    newColumns[to].splice(destIndex, 0, movedCard)

    setColumns(newColumns)

    try {
      // call backend to update status
      // endpoint assumed POST /api/ideas/{id}/status with body { status: "Approved" }
      await API.post(`/api/ideas/${cardId}/status`, { status: to })
      // reload to get authoritative data (optional)
      load()
    } catch (err) {
      console.error('Failed to update status', err.response || err)
      // revert to server state on error
      load()
    }
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">My Ideas Kanban</h2>
        <button onClick={load} className="text-sm px-3 py-1 rounded border">Refresh</button>
      </div>

      {loading ? (
        <div className="text-center py-6 text-gray-500">Loading ideas…</div>
      ) : (
        <KanbanBoard columns={columns} onDragEnd={onDragEnd} />
      )}

      <div id="add" className="mt-4">
        {/* Add idea shortcut or button can be placed here */}
      </div>
    </div>
  )
}
