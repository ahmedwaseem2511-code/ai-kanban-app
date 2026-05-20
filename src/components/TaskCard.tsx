import { useState, memo } from 'react'
import { useDispatch } from 'react-redux'
import { deleteTask, updateTask } from '../store/taskSlice'
import { supabase } from '../lib/supabase'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function EditModal({ task, onClose }: any) {
  const dispatch = useDispatch()

  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState(task.priority)
  const [dueDate, setDueDate] = useState(task.due_date || '')
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    setLoading(true)

    const { data } = await supabase
      .from('tasks')
      .update({
        title,
        description,
        priority,
        due_date: dueDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', task.id)
      .select()
      .single()

    if (data) dispatch(updateTask(data))

    setLoading(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-2xl p-6 w-full max-w-[460px] border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-white mb-5">Edit Task</h2>

        <div className="mb-4">
          <label className="text-slate-400 text-sm mb-1 block">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg text-sm outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="text-slate-400 text-sm mb-1 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg text-sm outline-none h-20 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div>
            <label className="text-slate-400 text-sm mb-1 block">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg text-sm outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-sm mb-1 block">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg text-sm outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 text-slate-300 py-3 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? 'Saving...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TaskCard({ task }: any) {
  const dispatch = useDispatch()
  const [editing, setEditing] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.3 : 1,
    // ✅ FIX 1: yeh line ZAROORI hai mobile drag ke liye
    // Iske bina browser touch ko scroll samajh leta hai, drag nahi hoti
    touchAction: 'none',
  }

  const handleDelete = async () => {
    await supabase.from('tasks').delete().eq('id', task.id)
    dispatch(deleteTask(task.id))
  }

  const priorityColors: any = {
    high: 'bg-red-900/30 text-red-400',
    medium: 'bg-yellow-900/30 text-yellow-400',
    low: 'bg-green-900/30 text-green-400',
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-slate-900 border border-slate-700 hover:border-indigo-500 rounded-xl p-4 mb-3 transition w-full select-none cursor-grab active:cursor-grabbing"
      >
        <h3 className="text-white font-semibold text-sm mb-1 break-words">
          {task.title}
        </h3>

        {task.description && (
          <p className="text-slate-400 text-xs mb-3 line-clamp-2 break-words">
            {task.description}
          </p>
        )}

        <div className="flex justify-between items-center mb-3 gap-2 flex-wrap">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}
          >
            {task.priority}
          </span>

          {task.due_date && (
            <span className="text-slate-500 text-xs">
              📅 {task.due_date}
            </span>
          )}
        </div>

        {/* Buttons — stopPropagation se drag trigger nahi hogi */}
        <div className="flex gap-2">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setEditing(true) }}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs py-2 rounded-lg transition"
          >
            Edit
          </button>

          <button
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); handleDelete() }}
            className="flex-1 bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 text-xs py-2 rounded-lg transition"
          >
            Delete
          </button>
        </div>
      </div>

      {editing && (
        <EditModal task={task} onClose={() => setEditing(false)} />
      )}
    </>
  )
}

export default memo(TaskCard)