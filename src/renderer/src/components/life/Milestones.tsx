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
      className="flex flex-1 min-h-0 overflow-hidden w-full"
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
    >
      {/* ── Left sidebar ─────────────────────────────────────────── */}
      <aside
        className="w-56 shrink-0 border-r border-border flex flex-col gap-5 p-5 overflow-y-auto h-full"
        style={{ background: 'var(--color-surface)' }}
      >
        {/* Hero blurb */}
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.10))'
          }}
        >
          <div
            className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }}
          />
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 relative"
            style={{ background: 'rgba(99,102,241,0.2)' }}
          >
            <FaFlag style={{ color: '#6366f1', width: 18, height: 18 }} />
          </div>
          <p className="text-sm font-bold text-foreground leading-snug">Milestones & Big Goals</p>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Track every big event, achievement, and future goal on your personal timeline.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div
            className="rounded-xl p-3 text-center border border-border"
            style={{ background: 'var(--color-card)' }}
          >
            <div className="text-2xl font-black text-foreground">{milestones.length}</div>
            <div className="text-[10px] text-muted uppercase tracking-wide mt-0.5">Total</div>
          </div>
          <div
            className="rounded-xl p-3 text-center border border-border"
            style={{ background: 'var(--color-card)' }}
          >
            <div className="text-2xl font-black" style={{ color: '#6366f1' }}>
              {milestones.filter((m) => m.title).length}
            </div>
            <div className="text-[10px] text-muted uppercase tracking-wide mt-0.5">Named</div>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isSaving || !isLoaded}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
          style={{
            background: isSaving
              ? 'rgba(99,102,241,0.4)'
              : 'linear-gradient(135deg, #6366f1, #a855f7)',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(99,102,241,0.35)'
          }}
        >
          <FaSave className={isSaving ? 'animate-bounce' : ''} />
          {isSaving ? 'Saved!' : 'Save Milestones'}
        </button>

        {/* Tips */}
        <div
          className="rounded-xl p-3 border border-border text-xs space-y-1"
          style={{ background: 'var(--color-card)', color: 'var(--color-muted)' }}
        >
          <p
            style={{
              color: 'var(--color-foreground)',
              fontWeight: 700,
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '6px'
            }}
          >
            Tips
          </p>
          <p style={{ color: 'var(--color-muted)' }}>
            • Click <span style={{ fontWeight: 700, color: 'var(--color-foreground)' }}>+ Add</span>{' '}
            button below
          </p>
          <p style={{ color: 'var(--color-muted)' }}>• Hover a card to edit or delete</p>
          <p style={{ color: 'var(--color-muted)' }}>
            • Use <span style={{ fontWeight: 700, color: 'var(--color-foreground)' }}>-</span> for
            bullet points
          </p>
          <p style={{ color: 'var(--color-muted)' }}>
            • Press <span style={{ fontWeight: 700, color: 'var(--color-foreground)' }}>Save</span>{' '}
            to keep data
          </p>
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

        {/* Timeline */}
        {milestones.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              {/* Vertical line — only spans the milestone items, not full container */}
              <div
                className="absolute left-5 top-5 w-0.5"
                style={{
                  height: `calc(100% - 40px)`,
                  background: 'linear-gradient(to bottom, #6366f1, #a855f7, transparent)'
                }}
              />

              <div className="flex flex-col gap-6 pl-16">
                {milestones.map((item, index) => {
                  const palette = PALETTE[index % PALETTE.length]
                  const isEditing = editingId === item.id

                  return (
                    <div
                      key={item.id}
                      className="relative group animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      {/* Timeline dot */}
                      <div
                        className="absolute -left-[52px] top-5 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border-2 transition-transform group-hover:scale-110"
                        style={{
                          background: palette.bg,
                          borderColor: palette.accent,
                          color: palette.accent
                        }}
                      >
                        <FaFlag style={{ width: 14, height: 14 }} />
                      </div>

                      {/* Card */}
                      <div
                        className="rounded-2xl border transition-all"
                        style={{
                          background: 'var(--color-card)',
                          borderColor: isEditing ? palette.accent : 'var(--color-border)',
                          boxShadow: isEditing
                            ? `0 0 0 3px ${palette.light}`
                            : '0 2px 8px rgba(0,0,0,0.04)'
                        }}
                      >
                        {/* Card header */}
                        <div className="flex items-start gap-3 p-5 pb-3">
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
                                onChange={(e) =>
                                  setDraft((d) => ({ ...d, description: e.target.value }))
                                }
                                placeholder="Describe your milestone… (supports - bullet points and **Markdown**)"
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
                    </div>
                  )
                })}

                {/* Add button at bottom */}
                <div className="relative">
                  <div
                    className="absolute -left-[52px] top-3 w-10 h-10 rounded-xl flex items-center justify-center border-2 border-dashed cursor-pointer hover:scale-110 transition-all"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                    onClick={addItem}
                  >
                    <FaPlus style={{ width: 12, height: 12 }} />
                  </div>
                  <button
                    onClick={addItem}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed text-sm font-semibold transition-all hover:border-indigo-400/50 hover:text-indigo-400 group"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                  >
                    <FaPlus className="group-hover:scale-125 transition-transform" />
                    Add Milestone
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
