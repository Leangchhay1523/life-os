import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Versions from './components/Versions'
import PomodoroTimer from './components/productivity/PomodoroTimer'
import WaterReminder from './components/productivity/WaterReminder'
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
      case 'pomodoro':
        return <PomodoroTimer />
      case 'water-reminder':
        return <WaterReminder {...waterReminderState} />
      case 'resume':
      case 'resume-overview':
      case 'resume-experience':
      case 'resume-education':
      case 'resume-projects':
        return (
          <div className="p-6 bg-card border border-border shadow-card rounded-xl">
            Resume section content coming soon
          </div>
        )
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

      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <div className="p-8 max-w-4xl w-full mx-auto flex-1 flex flex-col">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{getSectionTitle()}</h1>
            <p className="text-muted mt-2">
              Manage your {getSectionTitle().toLowerCase()} seamlessly.
            </p>
          </header>

          <div className="flex-1 flex flex-col">{renderContent()}</div>
        </div>

        <div className="absolute bottom-4 right-4">
          <Versions />
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
