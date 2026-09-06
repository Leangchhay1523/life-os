import { useState, useEffect, ReactElement } from 'react'
import {
  FaFlag,
  FaPlus,
  FaTrash,
  FaSave,
  FaCalendarAlt,
  FaEdit,
  FaCheck,
  FaTimes
} from 'react-icons/fa'

interface MilestoneItem {
  id: string
  title: string
  date: string
  description: string
  editing?: boolean
}

// ── Category color palette cycling ───────────────────────────────────────────
const PALETTE = [
  { bg: 'rgba(99,102,241,0.12)', accent: '#6366f1', light: 'rgba(99,102,241,0.08)' },
  { bg: 'rgba(16,185,129,0.12)', accent: '#10b981', light: 'rgba(16,185,129,0.08)' },
  { bg: 'rgba(245,158,11,0.12)', accent: '#f59e0b', light: 'rgba(245,158,11,0.08)' },
  { bg: 'rgba(239,68,68,0.12)', accent: '#ef4444', light: 'rgba(239,68,68,0.08)' },
  { bg: 'rgba(59,130,246,0.12)', accent: '#3b82f6', light: 'rgba(59,130,246,0.08)' },
  { bg: 'rgba(168,85,247,0.12)', accent: '#a855f7', light: 'rgba(168,85,247,0.08)' }
]

export default function Milestones(): ReactElement {
  const [milestones, setMilestones] = useState<MilestoneItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<MilestoneItem>>({})

  // ── Persist ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadData(): Promise<void> {
      try {
        const data = await (window as any).api.storeGet('life-milestones')
        if (data && Array.isArray(data)) setMilestones(data)
      } catch (err) {
        console.error('Failed to load milestones', err)
      } finally {
        setIsLoaded(true)
      }
    }
    loadData()
  }, [])

  const handleSave = async (): Promise<void> => {
    setIsSaving(true)
    try {
      await (window as any).api.storeSet('life-milestones', milestones)
    } catch (err) {
      console.error('Failed to save milestones', err)
    } finally {
      setTimeout(() => setIsSaving(false), 700)
    }
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const addItem = (): void => {
    const newItem: MilestoneItem = {
      id: Date.now().toString(),
      title: '',
      date: '',
      description: ''
    }
    setMilestones((prev) => [...prev, newItem])
    setEditingId(newItem.id)
    setDraft({ title: '', date: '', description: '' })
  }

  const startEdit = (item: MilestoneItem): void => {
    setEditingId(item.id)
    setDraft({ title: item.title, date: item.date, description: item.description })
  }

  const commitEdit = (): void => {
    if (!editingId) return
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === editingId
          ? {
              ...m,
              title: draft.title ?? '',
              date: draft.date ?? '',
              description: draft.description ?? ''
            }
          : m
      )
    )
    setEditingId(null)
    setDraft({})
  }

  const cancelEdit = (id: string): void => {
    // Remove if it was a brand-new empty item
    setMilestones((prev) => {
      const item = prev.find((m) => m.id === id)
      if (item && !item.title && !item.date && !item.description) {
        return prev.filter((m) => m.id !== id)
      }
      return prev
    })
    setEditingId(null)
    setDraft({})
  }

  const removeItem = (id: string): void => {
    setMilestones((prev) => prev.filter((m) => m.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setDraft({})
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-8 text-foreground relative">
      <div className="flex justify-end gap-3 mb-6">
        <button
          onClick={addItem}
          className="flex items-center gap-2 bg-surface hover:bg-surface-hover border border-border text-foreground font-bold py-2 px-4 rounded-xl transition-colors text-sm"
        >
          <FaPlus /> Add Milestone
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving || !isLoaded}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-2 px-6 rounded-xl transition-colors disabled:opacity-50 text-sm"
        >
          <FaSave className={isSaving ? 'animate-bounce' : ''} />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {isLoaded && milestones.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-3xl">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <FaFlag size={24} />
          </div>
          <h2 className="text-xl font-bold mb-2">No Milestones Yet</h2>
          <p className="text-muted text-sm max-w-sm mb-6">
            Start tracking your big goals and upcoming life events. They will be visualized here.
          </p>
          <button
            onClick={addItem}
            className="bg-primary text-primary-foreground font-bold py-2 px-6 rounded-xl transition-colors"
          >
            Add your first milestone
          </button>
        </div>
      )}

      {milestones.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {milestones.map((item, index) => {
            const palette = PALETTE[index % PALETTE.length]
            const isEditing = editingId === item.id

            return (
              <div
                key={item.id}
                className="bg-card border border-border rounded-3xl p-6 shadow-sm transition-all relative overflow-hidden group"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: palette.accent }}
                />

                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: palette.bg, color: palette.accent }}
                  >
                    <FaFlag size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        autoFocus
                        value={draft.title ?? ''}
                        onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                        placeholder="Milestone title…"
                        className="w-full bg-surface border border-border px-3 py-2 rounded-lg text-lg font-bold text-foreground focus:outline-none focus:border-primary transition-colors mb-2"
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-foreground truncate mb-1">
                        {item.title || (
                          <span className="text-muted italic opacity-70">Untitled Milestone</span>
                        )}
                      </h3>
                    )}

                    {isEditing ? (
                      <input
                        value={draft.date ?? ''}
                        onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                        placeholder="e.g. December 2025"
                        className="text-sm bg-surface border border-border px-3 py-1.5 rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors mb-3 w-48"
                      />
                    ) : item.date ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-lg text-xs font-semibold text-muted mb-3">
                        <FaCalendarAlt />
                        {item.date}
                      </div>
                    ) : null}

                    {isEditing ? (
                      <textarea
                        value={draft.description ?? ''}
                        onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                        placeholder="Describe your milestone..."
                        rows={3}
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-y text-foreground placeholder:text-muted/40"
                      />
                    ) : item.description ? (
                      <div className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed mt-2 bg-surface/30 p-4 rounded-xl border border-border/50">
                        {item.description}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={commitEdit}
                          className="w-10 h-10 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl flex items-center justify-center transition-colors"
                          title="Save"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => cancelEdit(item.id)}
                          className="w-10 h-10 bg-surface border border-border hover:bg-surface-hover rounded-xl flex items-center justify-center transition-colors"
                          title="Cancel"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(item)}
                          className="w-10 h-10 text-muted opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary rounded-xl flex items-center justify-center"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-10 h-10 text-muted opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-500 rounded-xl flex items-center justify-center"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
