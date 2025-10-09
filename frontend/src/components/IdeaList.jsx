import React from 'react'
import IdeaCard from './IdeaCard'

export default function IdeaList({ ideas, onLike }) {
  return (
    <div className="grid grid-cols-1 gap-3 p-3">
      {ideas.length === 0 && <div className="text-center text-gray-500">No ideas yet</div>}
      {ideas.map(i => <IdeaCard key={i.id} idea={i} onLike={onLike} />)}
    </div>
  )
}
