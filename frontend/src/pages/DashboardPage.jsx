import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, AlertTriangle, Star, TrendingUp, Search, Filter, Grid3X3, ChevronRight, RefreshCcw } from 'lucide-react'
import { useStore } from '../store/useStore'
import NoDataState from '../components/NoDataState'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

const RISK_CONFIG = {
  high:   { label: 'High Risk',   badge: 'badge-red',    dot: 'bg-red-400' },
  medium: { label: 'Medium Risk', badge: 'badge-yellow', dot: 'bg-yellow-400' },
  low:    { label: 'Safe',        badge: 'badge-green',  dot: 'bg-green-400' },
}

export default function DashboardPage() {
  const navigate     = useNavigate()
  const results      = useStore(s => s.results)
  const assignmentName = useStore(s => s.assignmentName)
  const getRanked    = useStore(s => s.getRankedStudents)
  const clearSession = useStore(s => s.clearSession)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  if (!results) return <NoDataState page="the Dashboard" />

  const ranked   = getRanked()
  const filtered = ranked.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || s.risk === filter
    return matchSearch && matchFilter
  })

  const highRisk  = ranked.filter(s => s.risk === 'high').length
  const medRisk   = ranked.filter(s => s.risk === 'medium').length
  const avgQ      = ranked.length > 0
    ? Math.round(ranked.reduce((a, b) => a + b.qualityScore, 0) / ranked.length) : 0

  const radarData = [
    { subject: 'Avg Quality', value: avgQ },
    { subject: 'Clean Code',  value: Math.max(0, 100 - Math.round(highRisk / (ranked.length || 1) * 100)) },
    { subject: 'Low Bugs',    value: Math.max(0, 100 - ranked.reduce((a, s) => a + s.bugs, 0) * 8) },
    { subject: 'Safe',        value: Math.round((ranked.length - highRisk) / (ranked.length || 1) * 100) },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{assignmentName || 'Dashboard'}</h1>
            <p className="text-white/40 mt-1">Analysis results · {ranked.length} submissions</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { clearSession(); navigate('/') }}
              className="btn-secondary flex items-center gap-2 text-sm">
              <RefreshCcw className="w-4 h-4" /> New Analysis
            </button>
            <Link to="/heatmap" className="btn-secondary flex items-center gap-2 text-sm">
              <Grid3X3 className="w-4 h-4" /> Heatmap
            </Link>
            <Link to="/reports" className="btn-primary flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" /> Reports
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Submissions', value: ranked.length,  icon: Users,          color: 'blue',   sub: 'students analyzed' },
          { label: 'High Plagiarism',   value: highRisk,        icon: AlertTriangle,  color: 'red',    sub: 'high risk cases' },
          { label: 'Medium Risk',       value: medRisk,         icon: Filter,         color: 'yellow', sub: 'need review' },
          { label: 'Avg Quality Score', value: `${avgQ}%`,     icon: Star,           color: 'green',  sub: 'across all students' },
        ].map(({ label, value, icon: Icon, color, sub }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="glass-card p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3
              ${color === 'blue'   ? 'bg-blue-500/15  text-blue-400'   :
                color === 'red'    ? 'bg-red-500/15   text-red-400'    :
                color === 'yellow' ? 'bg-yellow-500/15 text-yellow-400' :
                                    'bg-green-500/15  text-green-400'}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black text-white mb-1">{value}</div>
            <div className="text-xs text-white/40">{sub}</div>
            <div className="text-xs font-medium text-white/50 mt-1">{label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-white/5 flex flex-wrap gap-3">
              <div className="flex-1 relative min-w-[150px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search student name…"
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm
                    text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[['all','All'],['high','🔴 High'],['medium','🟡 Medium'],['low','🟢 Safe']].map(([v,l]) => (
                  <button key={v} onClick={() => setFilter(v)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${filter === v
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['#','Student','Risk','Plagiarism %','Quality','Bugs',''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const rc = RISK_CONFIG[s.risk]
                    return (
                      <motion.tr key={s.name}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="border-b border-white/3 hover:bg-white/3 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/student/${encodeURIComponent(s.name)}`)}>
                        <td className="px-4 py-4 text-white/20 text-sm font-mono">{i + 1}</td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-white text-sm">{s.name}</div>
                          <div className="text-xs text-white/30">{s.language}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={rc.badge}>
                            <div className={`w-1.5 h-1.5 rounded-full ${rc.dot} mr-1.5`} />
                            {rc.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full w-16">
                              <motion.div
                                className={`h-full rounded-full ${s.risk === 'high' ? 'bg-red-500' : s.risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}
                                initial={{ width: 0 }} animate={{ width: `${s.maxSim}%` }} transition={{ duration: 0.8, delay: i * 0.05 }}
                              />
                            </div>
                            <span className="text-sm font-mono text-white/70 w-10">{s.maxSim}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-sm font-semibold ${s.qualityScore >= 70 ? 'text-green-400' : s.qualityScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {s.qualityScore}/100
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-sm font-mono ${s.bugs > 0 ? 'text-red-400' : 'text-green-400'}`}>{s.bugs}</span>
                        </td>
                        <td className="px-4 py-4">
                          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-blue-400 transition-colors" />
                        </td>
                      </motion.tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-12 text-center text-white/30 text-sm">No students match the current filter</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          <div className="glass-card p-5">
            <h3 className="section-title flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" /> Batch Overview
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill:'rgba(255,255,255,0.4)', fontSize:11 }} />
                <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip contentStyle={{ background:'#1e293b', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px' }}
                  labelStyle={{ color:'#fff' }} itemStyle={{ color:'#60a5fa' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-5">
            <h3 className="section-title flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" /> 🏆 Cleanest Code
            </h3>
            <div className="space-y-2">
              {[...ranked].sort((a,b) => b.qualityScore - a.qualityScore).slice(0,5).map((s,i) => (
                <Link key={s.name} to={`/student/${encodeURIComponent(s.name)}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    ${i===0 ? 'bg-yellow-500/20 text-yellow-400' :
                      i===1 ? 'bg-gray-400/20 text-gray-300'    :
                      i===2 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-white/30'}`}>{i+1}</div>
                  <span className="flex-1 text-sm text-white/70 group-hover:text-white transition-colors truncate">{s.name}</span>
                  <span className={`text-sm font-semibold ${s.qualityScore >= 70 ? 'text-green-400' : s.qualityScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{s.qualityScore}%</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="section-title">🔴 Most Suspicious</h3>
            <div className="space-y-2">
              {ranked.filter(s => s.risk !== 'low').slice(0,4).map(s => (
                <Link key={s.name} to={`/student/${encodeURIComponent(s.name)}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group">
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors truncate">{s.name}</span>
                  <span className={`text-sm font-mono font-bold ${s.risk === 'high' ? 'text-red-400' : 'text-yellow-400'}`}>{s.maxSim}%</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
