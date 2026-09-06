import { useState, useRef, useEffect, useCallback } from 'react'
import {
  FaSave,
  FaBriefcase,
  FaGraduationCap,
  FaCode,
  FaStar,
  FaPhone,
  FaCertificate,
  FaAlignLeft,
  FaGlobe,
  FaTrophy,
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaBolt,
  FaUser,
  FaMapMarkerAlt,
  FaLinkedin,
  FaGithub,
  FaFacebook,
  FaTwitter,
  FaLink
} from 'react-icons/fa'

// ─── Types ────────────────────────────────────────────────────────────────────
interface BaseItem {
  id: string
  collapsed?: boolean
}
interface SummaryData {
  text: string
}
interface ExperienceItem extends BaseItem {
  company: string
  role: string
  jobType?: string
  startDate: string
  endDate: string
  location: string
  description: string
}
interface EducationItem extends BaseItem {
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa: string
}
interface ProjectItem extends BaseItem {
  name: string
  description: string
  tech: string
  url: string
  date: string
}
interface SkillItem extends BaseItem {
  name: string
  level: number
  category: string
}
interface PersonalInfo {
  photo: string
  name: string
  phone: string
  email: string
  city: string
  country: string
  jobTitle: string
  linkedin: string
  github: string
  facebook: string
  x: string
  portfolio: string
}
interface CertificationItem extends BaseItem {
  name: string
  issuer: string
  date: string
  url: string
}
interface LanguageItem extends BaseItem {
  language: string
  proficiency: string
}
interface AchievementItem extends BaseItem {
  title: string
  description: string
  date: string
}

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'contact', label: 'Contact', icon: FaPhone, color: '#5bbfb5' },
  { id: 'summary', label: 'Summary', icon: FaAlignLeft, color: '#6fa0d5' },
  { id: 'experience', label: 'Experience', icon: FaBriefcase, color: '#70b68c' },
  { id: 'education', label: 'Education', icon: FaGraduationCap, color: '#d5a85f' },
  { id: 'projects', label: 'Projects', icon: FaCode, color: '#9b8fdb' },
  { id: 'skills', label: 'Skills', icon: FaStar, color: '#dc7b7b' },
  { id: 'certifications', label: 'Certifications', icon: FaCertificate, color: '#c9954c' },
  { id: 'languages', label: 'Languages', icon: FaGlobe, color: '#8fc96b' },
  { id: 'achievements', label: 'Achievements', icon: FaTrophy, color: '#d56b97' }
]

// Single-line comma format config per section
const QUICK_FORMAT: Record<
  string,
  {
    fields: string[]
    example: string
    hint: string
  }
> = {
  experience: {
    fields: [
      'Role / Title',
      'Job Type',
      'Company',
      'Start Date',
      'End Date',
      'Location',
      'Description'
    ],
    example:
      'Senior Engineer, Full-time, Acme Corp, Jan 2022, Present, Phnom Penh, Built scalable features | Mentored juniors',
    hint: 'Dates: "Mon YYYY" or "YYYY" — use "Present" for current role — Separate description bullets with |'
  },
  education: {
    fields: ['Institution', 'Degree', 'Field of Study', 'Start Year', 'End Year', 'GPA'],
    example: 'MIT, Bachelor of Science, Computer Science, 2018, 2022, 3.9',
    hint: 'GPA is optional — leave blank with an extra comma or omit entirely'
  },
  projects: {
    fields: ['Project Name', 'Tech Stack', 'URL', 'Date', 'Description'],
    example:
      'Life OS, React / Node, https://github.com/..., Jan 2025, Personal productivity desktop app | Beautiful UI',
    hint: 'URL and Date are optional (leave blank if needed)'
  },
  skills: {
    fields: ['Skill Name', 'Category'],
    example: 'React.js, Frontend',
    hint: 'Categories: Frontend · Backend · DevOps · Design · Data · Mobile · Other'
  },
  contact: {
    fields: ['Label', 'Value'],
    example: 'Email, you@example.com',
    hint: 'Label examples: Email, LinkedIn, Phone, GitHub, Portfolio'
  },
  certifications: {
    fields: ['Name', 'Issuer', 'Date', 'URL'],
    example: 'AWS Solutions Architect, Amazon Web Services, Mar 2024, https://...',
    hint: 'Date: "Mon YYYY" — URL is optional'
  },
  languages: {
    fields: ['Language', 'Proficiency'],
    example: 'English, Fluent',
    hint: 'Proficiency: Native · Fluent · Advanced · Intermediate · Beginner'
  },
  achievements: {
    fields: ['Title', 'Date', 'Description'],
    example: '1st Place Hackathon, Nov 2023, Won regional competition with AI-powered tool',
    hint: 'Date: "Mon YYYY" or "YYYY"'
  }
}

const PROFICIENCY_LEVELS = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Beginner']
const SKILL_LEVELS = ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert']
const SKILL_CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Design', 'Data', 'Mobile', 'Other']

const uid = (): string => Math.random().toString(36).slice(2, 9)

// ─── Sub-components ───────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  type = 'text'
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
  type?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-primary transition-colors resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-primary transition-colors"
        />
      )}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function BulletField({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const points = value ? value.split('\n') : ['']

  const handleUpdate = (idx: number, newVal: string): void => {
    const newPoints = [...points]
    newPoints[idx] = newVal
    onChange(newPoints.join('\n'))
  }

  const handleAdd = (): void => {
    onChange([...points, ''].join('\n'))
  }

  const handleRemove = (idx: number): void => {
    const newPoints = points.filter((_, i) => i !== idx)
    if (newPoints.length === 0) newPoints.push('')
    onChange(newPoints.join('\n'))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const newPoints = [...points]
      newPoints.splice(idx + 1, 0, '')
      onChange(newPoints.join('\n'))
      setTimeout(() => {
        const inputs = e.currentTarget.parentElement?.parentElement?.querySelectorAll('input')
        if (inputs && inputs[idx + 1]) {
          inputs[idx + 1].focus()
        }
      }, 0)
    } else if (e.key === 'Backspace' && points[idx] === '') {
      e.preventDefault()
      if (points.length > 1) {
        handleRemove(idx)
        setTimeout(() => {
          const inputs = e.currentTarget.parentElement?.parentElement?.querySelectorAll('input')
          if (inputs && inputs[idx - 1]) {
            inputs[idx - 1].focus()
          }
        }, 0)
      }
    }
  }

  return (
    <div className="flex flex-col gap-1.5 focus-within:ring-0">
      <label className="text-xs font-semibold text-muted uppercase tracking-wide flex items-center justify-between">
        {label}
      </label>
      <div className="space-y-2">
        {points.map((p, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="mt-2 text-muted text-[10px]">●</span>
            <input
              type="text"
              value={p || ''}
              onChange={(e) => handleUpdate(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              placeholder={placeholder}
              className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={() => handleRemove(idx)}
              className="mt-1.5 text-muted hover:text-danger p-1"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          onClick={handleAdd}
          className="text-xs font-medium text-primary hover:opacity-80 flex items-center gap-1 pl-4 mt-1"
        >
          <FaPlus className="w-2.5 h-2.5" /> Add bullet point
        </button>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function EmptyState({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div
      onClick={onAdd}
      className="flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-border hover:border-primary/40 cursor-pointer group transition-all duration-200"
    >
      <FaPlus className="w-5 h-5 text-muted group-hover:text-primary mb-2 transition-colors" />
      <p className="text-sm text-muted group-hover:text-primary font-medium transition-colors">
        Add your first {label}
      </p>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function SectionBlock({
  id,
  label,
  icon: Icon,
  color,
  children,
  onAdd
}: {
  id: string
  label: string
  icon: React.ElementType
  color: string
  children: React.ReactNode
  onAdd?: () => void
}) {
  return (
    <section id={id} className="scroll-mt-4">
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${color}20` }}
            >
              <Icon style={{ color }} className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-foreground">{label}</h2>
          </div>
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80"
              style={{ background: `${color}18`, color }}
            >
              <FaPlus className="w-2.5 h-2.5" /> Add
            </button>
          )}
        </div>
        <div className="p-5">{children}</div>
      </div>
    </section>
  )
}

// ─── Collapsible entry card ───────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function EntryCard({
  collapsed,
  onToggle,
  onDelete,
  summary,
  children
}: {
  collapsed: boolean
  onToggle: () => void
  onDelete: () => void
  summary: string
  children: React.ReactNode
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-surface/60 transition-all duration-200 hover:border-border-hover">
      {/* Card header row */}
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          {summary ? (
            <p className="text-sm font-semibold text-foreground truncate">{summary}</p>
          ) : (
            <p className="text-sm text-muted italic">Untitled entry</p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-muted hover:text-danger transition-colors p-1 rounded"
        >
          <FaTrash className="w-3 h-3" />
        </button>
        <div className="text-muted p-1">
          {collapsed ? <FaChevronDown className="w-3 h-3" /> : <FaChevronUp className="w-3 h-3" />}
        </div>
      </div>
      {/* Expandable body */}
      {!collapsed && (
        <div className="px-4 pb-4 border-t border-border/50 pt-4 space-y-3 bg-card">{children}</div>
      )}
    </div>
  )
}

// ─── Quick Input Panel (single comma-separated input) ────────────────────────
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function QuickInputPanel({
  sectionId,
  color,
  label,
  onAdd,
  onClose
}: {
  sectionId: string
  color: string
  label: string
  onAdd: (values: Record<string, string>) => void
  onClose: () => void
}) {
  const fmt = QUICK_FORMAT[sectionId]
  const [raw, setRaw] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!fmt) return null

  // Map field labels → data keys per section
  const FIELD_KEYS: Record<string, string[]> = {
    experience: ['role', 'jobType', 'company', 'startDate', 'endDate', 'location', 'description'],
    education: ['institution', 'degree', 'field', 'startDate', 'endDate', 'gpa'],
    projects: ['name', 'tech', 'url', 'description'],
    skills: ['name', 'category'],
    contact: ['label', 'value'],
    certifications: ['name', 'issuer', 'date', 'url'],
    languages: ['language', 'proficiency'],
    achievements: ['title', 'date', 'description']
  }

  const keys = FIELD_KEYS[sectionId] || []

  const handleAdd = (): void => {
    const parts = raw.split(',').map((s) => s.trim())
    if (parts.filter(Boolean).length < 1) {
      setError('Please fill in at least the first field.')
      return
    }
    const values: Record<string, string> = {}
    keys.forEach((key, i) => {
      values[key] = parts[i] || ''
    })
    onAdd(values)
    setRaw('')
    setError('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 1800)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleAdd()
    }
  }

  // Live preview of parsed values
  const parts = raw.split(',').map((s) => s.trim())
  const hasContent = parts.some((p) => p.length > 0)

  return (
    <aside
      className="w-80 shrink-0 flex flex-col rounded-2xl border overflow-hidden"
      style={{ background: `${color}06`, borderColor: `${color}28` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: `${color}22`, background: `${color}10` }}
      >
        <div className="flex items-center gap-2">
          <FaBolt style={{ color }} className="w-3 h-3" />
          <span className="text-xs font-bold" style={{ color }}>
            Quick Add — {label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-muted hover:text-foreground p-1 rounded transition-colors"
        >
          <FaTimes className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Format guide */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Field Order</p>
          <div className="flex flex-wrap gap-1">
            {fmt.fields.map((f, i) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium"
                style={{
                  background: parts[i] ? `${color}18` : 'var(--life-surface)',
                  borderColor: parts[i] ? `${color}40` : 'var(--life-border)',
                  color: parts[i] ? color : 'var(--life-muted)'
                }}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full text-center leading-3.5 text-xs font-bold shrink-0 inline-flex items-center justify-center"
                  style={{ background: `${color}20`, color }}
                >
                  {i + 1}
                </span>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Example */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Example</p>
          <div
            className="px-3 py-2 rounded-lg text-xs font-mono leading-relaxed break-all cursor-pointer select-all"
            style={{
              background: `${color}0c`,
              color: `${color}cc`,
              border: `1px solid ${color}20`
            }}
            onClick={() => setRaw(fmt.example)}
            title="Click to use this example"
          >
            {fmt.example}
          </div>
          <p className="text-xs text-muted italic">↑ Click to paste example</p>
        </div>

        {/* Date hint */}
        <div
          className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs"
          style={{ background: 'var(--life-surface)' }}
        >
          <span className="shrink-0 mt-0.5">📅</span>
          <p className="text-muted leading-relaxed">{fmt.hint}</p>
        </div>

        {/* Input */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Your Input</p>
          <textarea
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value)
              setError('')
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Type values separated by commas…\n\ne.g. ${fmt.fields[0]}, ${fmt.fields[1]}${fmt.fields[2] ? ', ' + fmt.fields[2] : ''}…`}
            rows={5}
            autoFocus
            className="w-full px-3 py-2.5 rounded-xl border text-sm text-foreground placeholder:text-subtle focus:outline-none transition-colors resize-none font-mono"
            style={{
              background: 'var(--life-card)',
              borderColor: error
                ? 'var(--life-danger)'
                : hasContent
                  ? `${color}50`
                  : 'var(--life-border)'
            }}
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <p className="text-xs text-muted">
            Tip: <kbd className="px-1 py-0.5 rounded text-xs border border-border">Ctrl</kbd> +{' '}
            <kbd className="px-1 py-0.5 rounded text-xs border border-border">Enter</kbd> to add
            quickly
          </p>
        </div>

        {/* Live preview of parsed tokens */}
        {hasContent && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Preview</p>
            <div className="space-y-1">
              {fmt.fields.map((fieldLabel, i) => (
                <div key={fieldLabel} className="flex items-baseline gap-2">
                  <span className="text-xs text-muted w-24 shrink-0 truncate">{fieldLabel}</span>
                  <span
                    className="text-xs font-medium truncate"
                    style={{ color: parts[i] ? 'var(--life-foreground)' : 'var(--life-subtle)' }}
                  >
                    {parts[i] || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 pt-2 shrink-0">
        <button
          onClick={handleAdd}
          disabled={!hasContent}
          className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: success ? '#70b68c22' : `${color}1c`,
            color: success ? '#70b68c' : color,
            border: `1px solid ${success ? '#70b68c40' : `${color}30`}`
          }}
        >
          {success ? (
            <>
              <span>✓</span> Entry added!
            </>
          ) : (
            <>
              <FaPlus className="w-3 h-3" /> Add Entry
            </>
          )}
        </button>
      </div>
    </aside>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function ResumeSections() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeNav, setActiveNav] = useState('summary')
  const [quickPanelSection, setQuickPanelSection] = useState<string | null>(null)

  // ── Data state ──────────────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    photo: '',
    name: '',
    phone: '',
    email: '',
    city: '',
    country: '',
    jobTitle: '',
    linkedin: '',
    github: '',
    facebook: '',
    x: '',
    portfolio: ''
  })
  const pi = personalInfo
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const setPi = (patch: Partial<PersonalInfo>) => setPersonalInfo((p) => ({ ...p, ...patch }))

  const [summary, setSummary] = useState<SummaryData>({ text: '' })
  const [experiences, setExperiences] = useState<ExperienceItem[]>([])
  const [educations, setEducations] = useState<EducationItem[]>([])
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [skills, setSkills] = useState<SkillItem[]>([])
  const [certifications, setCertifications] = useState<CertificationItem[]>([])
  const [languages, setLanguages] = useState<LanguageItem[]>([])
  const [achievements, setAchievements] = useState<AchievementItem[]>([])

  // ── Load/Save data ──────────────────────────────────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    async function loadData() {
      try {
        const data = await (window as any).api.storeGet('resume-data')
        if (data) {
          if (data.personalInfo) setPersonalInfo(data.personalInfo)
          if (data.summary) setSummary(data.summary)
          if (data.experiences) setExperiences(data.experiences)
          if (data.educations) setEducations(data.educations)
          if (data.projects) setProjects(data.projects)
          if (data.skills) setSkills(data.skills)
          if (data.certifications) setCertifications(data.certifications)
          if (data.languages) setLanguages(data.languages)
          if (data.achievements) setAchievements(data.achievements)
        }
      } catch (err) {
        console.error('Failed to load resume data', err)
      } finally {
        setIsLoaded(true)
      }
    }
    loadData()
  }, [])

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const dataToSave = {
        personalInfo,
        summary,
        experiences,
        educations,
        projects,
        skills,
        certifications,
        languages,
        achievements
      }
      await (window as any).api.storeSet('resume-data', dataToSave)
    } catch (err) {
      console.error('Failed to save resume data', err)
    } finally {
      setTimeout(() => setIsSaving(false), 600)
    }
  }

  // ── IntersectionObserver for active nav highlight ──────────────────────────
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveNav(entry.target.id)
        })
      },
      { root: container, rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )
    NAV_ITEMS.forEach(({ id }) => {
      const el = container.querySelector(`#${id}`)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const scrollTo = (id: string) => {
    const container = scrollContainerRef.current
    const target = container?.querySelector(`#${id}`)
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveNav(id)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleNavClick = (id: string) => {
    scrollTo(id)
    // Contact & Summary have no quick-add panel
    const noPanel = ['contact', 'summary']
    if (quickPanelSection === id || noPanel.includes(id)) {
      setQuickPanelSection(null)
    } else {
      setQuickPanelSection(id)
    }
  }

  // ── Collapse toggle helper ──────────────────────────────────────────────────
  const toggleCollapse = useCallback(
    <T extends BaseItem>(setter: React.Dispatch<React.SetStateAction<T[]>>, id: string) => {
      setter((p) => p.map((e) => (e.id === id ? { ...e, collapsed: !e.collapsed } : e)))
    },
    []
  )

  // ── Generic updaters ────────────────────────────────────────────────────────
  const upd = <T extends BaseItem>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    id: string,
    patch: Partial<T>
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  ) => setter((p) => p.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const del = <T extends BaseItem>(setter: React.Dispatch<React.SetStateAction<T[]>>, id: string) =>
    setter((p) => p.filter((e) => e.id !== id))

  // ── Quick-add handlers ──────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleQuickAdd = (sectionId: string, values: Record<string, string>) => {
    switch (sectionId) {
      case 'experience':
        setExperiences((p) => [
          {
            id: uid(),
            collapsed: false,
            company: values.company || '',
            role: values.role || '',
            jobType: values.jobType || '',
            startDate: values.startDate || '',
            endDate: values.endDate || '',
            location: values.location || '',
            description: (values.description || '').replace(/\s*\|\s*/g, '\n')
          },
          ...p
        ])
        break
      case 'education':
        setEducations((p) => [
          {
            id: uid(),
            collapsed: false,
            institution: values.institution || '',
            degree: values.degree || '',
            field: values.field || '',
            startDate: values.startDate || '',
            endDate: values.endDate || '',
            gpa: values.gpa || ''
          },
          ...p
        ])
        break
      case 'projects':
        setProjects((p) => [
          {
            id: uid(),
            collapsed: false,
            name: values.name || '',
            description: (values.description || '').replace(/\s*\|\s*/g, '\n'),
            tech: values.tech || '',
            url: values.url || '',
            date: values.date || ''
          },
          ...p
        ])
        break
      case 'skills':
        setSkills((p) => [
          {
            id: uid(),
            collapsed: false,
            name: values.name || '',
            level: 3,
            category: values.category || 'Frontend'
          },
          ...p
        ])
        break
      // contact is a single structured form — no quick-add
      case 'certifications':
        setCertifications((p) => [
          {
            id: uid(),
            collapsed: false,
            name: values.name || '',
            issuer: values.issuer || '',
            date: values.date || '',
            url: values.url || ''
          },
          ...p
        ])
        break
      case 'languages':
        setLanguages((p) => [
          {
            id: uid(),
            collapsed: false,
            language: values.language || '',
            proficiency: values.proficiency || 'Intermediate'
          },
          ...p
        ])
        break
      case 'achievements':
        setAchievements((p) => [
          {
            id: uid(),
            collapsed: false,
            title: values.title || '',
            description: values.description || '',
            date: values.date || ''
          },
          ...p
        ])
        break
    }
  }

  // ── Inline "add empty" fallback ─────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const addExp = () =>
    setExperiences((p) => [
      {
        id: uid(),
        collapsed: false,
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        location: '',
        description: ''
      },
      ...p
    ])
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const addEdu = () =>
    setEducations((p) => [
      {
        id: uid(),
        collapsed: false,
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: ''
      },
      ...p
    ])
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const addProj = () =>
    setProjects((p) => [
      { id: uid(), collapsed: false, name: '', description: '', tech: '', url: '', date: '' },
      ...p
    ])
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const addSkill = () =>
    setSkills((p) => [
      { id: uid(), collapsed: false, name: '', level: 3, category: 'Frontend' },
      ...p
    ])

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const addCert = () =>
    setCertifications((p) => [
      { id: uid(), collapsed: false, name: '', issuer: '', date: '', url: '' },
      ...p
    ])
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const addLang = () =>
    setLanguages((p) => [
      { id: uid(), collapsed: false, language: '', proficiency: 'Intermediate' },
      ...p
    ])
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const addAch = () =>
    setAchievements((p) => [
      { id: uid(), collapsed: false, title: '', description: '', date: '' },
      ...p
    ])

  const qpNav = quickPanelSection ? NAV_ITEMS.find((n) => n.id === quickPanelSection) : null

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-4 min-h-0 flex-1 overflow-hidden p-4">
      {/* ── Left sticky nav ─────────────────────────────────────────────────── */}
      <aside className="w-44 shrink-0 overflow-y-auto pl-1">
        <div className="sticky top-0 flex flex-col gap-0.5 pt-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon, color }) => {
            const isActive = activeNav === id
            const isOpen = quickPanelSection === id
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-left group"
                style={{
                  background: isActive ? `${color}1a` : 'transparent',
                  color: isActive ? color : 'var(--life-muted)'
                }}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                {isOpen && !['summary', 'contact'].includes(id) && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                    style={{ background: color }}
                  />
                )}
              </button>
            )
          })}

          <div className="mt-6 px-1">
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

      {/* ── Scrollable main content ──────────────────────────────────────────── */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-5 min-w-0 pr-1 pb-8">
        {/* ══ CONTACT / PERSONAL INFO ══════════════════════════════════════ */}
        <SectionBlock id="contact" label="Personal Info" icon={FaPhone} color="#5bbfb5">
          <div className="space-y-4">
            {/* Identity */}
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <FaUser className="w-3 h-3" /> Identity
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide">
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-4 bg-surface rounded-xl border border-border p-3 transition-colors hover:border-border-hover">
                    {pi.photo ? (
                      <div className="relative group shrink-0">
                        <img
                          src={`file:///${pi.photo.replace(/\\/g, '/')}`}
                          alt="Profile"
                          className="w-14 h-14 rounded-full object-cover border-2 border-border shadow-sm"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-card border-2 border-dashed border-border flex items-center justify-center text-[10px] text-muted shrink-0 text-center leading-tight">
                        No
                        <br />
                        photo
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] as File & { path: string }
                          if (file?.path) {
                            setPi({ photo: file.path })
                          }
                        }}
                        className="text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer text-muted-foreground focus:outline-none w-full"
                      />
                      {pi.photo && (
                        <span
                          className="text-xs text-muted truncate pr-2 opacity-60"
                          title={pi.photo}
                        >
                          {pi.photo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Field
                  label="Full Name"
                  value={pi.name}
                  onChange={(v) => setPi({ name: v })}
                  placeholder="Your Full Name"
                />
                <Field
                  label="Job Title / Role"
                  value={pi.jobTitle}
                  onChange={(v) => setPi({ jobTitle: v })}
                  placeholder="Software Engineer"
                />
                <Field
                  label="Phone"
                  value={pi.phone}
                  onChange={(v) => setPi({ phone: v })}
                  placeholder="+855 12 345 678"
                />
                <Field
                  label="Email"
                  value={pi.email}
                  onChange={(v) => setPi({ email: v })}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <FaMapMarkerAlt className="w-3 h-3" /> Location
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="City"
                  value={pi.city}
                  onChange={(v) => setPi({ city: v })}
                  placeholder="Phnom Penh"
                />
                <Field
                  label="Country"
                  value={pi.country}
                  onChange={(v) => setPi({ country: v })}
                  placeholder="Cambodia"
                />
              </div>
            </div>

            {/* Social & Web */}
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <FaGlobe className="w-3 h-3" /> Social & Web
              </p>
              <div className="grid grid-cols-2 gap-3">
                {/* LinkedIn */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide flex items-center gap-1">
                    <FaLinkedin className="w-3 h-3" style={{ color: '#0a66c2' }} /> LinkedIn
                  </label>
                  <input
                    value={pi.linkedin}
                    onChange={(e) => setPi({ linkedin: e.target.value })}
                    placeholder="linkedin.com/in/yourname"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                {/* GitHub */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide flex items-center gap-1">
                    <FaGithub className="w-3 h-3" /> GitHub
                  </label>
                  <input
                    value={pi.github}
                    onChange={(e) => setPi({ github: e.target.value })}
                    placeholder="github.com/yourname"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                {/* Facebook */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide flex items-center gap-1">
                    <FaFacebook className="w-3 h-3" style={{ color: '#1877f2' }} /> Facebook
                  </label>
                  <input
                    value={pi.facebook}
                    onChange={(e) => setPi({ facebook: e.target.value })}
                    placeholder="facebook.com/yourname"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                {/* X / Twitter */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide flex items-center gap-1">
                    <FaTwitter className="w-3 h-3" style={{ color: '#1da1f2' }} /> X (Twitter)
                  </label>
                  <input
                    value={pi.x}
                    onChange={(e) => setPi({ x: e.target.value })}
                    placeholder="x.com/yourhandle"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                {/* Portfolio */}
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-xs font-semibold text-muted uppercase tracking-wide flex items-center gap-1">
                    <FaLink className="w-3 h-3" /> Portfolio / Website
                  </label>
                  <input
                    value={pi.portfolio}
                    onChange={(e) => setPi({ portfolio: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </SectionBlock>

        {/* ══ SUMMARY ═════════════════════════════════════════════════════════ */}
        <SectionBlock id="summary" label="Summary" icon={FaAlignLeft} color="#6fa0d5">
          <div className="flex flex-col gap-2">
            <textarea
              value={summary.text}
              onChange={(e) => setSummary({ text: e.target.value })}
              placeholder="Write a short, compelling professional summary. E.g., 'Full-stack developer with 5+ years building scalable web apps...'"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-primary transition-colors resize-none"
            />
            <p className="text-xs text-muted text-right">{summary.text.length} / 300 chars</p>
          </div>
        </SectionBlock>

        {/* ══ EXPERIENCE ═══════════════════════════════════════════════════════ */}
        <SectionBlock
          id="experience"
          label="Experience"
          icon={FaBriefcase}
          color="#70b68c"
          onAdd={() => {
            addExp()
            setQuickPanelSection('experience')
          }}
        >
          {experiences.length === 0 ? (
            <EmptyState
              label="work experience"
              onAdd={() => {
                addExp()
                setQuickPanelSection('experience')
              }}
            />
          ) : (
            <div className="space-y-3">
              {experiences.map((exp) => (
                <EntryCard
                  key={exp.id}
                  collapsed={!!exp.collapsed}
                  summary={[exp.role, exp.company].filter(Boolean).join(' @ ')}
                  onToggle={() => toggleCollapse(setExperiences, exp.id)}
                  onDelete={() => del(setExperiences, exp.id)}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Company"
                      value={exp.company}
                      onChange={(v) => upd(setExperiences, exp.id, { company: v })}
                      placeholder="Acme Corp"
                    />
                    <Field
                      label="Role / Title"
                      value={exp.role}
                      onChange={(v) => upd(setExperiences, exp.id, { role: v })}
                      placeholder="Senior Engineer"
                    />
                    <Field
                      label="Job Type"
                      value={exp.jobType || ''}
                      onChange={(v) => upd(setExperiences, exp.id, { jobType: v })}
                      placeholder="Full-time, Internship"
                    />
                    <Field
                      label="Start Date"
                      value={exp.startDate}
                      onChange={(v) => upd(setExperiences, exp.id, { startDate: v })}
                      placeholder="Jan 2022"
                    />
                    <Field
                      label="End Date"
                      value={exp.endDate}
                      onChange={(v) => upd(setExperiences, exp.id, { endDate: v })}
                      placeholder="Present"
                    />
                  </div>
                  <Field
                    label="Location"
                    value={exp.location}
                    onChange={(v) => upd(setExperiences, exp.id, { location: v })}
                    placeholder="Phnom Penh, Cambodia"
                  />
                  <BulletField
                    label="Description (Bullet Points)"
                    value={exp.description}
                    onChange={(v) => upd(setExperiences, exp.id, { description: v })}
                    placeholder="Key responsibilities and achievements..."
                  />
                </EntryCard>
              ))}
            </div>
          )}
        </SectionBlock>

        {/* ══ EDUCATION ════════════════════════════════════════════════════════ */}
        <SectionBlock
          id="education"
          label="Education"
          icon={FaGraduationCap}
          color="#d5a85f"
          onAdd={() => {
            addEdu()
            setQuickPanelSection('education')
          }}
        >
          {educations.length === 0 ? (
            <EmptyState
              label="education"
              onAdd={() => {
                addEdu()
                setQuickPanelSection('education')
              }}
            />
          ) : (
            <div className="space-y-3">
              {educations.map((edu) => (
                <EntryCard
                  key={edu.id}
                  collapsed={!!edu.collapsed}
                  summary={[edu.degree, edu.institution].filter(Boolean).join(' — ')}
                  onToggle={() => toggleCollapse(setEducations, edu.id)}
                  onDelete={() => del(setEducations, edu.id)}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Institution"
                      value={edu.institution}
                      onChange={(v) => upd(setEducations, edu.id, { institution: v })}
                      placeholder="Harvard University"
                    />
                    <Field
                      label="Degree"
                      value={edu.degree}
                      onChange={(v) => upd(setEducations, edu.id, { degree: v })}
                      placeholder="Bachelor of Science"
                    />
                    <Field
                      label="Field"
                      value={edu.field}
                      onChange={(v) => upd(setEducations, edu.id, { field: v })}
                      placeholder="Computer Science"
                    />
                    <Field
                      label="GPA"
                      value={edu.gpa}
                      onChange={(v) => upd(setEducations, edu.id, { gpa: v })}
                      placeholder="3.8 / 4.0"
                    />
                    <Field
                      label="Start Year"
                      value={edu.startDate}
                      onChange={(v) => upd(setEducations, edu.id, { startDate: v })}
                      placeholder="2018"
                    />
                    <Field
                      label="End Year"
                      value={edu.endDate}
                      onChange={(v) => upd(setEducations, edu.id, { endDate: v })}
                      placeholder="2022"
                    />
                  </div>
                </EntryCard>
              ))}
            </div>
          )}
        </SectionBlock>

        {/* ══ PROJECTS ═════════════════════════════════════════════════════════ */}
        <SectionBlock
          id="projects"
          label="Projects"
          icon={FaCode}
          color="#9b8fdb"
          onAdd={() => {
            addProj()
            setQuickPanelSection('projects')
          }}
        >
          {projects.length === 0 ? (
            <EmptyState
              label="project"
              onAdd={() => {
                addProj()
                setQuickPanelSection('projects')
              }}
            />
          ) : (
            <div className="space-y-3">
              {projects.map((proj) => (
                <EntryCard
                  key={proj.id}
                  collapsed={!!proj.collapsed}
                  summary={proj.name || 'Unnamed Project'}
                  onToggle={() => toggleCollapse(setProjects, proj.id)}
                  onDelete={() => del(setProjects, proj.id)}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Project Name"
                      value={proj.name}
                      onChange={(v) => upd(setProjects, proj.id, { name: v })}
                      placeholder="Life OS"
                    />
                    <Field
                      label="URL / Link"
                      value={proj.url}
                      onChange={(v) => upd(setProjects, proj.id, { url: v })}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label="Tech Stack / Tools"
                      value={proj.tech}
                      onChange={(val) => upd(setProjects, proj.id, { tech: val })}
                      placeholder="React, Node.js, ..."
                    />
                    <Field
                      label="Date (Optional)"
                      value={proj.date}
                      onChange={(val) => upd(setProjects, proj.id, { date: val })}
                      placeholder="e.g. Jan 2025"
                    />
                  </div>
                  <BulletField
                    label="Description (Bullet Points)"
                    value={proj.description}
                    onChange={(v) => upd(setProjects, proj.id, { description: v })}
                    placeholder="Project details..."
                  />
                </EntryCard>
              ))}
            </div>
          )}
        </SectionBlock>

        {/* ══ SKILLS ═══════════════════════════════════════════════════════════ */}
        <SectionBlock
          id="skills"
          label="Skills"
          icon={FaStar}
          color="#dc7b7b"
          onAdd={() => {
            addSkill()
            setQuickPanelSection('skills')
          }}
        >
          {skills.length === 0 ? (
            <EmptyState
              label="skill"
              onAdd={() => {
                addSkill()
                setQuickPanelSection('skills')
              }}
            />
          ) : (
            <div className="space-y-3">
              {skills.map((skill) => (
                <EntryCard
                  key={skill.id}
                  collapsed={!!skill.collapsed}
                  summary={skill.name ? `${skill.name} (${skill.category})` : ''}
                  onToggle={() => toggleCollapse(setSkills, skill.id)}
                  onDelete={() => del(setSkills, skill.id)}
                >
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <Field
                      label="Skill Name"
                      value={skill.name}
                      onChange={(v) => upd(setSkills, skill.id, { name: v })}
                      placeholder="React.js"
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wide">
                        Category
                      </label>
                      <select
                        value={skill.category}
                        onChange={(e) => upd(setSkills, skill.id, { category: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                      >
                        {SKILL_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wide">
                        Level — {SKILL_LEVELS[skill.level - 1]}
                      </label>
                      <div className="flex items-center gap-1 h-9 px-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => upd(setSkills, skill.id, { level: n })}
                            className="flex-1 h-5 rounded transition-all duration-150"
                            style={{
                              background: n <= skill.level ? '#dc7b7b' : 'var(--life-border)',
                              transform: n <= skill.level ? 'scaleY(1.3)' : 'scaleY(1)'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </EntryCard>
              ))}
              {/* Chip preview */}
              {skills.some((s) => s.name) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills
                    .filter((s) => s.name)
                    .map((s) => (
                      <span
                        key={s.id}
                        className="text-xs font-medium px-2.5 py-1 rounded-full border border-border text-foreground bg-card"
                      >
                        {s.name}
                      </span>
                    ))}
                </div>
              )}
            </div>
          )}
        </SectionBlock>

        {/* ══ CERTIFICATIONS ═══════════════════════════════════════════════════ */}
        <SectionBlock
          id="certifications"
          label="Certifications"
          icon={FaCertificate}
          color="#c9954c"
          onAdd={() => {
            addCert()
            setQuickPanelSection('certifications')
          }}
        >
          {certifications.length === 0 ? (
            <EmptyState
              label="certification"
              onAdd={() => {
                addCert()
                setQuickPanelSection('certifications')
              }}
            />
          ) : (
            <div className="space-y-3">
              {certifications.map((cert) => (
                <EntryCard
                  key={cert.id}
                  collapsed={!!cert.collapsed}
                  summary={cert.name || ''}
                  onToggle={() => toggleCollapse(setCertifications, cert.id)}
                  onDelete={() => del(setCertifications, cert.id)}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Name"
                      value={cert.name}
                      onChange={(v) => upd(setCertifications, cert.id, { name: v })}
                      placeholder="AWS Solutions Architect"
                    />
                    <Field
                      label="Issuer"
                      value={cert.issuer}
                      onChange={(v) => upd(setCertifications, cert.id, { issuer: v })}
                      placeholder="Amazon Web Services"
                    />
                    <Field
                      label="Date"
                      value={cert.date}
                      onChange={(v) => upd(setCertifications, cert.id, { date: v })}
                      placeholder="March 2024"
                    />
                    <Field
                      label="URL"
                      value={cert.url}
                      onChange={(v) => upd(setCertifications, cert.id, { url: v })}
                      placeholder="https://..."
                    />
                  </div>
                </EntryCard>
              ))}
            </div>
          )}
        </SectionBlock>

        {/* ══ LANGUAGES ════════════════════════════════════════════════════════ */}
        <SectionBlock
          id="languages"
          label="Languages"
          icon={FaGlobe}
          color="#8fc96b"
          onAdd={() => {
            addLang()
            setQuickPanelSection('languages')
          }}
        >
          {languages.length === 0 ? (
            <EmptyState
              label="language"
              onAdd={() => {
                addLang()
                setQuickPanelSection('languages')
              }}
            />
          ) : (
            <div className="space-y-3">
              {languages.map((lang) => (
                <EntryCard
                  key={lang.id}
                  collapsed={!!lang.collapsed}
                  summary={lang.language ? `${lang.language} — ${lang.proficiency}` : ''}
                  onToggle={() => toggleCollapse(setLanguages, lang.id)}
                  onDelete={() => del(setLanguages, lang.id)}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Language"
                      value={lang.language}
                      onChange={(v) => upd(setLanguages, lang.id, { language: v })}
                      placeholder="English"
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wide">
                        Proficiency
                      </label>
                      <select
                        value={lang.proficiency}
                        onChange={(e) =>
                          upd(setLanguages, lang.id, { proficiency: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                      >
                        {PROFICIENCY_LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </EntryCard>
              ))}
              {languages.some((l) => l.language) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {languages
                    .filter((l) => l.language)
                    .map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card"
                      >
                        <span className="text-xs font-semibold text-foreground">{l.language}</span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                          style={{ background: '#8fc96b20', color: '#8fc96b' }}
                        >
                          {l.proficiency}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </SectionBlock>

        {/* ══ ACHIEVEMENTS ═════════════════════════════════════════════════════ */}
        <SectionBlock
          id="achievements"
          label="Achievements"
          icon={FaTrophy}
          color="#d56b97"
          onAdd={() => {
            addAch()
            setQuickPanelSection('achievements')
          }}
        >
          {achievements.length === 0 ? (
            <EmptyState
              label="achievement"
              onAdd={() => {
                addAch()
                setQuickPanelSection('achievements')
              }}
            />
          ) : (
            <div className="space-y-3">
              {achievements.map((ach) => (
                <EntryCard
                  key={ach.id}
                  collapsed={!!ach.collapsed}
                  summary={ach.title || ''}
                  onToggle={() => toggleCollapse(setAchievements, ach.id)}
                  onDelete={() => del(setAchievements, ach.id)}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Title"
                      value={ach.title}
                      onChange={(v) => upd(setAchievements, ach.id, { title: v })}
                      placeholder="1st Place Hackathon"
                    />
                    <Field
                      label="Date"
                      value={ach.date}
                      onChange={(v) => upd(setAchievements, ach.id, { date: v })}
                      placeholder="November 2023"
                    />
                  </div>
                  <Field
                    label="Description"
                    value={ach.description}
                    onChange={(v) => upd(setAchievements, ach.id, { description: v })}
                    placeholder="Brief description..."
                    multiline
                  />
                </EntryCard>
              ))}
            </div>
          )}
        </SectionBlock>
      </div>

      {/* ── Right Quick Input Panel ──────────────────────────────────────────── */}
      {qpNav && (
        <QuickInputPanel
          sectionId={qpNav.id}
          color={qpNav.color}
          label={qpNav.label}
          onAdd={(values) => handleQuickAdd(qpNav.id, values)}
          onClose={() => setQuickPanelSection(null)}
        />
      )}
    </div>
  )
}
