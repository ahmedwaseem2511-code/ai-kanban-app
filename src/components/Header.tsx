import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../store/authSlice'
import { supabase } from '../lib/supabase'

export default function Header() {
  const dispatch = useDispatch()
  const user = useSelector((state: any) => state.auth.user)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    dispatch(setUser(null))
  }

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-indigo-400">AIKanban</h1>
        <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">AI Powered</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-slate-400 text-sm">{user?.email}</span>
        <button onClick={handleLogout} className="bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm transition">
          Logout
        </button>
      </div>
    </header>
  )
}