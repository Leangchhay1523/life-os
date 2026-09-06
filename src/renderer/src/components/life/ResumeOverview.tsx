import {
  FaBriefcase,
  FaGraduationCap,
  FaCode,
  FaStar,
  FaPhone,
  FaCertificate,
  FaAlignLeft,
  FaGlobe,
  FaTrophy,
  FaUser,
  FaLightbulb
} from 'react-icons/fa'

const sections = [
  { id: 'summary', label: 'Summary', icon: FaAlignLeft, color: '#6fa0d5', count: 0, total: 1 },
  {
    id: 'experience',
    label: 'Experience',
    icon: FaBriefcase,
    color: '#70b68c',
    count: 2,
    total: 5
  },
  {
    id: 'education',
    label: 'Education',
    icon: FaGraduationCap,
    color: '#d5a85f',
    count: 1,
    total: 2
  },
  { id: 'projects', label: 'Projects', icon: FaCode, color: '#9b8fdb', count: 3, total: 6 },
  { id: 'skills', label: 'Skills', icon: FaStar, color: '#dc7b7b', count: 8, total: 10 },
  { id: 'contact', label: 'Contact', icon: FaPhone, color: '#5bbfb5', count: 3, total: 5 },
  {
    id: 'certifications',
    label: 'Certifications',
    icon: FaCertificate,
    color: '#c9954c',
    count: 1,
    total: 3
  },
  { id: 'languages', label: 'Languages', icon: FaGlobe, color: '#8fc96b', count: 2, total: 4 },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: FaTrophy,
    color: '#d56b97',
    count: 0,
    total: 3
  }
]

export default function ResumeOverview() {
  const totalFilled = sections.reduce((acc, s) => acc + s.count, 0)
  const totalPossible = sections.reduce((acc, s) => acc + s.total, 0)
  const overallPercent = Math.round((totalFilled / totalPossible) * 100)

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div
        className="relative rounded-2xl overflow-hidden p-8"
        style={{
          background: 'linear-gradient(135deg, #5b8fc9 0%, #9b8fdb 100%)'
        }}
      >
        <div className="relative z-10 flex items-center gap-6">
          {/* Avatar placeholder */}
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
          >
            <FaUser className="text-4xl text-white" />
          </div>
          <div className="flex-1 text-white">
            <h2 className="text-2xl font-bold mb-1">Your Name</h2>
            <p className="text-white/70 text-sm mb-4">Your Job Title · Your City</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
              <span className="text-white font-semibold text-sm shrink-0">
                {overallPercent}% complete
              </span>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        />
        <div
          className="absolute -bottom-8 right-16 w-24 h-24 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        />
      </div>

      {/* Section Cards Grid */}
      <div>
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
          Resume Sections
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {sections.map((section) => {
            const Icon = section.icon
            const pct = Math.round((section.count / section.total) * 100)
            const isComplete = pct === 100
            const isEmpty = section.count === 0

            return (
              <div
                key={section.id}
                className="bg-card border border-border rounded-xl p-4 hover:border-border-hover hover:shadow-card-hover transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: `${section.color}18` }}
                  >
                    <Icon style={{ color: section.color }} className="w-4 h-4" />
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: isComplete
                        ? '#70b68c20'
                        : isEmpty
                          ? '#dc7b7b20'
                          : `${section.color}18`,
                      color: isComplete ? '#70b68c' : isEmpty ? '#dc7b7b' : section.color
                    }}
                  >
                    {isComplete ? 'Done' : isEmpty ? 'Empty' : 'In progress'}
                  </span>
                </div>
                <p className="font-semibold text-sm text-foreground mb-1">{section.label}</p>
                <p className="text-xs text-muted mb-3">
                  {section.count} / {section.total} items
                </p>
                <div className="h-1.5 rounded-full bg-border">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: section.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-primary-light border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <div className="mt-1 text-primary">
          <FaLightbulb className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary mb-0.5">Pro Tip</p>
          <p className="text-xs text-muted">
            Head to <strong>Resume Sections</strong> in the sidebar to fill in and manage each
            section of your resume in one scrollable page.
          </p>
        </div>
      </div>
    </div>
  )
}
