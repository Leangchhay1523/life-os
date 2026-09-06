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
    <div
      className="flex flex-1 min-h-0 overflow-hidden w-full p-4"
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
    >
      {/* ── Left sidebar ─────────────────────────────────────── */}
      <aside className="w-44 shrink-0 overflow-y-auto pl-1">
        <div className="sticky top-0 flex flex-col gap-0.5 pt-1">
          {/* Section header */}
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <FaFlag className="w-3.5 h-3.5" style={{ color: '#6366f1' }} />
            <span className="text-sm font-bold text-foreground">Milestones</span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 px-3 py-2 text-xs text-muted">
            <span>
              <span className="font-bold text-foreground">{milestones.length}</span> total
            </span>
            <span>
              <span className="font-bold" style={{ color: '#6366f1' }}>
                {milestones.filter((m) => m.title).length}
              </span>{' '}
              named
            </span>
          </div>

          {/* Save */}
          <div className="mt-4 px-1">
            <button
              onClick={handleSave}
              disabled={isSaving || !isLoaded}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave className={`w-4 h-4 ${isSaving ? 'animate-bounce' : ''}`} />
              {isSaving ? 'Saving...' : 'Save Data'}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main timeline area ───────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-8 min-w-0">
        {/* Empty state */}
        {isLoaded && milestones.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-20">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
                boxShadow: '0 0 60px rgba(99,102,241,0.15)'
              }}
            >
              <FaFlag style={{ width: 36, height: 36, color: '#6366f1', opacity: 0.7 }} />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">No milestones yet</h2>
            <p className="text-muted text-sm max-w-xs mb-8 leading-relaxed">
              Start tracking your big goals and upcoming events. Every journey begins with a single
              milestone.
            </p>
            <button
              onClick={addItem}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(99,102,241,0.35)'
              }}
            >
              <FaPlus />
              Add your first milestone
            </button>
          </div>
        )}

        {/* Milestone cards */}
        {milestones.length > 0 && (
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            {milestones.map((item, index) => {
              const palette = PALETTE[index % PALETTE.length]
              const isEditing = editingId === item.id

              return (
                <div
                  key={item.id}
                  className="group rounded-2xl border transition-all overflow-hidden"
                  style={{
                    background: 'var(--color-card)',
                    borderColor: isEditing ? palette.accent : 'var(--color-border)',
                    borderLeftWidth: '4px',
                    borderLeftColor: palette.accent,
                    boxShadow: isEditing
                      ? `0 0 0 3px ${palette.light}`
                      : '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  {/* Card header */}
                  <div className="flex items-start gap-3 p-5 pb-3">
                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: palette.bg, color: palette.accent }}
                    >
                      <FaFlag style={{ width: 13, height: 13 }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          autoFocus
                          value={draft.title ?? ''}
                          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                          placeholder="Milestone title…"
                          className="w-full bg-transparent text-lg font-bold text-foreground focus:outline-none placeholder:text-muted/40 border-b-2 pb-1 transition-colors"
                          style={{ borderColor: palette.accent }}
                        />
                      ) : (
                        <h3 className="text-base font-bold text-foreground truncate">
                          {item.title || (
                            <span className="text-muted italic font-normal text-sm">
                              Untitled Milestone
                            </span>
                          )}
                        </h3>
                      )}

                      {/* Date badge */}
                      {isEditing ? (
                        <input
                          value={draft.date ?? ''}
                          onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                          placeholder="e.g. December 2025"
                          className="mt-2 text-xs bg-transparent focus:outline-none text-muted placeholder:text-muted/40 border-b pb-0.5 w-48 transition-colors"
                          style={{ borderColor: 'var(--color-border)' }}
                        />
                      ) : item.date ? (
                        <div
                          className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: palette.bg, color: palette.accent }}
                        >
                          <FaCalendarAlt style={{ width: 10, height: 10 }} />
                          {item.date}
                        </div>
                      ) : null}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            onClick={commitEdit}
                            className="p-2 rounded-lg transition-all hover:scale-110"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
                            title="Save"
                          >
                            <FaCheck style={{ width: 12, height: 12 }} />
                          </button>
                          <button
                            onClick={() => cancelEdit(item.id)}
                            className="p-2 rounded-lg transition-all hover:scale-110"
                            style={{ background: 'rgba(107,114,128,0.1)', color: '#6b7280' }}
                            title="Cancel"
                          >
                            <FaTimes style={{ width: 12, height: 12 }} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2 rounded-lg text-muted opacity-0 group-hover:opacity-100 transition-all hover:bg-border hover:text-foreground"
                            title="Edit"
                          >
                            <FaEdit style={{ width: 12, height: 12 }} />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 rounded-lg text-muted opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 hover:bg-red-500/10"
                            title="Delete"
                          >
                            <FaTrash style={{ width: 12, height: 12 }} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {(isEditing || item.description) && (
                    <div className="px-5 pb-5">
                      {isEditing ? (
                        <textarea
                          value={draft.description ?? ''}
                          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                          placeholder="Describe your milestone… (supports - bullet points)"
                          rows={4}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all resize-y text-foreground placeholder:text-muted/40"
                          style={{
                            borderColor: 'var(--color-border)',
                            outline: 'none'
                          }}
                          onFocus={(e) => (e.target.style.borderColor = palette.accent)}
                          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                        />
                      ) : (
                        <div
                          className="text-sm text-muted whitespace-pre-wrap leading-relaxed pt-1"
                          style={{ borderTop: '1px solid var(--color-border)' }}
                        >
                          <div className="pt-3">{item.description}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Add button at bottom */}
            <button
              onClick={addItem}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed text-sm font-semibold transition-all hover:border-indigo-400/50 hover:text-indigo-400 group"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            >
              <FaPlus className="group-hover:scale-125 transition-transform" />
              Add Milestone
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
