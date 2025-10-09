import React from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function KanbanBoard({ columns = {}, onDragEnd }) {
  const statuses = Object.keys(columns)

  return (
    <div className="p-3">
      <DragDropContext onDragEnd={result => onDragEnd && onDragEnd(result)}>
        <div className="flex gap-3 overflow-auto pb-4">
          {statuses.map(status => (
            <div key={status} className="min-w-[260px] bg-gray-100 rounded p-3 flex-shrink-0">
              <h4 className="font-semibold mb-2">{status} ({(columns[status] || []).length})</h4>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 min-h-[120px] ${snapshot.isDraggingOver ? 'ring-2 ring-orange-300' : ''}`}
                  >
                    {(columns[status] || []).map((card, idx) => (
                      <Draggable key={String(card.id)} draggableId={String(card.id)} index={idx}>
                        {(prov, dragSnapshot) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`bg-white p-3 rounded shadow-sm ${dragSnapshot.isDragging ? 'opacity-90 scale-105' : ''}`}
                          >
                            <div className="font-medium">{card.title}</div>
                            {card.owner_name && <div className="text-xs text-gray-500">{card.owner_name}</div>}
                            <div className="text-xs text-gray-400 mt-1">{card.created_at ? new Date(card.created_at).toLocaleString() : ''}</div>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
