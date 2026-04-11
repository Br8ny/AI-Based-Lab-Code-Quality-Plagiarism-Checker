import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Upload } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function NoDataState({ page = 'this page' }) {
  const navigate = useNavigate()
  const loadDemo = useStore(s => s.loadDemoData)

  const handleDemo = () => {
    loadDemo()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center
          justify-center mx-auto mb-6 text-3xl">📊</div>
        <h2 className="text-2xl font-bold text-white mb-2">No Session Data</h2>
        <p className="text-white/40 text-sm mb-8 leading-relaxed">
          {page} requires an active analysis session.
          Upload real student files or explore the interactive demo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={handleDemo}
            className="btn-primary flex items-center gap-2 justify-center">
            <Play className="w-4 h-4" /> Try Live Demo
          </button>
          <button onClick={() => navigate('/')}
            className="btn-secondary flex items-center gap-2 justify-center">
            <Upload className="w-4 h-4" /> Upload Files
          </button>
        </div>
      </motion.div>
    </div>
  )
}
