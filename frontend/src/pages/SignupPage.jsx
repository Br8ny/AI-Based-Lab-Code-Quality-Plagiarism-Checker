import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/useAuthStore'

const ROLES = [
  { value: 'professor', label: 'Professor',  emoji: '🎓', desc: 'Analyze student submissions' },
  { value: 'ta',        label: 'Teaching Assistant', emoji: '📚', desc: 'Review and grade' },
  { value: 'admin',     label: 'Admin',      emoji: '🏛️', desc: 'Full system access' },
]

const passwordStrength = (pw) => {
  let score = 0
  if (pw.length >= 8)              score++
  if (/[A-Z]/.test(pw))           score++
  if (/[0-9]/.test(pw))           score++
  if (/[^A-Za-z0-9]/.test(pw))   score++
  return score  // 0-4
}
const strengthLabel  = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColor  = ['', '#ef4444', '#eab308', '#3b82f6', '#22c55e']

export default function SignupPage() {
  const navigate  = useNavigate()
  const signup    = useAuthStore(s => s.signup)
  const authError = useAuthStore(s => s.authError)
  const clearError= useAuthStore(s => s.clearError)

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '', role: 'professor' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: false }))
    clearError()
  }

  const pwStrength = passwordStrength(form.password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim())                          errs.name     = 'Full name is required'
    if (!form.email.trim())                         errs.email    = 'Email is required'
    if (!form.email.includes('@'))                  errs.email    = 'Enter a valid email'
    if (form.password.length < 6)                   errs.password = 'Minimum 6 characters'
    if (form.password !== form.confirm)             errs.confirm  = 'Passwords do not match'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    const ok = signup({ name: form.name, email: form.email, password: form.password })
    setLoading(false)

    if (ok) {
      toast.success(`Welcome, ${form.name.split(' ')[0]}! 🎉`)
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
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
          <h1 className="text-3xl font-black text-white">Create account</h1>
          <p className="text-white/40 mt-1 text-sm">Free · Local · No cloud required</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${errors.name ? 'text-red-400' : 'text-white/60'}`}>
                Full Name {errors.name && <span className="text-xs">← {errors.name}</span>}
              </label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Dr. Jane Smith" autoComplete="name"
                className={`w-full px-4 py-3 rounded-xl border bg-white/5 text-white placeholder-white/20
                  focus:outline-none transition-all text-sm
                  ${errors.name ? 'border-red-500/60 bg-red-500/5' : 'border-white/10 focus:border-blue-500/50'}`} />
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${errors.email ? 'text-red-400' : 'text-white/60'}`}>
                Email address {errors.email && <span className="text-xs">← {errors.email}</span>}
              </label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@university.edu" autoComplete="email"
                className={`w-full px-4 py-3 rounded-xl border bg-white/5 text-white placeholder-white/20
                  focus:outline-none transition-all text-sm
                  ${errors.email ? 'border-red-500/60 bg-red-500/5' : 'border-white/10 focus:border-blue-500/50'}`} />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => set('role', r.value)}
                    className={`p-2.5 rounded-xl border text-center transition-all duration-200
                      ${form.role === r.value
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                        : 'bg-white/3 border-white/10 text-white/40 hover:bg-white/8'}`}>
                    <div className="text-lg mb-0.5">{r.emoji}</div>
                    <div className="text-xs font-semibold leading-tight">{r.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${errors.password ? 'text-red-400' : 'text-white/60'}`}>
                Password {errors.password && <span className="text-xs">← {errors.password}</span>}
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Min. 6 characters" autoComplete="new-password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border bg-white/5 text-white placeholder-white/20
                    focus:outline-none transition-all text-sm
                    ${errors.password ? 'border-red-500/60 bg-red-500/5' : 'border-white/10 focus:border-blue-500/50'}`} />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength meter */}
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i <= pwStrength ? strengthColor[pwStrength] : 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                  <div className="text-xs" style={{ color: strengthColor[pwStrength] }}>
                    {strengthLabel[pwStrength]} password
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${errors.confirm ? 'text-red-400' : 'text-white/60'}`}>
                Confirm Password {errors.confirm && <span className="text-xs">← {errors.confirm}</span>}
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.confirm}
                  onChange={e => set('confirm', e.target.value)}
                  placeholder="Repeat your password" autoComplete="new-password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border bg-white/5 text-white placeholder-white/20
                    focus:outline-none transition-all text-sm
                    ${errors.confirm ? 'border-red-500/60 bg-red-500/5'
                      : form.confirm && form.confirm === form.password
                        ? 'border-green-500/40' : 'border-white/10 focus:border-blue-500/50'}`} />
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                )}
              </div>
            </div>

            {/* Submit */}
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-2
                bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500
                disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-500/20 text-sm">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Creating account…</>
                : <><UserPlus className="w-4 h-4" /> Create Account</>}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-sm text-white/30 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
