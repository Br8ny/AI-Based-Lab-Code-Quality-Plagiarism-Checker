import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react'
import { useStore } from '../store/useStore'
import NoDataState from '../components/NoDataState'

function findCommonLines(linesA, linesB) {
  const setB = new Set(linesB.map(l => l.line.trim()).filter(l => l.length > 4))
  return new Set(
    linesA
      .filter(l => setB.has(l.line.trim()) && l.line.trim().length > 4)
      .map(l => l.num)
  )
}

export default function ComparisonPage() {
  const { studentA, studentB } = useParams()
  const navigate               = useNavigate()
  const results                = useStore(s => s.results)
  const getPairSim             = useStore(s => s.getPairSimilarity)
  const [showOnlySimilar, setShowOnlySimilar] = useState(false)

  const nameA = decodeURIComponent(studentA)
  const nameB = decodeURIComponent(studentB)

  if (!results) return <NoDataState page="the Code Comparison page" />

  const codeA = results.quality?.[nameA]?.code || '// No code found'
  const codeB = results.quality?.[nameB]?.code || '// No code found'
  const sim   = getPairSim(nameA, nameB)
  const simPct = sim ? Math.round(sim.combined * 100) : 0
  const riskColor = simPct >= 70 ? '#ef4444' : simPct >= 40 ? '#eab308' : '#22c55e'

  const linesA = codeA.split('\n').map((line, i) => ({ line, num: i + 1 }))
  const linesB = codeB.split('\n').map((line, i) => ({ line, num: i + 1 }))
  const commonA = findCommonLines(linesA, linesB)
  const commonB = findCommonLines(linesB, linesA)

  const displayA = showOnlySimilar ? linesA.filter(l => commonA.has(l.num)) : linesA
  const displayB = showOnlySimilar ? linesB.filter(l => commonB.has(l.num)) : linesB

  return (
    <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header card */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="glass-card p-5 flex flex-wrap items-center justify-between gap-5">
          <div>
            <h1 className="text-2xl font-bold text-white">
              <span className="text-blue-400">{nameA}</span>
              <span className="text-white/30 mx-3 font-light">vs</span>
              <span className="text-violet-400">{nameB}</span>
            </h1>
            <p className="text-white/40 text-sm mt-0.5">Side-by-side code comparison · highlighted lines match between submissions</p>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            {/* Combined score */}
            <div className="text-center">
              <div className="text-5xl font-black" style={{ color: riskColor }}>{simPct}%</div>
              <div className="text-xs text-white/30 mt-0.5">Combined Similarity</div>
            </div>

            {/* Breakdown */}
            {sim && (
              <div className="flex flex-col gap-2">
                {[
                  { label: 'AST',       value: Math.round(sim.ast * 100)       },
                  { label: 'Token',     value: Math.round(sim.token * 100)     },
                  { label: 'Embedding', value: Math.round(sim.embedding * 100) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <span className="text-white/30 w-16">{label}</span>
                    <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full bg-blue-400"
                        initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8 }} />
                    </div>
                    <span className="text-white/50 font-mono w-8">{value}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Risk badge */}
            <div className={`px-4 py-2 rounded-xl text-sm font-bold border
              ${simPct >= 70 ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                simPct >= 40 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                              'bg-green-500/10 text-green-400 border-green-500/30'}`}>
              {simPct >= 70 ? '🔴 High Risk' : simPct >= 40 ? '🟡 Medium Risk' : '🟢 Safe'}
            </div>

            {/* Toggle */}
            <button onClick={() => setShowOnlySimilar(s => !s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all
                ${showOnlySimilar
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}>
              {showOnlySimilar ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              Similar Only
            </button>
          </div>
        </div>
      </motion.div>

      {/* Split viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { name: nameA, lines: displayA, common: commonA, color: 'blue',   accent: 'border-l-blue-500/60',   textColor: 'text-blue-200',   bgColor: 'bg-blue-500/8'   },
          { name: nameB, lines: displayB, common: commonB, color: 'violet', accent: 'border-l-violet-500/60', textColor: 'text-violet-200', bgColor: 'bg-violet-500/8' },
        ].map(({ name, lines, common, color, accent, textColor, bgColor }) => (
          <div key={name} className={`glass-card overflow-hidden border-l-2 ${accent}`}>
            <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${color === 'blue' ? 'bg-blue-400' : 'bg-violet-400'}`} />
              <span className="font-semibold text-white text-sm">{name}</span>
              <span className="text-xs text-white/25 ml-auto">{lines.length} lines</span>
              <span className={`text-xs ${color === 'blue' ? 'text-blue-400/60' : 'text-violet-400/60'}`}>
                {common.size} matching
              </span>
            </div>

            <div className="overflow-auto max-h-[580px] font-mono text-xs">
              {lines.length === 0 ? (
                <div className="py-16 text-center text-white/25">
                  {showOnlySimilar ? 'No matching lines found' : 'No code available'}
                </div>
              ) : lines.map(({ line, num }) => {
                const isSim = common.has(num)
                return (
                  <div key={num} className={`flex transition-colors ${isSim ? bgColor : 'hover:bg-white/2'}`}>
                    <div className={`w-10 text-right pr-3 py-1.5 select-none border-r shrink-0
                      ${isSim ? (color === 'blue' ? 'text-blue-400/40 border-blue-500/20' : 'text-violet-400/40 border-violet-500/20')
                              : 'text-white/10 border-white/5'}`}>
                      {num}
                    </div>
                    <div className={`px-3 py-1.5 flex-1 whitespace-pre overflow-x-auto
                      ${isSim ? textColor : 'text-slate-400'}`}>
                      {line || ' '}
                    </div>
                    {isSim && (
                      <div className={`px-2 py-1.5 text-xs shrink-0 ${color === 'blue' ? 'text-blue-400/40' : 'text-violet-400/40'}`}>●</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-xs text-white/25 justify-center flex-wrap">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500/25" />Student A matching lines</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-violet-500/25" />Student B matching lines</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-white/5" />Unique lines</div>
        <div className="flex items-center gap-2"><span className="text-blue-400/60">●</span> = matched token</div>
      </div>
    </div>
  )
}
