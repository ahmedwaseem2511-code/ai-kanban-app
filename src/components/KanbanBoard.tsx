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
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'

import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

const columns = [
  { id: 'todo',       label: 'To Do',       dot: 'bg-yellow-400', count_bg: 'bg-yellow-900/30 text-yellow-400' },
  { id: 'inprogress', label: 'In Progress',  dot: 'bg-indigo-400', count_bg: 'bg-indigo-900/30 text-indigo-400' },
  { id: 'done',       label: 'Done',         dot: 'bg-green-400',  count_bg: 'bg-green-900/30 text-green-400' },
]

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl transition-all duration-200 ${isOver ? 'ring-2 ring-indigo-500' : ''}`}
    >
      {children}
    </div>
  )
}

export default function KanbanBoard() {
  const dispatch = useDispatch()
  const tasks = useSelector((state: any) => state.tasks.tasks)
  const [showModal, setShowModal] = useState(false)
  const [activeTask, setActiveTask] = useState<any>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  const handleDragStart = (event: any) => {
    setActiveTask(tasks.find((t: any) => t.id === event.active.id) || null)
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const task = tasks.find((t: any) => t.id === active.id)
    if (!task) return

    const overColumn = columns.find((col) => col.id === over.id)
    const newStatus = overColumn
      ? overColumn.id
      : tasks.find((t: any) => t.id === over.id)?.status

    if (!newStatus || task.status === newStatus) return

    dispatch(updateTask({ ...task, status: newStatus }))
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
  }

  return (
    <div className="w-full">

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-xl font-bold">My Tasks</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all"
        >
          + Add Task
        </button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* 
          Mobile: single column stack  
          Tablet (md): 3 columns side by side
          Each column has a fixed min-height so drop zones always exist
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t: any) => t.status === col.id)
            return (
              <DroppableColumn key={col.id} id={col.id}>
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 min-h-[300px]">

                  {/* Column Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                      <h3 className="text-white font-semibold text-sm">{col.label}</h3>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.count_bg}`}>
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Task List */}
                  <SortableContext
                    items={colTasks.map((t: any) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-3">
                      {colTasks.map((task: any) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  </SortableContext>

                  {colTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-600">
                      <div className="text-2xl mb-2">📭</div>
                      <p className="text-xs">Drop tasks here</p>
                    </div>
                  )}
                </div>
              </DroppableColumn>
            )
          })}
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}>
          {activeTask ? (
            <div className="bg-slate-900 border-2 border-indigo-500 rounded-xl p-4 shadow-2xl rotate-1 scale-105 w-72">
              <p className="text-white font-semibold text-sm break-words">{activeTask.title}</p>
              {activeTask.description && (
                <p className="text-slate-400 text-xs mt-1 line-clamp-2">{activeTask.description}</p>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showModal && <TaskModal onClose={() => setShowModal(false)} />}
    </div>
  )
}