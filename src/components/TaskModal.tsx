import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addTask, updateTask } from '../store/taskSlice'
import { supabase } from '../lib/supabase'
import { generateDescription } from '../services/groq'  // ← gemini.ts ki jagah groq.ts

export default function TaskModal({ task, onClose }: any) {
  const dispatch = useDispatch()
  const user = useSelector((state: any) => state.auth.user)
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState(task?.priority || 'medium')
  const [dueDate, setDueDate] = useState(task?.due_date || '')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAIGenerate = async () => {
    if (!title.trim()) return setError('Pehle title likhe!')
    setError('')
    setAiLoading(true)
    const desc = await generateDescription(title)
    setDescription(desc)
    setAiLoading(false)
  }

  const handleSubmit = async () => {
    if (!title.trim()) return setError('Title zaroori hai!')
    setLoading(true)
    const taskData = {
      title,
      description,
      priority,
      due_date: dueDate || null,
      user_id: user?.id,
      status: task?.status || 'todo',
      updated_at: new Date().toISOString(),
    }
    if (task) {
      const { data } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', task.id)
        .select()
        .single()
      if (data) dispatch(updateTask(data))
    } else {
      const { data } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single()
      if (data) dispatch(addTask(data))
    }
    setLoading(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 w-full sm:w-auto sm:min-w-[420px] sm:max-w-[460px] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 border border-slate-700 border-b-0 sm:border-b"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-white mb-5">
          {task ? 'Edit Task' : 'Add New Task'}
        </h2>

        {error && (
          <p className="text-red-400 text-sm mb-3 bg-red-900/20 p-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label className="text-slate-400 text-sm mb-1 block">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg text-sm outline-none"
            placeholder="Task title..."
          />
        </div>

        <div className="mb-4">
          <label className="text-slate-400 text-sm mb-1 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg text-sm outline-none h-20 resize-none"
            placeholder="Description..."
          />
          <button
            onClick={handleAIGenerate}
            disabled={aiLoading}
            className="mt-2 bg-indigo-900/50 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700 px-3 py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {aiLoading ? '✨ Generating...' : '✨ Generate with AI'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
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
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : task ? 'Update' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  )
}