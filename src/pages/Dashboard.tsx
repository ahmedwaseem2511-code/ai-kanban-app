import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setTasks } from '../store/taskSlice'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import KanbanBoard from '../components/KanbanBoard'

export default function Dashboard() {
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) dispatch(setTasks(data))
    }
    fetchTasks()
  }, [dispatch])

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      {/* px-4 on mobile, px-6 on larger screens — prevents edge overflow */}
      <main className="px-4 py-5 sm:px-6 sm:py-6 max-w-screen-xl mx-auto">
        <KanbanBoard />
      </main>
    </div>
  )
}