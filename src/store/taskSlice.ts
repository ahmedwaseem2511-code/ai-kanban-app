import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface Task {
  id: string
  user_id: string
  title: string
  description: string
  status: 'todo' | 'inprogress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  created_at: string
  updated_at: string
}

interface TaskState {
  tasks: Task[]
  loading: boolean
  error: string | null
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
}

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload
    },
    addTask(state, action: PayloadAction<Task>) {
      state.tasks.unshift(action.payload)
    },
    updateTask(state, action: PayloadAction<Task>) {
      const index = state.tasks.findIndex(t => t.id === action.payload.id)
      if (index !== -1) state.tasks[index] = action.payload
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter(t => t.id !== action.payload)
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
  },
})

export const { setTasks, addTask, updateTask, deleteTask, setLoading, setError } = taskSlice.actions
export default taskSlice.reducer