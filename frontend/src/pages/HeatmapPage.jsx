import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { useStore } from '../store/useStore'
import NoDataState from '../components/NoDataState'

function getSimilarityColor(value) {
  if (value >= 0.7) return { bg: 'rgba(239,68,68,',  text: '#ef4444' }
  if (value >= 0.4) return { bg: 'rgba(234,179,8,',  text: '#eab308' }
  if (value >  0)   return { bg: 'rgba(34,197,94,',  text: '#22c55e' }
  return              { bg: 'rgba(100,116,139,',      text: '#64748b' }
}

export default function HeatmapPage() {
  const navigate      = useNavigate()
  const results       = useStore(s => s.results)
  const getHeatmap    = useStore(s => s.getHeatmapData)
  const [tooltip, setTooltip] = useState(null)
  const [zoom, setZoom]       = useState(1)
  const [hoveredPair, setHoveredPair] = useState(null)

  if (!results) return <NoDataState page="the Heatmap" />

  const { students, matrix } = getHeatmap()
  const n = students.length

  const getSim = (a, b) => {
    if (a === b) return 1
    return matrix[`${a}||${b}`]?.combined ?? matrix[`${b}||${a}`]?.combined ?? 0
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Similarity Heatmap</h1>
            <p className="text-white/40 mt-1">Click any cell to compare two students · {n}×{n} matrix</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-4 text-xs text-white/50">
              {[
                { color:'#22c55e', label:'Safe (<40%)' },
                { color:'#eab308', label:'Medium' },
                { color:'#ef4444', label:'High Risk (>70%)' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ background: color, opacity: 0.8 }} />
                  {label}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(z => Math.max(0.5, +(z - 0.15).toFixed(2)))}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center text-lg font-bold">−</button>
              <span className="text-xs text-white/40 w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(2, +(z + 0.15).toFixed(2)))}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center text-lg font-bold">+</button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Heatmap grid */}
      <div className="glass-card p-6 overflow-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 0.2s ease',
                   width: `${100 / zoom}%` }}>
          <div className="grid gap-1.5"
            style={{ gridTemplateColumns: `100px repeat(${n}, minmax(70px, 1fr))` }}>

            {/* Column headers */}
            <div />
            {students.map(s => (
              <div key={s} className="flex justify-center">
                <div className="text-xs text-white/40 text-center truncate"
                  style={{ writingMode:'vertical-rl', transform:'rotate(180deg)', height:90, maxWidth:70, lineHeight:'14px' }}
                  title={s}>{s}</div>
              </div>
            ))}

            {/* Row */}
            {students.map(rowS => (
              <React.Fragment key={`row-${rowS}`}>
                <div className="flex items-center pr-2">
                  <span className="text-xs text-white/40 truncate" title={rowS}>{rowS}</span>
                </div>
                {students.map(colS => {
                  const sim      = getSim(rowS, colS)
                  const isSelf   = rowS === colS
                  const { bg, text } = getSimilarityColor(sim)
                  const pct      = Math.round(sim * 100)
                  const isHovered = hoveredPair === `${rowS}||${colS}`

                  return (
                    <motion.div key={`${rowS}-${colS}`}
                      whileHover={{ scale: isSelf ? 1 : 1.12, zIndex: 20 }}
                      onClick={() => !isSelf && navigate(`/compare/${encodeURIComponent(rowS)}/${encodeURIComponent(colS)}`)}
                      onMouseEnter={() => { setHoveredPair(`${rowS}||${colS}`); setTooltip({ a: rowS, b: colS, pct, isSelf }) }}
                      onMouseLeave={() => { setHoveredPair(null); setTooltip(null) }}
                      className={`relative h-14 rounded-xl flex items-center justify-center text-xs font-bold
                        ${isSelf ? 'cursor-default' : 'cursor-pointer'}
                        transition-all duration-150`}
                      style={{
                        background: isSelf
                          ? 'rgba(59,130,246,0.25)'
                          : `${bg}${Math.max(0.12, sim * 0.85)})`,
                        border: isSelf
                          ? '1.5px solid rgba(59,130,246,0.5)'
                          : isHovered
                            ? '1.5px solid rgba(255,255,255,0.3)'
                            : '1.5px solid rgba(255,255,255,0.05)',
                        boxShadow: isHovered && !isSelf ? '0 0 14px rgba(255,255,255,0.1)' : 'none',
                      }}>
                      <span style={{ color: isSelf ? '#60a5fa' : text }}>
                        {isSelf ? '—' : `${pct}%`}
                      </span>
                    </motion.div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating tooltip */}
      {tooltip && !tooltip.isSelf && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-card px-6 py-3 flex items-center gap-4 z-50 shadow-2xl">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-sm text-white/60">
            <strong className="text-white">{tooltip.a}</strong>
            <span className="mx-2 text-white/30">vs</span>
            <strong className="text-white">{tooltip.b}</strong>
          </span>
          <span className={`text-xl font-black ${tooltip.pct >= 70 ? 'text-red-400' : tooltip.pct >= 40 ? 'text-yellow-400' : 'text-green-400'}`}>
            {tooltip.pct}%
          </span>
          <span className="text-white/30 text-xs hidden sm:block">Click to open comparison →</span>
        </motion.div>
      )}
    </div>
  )
}
