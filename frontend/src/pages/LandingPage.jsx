import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain, Sparkles, Shield, BarChart3, ArrowRight,
  Zap, Code2, Play, Upload
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import FileDropzone from '../components/FileDropzone'
import { api } from '../api'
import { useStore } from '../store/useStore'

const LANGUAGES = [
  { value: 'auto',   label: 'Auto Detect', emoji: '🤖' },
  { value: 'python', label: 'Python',       emoji: '🐍' },
  { value: 'java',   label: 'Java',         emoji: '☕' },
  { value: 'c',      label: 'C / C++',      emoji: '⚡' },
]

const FEATURES = [
  { icon: Brain,    title: 'AST Analysis',        desc: 'Deep structural similarity via Abstract Syntax Trees' },
  { icon: Shield,   title: 'Plagiarism Detection', desc: 'Multi-method weighted similarity scoring' },
  { icon: BarChart3,title: 'Quality Metrics',      desc: 'Cyclomatic complexity, function length, comment density' },
  { icon: Zap,      title: 'Bug Detection',        desc: 'Common anti-patterns and potential bugs flagged instantly' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const setSession  = useStore(s => s.setSession)
  const loadDemo    = useStore(s => s.loadDemoData)
  const [files, setFiles]             = useState([])
  const [language, setLanguage]       = useState('auto')
  const [assignmentName, setAssignmentName] = useState('')
  const [loading, setLoading]         = useState(false)
  const [tab, setTab]                 = useState('upload') // 'upload' | 'demo'
  const [errors, setErrors]           = useState({}) // { name: true, files: true }

  /* ── Load demo instantly ── */
  const handleDemo = () => {
    loadDemo()
    toast.success('Demo data loaded! Exploring Lab 3 — Sorting Algorithms')
    navigate('/dashboard')
  }

  /* ── Real upload + analyze ── */
  const handleAnalyze = async () => {
    const errs = {}
    if (!assignmentName.trim()) errs.name  = true
    if (files.length === 0)     errs.files = true
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      if (errs.name)  toast.error('Please enter an assignment name', { icon: '✏️' })
      else if (errs.files) toast.error('Please drop or select student files', { icon: '📁' })
      return
    }
    setErrors({})
    setLoading(true)
    try {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))
      const res = await api.upload(formData)
      const { session_id, students } = res.data
      setSession(session_id, assignmentName.trim(), language, students)
      await api.analyze(session_id, language, assignmentName.trim())
      navigate('/processing')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Upload failed — is the backend running on port 8000?')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

      {/* ── Hero ── */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} className="text-center pt-16 pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
          bg-blue-500/10 border border-blue-500/20 mb-6">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-300 font-medium">AI-Powered Academic Tool</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
          <span className="text-white">Lab Code </span>
          <span className="text-gradient">Quality</span>
          <br />
          <span className="text-white">&amp; </span>
          <span className="text-gradient">Plagiarism</span>
          <span className="text-white"> Checker</span>
        </h1>

        <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
          Upload student submissions and get instant AI-powered analysis —
          similarity scores, quality metrics, bug detection, and downloadable reports.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-white/40">
          {['100% Local','No Cloud','Python · C · Java','Privacy First'].map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />{t}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Card with tab switcher ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-3xl mx-auto glass-card p-8 mb-16">

        {/* Tab row */}
        <div className="flex gap-2 mb-7 p-1 bg-white/5 rounded-xl w-fit">
          <button onClick={() => setTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab === 'upload'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-white/40 hover:text-white'}`}>
            <Upload className="w-4 h-4" /> Upload Files
          </button>
          <button onClick={() => setTab('demo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab === 'demo'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                : 'text-white/40 hover:text-white'}`}>
            <Play className="w-4 h-4" /> Try Live Demo
          </button>
        </div>

        {tab === 'demo' ? (
          /* ── Demo Panel ── */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-6">
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
              <h3 className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                Live Demo — Lab 3: Sorting Algorithms
              </h3>
              <p className="text-white/50 text-sm leading-relaxed mb-5">
                Explore a pre-loaded session with <strong className="text-white">6 students</strong>,
                including one plagiarised pair, a clean submission, and a buggy submission.
                All pages — Dashboard, Heatmap, Student Detail, Comparison, Reports — are fully interactive.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { name: 'Alice Johnson', badge: '🟢 Original',  detail: 'Clean, well-commented' },
                  { name: 'Bob Smith',     badge: '🔴 Plagiarised',detail: '85% match with Alice' },
                  { name: 'Carol Davis',   badge: '🟢 Best Code', detail: 'Score 95/100' },
                  { name: 'David Lee',     badge: '🔴 Poor Quality',detail: '4 bugs detected' },
                  { name: 'Emma Wilson',   badge: '🟡 Medium',    detail: '1 warning' },
                  { name: 'Frank Brown',   badge: '🟡 Partial',   detail: 'Score 55/100' },
                ].map(s => (
                  <div key={s.name}
                    className="glass-card p-3 text-center hover:border-violet-500/30 transition-colors">
                    <div className="text-xs font-semibold text-white mb-0.5">{s.name}</div>
                    <div className="text-xs text-white/40 mb-1">{s.detail}</div>
                    <div className="text-xs">{s.badge}</div>
                  </div>
                ))}
              </div>

              <motion.button onClick={handleDemo}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3
                  bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500
                  transition-all duration-300 shadow-xl shadow-violet-500/20">
                <Play className="w-5 h-5" />
                Launch Live Demo — Explore All Pages
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* ── Upload Panel ── */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-400" /> Submit for Analysis
            </h2>

            {/* Assignment Name */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors
                ${errors.name ? 'text-red-400' : 'text-white/60'}`}>
                Assignment Name {errors.name && <span className="text-red-400 text-xs ml-1">← required</span>}
              </label>
              <input value={assignmentName}
                onChange={e => { setAssignmentName(e.target.value); if (e.target.value.trim()) setErrors(p => ({ ...p, name: false })) }}
                placeholder="e.g. Lab 3 – Sorting Algorithms"
                className={`w-full bg-white/5 rounded-xl px-4 py-3 text-white
                  placeholder-white/20 focus:outline-none transition-all border
                  ${errors.name
                    ? 'border-red-500/60 focus:border-red-400 bg-red-500/5'
                    : 'border-white/10 focus:border-blue-500/50'}`} />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Programming Language</label>
              <div className="grid grid-cols-4 gap-2">
                {LANGUAGES.map(({ value, label, emoji }) => (
                  <button key={value} onClick={() => setLanguage(value)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-sm
                      font-medium transition-all duration-200
                      ${language === value
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                        : 'bg-white/3 border-white/8 text-white/50 hover:bg-white/8 hover:border-white/20'}`}>
                    <span className="text-xl">{emoji}</span>
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dropzone */}
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors
                ${errors.files ? 'text-red-400' : 'text-white/60'}`}>
                Student Submissions {errors.files && <span className="text-red-400 text-xs ml-1">← select at least 1 file</span>}
              </label>
              <div className={`rounded-xl transition-all ${errors.files ? 'ring-2 ring-red-500/40' : ''}`}>
                <FileDropzone onFilesSelected={f => { setFiles(f); if (f.length > 0) setErrors(p => ({ ...p, files: false })) }} />
              </div>
            </div>

            {/* CTA */}
            <motion.button onClick={handleAnalyze} disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3
                bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500
                disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                shadow-xl shadow-blue-500/20">
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />Uploading...</>
              ) : (
                <><Brain className="w-5 h-5" />Analyze Submissions<ArrowRight className="w-5 h-5" /></>
              )}
            </motion.button>

            <p className="text-center text-xs text-white/25">
              Backend must be running on <span className="text-blue-400">http://localhost:8000</span>
              {' '}· or use the <button onClick={() => setTab('demo')} className="text-violet-400 hover:text-violet-300 underline">Live Demo</button> instead
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* ── Feature cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
          <motion.div key={title}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="glass-card-hover p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20
              flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
