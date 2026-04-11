import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, FileText, Table2, TrendingUp, AlertTriangle, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import { api } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { toast } from 'react-hot-toast'
import NoDataState from '../components/NoDataState'

export default function ReportsPage() {
  const navigate        = useNavigate()
  const results         = useStore(s => s.results)
  const sessionId       = useStore(s => s.sessionId)
  const assignmentName  = useStore(s => s.assignmentName)
  const getRanked       = useStore(s => s.getRankedStudents)
  const [sortBy, setSortBy]   = useState('maxSim')
  const [sortDir, setSortDir] = useState('desc')

  if (!results) return <NoDataState page="the Reports page" />

  const ranked = getRanked()

  const sorted = [...ranked].sort((a, b) => {
    const mult = sortDir === 'desc' ? -1 : 1
    return (a[sortBy] - b[sortBy]) * mult
  })

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const downloadPDF = () => {
    if (sessionId === 'demo-session') {
      toast('PDF download requires a real backend session. Start the backend and upload real files.', { icon: '⚠️' })
      return
    }
    window.open(api.reportPdfUrl(sessionId), '_blank')
    toast.success('PDF download started!')
  }

  const downloadCSV = () => {
    if (sessionId === 'demo-session') {
      // Generate CSV from demo data client-side
      const header = ['Student','Language','Quality Score','Plagiarism %','Complexity','Bugs']
      const rows = sorted.map(s => [
        s.name, s.language, s.qualityScore, s.maxSim, s.complexity, s.bugs
      ])
      const csv = [header, ...rows].map(r => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `${assignmentName}_report.csv`; a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV downloaded!')
      return
    }
    window.open(api.reportCsvUrl(sessionId), '_blank')
    toast.success('CSV download started!')
  }

  const RISK_COLORS = { high: '#ef4444', medium: '#eab308', low: '#22c55e' }
  const chartData = sorted.map(s => ({
    name:        s.name.length > 9 ? s.name.slice(0, 9) + '…' : s.name,
    fullName:    s.name,
    plagiarism:  s.maxSim,
    quality:     s.qualityScore,
    risk:        s.risk,
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="glass-card px-4 py-3 text-xs shadow-xl">
        <div className="font-semibold text-white mb-1">{d.fullName}</div>
        {payload.map((p, i) => (
          <div key={i} className="flex justify-between gap-4" style={{ color: p.color }}>
            <span className="text-white/50">{p.name}</span>
            <span className="font-mono font-bold">{p.value}%</span>
          </div>
        ))}
      </div>
    )
  }

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronDown className="w-3 h-3 opacity-20" />
    return sortDir === 'desc'
      ? <ChevronDown className="w-3 h-3 text-blue-400" />
      : <ChevronUp className="w-3 h-3 text-blue-400" />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Reports</h1>
            <p className="text-white/40 mt-1">{assignmentName} · {ranked.length} students analysed</p>
          </div>
          <div className="flex gap-3">
            <motion.button onClick={downloadCSV} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-secondary flex items-center gap-2">
              <Table2 className="w-4 h-4" /> Download CSV
            </motion.button>
            <motion.button onClick={downloadPDF} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary flex items-center gap-2">
              <Download className="w-4 h-4" /> Download PDF
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-5">
          <h3 className="section-title flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" /> Plagiarism Risk by Student
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 10, bottom: 25, left: 0 }}>
              <XAxis dataKey="name" tick={{ fill:'rgba(255,255,255,0.3)', fontSize: 10 }} angle={-35} textAnchor="end" />
              <YAxis tick={{ fill:'rgba(255,255,255,0.3)', fontSize: 10 }} domain={[0, 100]} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="plagiarism" name="Plagiarism %" radius={[5, 5, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={RISK_COLORS[d.risk]} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="section-title flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" /> Code Quality Scores
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 10, bottom: 25, left: 0 }}>
              <XAxis dataKey="name" tick={{ fill:'rgba(255,255,255,0.3)', fontSize: 10 }} angle={-35} textAnchor="end" />
              <YAxis tick={{ fill:'rgba(255,255,255,0.3)', fontSize: 10 }} domain={[0, 100]} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="quality" name="Quality %" radius={[5, 5, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i}
                    fill={d.quality >= 70 ? '#22c55e' : d.quality >= 40 ? '#eab308' : '#ef4444'}
                    opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sortable Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-white/80 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" /> Full Results Table
          </h3>
          <span className="text-xs text-white/30">Click column headers to sort</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                {[
                  { key:'name',         label:'Student',        sortable: false },
                  { key:'language',     label:'Language',       sortable: false },
                  { key:'maxSim',       label:'Plagiarism %',   sortable: true  },
                  { key:'qualityScore', label:'Quality',        sortable: true  },
                  { key:'complexity',   label:'Complexity',     sortable: true  },
                  { key:'bugs',         label:'Bugs',           sortable: true  },
                  { key:'risk',         label:'Risk Level',     sortable: false },
                ].map(({ key, label, sortable }) => (
                  <th key={key}
                    onClick={() => sortable && toggleSort(key)}
                    className={`px-4 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider
                      ${sortable ? 'cursor-pointer hover:text-white/60 select-none' : ''}`}>
                    <div className="flex items-center gap-1">
                      {label}
                      {sortable && <SortIcon col={key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => {
                const riskColor = RISK_COLORS[s.risk]
                return (
                  <motion.tr key={s.name}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/student/${encodeURIComponent(s.name)}`)}
                    className="border-b border-white/3 hover:bg-white/3 transition-colors cursor-pointer group">
                    <td className="px-4 py-3 font-semibold text-white text-sm group-hover:text-blue-300 transition-colors">{s.name}</td>
                    <td className="px-4 py-3 text-white/40 text-xs">{s.language}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width:`${s.maxSim}%`, background: riskColor }} />
                        </div>
                        <span className="text-sm font-mono font-bold" style={{ color: riskColor }}>{s.maxSim}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold
                        ${s.qualityScore >= 70 ? 'text-green-400' : s.qualityScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {s.qualityScore}/100
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50 text-sm font-mono">{s.complexity}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-mono font-bold ${s.bugs > 0 ? 'text-red-400' : 'text-green-400'}`}>{s.bugs}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border
                        ${s.risk === 'high'   ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          s.risk === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                        {s.risk === 'high' ? '🔴 High' : s.risk === 'medium' ? '🟡 Medium' : '🟢 Safe'}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {sessionId === 'demo-session' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-4 p-4 rounded-xl bg-blue-500/8 border border-blue-500/20 text-xs text-blue-300/70 text-center">
          ℹ️ CSV download is available in demo mode. PDF download requires the backend server running on <strong>localhost:8000</strong>.
        </motion.div>
      )}
    </div>
  )
}
