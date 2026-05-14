import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setError(error.message)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
      }
    } catch {
      setError('Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-2xl w-96 border border-slate-700">
        <h1 className="text-3xl font-bold text-indigo-400 text-center mb-2">AIKanban</h1>
        <p className="text-slate-400 text-center mb-6 text-sm">Manage tasks smarter with AI</p>
        <div className="flex bg-slate-700 rounded-lg p-1 mb-6">
          <button onClick={() => setIsSignup(false)} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${!isSignup ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Login</button>
          <button onClick={() => setIsSignup(true)} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${isSignup ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Sign Up</button>
        </div>
        {error && <p className="text-red-400 text-sm mb-4 bg-red-900/20 p-3 rounded-lg">{error}</p>}
        <div className="mb-4">
          <label className="text-slate-400 text-sm mb-1 block">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg text-sm outline-none focus:border-indigo-500" placeholder="ahmed@gmail.com" />
        </div>
        <div className="mb-6">
          <label className="text-slate-400 text-sm mb-1 block">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg text-sm outline-none focus:border-indigo-500" placeholder="••••••••" />
        </div>
        <button onClick={handleSubmit} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition">
          {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Login'}
        </button>
      </div>
    </div>
  )
}