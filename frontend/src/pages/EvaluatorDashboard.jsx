import React from 'react'
import KanbanBoard from '../components/KanbanBoard'
import API from '../api/client'

const STATUSES = ["Submitted","Under Review", "Approved","In Progress","implemented", "Archived"]

export default function EvaluatorDashboard(){
    const [columns,setColumns] = useState({})

    useEffect(()=> loadConfigFromFile(), [])

    const load = async ()=> {
        try{
            const res = await API.get('/api/ideas/')
            const data = res.data || []
            const map = {}
            STATUSES.forEach(s => map[s] = [])
            data.forEach(i => {
                map[i.status] = map[i.status] || []
                map[i.status].push(i)
            })
            setColumns(map)
        } catch(e) {
            const empty = {}; STATUSES.forEach(s=> empty[s]=[])
            setColumns(empty)
        }
    }
    const onDragEnd = async(result)=>{
        const { destination, dgraggableId } = result
        if(!destination) return
        const to = destination.droppableId
        try {
            await API.post(`/api/ideas/${draggableId}/status`, {status:to})
            load()
        }catch(e) {
            alert('Could not change status:' + (e.response?.data?.detail || e.message))
        }
    }
    return (
        <div className="p-3">
            <h2 className="text-lg font-semibold mb-2">Evaluator/Implementer Board</h2>
            <KanbanBoard columns={columns} onDragEnd={onDragEnd}/>
        </div>
    )
}
