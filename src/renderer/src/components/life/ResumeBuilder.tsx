import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import {
  FaBriefcase,
  FaGraduationCap,
  FaCode,
  FaStar,
  FaCertificate,
  FaGlobe,
  FaTrophy,
  FaAlignLeft,
  FaGripVertical,
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaFileCode,
  FaFilePdf,
  FaSpinner,
  FaCopy,
  FaCheck,
  FaArrowLeft
} from 'react-icons/fa'

// ─── Types (mirrored from ResumeSections) ─────────────────────────────────────
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

interface ResumeData {
  personalInfo: PersonalInfo
  summary: SummaryData
  experiences: ExperienceItem[]
  educations: EducationItem[]
  projects: ProjectItem[]
  skills: SkillItem[]
  certifications: CertificationItem[]
  languages: LanguageItem[]
  achievements: AchievementItem[]
}

// Canvas item: a section header or a record within a section
interface CanvasSection {
  sectionId: string
  label: string
  records: string[] // record IDs
}

type SectionKey =
  | 'summary'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'languages'
  | 'achievements'

const SECTION_META: Record<SectionKey, { label: string; icon: React.ElementType; color: string }> =
  {
    summary: { label: 'Summary', icon: FaAlignLeft, color: '#6fa0d5' },
    experience: { label: 'Experience', icon: FaBriefcase, color: '#70b68c' },
    education: { label: 'Education', icon: FaGraduationCap, color: '#d5a85f' },
    projects: { label: 'Projects', icon: FaCode, color: '#9b8fdb' },
    skills: { label: 'Skills', icon: FaStar, color: '#dc7b7b' },
    certifications: { label: 'Certifications', icon: FaCertificate, color: '#c9954c' },
    languages: { label: 'Languages', icon: FaGlobe, color: '#8fc96b' },
    achievements: { label: 'Achievements', icon: FaTrophy, color: '#d56b97' }
  }

function getRecordLabel(sectionId: SectionKey, record: any): string {
  switch (sectionId) {
    case 'summary':
      return 'Summary text'
    case 'experience':
      return `${record.role || 'Role'} @ ${record.company || 'Company'}`
    case 'education':
      return `${record.degree || 'Degree'} - ${record.institution || 'Institution'}`
    case 'projects':
      return record.name || 'Project'
    case 'skills':
      return `${record.category || 'Skill'}: ${record.name || ''}`
    case 'certifications':
      return record.name || 'Certification'
    case 'languages':
      return `${record.language || 'Language'} (${record.proficiency || ''})`
    case 'achievements':
      return record.title || 'Achievement'
    default:
      return 'Item'
  }
}

function getRecordsForSection(data: ResumeData, sectionId: SectionKey): any[] {
  switch (sectionId) {
    case 'summary':
      return data.summary.text ? [{ id: 'summary-text', text: data.summary.text }] : []
    case 'experience':
      return data.experiences
    case 'education':
      return data.educations
    case 'projects':
      return data.projects
    case 'skills':
      return data.skills
    case 'certifications':
      return data.certifications
    case 'languages':
      return data.languages
    case 'achievements':
      return data.achievements
    default:
      return []
  }
}

// ─── LaTeX escaping ───────────────────────────────────────────────────────────
function esc(s: string): string {
  return s.replace(/\\/g, '\\textbackslash{}').replace(/[&%$#_{}~^]/g, (m) => '\\' + m)
}

// ─── LaTeX Generation ─────────────────────────────────────────────────────────
function generateLatex(data: ResumeData, canvas: CanvasSection[]): string {
  const pi = data.personalInfo
  let tex = `%
%Academic CV LaTeX Template
%
\\documentclass[a4paper,11pt]{article}

\\usepackage{latexsym}
\\usepackage{xcolor}
\\usepackage{float}
\\usepackage{ragged2e}
\\usepackage[empty]{fullpage}
\\usepackage{wrapfig}
\\usepackage{tabularx}
\\usepackage{titlesec}
\\usepackage{geometry}
\\usepackage{marvosym}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage{fancyhdr}
\\usepackage{multicol}
\\usepackage{graphicx}
\\usepackage[scaled]{helvet}
\\renewcommand{\\familydefault}{\\sfdefault}
\\usepackage[T1]{fontenc}
\\usepackage{fontawesome5}
\\usepackage{ragged2e}

\\definecolor{darkblue}{RGB}{0,0,139}
\\setlength{\\multicolsep}{0pt}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\geometry{left=1.4cm, top=0.8cm, right=1.2cm, bottom=1cm}
\\setlength{\\footskip}{5pt}

\\usepackage[hidelinks]{hyperref}
\\hypersetup{colorlinks=true,linkcolor=darkblue,filecolor=darkblue,urlcolor=darkblue}

\\usepackage[most]{tcolorbox}
\\tcbset{frame code={},center title,left=0pt,right=0pt,top=0pt,bottom=0pt,colback=gray!20,colframe=white,width=\\dimexpr\\textwidth\\relax,enlarge left by=-2mm,boxsep=4pt,arc=0pt,outer arc=0pt}

\\urlstyle{same}
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{\\vspace{-4pt}\\scshape\\raggedright\\large}{}{0em}{}[\\color{black}\\titlerule \\vspace{-7pt}]

\\newcommand{\\resumeItem}[2]{\\item{\\textbf{#1}{\\hspace{0.5mm}#2 \\vspace{-0.5mm}}}}
\\newcommand{\\resumeSubheading}[4]{\\vspace{0.5mm}\\item\\begin{tabular*}{0.98\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}\\textbf{#1} & \\textit{\\footnotesize{#4}} \\\\\\textit{\\footnotesize{#3}} & \\footnotesize{#2} \\\\\\end{tabular*}\\vspace{-2.4mm}}
\\newcommand{\\resumeProject}[4]{\\vspace{0.5mm}\\item\\begin{tabular*}{0.98\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}\\textbf{#1} & \\textit{\\footnotesize{#3}} \\\\\\footnotesize{\\textit{#2}} & \\footnotesize{#4}\\end{tabular*}\\vspace{-2.4mm}}
\\newcommand{\\resumeSubItem}[2]{\\resumeItem{#1}{#2}\\vspace{-4pt}}
\\renewcommand{\\labelitemi}{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=*,labelsep=1mm]}
\\newcommand{\\resumeHeadingSkillStart}{\\begin{itemize}[leftmargin=*,itemsep=1.7mm, rightmargin=2ex]}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=*,labelsep=1mm,itemsep=0.5mm]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}\\vspace{2mm}}
\\newcommand{\\resumeHeadingSkillEnd}{\\end{itemize}\\vspace{-2mm}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-2mm}}
\\newcommand{\\cvsection}[1]{\\vspace{2mm}\\begin{tcolorbox}\\textbf{\\large #1}\\end{tcolorbox}\\vspace{-4mm}}
\\newcolumntype{L}{>{\\raggedright\\arraybackslash}X}%
\\newcolumntype{R}{>{\\raggedleft\\arraybackslash}X}%
\\newcolumntype{C}{>{\\centering\\arraybackslash}X}%
\\newcommand{\\socialicon}[1]{\\raisebox{-0.05em}{\\resizebox{!}{1em}{#1}}}
\\newcommand{\\headerfont}{\\fontfamily{phv}\\selectfont}

\\begin{document}
\\headerfont

\\begin{minipage}[t]{0.70\\textwidth}
    \\vspace{-2mm}
    \\raggedright
    {\\Huge\\bfseries ${esc(pi.name || 'Your Name')}}\\\\[3mm]
    {\\LARGE\\bfseries ${esc(pi.jobTitle || 'Your Title')}}\\\\[5mm]
    \\small
    ${pi.phone ? `\\socialicon{\\faPhone}\\kern1mm ${esc(pi.phone)} \\quad` : ''}
    ${pi.email ? `\\socialicon{\\faEnvelope}\\kern1mm \\href{mailto:${esc(pi.email)}}{${esc(pi.email)}}` : ''}
    ${pi.portfolio ? `\\socialicon{\\faGlobe}\\kern1mm \\href{${esc(pi.portfolio)}}{Personal Portfolio} \\quad` : ''}
    ${pi.linkedin ? `\\socialicon{\\faLinkedin}\\kern1mm \\href{${esc(pi.linkedin)}}{LinkedIn} \\quad` : ''}
    ${pi.github ? `\\socialicon{\\faGithub}\\kern1mm \\href{${esc(pi.github)}}{GitHub} \\quad` : ''}
    \\normalsize
    ${pi.city || pi.country ? `${esc([pi.city, pi.country].filter(Boolean).join(', '))}` : ''}
    \\vspace{3mm}
\\end{minipage}%
\\hfill
\\begin{minipage}[t]{0.28\\textwidth}
    \\vspace{-8mm}
    \\raggedleft
    ${pi.photo ? `\\includegraphics[width=3.6cm,height=4.8cm,keepaspectratio]{${pi.photo.replace(/\\/g, '/')}}` : ''}
\\end{minipage}

\\vspace{4mm}
\\vspace{-10mm}
`

  for (const section of canvas) {
    const sid = section.sectionId as SectionKey
    const records = getRecordsForSection(data, sid)
    const selectedRecords = section.records
      .map((rid) => records.find((r) => r.id === rid))
      .filter(Boolean)

    if (selectedRecords.length === 0) continue

    switch (sid) {
      case 'summary':
        tex += `\n\\section{\\textbf{Summary}}\n\\justifying{${esc(selectedRecords[0]?.text || '')}}\n`
        break

      case 'experience':
        tex += `\n\\section{\\textbf{Experience}}\n\\vspace{-0.4mm}\n\\resumeSubHeadingListStart\n`
        for (const r of selectedRecords) {
          const exp = r as ExperienceItem
          tex += `\\resumeSubheading\n    {${esc(exp.company)}}{${esc(exp.location)}}{${esc(exp.role)}}{${esc(exp.startDate)}${exp.endDate ? ` - ${esc(exp.endDate)}` : ''}}\n`
          if (exp.description) {
            tex += `\\resumeItemListStart\n    \\item ${esc(exp.description)}\n\\resumeItemListEnd\n`
          }
        }
        tex += `\\resumeSubHeadingListEnd\n`
        break

      case 'education':
        tex += `\n\\section{\\textbf{Education}}\n\\vspace{-0.4mm}\n\\resumeSubHeadingListStart\n`
        for (const r of selectedRecords) {
          const ed = r as EducationItem
          tex += `\\resumeSubheading\n    {${esc(ed.institution)}}{${esc(ed.gpa ? `GPA: ${ed.gpa}` : '')}}{${esc(`${ed.degree}${ed.field ? ` in ${ed.field}` : ''}`)}}{${esc(ed.startDate)}${ed.endDate ? ` - ${esc(ed.endDate)}` : ''}}\n`
        }
        tex += `\\resumeSubHeadingListEnd\n`
        break

      case 'projects':
        tex += `\n\\section{\\textbf{Projects}}\n\\vspace{-0.4mm}\n\\resumeSubHeadingListStart\n`
        for (const r of selectedRecords) {
          const pr = r as ProjectItem
          tex += `\\resumeProject\n    {${esc(pr.name)}}{Tools: ${esc(pr.tech)}}{}{${pr.url ? `{}[\\href{${esc(pr.url)}}{\\textcolor{darkblue}{\\faGithub}}]` : ''}}\n`
          if (pr.description) {
            tex += `\\resumeItemListStart\n    \\item ${esc(pr.description)}\n\\resumeItemListEnd\n`
          }
        }
        tex += `\\resumeSubHeadingListEnd\n`
        break

      case 'skills': {
        tex += `\n\\section{\\textbf{Skills}}\n\\vspace{-0.4mm}\n\\resumeHeadingSkillStart\n`
        const grouped: Record<string, string[]> = {}
        for (const r of selectedRecords) {
          const sk = r as SkillItem
          const cat = sk.category || 'Other'
          if (!grouped[cat]) grouped[cat] = []
          grouped[cat].push(sk.name)
        }
        for (const [cat, names] of Object.entries(grouped)) {
          tex += `\\resumeSubItem{${esc(cat)}:}{${esc(names.join(', '))}}\n`
        }
        tex += `\\resumeHeadingSkillEnd\n`
        break
      }

      case 'certifications':
        tex += `\n\\section{\\textbf{Certifications}}\n\\vspace{-0.2mm}\n\\resumeSubHeadingListStart\n`
        for (const r of selectedRecords) {
          const c = r as CertificationItem
          tex += `\\resumeProject{${esc(c.name)}}{${esc(c.issuer)}}{${esc(c.date)}}{${c.url ? `{}[\\href{${esc(c.url)}}{\\textcolor{darkblue}{\\faGlobe}}]` : ''}}\n`
        }
        tex += `\\resumeSubHeadingListEnd\n`
        break

      case 'languages':
        tex += `\n\\section{\\textbf{Languages}}\n\\vspace{-0.4mm}\n\\small{\n`
        const langLines = selectedRecords.map((r) => {
          const l = r as LanguageItem
          return `\\textbf{${esc(l.language)}}: ${esc(l.proficiency)}`
        })
        tex += langLines.join(' \\quad ') + '\n}\n'
        break

      case 'achievements':
        tex += `\n\\section{\\textbf{Achievements}}\n\\vspace{-0.4mm}\n\\resumeSubHeadingListStart\n`
        for (const r of selectedRecords) {
          const a = r as AchievementItem
          tex += `\\resumeProject{${esc(a.title)}}{${esc(a.description)}}{${esc(a.date)}}{}\n`
        }
        tex += `\\resumeSubHeadingListEnd\n`
        break
    }
  }

  tex += `\n\\end{document}\n`
  return tex
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ResumeBuilder(): React.JSX.Element {
  const [data, setData] = useState<ResumeData | null>(null)
  const [canvas, setCanvas] = useState<CanvasSection[]>([])
  const [activeSidebar, setActiveSidebar] = useState<SectionKey>('experience')
  const [latexCode, setLatexCode] = useState('')
  const [showLatex, setShowLatex] = useState(false)
  const [pdfBase64, setPdfBase64] = useState('')
  const [compiling, setCompiling] = useState(false)
  const [compileError, setCompileError] = useState('')
  const [copied, setCopied] = useState(false)

  // Load saved resume data
  useEffect(() => {
    async function load() {
      try {
        const raw = await (window as any).api.storeGet('resume-data')
        if (raw) setData(raw as ResumeData)
        const savedCanvas = await (window as any).api.storeGet('resume-builder-canvas')
        if (savedCanvas) setCanvas(savedCanvas as CanvasSection[])
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  // Auto-save canvas
  const saveCanvas = useCallback((c: CanvasSection[]) => {
    setCanvas(c)
    ;(window as any).api.storeSet('resume-builder-canvas', c)
  }, [])

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 animate-spin mx-auto mb-4 opacity-40" />
          <p className="text-sm">Loading resume data...</p>
          <p className="text-xs mt-1 opacity-60">Fill in your data in Resume Sections first.</p>
        </div>
      </div>
    )
  }

  // ── Check which records are already on canvas ──
  const usedRecordIds = new Set(canvas.flatMap((s) => s.records))

  const currentRecords = getRecordsForSection(data, activeSidebar)
  const availableRecords = currentRecords.filter((r) => !usedRecordIds.has(r.id))

  // ── Add record to canvas ──
  const addRecordToCanvas = (recordId: string) => {
    const existing = canvas.find((s) => s.sectionId === activeSidebar)
    if (existing) {
      const updated = canvas.map((s) =>
        s.sectionId === activeSidebar ? { ...s, records: [...s.records, recordId] } : s
      )
      saveCanvas(updated)
    } else {
      const meta = SECTION_META[activeSidebar]
      saveCanvas([...canvas, { sectionId: activeSidebar, label: meta.label, records: [recordId] }])
    }
  }

  // ── Remove record from canvas ──
  const removeRecordFromCanvas = (sectionId: string, recordId: string) => {
    const updated = canvas
      .map((s) => {
        if (s.sectionId !== sectionId) return s
        return { ...s, records: s.records.filter((r) => r !== recordId) }
      })
      .filter((s) => s.records.length > 0)
    saveCanvas(updated)
  }

  // ── Remove entire section from canvas ──
  const removeSectionFromCanvas = (sectionId: string) => {
    saveCanvas(canvas.filter((s) => s.sectionId !== sectionId))
  }

  // ── Move section up/down ──
  const moveSectionUp = (idx: number) => {
    if (idx === 0) return
    const arr = [...canvas]
    ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
    saveCanvas(arr)
  }
  const moveSectionDown = (idx: number) => {
    if (idx >= canvas.length - 1) return
    const arr = [...canvas]
    ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
    saveCanvas(arr)
  }

  // ── Drag and drop ──
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result
    if (!destination) return

    // Reorder sections
    if (source.droppableId === 'canvas-sections' && destination.droppableId === 'canvas-sections') {
      const arr = [...canvas]
      const [moved] = arr.splice(source.index, 1)
      arr.splice(destination.index, 0, moved)
      saveCanvas(arr)
      return
    }

    // Reorder records within a section
    if (
      source.droppableId === destination.droppableId &&
      source.droppableId.startsWith('section-')
    ) {
      const secId = source.droppableId.replace('section-', '')
      const updated = canvas.map((s) => {
        if (s.sectionId !== secId) return s
        const records = [...s.records]
        const [moved] = records.splice(source.index, 1)
        records.splice(destination.index, 0, moved)
        return { ...s, records }
      })
      saveCanvas(updated)
    }
  }

  // ── Generate LaTeX ──
  const handleGenerate = () => {
    const tex = generateLatex(data, canvas)
    setLatexCode(tex)
    setShowLatex(true)
    setPdfBase64('')
    setCompileError('')
  }

  // ── Compile to PDF ──
  const handleCompile = async () => {
    setCompiling(true)
    setCompileError('')
    try {
      const result = await (window as any).api.compileLatex(latexCode)
      if (result.success && result.base64) {
        setPdfBase64(result.base64)
      } else {
        setCompileError(result.error || 'Compilation failed')
      }
    } catch (e: any) {
      setCompileError(e.message || 'Unknown error')
    } finally {
      setCompiling(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(latexCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  if (showLatex) {
    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-surface shrink-0">
          <button
            onClick={() => setShowLatex(false)}
            className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            <FaArrowLeft className="w-3 h-3" /> Back to Builder
          </button>
          <div className="flex-1" />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-border-hover transition-all"
          >
            {copied ? (
              <FaCheck className="w-3 h-3 text-green-500" />
            ) : (
              <FaCopy className="w-3 h-3" />
            )}
            {copied ? 'Copied!' : 'Copy LaTeX'}
          </button>
          <button
            onClick={handleCompile}
            disabled={compiling}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-lg bg-primary text-white hover:opacity-90 transition-all disabled:opacity-50"
          >
            {compiling ? (
              <FaSpinner className="w-3 h-3 animate-spin" />
            ) : (
              <FaFilePdf className="w-3 h-3" />
            )}
            {compiling ? 'Compiling...' : 'Compile PDF'}
          </button>
        </div>

        {compileError && (
          <div className="mx-5 mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono whitespace-pre-wrap max-h-32 overflow-auto">
            {compileError}
          </div>
        )}

        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* LaTeX code panel */}
          <div className="flex-1 flex flex-col min-h-0 border-r border-border">
            <div className="px-4 py-2 border-b border-border text-xs font-bold text-muted uppercase tracking-wider bg-surface/50 shrink-0">
              <FaFileCode className="inline w-3 h-3 mr-1.5" /> Generated LaTeX
            </div>
            <textarea
              value={latexCode}
              onChange={(e) => setLatexCode(e.target.value)}
              className="flex-1 p-4 font-mono text-xs leading-relaxed bg-background text-foreground resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>

          {/* PDF preview panel */}
          {pdfBase64 && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-4 py-2 border-b border-border text-xs font-bold text-muted uppercase tracking-wider bg-surface/50 shrink-0">
                <FaFilePdf className="inline w-3 h-3 mr-1.5" /> PDF Preview
              </div>
              <iframe
                src={`data:application/pdf;base64,${pdfBase64}`}
                className="flex-1 w-full"
                title="Resume PDF Preview"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <DragDropContext onDragEnd={onDragEnd}>
        {/* ═══ LEFT: Record Browser ═══ */}
        <aside className="w-72 shrink-0 flex flex-col border-r border-border bg-surface/30 min-h-0">
          <div className="px-4 py-3 border-b border-border shrink-0">
            <h2 className="text-sm font-bold text-foreground">📋 Records</h2>
            <p className="text-xs text-muted mt-0.5">Click + to add records to your resume</p>
          </div>

          {/* Section tabs */}
          <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-border shrink-0">
            {(Object.keys(SECTION_META) as SectionKey[]).map((key) => {
              const meta = SECTION_META[key]
              const Icon = meta.icon
              const isActive = activeSidebar === key
              const records = getRecordsForSection(data, key)
              if (records.length === 0) return null
              return (
                <button
                  key={key}
                  onClick={() => setActiveSidebar(key)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: isActive ? `${meta.color}20` : 'transparent',
                    color: isActive ? meta.color : 'var(--life-muted)'
                  }}
                >
                  <Icon className="w-3 h-3" />
                  <span>{meta.label}</span>
                  <span className="text-[10px] opacity-60">({records.length})</span>
                </button>
              )
            })}
          </div>

          {/* Records list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {availableRecords.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted">
                {currentRecords.length === 0
                  ? 'No records. Add data in Resume Sections.'
                  : 'All records already added to resume.'}
              </div>
            ) : (
              availableRecords.map((record) => {
                const meta = SECTION_META[activeSidebar]
                return (
                  <div
                    key={record.id}
                    className="group flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-card hover:border-border-hover hover:shadow-sm transition-all cursor-default"
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: `${meta.color}15` }}
                    >
                      {(() => {
                        const I = meta.icon
                        return <I className="w-3 h-3" style={{ color: meta.color }} />
                      })()}
                    </div>
                    <span className="flex-1 text-xs font-medium text-foreground truncate">
                      {getRecordLabel(activeSidebar, record)}
                    </span>
                    <button
                      onClick={() => addRecordToCanvas(record.id)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: `${meta.color}20`, color: meta.color }}
                    >
                      <FaPlus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </aside>

        {/* ═══ RIGHT: A4 Canvas ═══ */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Canvas toolbar */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-surface/50 shrink-0">
            <h2 className="text-sm font-bold text-foreground flex-1">
              📄 Resume Canvas
              <span className="text-muted font-normal ml-2 text-xs">
                {canvas.length} section{canvas.length !== 1 ? 's' : ''}
              </span>
            </h2>
            <button
              onClick={handleGenerate}
              disabled={canvas.length === 0}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <FaFileCode className="w-3 h-3" /> Generate LaTeX
            </button>
          </div>

          {/* Canvas body (A4-like) */}
          <div className="flex-1 overflow-y-auto p-6 bg-background">
            <div
              className="max-w-[680px] mx-auto bg-card border border-border rounded-2xl shadow-lg min-h-[800px] p-8"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
            >
              {/* Personal info header (always shown) */}
              <div className="mb-6 pb-4 border-b-2 border-border">
                <h1 className="text-xl font-bold text-foreground">
                  {data.personalInfo.name || 'Your Name'}
                </h1>
                <p className="text-sm text-muted">{data.personalInfo.jobTitle || 'Job Title'}</p>
                <p className="text-xs text-subtle mt-1">
                  {[data.personalInfo.email, data.personalInfo.phone, data.personalInfo.city]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>

              {canvas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <FaPlus className="w-6 h-6 text-primary/40" />
                  </div>
                  <p className="text-sm font-medium text-muted mb-1">Your canvas is empty</p>
                  <p className="text-xs text-subtle max-w-xs">
                    Browse sections on the left and click the + button to add records to your
                    resume.
                  </p>
                </div>
              ) : (
                <Droppable droppableId="canvas-sections" type="SECTION">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                      {canvas.map((section, sIdx) => {
                        const sid = section.sectionId as SectionKey
                        const meta = SECTION_META[sid]
                        const Icon = meta.icon
                        const records = getRecordsForSection(data, sid)

                        return (
                          <Draggable
                            key={section.sectionId}
                            draggableId={`sec-${section.sectionId}`}
                            index={sIdx}
                          >
                            {(dragProvided, snapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                className={`rounded-xl border overflow-hidden transition-shadow ${snapshot.isDragging ? 'shadow-xl border-primary/40' : 'border-border'}`}
                              >
                                {/* Section header */}
                                <div
                                  className="flex items-center gap-2 px-3 py-2 bg-surface/60"
                                  {...dragProvided.dragHandleProps}
                                >
                                  <FaGripVertical className="w-3 h-3 text-subtle cursor-grab" />
                                  <div
                                    className="w-6 h-6 rounded-md flex items-center justify-center"
                                    style={{ background: `${meta.color}18` }}
                                  >
                                    <Icon className="w-3 h-3" style={{ color: meta.color }} />
                                  </div>
                                  <span className="text-xs font-bold text-foreground flex-1">
                                    {meta.label}
                                  </span>
                                  <button
                                    onClick={() => moveSectionUp(sIdx)}
                                    disabled={sIdx === 0}
                                    className="p-1 text-muted hover:text-foreground transition-colors disabled:opacity-20"
                                  >
                                    <FaChevronUp className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    onClick={() => moveSectionDown(sIdx)}
                                    disabled={sIdx === canvas.length - 1}
                                    className="p-1 text-muted hover:text-foreground transition-colors disabled:opacity-20"
                                  >
                                    <FaChevronDown className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    onClick={() => removeSectionFromCanvas(section.sectionId)}
                                    className="p-1 text-muted hover:text-red-400 transition-colors"
                                  >
                                    <FaTrash className="w-2.5 h-2.5" />
                                  </button>
                                </div>

                                {/* Records inside section */}
                                <Droppable
                                  droppableId={`section-${section.sectionId}`}
                                  type="RECORD"
                                >
                                  {(dropProvided) => (
                                    <div
                                      ref={dropProvided.innerRef}
                                      {...dropProvided.droppableProps}
                                      className="p-2 space-y-1 min-h-[32px]"
                                    >
                                      {section.records.map((rid, rIdx) => {
                                        const rec = records.find((r) => r.id === rid)
                                        if (!rec) return null
                                        return (
                                          <Draggable
                                            key={rid}
                                            draggableId={`rec-${rid}`}
                                            index={rIdx}
                                          >
                                            {(rProv, rSnap) => (
                                              <div
                                                ref={rProv.innerRef}
                                                {...rProv.draggableProps}
                                                {...rProv.dragHandleProps}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${rSnap.isDragging ? 'bg-primary/10 shadow-md' : 'bg-card hover:bg-surface/80'}`}
                                              >
                                                <FaGripVertical className="w-2.5 h-2.5 text-subtle/60 shrink-0 cursor-grab" />
                                                <span className="flex-1 font-medium text-foreground truncate">
                                                  {getRecordLabel(sid, rec)}
                                                </span>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeRecordFromCanvas(section.sectionId, rid)
                                                  }}
                                                  className="text-subtle hover:text-red-400 transition-colors p-0.5"
                                                >
                                                  <FaTrash className="w-2 h-2" />
                                                </button>
                                              </div>
                                            )}
                                          </Draggable>
                                        )
                                      })}
                                      {dropProvided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}
