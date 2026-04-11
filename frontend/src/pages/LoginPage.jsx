import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, LogIn, Sparkles, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/useAuthStore'

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const login     = useAuthStore(s => s.login)
  const authError = useAuthStore(s => s.authError)
  const clearError= useAuthStore(s => s.clearError)

  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: false }))
    clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.email.trim())    errs.email    = 'Email is required'
    if (!form.password.trim()) errs.password = 'Password is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 600)) // small UX delay
    const ok = login(form)
    setLoading(false)

    if (ok) {
      toast.success('Welcome back! 👋')
      navigate(from, { replace: true })
    }
  }

  // Quick demo login
  const handleDemoLogin = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    // ensure demo account exists
    const users = JSON.parse(localStorage.getItem('ac_users') || '[]')
    if (!users.find(u => u.email === 'demo@lab.edu')) {
      localStorage.setItem('ac_users', JSON.stringify([...users, {
        id: 'demo-user', name: 'Demo Professor', email: 'demo@lab.edu',
        password: btoa(encodeURIComponent('demo123')), role: 'professor',
        createdAt: new Date().toISOString(),
      }]))
    }
    const ok = login({ email: 'demo@lab.edu', password: 'demo123' })
    setLoading(false)
    if (ok) { toast.success('Logged in as Demo Professor 🎓'); navigate(from, { replace: true }) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="Academia Lab Analyzer"
              className="w-14 h-14 rounded-2xl object-cover shadow-xl shadow-cyan-500/30" />
            <div className="text-left">
              <div className="font-black text-white tracking-widest text-sm">ACADEMIA LAB</div>
              <div className="font-bold text-sm tracking-widest" style={{ background: 'linear-gradient(90deg,#22d3ee,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>ANALYZER</div>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white">Welcome back</h1>
          <p className="text-white/40 mt-1 text-sm">Sign in to access your analysis dashboard</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Auth error banner */}
          <AnimatePresence>
            {authError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30
                  flex items-center gap-2 text-red-400 text-sm overflow-hidden">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {authError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${errors.email ? 'text-red-400' : 'text-white/60'}`}>
                Email address {errors.email && <span className="text-xs">← {errors.email}</span>}
              </label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="professor@university.edu" autoComplete="email"
                className={`w-full px-4 py-3 rounded-xl border bg-white/5 text-white placeholder-white/20
                  focus:outline-none transition-all text-sm
                  ${errors.email ? 'border-red-500/60 bg-red-500/5' : 'border-white/10 focus:border-blue-500/50'}`} />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm font-medium ${errors.password ? 'text-red-400' : 'text-white/60'}`}>
                  Password {errors.password && <span className="text-xs">← {errors.password}</span>}
                </label>
                <span className="text-xs text-blue-400/60">Local account only</span>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border bg-white/5 text-white placeholder-white/20
                    focus:outline-none transition-all text-sm
                    ${errors.password ? 'border-red-500/60 bg-red-500/5' : 'border-white/10 focus:border-blue-500/50'}`} />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2
                bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500
                disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-500/20 text-sm">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Signing in…</>
                : <><LogIn className="w-4 h-4" /> Sign In</>}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-xs text-white/20">or</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Demo login */}
            <motion.button type="button" onClick={handleDemoLogin} disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2
                bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40
                text-violet-300 transition-all text-sm">
              <Sparkles className="w-4 h-4" /> Continue as Demo Professor
            </motion.button>
          </form>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-white/30 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Create one free
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
