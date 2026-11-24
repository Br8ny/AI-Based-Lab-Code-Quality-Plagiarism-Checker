import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Code2, GitBranch, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import { api } from '../api'
import { useStore } from '../store/useStore'

const STEPS = [
  { id: 1, icon: Code2,      label: 'Parsing Source Code',       desc: 'Reading and normalizing student files' },
  { id: 2, icon: GitBranch,  label: 'Generating AST',            desc: 'Building Abstract Syntax Trees' },
  { id: 3, icon: Brain,      label: 'Computing Similarity',       desc: 'Running AST + Token + Embedding analysis' },
  { id: 4, icon: Sparkles,   label: 'Scoring Quality & Bugs',    desc: 'Analyzing metrics and detecting issues' },
]

export default function ProcessingPage() {
  const navigate = useNavigate()
  const sessionId = useStore(s => s.sessionId)
  const setResults = useStore(s => s.setResults)
  const [currentStep, setCurrentStep] = useState(0)
  const [subMessage, setSubMessage] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)
  const wsRef = useRef(null)

  const pollResults = useCallback(async () => {
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await api.getResults(sessionId)
        if (res.data.status === 'done') {
          clearInterval(interval)
          setResults(res.data.data)
          setCurrentStep(5)
          setDone(true)
          setTimeout(() => navigate('/dashboard'), 1500)
        }
        if (res.data.status === 'error') {
          clearInterval(interval)
          setError('Analysis failed')
        }
      } catch { /* transient network error — keep polling until the attempt cap */ }
      if (attempts > 60) clearInterval(interval)
    }, 1000)
  }, [sessionId, navigate, setResults])

  useEffect(() => {
    if (!sessionId) { navigate('/'); return }

    const ws = api.openProgressWs(sessionId)
    wsRef.current = ws

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.error) { setError(data.error); return }
      if (data.done) {
        setCurrentStep(5)
        setDone(true)
        // Fetch results
        api.getResults(sessionId).then(res => {
          if (res.data?.data) {
            setResults(res.data.data)
            setTimeout(() => navigate('/dashboard'), 1500)
          }
        }).catch(() => setError('Failed to fetch results'))
        return
      }
      setCurrentStep(data.step || 0)
      setSubMessage(data.sub || '')
    }

    ws.onerror = () => {
      // Fallback: poll for results
      pollResults()
    }

    ws.onclose = () => {}

    return () => { ws.close() }
  }, [sessionId, pollResults, navigate, setResults])

  const progress = done ? 100 : Math.round((currentStep / 4) * 100)

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600
              flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
              <Brain className="w-10 h-10 text-white" />
            </div>
            {!done && (
              <div className="absolute -inset-1 rounded-2xl border-2 border-blue-400/30 animate-ping mx-auto" style={{ width: '88px', height: '88px', top: 0 }} />
            )}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {done ? '✅ Analysis Complete!' : 'AI is Working...'}
          </h1>
          <p className="text-white/50">
            {done ? 'Redirecting to your dashboard' : 'Please wait while we analyze your submissions'}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/40 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const isActive = currentStep === step.id
            const isComplete = currentStep > step.id || done
            const isPending = currentStep < step.id

            return (
              <motion.div key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-4 flex items-center gap-4 transition-all duration-500
                  ${isActive ? 'border-blue-500/40 bg-blue-500/5' : ''}
                  ${isComplete ? 'border-green-500/20' : ''}
                  ${isPending ? 'opacity-40' : ''}`}>
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                  ${isComplete ? 'bg-green-500/20 border border-green-500/30' :
                    isActive ? 'bg-blue-500/20 border border-blue-500/40' :
                    'bg-white/5 border border-white/10'}`}>
                  {isComplete
                    ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                    : isActive
                      ? <step.icon className="w-5 h-5 text-blue-400 animate-pulse" />
                      : <step.icon className="w-5 h-5 text-white/20" />
                  }
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm ${isComplete ? 'text-green-400' : isActive ? 'text-white' : 'text-white/30'}`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-white/30 truncate">
                    {isActive && subMessage ? subMessage : step.desc}
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="flex gap-1">
                    {[0, 1, 2].map(j => (
                      <motion.div key={j} className="w-1.5 h-1.5 rounded-full bg-blue-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: j * 0.2 }} />
                    ))}
                  </div>
                )}
                {isComplete && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
              </motion.div>
            )
          })}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <div className="font-semibold text-red-400 text-sm">Analysis Error</div>
                <div className="text-xs text-red-400/70 mt-0.5">{error}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
