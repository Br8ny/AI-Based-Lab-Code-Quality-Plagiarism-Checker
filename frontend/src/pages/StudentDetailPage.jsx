import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, AlertTriangle, Info, Bug, BarChart2, GitCompare, Lightbulb, CheckCircle } from 'lucide-react'
import { useStore } from '../store/useStore'
import NoDataState from '../components/NoDataState'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

const SEVERITY_CONFIG = {
  error:   { badge: 'bg-red-500/15 text-red-400 border border-red-500/30',     icon: AlertTriangle },
  warning: { badge: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30', icon: Info },
  info:    { badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',   icon: Info },
}

const BUG_EXPLANATIONS = {
  BareExcept:           'Catching all exceptions hides errors and makes debugging very difficult. Always specify the exception type.',
  MutableDefault:       'Mutable defaults (list/dict/set) are shared across all calls — mutations in one call persist to the next.',
  InfiniteLoop:         'A loop with no clear exit condition will freeze the program indefinitely.',
  NoneComparison:       '`is None` tests object identity; `== None` tests value equality and can produce unexpected results.',
  NullAssignment:       'Setting a variable to null means it must always be checked before use to avoid NullPointerException.',
  UninitializedVariable:'Using a variable before assigning a value causes undefined behavior in C.',
  PoorNaming:           'Descriptive variable names make code self-documenting and drastically improve readability.',
}

export default function StudentDetailPage() {
  const { name }           = useParams()
  const navigate           = useNavigate()
  const results            = useStore(s => s.results)
  const getStudentResult   = useStore(s => s.getStudentResult)
  const [showExplain, setShowExplain] = useState(null)
  const [hoveredLine, setHoveredLine] = useState(null)

  const studentName = decodeURIComponent(name)

  if (!results) return <NoDataState page={`the student detail page for "${studentName}"`} />

  const student = getStudentResult(studentName)
  if (!student) return <NoDataState page={`student "${studentName}"`} />

  const code     = student.code || '// No code available'
  const bugs     = student.bugs || []
  const bugLines = new Set(bugs.map(b => b.line))

  const riskPct   = Math.round((student.maxSim || 0) * 100)
  const risk      = riskPct >= 70 ? 'high' : riskPct >= 40 ? 'medium' : 'low'
  const riskColor = risk === 'high' ? '#ef4444' : risk === 'medium' ? '#eab308' : '#22c55e'
  const qualScore = student.quality_score || 0
  const qualColor = qualScore >= 70 ? '#22c55e' : qualScore >= 40 ? '#eab308' : '#ef4444'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{studentName}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-sm text-white/40 bg-white/5 px-2 py-0.5 rounded">{student.language || 'python'}</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border
                ${risk === 'high' ? 'badge-red' : risk === 'medium' ? 'badge-yellow' : 'badge-green'}`}>
                {risk === 'high' ? '🔴 High Plagiarism Risk' : risk === 'medium' ? '🟡 Medium Risk' : '🟢 Safe — Original Work'}
              </span>
            </div>
          </div>
          {student.mostSimilarWith && (
            <Link to={`/compare/${encodeURIComponent(studentName)}/${encodeURIComponent(student.mostSimilarWith)}`}
              className="btn-secondary flex items-center gap-2 text-sm">
              <GitCompare className="w-4 h-4" /> Compare with {student.mostSimilarWith}
            </Link>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Code Viewer */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-semibold text-white/80 flex items-center gap-2">
                <Bug className="w-4 h-4 text-red-400" />
                Source Code
                <span className="text-xs text-white/25 font-normal ml-1">{code.split('\n').length} lines</span>
              </h2>
              {bugLines.size > 0 && (
                <div className="flex items-center gap-2 text-xs text-red-400/70">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {bugLines.size} flagged line{bugLines.size > 1 ? 's' : ''}
                </div>
              )}
            </div>
            <div className="overflow-auto max-h-[520px] font-mono text-xs">
              {code.split('\n').map((line, i) => {
                const lineNum  = i + 1
                const isFlag   = bugLines.has(lineNum)
                const isHover  = hoveredLine === lineNum
                const bugForLine = bugs.find(b => b.line === lineNum)
                return (
                  <div key={i}
                    onMouseEnter={() => setHoveredLine(lineNum)}
                    onMouseLeave={() => setHoveredLine(null)}
                    className={`flex group transition-all duration-100 relative
                      ${isFlag ? 'bg-red-500/8' : isHover ? 'bg-white/3' : ''}`}>
                    <div className={`w-11 text-right pr-3 py-1.5 select-none border-r shrink-0
                      ${isFlag ? 'text-red-400/60 border-red-500/20' : 'text-white/15 border-white/5'}`}>
                      {lineNum}
                    </div>
                    <div className={`px-4 py-1.5 flex-1 whitespace-pre overflow-x-auto
                      ${isFlag ? 'text-red-200' : 'text-slate-300'}`}>
                      {line || ' '}
                    </div>
                    {isFlag && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        {isHover && bugForLine && (
                          <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                            className="absolute right-6 top-1/2 -translate-y-1/2 bg-dark-800 border border-red-500/30
                              rounded-lg px-3 py-1.5 text-xs text-red-300 whitespace-nowrap z-10 shadow-xl max-w-xs">
                            {bugForLine.type}: {bugForLine.message.slice(0, 60)}…
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bug Panel */}
          {bugs.length > 0 ? (
            <div className="glass-card p-5">
              <h2 className="section-title flex items-center gap-2">
                <Bug className="w-4 h-4 text-red-400" /> Issues Detected ({bugs.length})
              </h2>
              <div className="space-y-3">
                {bugs.map((bug, i) => {
                  const sc = SEVERITY_CONFIG[bug.severity] || SEVERITY_CONFIG.info
                  const BugIcon = sc.icon
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`p-4 rounded-xl ${sc.badge} space-y-2`}>
                      <div className="flex items-start gap-3">
                        <BugIcon className="w-4 h-4 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-sm">{bug.type}</span>
                            <span className="text-xs opacity-60 bg-black/20 px-1.5 py-0.5 rounded">Line {bug.line}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded capitalize
                              ${bug.severity === 'error' ? 'bg-red-500/20 text-red-400' :
                                bug.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'}`}>{bug.severity}</span>
                          </div>
                          <p className="text-xs opacity-80 leading-relaxed">{bug.message}</p>
                        </div>
                        <button onClick={() => setShowExplain(showExplain === i ? null : i)}
                          className="text-xs opacity-50 hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0 whitespace-nowrap">
                          <Lightbulb className="w-3.5 h-3.5" /> Explain
                        </button>
                      </div>
                      <AnimatePresence>
                        {showExplain === i && BUG_EXPLANATIONS[bug.type] && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="pl-7 text-xs opacity-75 bg-black/20 rounded-lg px-3 py-2 leading-relaxed">
                              💡 {BUG_EXPLANATIONS[bug.type]}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="glass-card p-5 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
              <div>
                <div className="font-semibold text-green-400 text-sm">No Issues Detected</div>
                <div className="text-xs text-white/40 mt-0.5">This submission passed all bug checks</div>
              </div>
            </div>
          )}
        </div>

        {/* Metrics Panel */}
        <div className="space-y-5">
          {/* Radial quality */}
          <div className="glass-card p-5 text-center">
            <h3 className="section-title">Quality Score</h3>
            <div className="relative inline-block">
              <ResponsiveContainer width={160} height={160}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%"
                  data={[{ value: qualScore, fill: qualColor }]} startAngle={90}
                  endAngle={90 - 360 * (qualScore / 100)}>
                  <RadialBar dataKey="value" cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-black text-white">{qualScore}</div>
                <div className="text-xs text-white/40">/ 100</div>
              </div>
            </div>
            <div className={`text-sm font-semibold mt-2 ${qualScore >= 70 ? 'text-green-400' : qualScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {qualScore >= 70 ? 'Good Quality' : qualScore >= 40 ? 'Needs Improvement' : 'Poor Quality'}
            </div>
          </div>

          {/* Plagiarism gauge */}
          <div className="glass-card p-5">
            <h3 className="section-title">Plagiarism Risk</h3>
            <div className="flex items-baseline gap-2 mb-3">
              <div className="text-4xl font-black" style={{ color: riskColor }}>{riskPct}%</div>
              <div className="text-xs text-white/40">similarity with closest peer</div>
            </div>
            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: riskColor }}
                initial={{ width: 0 }} animate={{ width: `${riskPct}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
            </div>
            {student.mostSimilarWith && (
              <div className="text-xs text-white/30 mt-2">
                Most similar to: <Link to={`/compare/${encodeURIComponent(studentName)}/${encodeURIComponent(student.mostSimilarWith)}`}
                  className="text-blue-400 hover:text-blue-300 underline">{student.mostSimilarWith}</Link>
              </div>
            )}
          </div>

          {/* Metrics bars */}
          <div className="glass-card p-5">
            <h3 className="section-title flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-400" /> Code Metrics
            </h3>
            <div className="space-y-4">
              {[
                { label:'Cyclomatic Complexity', value: student.cyclomatic_complexity,  max: 20,  unit:'',      warn: 10,  invert: false },
                { label:'Avg Function Length',   value: student.avg_function_length,    max: 100, unit:' lines', warn: 50,  invert: false },
                { label:'Comment Density',        value: student.comment_density,        max: 40,  unit:'%',     warn: 10,  invert: true  },
                { label:'Total Lines',            value: student.total_lines,            max: 300, unit:'',      neutral: true },
              ].map(({ label, value, max, unit, warn, invert, neutral }) => {
                const pct    = Math.min(100, ((value || 0) / max) * 100)
                const isGood = neutral ? true : invert ? (value || 0) >= (warn || 0) : (value || 0) <= (warn || 999)
                const color  = neutral ? '#3b82f6' : isGood ? '#22c55e' : '#ef4444'
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-white/50 mb-1.5">
                      <span>{label}</span>
                      <span className="font-mono font-semibold" style={{ color }}>{value ?? 0}{unit}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: color }}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label:'Functions',     value: student.num_functions },
              { label:'Code Lines',    value: student.code_lines },
              { label:'Comment Lines', value: student.comment_lines },
              { label:'Bugs Found',    value: bugs.length, alert: bugs.length > 0 },
            ].map(({ label, value, alert }) => (
              <div key={label} className="glass-card p-3 text-center">
                <div className={`text-2xl font-bold ${alert ? 'text-red-400' : 'text-white'}`}>{value ?? '—'}</div>
                <div className="text-xs text-white/30 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
