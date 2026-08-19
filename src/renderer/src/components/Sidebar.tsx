import { FaBriefcase, FaHeartbeat, FaLeaf, FaChevronDown } from 'react-icons/fa'
import { useState } from 'react'
import electronLogo from '../assets/icon.svg'

interface SidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

const navItems = [
  {
    id: 'productivity',
    label: 'Productivity',
    icon: <FaBriefcase className="w-4 h-4 flex-shrink-0" />,
    color: '#6fa0d5',
    subItems: [
      { id: 'pomodoro', label: 'Pomodoro Timer' },
      { id: 'water-reminder', label: 'Water Reminder' }
    ]
  },
  {
    id: 'health-fitness',
    label: 'Health & Fitness',
    icon: <FaHeartbeat className="w-4 h-4 flex-shrink-0" />,
    color: '#dc7b7b',
    subItems: [] as { id: string; label: string }[]
  },
  {
    id: 'life',
    label: 'Life',
    icon: <FaLeaf className="w-4 h-4 flex-shrink-0" />,
    color: '#70b68c',
    subItems: [
      { id: 'resume-overview', label: 'Resume Overview' },
      { id: 'resume-sections', label: 'Resume Sections' }
    ]
  }
]

export default function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    productivity: true,
    'health-fitness': true,
    life: true
  })

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  const isChildActive = (item: (typeof navItems)[0]) =>
    item.subItems.some((s) => s.id === activeSection)

  return (
    <div className="w-56 h-full bg-surface border-r border-border shrink-0 flex flex-col transition-colors">
      {/* App Header */}
      <div className="h-14 flex items-center px-5 border-b border-border gap-3 shrink-0">
        <img src={electronLogo} alt="Life OS" className="w-7 h-7 drop-shadow-sm" />
        <span className="font-bold text-lg tracking-tight text-foreground">Life OS</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const hasChildren = item.subItems.length > 0
          const isOpen = expanded[item.id]
          const childActive = isChildActive(item)
          const selfActive = activeSection === item.id && !hasChildren

          return (
            <div key={item.id}>
              {/* Category row */}
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggle(item.id)
                    // Also navigate to first child if none active yet
                    if (!childActive && !isOpen) {
                      setActiveSection(item.subItems[0]?.id ?? item.id)
                    }
                  } else {
                    setActiveSection(item.id)
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group select-none"
                style={{
                  background: selfActive || childActive ? `${item.color}18` : 'transparent',
                  color: selfActive || childActive ? item.color : 'var(--color-muted, #888)'
                }}
              >
                {/* Icon bubble */}
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                  style={{
                    background:
                      selfActive || childActive
                        ? `${item.color}22`
                        : 'var(--color-surface-2, rgba(128,128,128,0.08))',
                    color: selfActive || childActive ? item.color : 'var(--color-subtle, #aaa)'
                  }}
                >
                  {item.icon}
                </span>

                <span className="flex-1 text-left truncate">{item.label}</span>

                {hasChildren && (
                  <FaChevronDown
                    className="w-3 h-3 shrink-0 transition-transform duration-200"
                    style={{
                      transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      opacity: 0.5
                    }}
                  />
                )}
              </button>

              {/* Sub items — collapsible with CSS height trick */}
              {hasChildren && (
                <div
                  className="overflow-hidden transition-all duration-200"
                  style={{
                    maxHeight: isOpen ? `${item.subItems.length * 44}px` : '0px',
                    opacity: isOpen ? 1 : 0
                  }}
                >
                  <div className="ml-4 pl-3 border-l border-border/50 flex flex-col gap-0.5 py-1">
                    {item.subItems.map((sub) => {
                      const isActive = activeSection === sub.id
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setActiveSection(sub.id)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150"
                          style={{
                            background: isActive ? `${item.color}15` : 'transparent',
                            color: isActive ? item.color : 'var(--color-muted, #888)',
                            fontWeight: isActive ? 600 : 400
                          }}
                        >
                          {sub.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="text-xs text-subtle text-center">Life OS v1.0.0</div>
      </div>
    </div>
  )
}
