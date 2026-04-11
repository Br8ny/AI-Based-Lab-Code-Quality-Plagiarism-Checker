import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileCode2, X, FolderArchive } from 'lucide-react'

export default function FileDropzone({ onFilesSelected }) {
  const [files, setFiles] = useState([])

  const onDrop = useCallback((accepted) => {
    const newFiles = [...files, ...accepted].slice(0, 50)
    setFiles(newFiles)
    onFilesSelected(newFiles)
  }, [files, onFilesSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'text/x-python': ['.py'],
      'text/x-csrc': ['.c', '.h'],
      'text/x-java': ['.java'],
    },
    multiple: true,
  })

  const removeFile = (idx) => {
    const updated = files.filter((_, i) => i !== idx)
    setFiles(updated)
    onFilesSelected(updated)
  }

  return (
    <div className="space-y-4">
      <div {...getRootProps()}
        className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer
          transition-all duration-300 group
          ${isDragActive
            ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
            : 'border-white/10 hover:border-blue-500/50 hover:bg-white/5'}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center
              ${isDragActive
                ? 'bg-blue-500/30 border border-blue-400/50'
                : 'bg-white/5 border border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/30'}
              transition-all duration-300`}>
            <Upload className={`w-7 h-7 ${isDragActive ? 'text-blue-400' : 'text-white/40 group-hover:text-blue-400'} transition-colors`} />
          </motion.div>
          <div>
            <p className="text-white/80 font-semibold text-lg">
              {isDragActive ? 'Drop files here!' : 'Drop student submissions'}
            </p>
            <p className="text-white/40 text-sm mt-1">
              Supports <span className="text-blue-400">.zip</span>,{' '}
              <span className="text-green-400">.py</span>,{' '}
              <span className="text-orange-400">.c/.h</span>,{' '}
              <span className="text-red-400">.java</span> files
            </p>
            <p className="text-white/30 text-xs mt-2">or click to browse</p>
          </div>
          <div className="flex gap-6 text-xs text-white/30">
            <div className="flex items-center gap-1.5">
              <FolderArchive className="w-3.5 h-3.5 text-yellow-500/60" />
              ZIP with student folders
            </div>
            <div className="flex items-center gap-1.5">
              <FileCode2 className="w-3.5 h-3.5 text-blue-500/60" />
              Individual code files
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass-card p-4 space-y-2 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white/70">{files.length} file(s) selected</span>
                <button onClick={() => { setFiles([]); onFilesSelected([]) }}
                  className="text-xs text-white/30 hover:text-red-400 transition-colors">Clear all</button>
              </div>
              {files.map((f, i) => (
                <motion.div key={`${f.name}-${i}`}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 group">
                  <FileCode2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-sm text-white/70 flex-1 truncate">{f.name}</span>
                  <span className="text-xs text-white/30 shrink-0">{(f.size / 1024).toFixed(1)}KB</span>
                  <button onClick={() => removeFile(i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-red-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
