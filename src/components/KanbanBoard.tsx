import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateTask } from '../store/taskSlice'
import { supabase } from '../lib/supabase'
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'
import {
  DndContext,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

const columns = [
  { id: 'todo', label: 'To Do', dot: 'bg-yellow-400' },
  { id: 'inprogress', label: 'In Progress', dot: 'bg-indigo-400' },
  { id: 'done', label: 'Done', dot: 'bg-green-400' },
]

function DroppableColumn({ id, children }: any) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div ref={setNodeRef} className="h-full">
      {children}
    </div>
  )
}

export default function KanbanBoard() {
  const dispatch = useDispatch()
  const tasks = useSelector((state: any) => state.tasks.tasks)
  const [showModal, setShowModal] = useState(false)

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (!over) return

    const task = tasks.find((t: any) => t.id === active.id)
    if (!task) return

    const newStatus = over.id

    if (task.status === newStatus) return

    const updated = { ...task, status: newStatus }

    dispatch(updateTask(updated))

    await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-xl font-bold">My Tasks</h2>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition"
        >
          + Add Task
        </button>
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-5">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {columns.map((col) => {
            const colTasks = tasks.filter(
              (t: any) => t.status === col.id
            )

            return (
              <DroppableColumn key={col.id} id={col.id}>
                <div className="bg-slate-800 rounded-2xl p-4 min-h-[500px]">
                  
                  {/* Column Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${col.dot}`} />
                      <h3 className="text-white font-bold">
                        {col.label}
                      </h3>
                    </div>

                    <span className="bg-slate-700 text-slate-400 text-xs px-2 py-1 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tasks */}
                  <SortableContext
                    items={colTasks.map((t: any) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {colTasks.map((task: any) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </SortableContext>

                  {/* Empty state */}
                  {colTasks.length === 0 && (
                    <div className="text-slate-600 text-sm text-center mt-10">
                      No tasks yet
                    </div>
                  )}
                </div>
              </DroppableColumn>
            )
          })}
        </DndContext>
      </div>

      {/* Modal */}
      {showModal && (
        <TaskModal onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}