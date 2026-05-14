import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { setUser } from './store/authSlice'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const dispatch = useDispatch()
  const user = useSelector((state: any) => state.auth.user)
  const loading = useSelector((state: any) => state.auth.loading)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setUser(session?.user ?? null))
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setUser(session?.user ?? null))
    })
    return () => subscription.unsubscribe()
  }, [dispatch])

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-indigo-400 text-xl">Loading...</div>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App