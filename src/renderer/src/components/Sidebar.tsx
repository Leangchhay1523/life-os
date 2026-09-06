import {
  FaBriefcase,
  FaHeartbeat,
  FaLeaf,
  FaChevronDown,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaCogs
} from 'react-icons/fa'
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
      { id: 'daily-planner', label: 'Daily Planner' },
      { id: 'pomodoro', label: 'Pomodoro Timer' },
      { id: 'water-reminder', label: 'Water Reminder' }
    ]
  },
  {
    id: 'health-fitness',
    label: 'Health & Fitness',
    icon: <FaHeartbeat className="w-4 h-4 flex-shrink-0" />,
    color: '#dc7b7b',
    subItems: [{ id: 'health-dashboard', label: 'Health Dashboard' }]
  },
  {
    id: 'life',
    label: 'Life',
    icon: <FaLeaf className="w-4 h-4 flex-shrink-0" />,
    color: '#70b68c',
    subItems: [
      {
        id: 'resume-group',
        label: 'Resume',
        subItems: [
          { id: 'resume-overview', label: 'Resume Overview' },
          { id: 'resume-sections', label: 'Resume Sections' },
          { id: 'resume-builder', label: 'Resume Builder' }
        ]
      },
      { id: 'self-awareness', label: 'Self-Awareness' },
      { id: 'milestones', label: 'Milestones (Big Goals)' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <FaCogs className="w-4 h-4 flex-shrink-0" />,
    color: '#8b8b8b',
    subItems: []
  }
]

export default function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    productivity: true,
    'health-fitness': true,
    life: true,
    'resume-group': true
  })
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  const isChildActive = (item: (typeof navItems)[0]) =>
    item.subItems.some(
      (s) =>
        s.id === activeSection ||
        (s.subItems && s.subItems.some((child) => child.id === activeSection))
    )

  return (
    <div
      className={`${isSidebarOpen ? 'w-56' : 'w-16'} h-full bg-surface border-r border-border shrink-0 flex flex-col transition-all duration-300`}
    >
      {/* App Header */}
      <div
        className={`h-14 flex items-center ${isSidebarOpen ? 'px-5 gap-3' : 'justify-center'} border-b border-border shrink-0 transition-all`}
      >
        <img src={electronLogo} alt="Life OS" className="w-7 h-7 drop-shadow-sm shrink-0" />
        {isSidebarOpen && (
          <span className="font-bold text-lg tracking-tight text-foreground whitespace-nowrap animate-in fade-in duration-300">
            Life OS
          </span>
        )}
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
                  if (!isSidebarOpen) {
                    setIsSidebarOpen(true)
                  }
                  if (hasChildren) {
                    if (isSidebarOpen) toggle(item.id)
                    else setExpanded((prev) => ({ ...prev, [item.id]: true }))
                    // Also navigate to first child if none active yet
                    if (!childActive && (!isOpen || !isSidebarOpen)) {
                      setActiveSection(item.subItems[0]?.id ?? item.id)
                    }
                  } else {
                    setActiveSection(item.id)
                  }
                }}
                title={!isSidebarOpen ? item.label : undefined}
                className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group select-none`}
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

                {isSidebarOpen && (
                  <span className="flex-1 text-left truncate whitespace-nowrap animate-in fade-in duration-300">
                    {item.label}
                  </span>
                )}

                {hasChildren && isSidebarOpen && (
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
              {hasChildren && isSidebarOpen && (
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: isOpen
                      ? `${item.subItems.reduce((acc, sub) => acc + 44 + (sub.subItems && expanded[sub.id] ? sub.subItems.length * 44 : 0), 0) + 16}px`
                      : '0px',
                    opacity: isOpen ? 1 : 0
                  }}
                >
                  <div className="ml-4 pl-3 border-l border-border/50 flex flex-col gap-0.5 py-1">
                    {item.subItems.map((sub) => {
                      if (sub.subItems) {
                        const isSubOpen = expanded[sub.id]
                        const isSubChildActive = sub.subItems.some(
                          (child) => child.id === activeSection
                        )

                        return (
                          <div key={sub.id} className="flex flex-col">
                            <button
                              onClick={() => toggle(sub.id)}
                              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all duration-150 mt-1"
                              style={{
                                color: isSubChildActive ? item.color : 'var(--color-muted, #888)',
                                fontWeight: 600
                              }}
                            >
                              <span className="truncate whitespace-nowrap">{sub.label}</span>
                              <FaChevronDown
                                className="w-2.5 h-2.5 shrink-0 transition-transform duration-200"
                                style={{
                                  transform: isSubOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                                  opacity: 0.5
                                }}
                              />
                            </button>
                            <div
                              className="overflow-hidden transition-all duration-300 flex flex-col gap-0.5"
                              style={{
                                maxHeight: isSubOpen
                                  ? `${(sub.subItems?.length || 0) * 44 + 8}px`
                                  : '0px',
                                opacity: isSubOpen ? 1 : 0
                              }}
                            >
                              <div className="ml-3 pl-2 border-l border-border/40 flex flex-col gap-0.5 mt-0.5">
                                {sub.subItems.map((child) => {
                                  const isActive = activeSection === child.id
                                  return (
                                    <button
                                      key={child.id}
                                      onClick={() => setActiveSection(child.id)}
                                      className="w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all duration-150 truncate whitespace-nowrap"
                                      style={{
                                        background: isActive ? `${item.color}15` : 'transparent',
                                        color: isActive ? item.color : 'var(--color-muted, #888)',
                                        fontWeight: isActive ? 600 : 400
                                      }}
                                    >
                                      {child.label}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        )
                      }

                      const isActive = activeSection === sub.id
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setActiveSection(sub.id)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 truncate whitespace-nowrap"
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
      <div
        className={`p-3 border-t border-border shrink-0 flex items-center overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}
      >
        {isSidebarOpen && (
          <div className="text-xs text-subtle truncate animate-in fade-in duration-300">
            Life OS v1.0.0
          </div>
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 -mr-1 rounded-lg text-subtle hover:text-foreground hover:bg-surface-hover transition-colors shrink-0"
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isSidebarOpen ? (
            <FaAngleDoubleLeft className="w-3 h-3" />
          ) : (
            <FaAngleDoubleRight className="w-3 h-3" />
          )}
        </button>
      </div>
    </div>
  )
}
