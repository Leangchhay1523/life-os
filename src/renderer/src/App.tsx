import { useState } from 'react'
import Sidebar from './components/Sidebar'
import PomodoroTimer from './components/productivity/PomodoroTimer'
import WaterReminder from './components/productivity/WaterReminder'
import DailyPlanner from './components/productivity/DailyPlanner'
import ResumeOverview from './components/life/ResumeOverview'
import ResumeSections from './components/life/ResumeSections'
import ResumeBuilder from './components/life/ResumeBuilder'
import Milestones from './components/life/Milestones'
import SelfAwareness from './components/life/SelfAwareness'
import HealthDashboard from './components/health/HealthDashboard'
import Settings from './components/Settings'
import Calculator from './components/tools/Calculator'
import MathAndConverters from './components/tools/MathAndConverters'
import DateTimeTools from './components/tools/DateTimeTools'
import DeveloperUtils from './components/tools/DeveloperUtils'
import TextAndDesign from './components/tools/TextAndDesign'
import { useWaterReminder } from './hooks/useWaterReminder'
import { FaTint } from 'react-icons/fa'

function App(): React.JSX.Element {
  const [activeSection, setActiveSection] = useState('pomodoro')
  const waterReminderState = useWaterReminder()

  // Check if we are rendering the popup window
  const urlParams = new URLSearchParams(window.location.search)
  const isPopup = urlParams.get('popup') === 'water'
  const popupTime = urlParams.get('time') || '60'

  if (isPopup) {
    return (
      <div className="h-screen w-screen bg-transparent flex items-center justify-center p-4">
        {/* The window is transparent but we have an opaque modal card */}
        <div
          className="bg-card border-2 border-border shadow-2xl rounded-2xl p-8 max-w-sm w-full mx-4 text-center select-none"
          style={{ WebkitAppRegion: 'drag' } as any}
        >
          <div className="w-20 h-20 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTint className="w-10 h-10 animate-bounce" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-foreground">Time to Hydrate!</h3>
          <p className="text-muted mb-8">
            It's been {popupTime} minutes. Grab a glass of water and stay healthy!
          </p>
          <div className="flex gap-4" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <button
              onClick={() => window.electron?.ipcRenderer.send('water-action', 'snooze')}
              className="flex-1 py-3 px-4 rounded-xl font-medium border border-border hover:bg-surface text-muted hover:text-foreground transition-all cursor-pointer"
            >
              Snooze
            </button>
            <button
              onClick={() => window.electron?.ipcRenderer.send('water-action', 'drink')}
              className="flex-1 py-3 px-4 rounded-xl font-medium bg-primary hover:bg-primary-hover text-white shadow-md transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              I drank
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'health-dashboard':
        return <HealthDashboard />
      case 'daily-planner':
        return <DailyPlanner />
      case 'settings':
        return <Settings />
      case 'pomodoro':
        return <PomodoroTimer />
      case 'water-reminder':
        return <WaterReminder {...waterReminderState} />
      case 'resume-overview':
        return <ResumeOverview />
      case 'resume-sections':
        return <ResumeSections />
      case 'resume-builder':
        return <ResumeBuilder />
      case 'self-awareness':
        return <SelfAwareness />
      case 'milestones':
        return <Milestones />
      case 'tool-calculator':
        return <Calculator />
      case 'tool-math':
        return <MathAndConverters />
      case 'tool-datetime':
        return <DateTimeTools />
      case 'tool-dev':
        return <DeveloperUtils />
      case 'tool-text':
        return <TextAndDesign />
      default:
        return (
          <div className="bg-card border border-border shadow-card rounded-xl p-6 min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-pulse w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Select a section</h2>
              <p className="text-muted max-w-md mx-auto relative z-10">
                Choose an item from the sidebar to view its dashboard.
              </p>
            </div>
          </div>
        )
    }
  }

  const getSectionTitle = () => {
    return activeSection
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className="flex-1 overflow-hidden relative flex flex-col">
        <div
          className={`flex-1 flex flex-col min-h-0 ${
            activeSection === 'resume-sections' || activeSection === 'resume-builder'
              ? 'p-0 w-full overflow-hidden'
              : activeSection === 'pomodoro'
                ? 'p-8 max-w-4xl w-full mx-auto'
                : activeSection === 'daily-planner' ||
                    activeSection === 'self-awareness' ||
                    activeSection === 'health-dashboard' ||
                    activeSection === 'milestones'
                  ? 'p-8 max-w-5xl w-full mx-auto overflow-hidden'
                  : activeSection === 'settings'
                    ? 'p-8 max-w-4xl w-full mx-auto overflow-hidden'
                    : 'p-8 pb-16 max-w-4xl w-full mx-auto overflow-y-auto no-scrollbar'
          }`}
        >
          {activeSection !== 'resume-sections' && activeSection !== 'resume-builder' && (
            <header className="mb-6 shrink-0">
              <h1 className="text-3xl font-bold tracking-tight">{getSectionTitle()}</h1>
              <p className="text-muted mt-2">
                Manage your {getSectionTitle().toLowerCase()} seamlessly.
              </p>
            </header>
          )}

          <div
            className={`flex-1 flex flex-col min-h-0 ${['resume-sections', 'resume-builder', 'milestones', 'daily-planner', 'self-awareness', 'health-dashboard'].includes(activeSection) ? 'overflow-hidden' : ''}`}
          >
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Global Water Reminder Popup (In-App) */}
      {waterReminderState.showPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-card border border-border shadow-2xl rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-20 h-20 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTint className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">Time to Hydrate!</h3>
            <p className="text-muted mb-8">
              It's been {waterReminderState.cycleMinutes} minutes. Grab a glass of water and stay
              healthy!
            </p>
            <div className="flex gap-4">
              <button
                onClick={waterReminderState.handleSnooze}
                className="flex-1 py-3 px-4 rounded-xl font-medium border border-border hover:bg-surface text-muted hover:text-foreground transition-all"
              >
                Snooze
              </button>
              <button
                onClick={waterReminderState.handleDrink}
                className="flex-1 py-3 px-4 rounded-xl font-medium bg-primary hover:bg-primary-hover text-white shadow-md transition-all transform hover:scale-105 active:scale-95"
              >
                I drank
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
