import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Grid3X3, FileText, Home, LogOut, ChevronDown } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useAuthStore } from '../store/useAuthStore'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

const navItems = [
  { to: '/',          label: 'Home',      icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/heatmap',   label: 'Heatmap',   icon: Grid3X3 },
  { to: '/reports',   label: 'Reports',   icon: FileText },
]

const roleColors = {
  professor: 'text-blue-400 bg-blue-500/10',
  ta:        'text-violet-400 bg-violet-500/10',
  admin:     'text-amber-400 bg-amber-500/10',
}

export default function Navbar() {
  const location       = useLocation()
  const navigate       = useNavigate()
  const assignmentName = useStore(s => s.assignmentName)
  const clearSession   = useStore(s => s.clearSession)
  const user           = useAuthStore(s => s.user)
  const logout         = useAuthStore(s => s.logout)
  const [menuOpen, setMenuOpen] = useState(false)

  // Hide nav on auth pages
  const isAuthPage = ['/login', '/signup'].includes(location.pathname)

  const handleLogout = () => {
    clearSession()
    logout()
    setMenuOpen(false)
    toast.success('Signed out successfully')
    navigate('/login')
  }

  const avatarInitials = user
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5"
      style={{ background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to={user ? '/' : '/login'} className="flex items-center gap-3">
            <img src="/logo.png" alt="Academia Lab Analyzer"
              className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-cyan-500/20" />
            <div className="hidden sm:block">
              <div className="font-bold text-sm text-white leading-tight tracking-wide">ACADEMIA LAB</div>
              <div className="text-xs font-semibold leading-tight" style={{ background: 'linear-gradient(90deg,#22d3ee,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>ANALYZER</div>
            </div>
          </Link>

          {/* Nav links — only when signed in and not on auth pages */}
          {user && !isAuthPage && (
            <div className="flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to
                return (
                  <Link key={to} to={to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${active
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Session badge */}
            {user && !isAuthPage && assignmentName && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-white/60 max-w-[120px] truncate">{assignmentName}</span>
              </div>
            )}

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(s => !s)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/5
                    border border-transparent hover:border-white/10 transition-all duration-200">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600
                    flex items-center justify-center text-xs font-bold text-white shadow-md">
                    {avatarInitials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-white leading-tight max-w-[90px] truncate">
                      {user.name.split(' ')[0]}
                    </div>
                    <div className={`text-xs leading-tight capitalize px-1 rounded ${roleColors[user.role] || roleColors.professor}`}>
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div initial={{ opacity: 0, y: 4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-52 glass-card p-1 shadow-2xl">

                      {/* User info header */}
                      <div className="px-3 py-2.5 border-b border-white/8 mb-1">
                        <div className="font-semibold text-white text-sm truncate">{user.name}</div>
                        <div className="text-xs text-white/40 truncate">{user.email}</div>
                      </div>

                      {/* Sign out */}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                          text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left">
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Not logged in */
              !isAuthPage && (
                <div className="flex gap-2">
                  <Link to="/login"
                    className="px-4 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/5
                      rounded-lg border border-white/10 transition-all font-medium">
                    Sign In
                  </Link>
                  <Link to="/signup"
                    className="px-4 py-1.5 text-sm text-white font-semibold rounded-lg
                      bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
                    Sign Up
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Backdrop to close dropdown */}
      {menuOpen && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)} />
      )}
    </nav>
  )
}

