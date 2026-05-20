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

  // Email ko short karo mobile par — long email overflow karti hai
  const shortEmail = user?.email?.split('@')[0]

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-3">
      
      {/* Left: Logo */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <h1 className="text-lg sm:text-xl font-bold text-indigo-400">AIKanban</h1>
        <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full hidden sm:inline">
          AI Powered
        </span>
      </div>

      {/* Right: User info + Logout */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Mobile: short email, Desktop: full email */}
        <span className="text-slate-400 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
          <span className="sm:hidden">{shortEmail}</span>
          <span className="hidden sm:inline">{user?.email}</span>
        </span>

        <button
          onClick={handleLogout}
          className="bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition flex-shrink-0"
        >
          Logout
        </button>
      </div>
    </header>
  )
}