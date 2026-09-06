import { useState, useEffect } from 'react'
import { FaDatabase, FaTrash, FaExclamationTriangle, FaDownload } from 'react-icons/fa'

export default function Settings() {
  const [dataSize, setDataSize] = useState<number>(0)
  const [showConfirm, setShowConfirm] = useState(false)
  const [cleared, setCleared] = useState(false)

  const loadSize = async () => {
    if (window.electron) {
      const size = await window.electron.ipcRenderer.invoke('store-get-size')
      setDataSize(size)
    }
  }

  useEffect(() => {
    loadSize()
  }, [])

  const handleClearData = async () => {
    if (window.electron) {
      await window.electron.ipcRenderer.invoke('store-clear')
      setCleared(true)
      setShowConfirm(false)
      loadSize()
      setTimeout(() => setCleared(false), 3000)
    }
  }

  const handleExportData = async () => {
    if (window.electron) {
      const success = await window.electron.ipcRenderer.invoke('store-export')
      if (success) {
        // optionally show a quick toast or alert, but the dialog success is usually enough
      }
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-8 text-foreground">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
          <FaDatabase className="text-2xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Settings</h1>
          <p className="text-muted">Manage your application data and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Management Card */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <FaDatabase className="text-primary" /> Data Management
          </h2>

          <div className="bg-surface/50 border border-border rounded-2xl p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm font-bold text-muted uppercase tracking-wider mb-1">
                  Local Storage Size
                </p>
                <p className="text-2xl font-bold">{formatBytes(dataSize)}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <FaDatabase size={20} />
              </div>
            </div>

            <button
              onClick={handleExportData}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FaDownload /> Export Database (.db)
            </button>
          </div>

          <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-5">
            <h3 className="font-bold text-red-500 flex items-center gap-2 mb-2">
              <FaExclamationTriangle /> Danger Zone
            </h3>
            <p className="text-sm text-muted mb-4">
              This action will permanently delete all your data including daily planner tasks,
              self-awareness reflections, and settings. This cannot be undone.
            </p>

            {showConfirm ? (
              <div className="flex gap-3">
                <button
                  onClick={handleClearData}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl transition-colors"
                >
                  Yes, Delete Everything
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-surface hover:bg-surface-hover border border-border font-bold py-2 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full bg-background hover:bg-red-500/10 border border-red-500/30 text-red-500 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <FaTrash /> Clear All Data
              </button>
            )}

            {cleared && (
              <div className="mt-4 text-emerald-500 text-sm font-bold text-center bg-emerald-500/10 py-2 rounded-lg">
                All data successfully cleared!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
