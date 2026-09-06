import { useState, useEffect } from 'react'
import {
  FaEye,
  FaBullseye,
  FaHeart,
  FaDumbbell,
  FaExclamationTriangle,
  FaTools,
  FaBookOpen
} from 'react-icons/fa'

const TABS = [
  { id: 'vision', label: 'Vision', icon: FaEye, prompt: 'What kind of life do I want to create?' },
  {
    id: 'mission',
    label: 'Mission',
    icon: FaBullseye,
    prompt: 'How do I want to live and what do I want to contribute?'
  },
  {
    id: 'values',
    label: 'Values',
    icon: FaHeart,
    prompt: 'What principles and things matter most to me?'
  },
  {
    id: 'strengths',
    label: 'Strengths',
    icon: FaDumbbell,
    prompt: 'What am I naturally good at or consistently perform well in?'
  },
  {
    id: 'weaknesses',
    label: 'Weaknesses',
    icon: FaExclamationTriangle,
    prompt: 'What limits me, what am I bad at, and what do I need to improve?'
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: FaTools,
    prompt: 'What can I currently do, how good am I at it, and what do I want to learn?'
  },
  {
    id: 'reflection',
    label: 'Reflection',
    icon: FaBookOpen,
    prompt:
      'Regularly reflect on your experiences, decisions, behavior, and what you are learning about yourself.'
  }
]

export default function SelfAwareness() {
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [content, setContent] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadContent = async () => {
      if (window.electron) {
        const loaded: Record<string, string> = {}
        for (const tab of TABS) {
          const text = await window.electron.ipcRenderer.invoke(
            'store-get',
            `self-awareness-${tab.id}`
          )
          loaded[tab.id] = text || ''
        }
        setContent(loaded)
      }
    }
    loadContent()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = { ...content, [activeTab]: e.target.value }
    setContent(newContent)

    // Auto-save debounce
    setIsSaving(true)
    if (window.electron) {
      window.electron.ipcRenderer
        .invoke('store-set', `self-awareness-${activeTab}`, e.target.value)
        .then(() => {
          setTimeout(() => setIsSaving(false), 500)
        })
    }
  }

  const activeTabObj = TABS.find((t) => t.id === activeTab)!
  const ActiveIcon = activeTabObj.icon

  return (
    <div className="flex flex-col h-full bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
      {/* Header Info */}
      <div className="p-8 border-b border-border bg-surface/30">
        <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Self-Awareness</h2>
        <p className="text-muted text-sm leading-relaxed max-w-3xl">
          A personal space to understand yourself better — your direction, values, strengths,
          weaknesses, and abilities. Track how you see yourself today, reflect on your experiences,
          and understand how you grow and change over time.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-border bg-surface/50 no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted hover:text-foreground hover:bg-surface'
              }`}
            >
              <Icon className={isActive ? 'opacity-100' : 'opacity-60'} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col p-6 bg-background relative min-h-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <ActiveIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{activeTabObj.label}</h3>
              <p className="text-xs text-primary font-medium">{activeTabObj.prompt}</p>
            </div>
          </div>
          <div className="text-xs text-subtle font-medium">
            {isSaving ? 'Saving...' : 'Saved to local system'}
          </div>
        </div>

        <textarea
          value={content[activeTab] || ''}
          onChange={handleChange}
          placeholder={`Write about your ${activeTabObj.label.toLowerCase()} here...\n\nTake your time. Think deeply.`}
          className="flex-1 w-full p-6 bg-surface/50 border border-border rounded-xl resize-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-sm leading-relaxed transition-all shadow-inner"
        />
      </div>
    </div>
  )
}
