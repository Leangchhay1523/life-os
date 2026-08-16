import { useState, useEffect } from 'react'
import { FaPlay, FaPause, FaRedo, FaCoffee, FaBrain, FaCog, FaTimes } from 'react-icons/fa'

type Mode = 'focus' | 'shortBreak' | 'longBreak'

export default function PomodoroTimer() {
  const [focusTime, setFocusTime] = useState(25)
  const [shortBreakTime, setShortBreakTime] = useState(5)
  const [longBreakTime, setLongBreakTime] = useState(15)

  const [mode, setMode] = useState<Mode>('focus')
  const [timeLeft, setTimeLeft] = useState(focusTime * 60)
  const [isActive, setIsActive] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)

  const [showSettings, setShowSettings] = useState(false)
  const [inputFocus, setInputFocus] = useState(focusTime.toString())
  const [inputShort, setInputShort] = useState(shortBreakTime.toString())
  const [inputLong, setInputLong] = useState(longBreakTime.toString())

  // Initial load
  useEffect(() => {
    if (!isActive) {
      if (mode === 'focus') setTimeLeft(focusTime * 60)
      if (mode === 'shortBreak') setTimeLeft(shortBreakTime * 60)
      if (mode === 'longBreak') setTimeLeft(longBreakTime * 60)
    }
  }, [focusTime, shortBreakTime, longBreakTime, mode])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (isActive && timeLeft <= 0) {
      // Transition logic
      if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.send('bring-to-front')
      }

      let nextMode: Mode = 'focus'
      let message = ''

      if (mode === 'focus') {
        const newSessions = sessionsCompleted + 1
        setSessionsCompleted(newSessions)

        if (newSessions > 0 && newSessions % 4 === 0) {
          nextMode = 'longBreak'
          message = 'Great job! Time for a long break.'
        } else {
          nextMode = 'shortBreak'
          message = 'Time for a short break.'
        }
      } else {
        // Break is over -> Focus
        nextMode = 'focus'
        message = 'Break is over! Time to focus.'
      }

      if (Notification.permission === 'granted') {
        new Notification(message)
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission()
      }

      setMode(nextMode)
      setIsActive(false) // Requires user to manually start next phase

      if (nextMode === 'focus') setTimeLeft(focusTime * 60)
      else if (nextMode === 'shortBreak') setTimeLeft(shortBreakTime * 60)
      else if (nextMode === 'longBreak') setTimeLeft(longBreakTime * 60)
    }

    return () => clearInterval(interval)
  }, [isActive, timeLeft, mode, focusTime, shortBreakTime, longBreakTime, sessionsCompleted])

  const toggleTimer = () => setIsActive(!isActive)

  const resetTimer = () => {
    setIsActive(false)
    if (mode === 'focus') setTimeLeft(focusTime * 60)
    if (mode === 'shortBreak') setTimeLeft(shortBreakTime * 60)
    if (mode === 'longBreak') setTimeLeft(longBreakTime * 60)
  }

  const switchMode = (newMode: Mode) => {
    setMode(newMode)
    setIsActive(false)
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    const f = parseInt(inputFocus, 10)
    const s = parseInt(inputShort, 10)
    const l = parseInt(inputLong, 10)

    if (!isNaN(f) && f > 0) setFocusTime(f)
    if (!isNaN(s) && s > 0) setShortBreakTime(s)
    if (!isNaN(l) && l > 0) setLongBreakTime(l)

    setShowSettings(false)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getTotalTime = () => {
    if (mode === 'focus') return focusTime * 60
    if (mode === 'shortBreak') return shortBreakTime * 60
    return longBreakTime * 60
  }

  const progress = ((getTotalTime() - timeLeft) / getTotalTime()) * 100

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20 relative">
      <div className="bg-card w-full max-w-md border border-border shadow-card rounded-3xl p-8 flex flex-col items-center relative overflow-hidden">
        {/* Settings button */}
        <button
          onClick={() => setShowSettings(true)}
          className="absolute top-6 right-6 text-muted hover:text-foreground transition-colors p-2 rounded-full hover:bg-surface"
        >
          <FaCog />
        </button>

        {/* Mode Toggles */}
        <div className="flex bg-surface p-1 rounded-xl mb-8 flex-wrap justify-center">
          <button
            onClick={() => switchMode('focus')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'focus'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <FaBrain /> Focus
          </button>
          <button
            onClick={() => switchMode('shortBreak')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'shortBreak'
                ? 'bg-success text-white shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <FaCoffee /> Short Break
          </button>
          <button
            onClick={() => switchMode('longBreak')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'longBreak'
                ? 'bg-warning text-white shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <FaCoffee /> Long Break
          </button>
        </div>

        {/* Sessions Tracker */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((dot) => (
            <div
              key={dot}
              className={`w-3 h-3 rounded-full transition-colors ${
                sessionsCompleted % 4 === 0 && sessionsCompleted > 0 && dot <= 4
                  ? 'bg-primary'
                  : sessionsCompleted % 4 >= dot
                    ? 'bg-primary'
                    : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Timer Circle */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-12">
          <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-border"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r="48"
              cx="50"
              cy="50"
            />
            <circle
              className={`transition-all duration-1000 ease-linear ${
                mode === 'focus'
                  ? 'text-primary'
                  : mode === 'shortBreak'
                    ? 'text-success'
                    : 'text-warning'
              }`}
              strokeWidth="4"
              strokeDasharray={301.59}
              strokeDashoffset={301.59 - (301.59 * progress) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="48"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="text-6xl font-extrabold tracking-tighter text-foreground tabular-nums">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={resetTimer}
            className="w-14 h-14 flex items-center justify-center text-muted hover:text-foreground bg-surface hover:bg-border transition-colors rounded-full text-xl"
            title="Reset"
          >
            <FaRedo />
          </button>

          <button
            onClick={toggleTimer}
            className={`w-20 h-20 flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-md rounded-full text-3xl ${
              mode === 'focus'
                ? isActive
                  ? 'bg-primary-hover'
                  : 'bg-primary'
                : mode === 'shortBreak'
                  ? isActive
                    ? 'bg-success/80'
                    : 'bg-success'
                  : isActive
                    ? 'bg-warning/80'
                    : 'bg-warning'
            }`}
          >
            {isActive ? <FaPause /> : <FaPlay className="ml-2" />}
          </button>
        </div>

        <p className="mt-8 text-muted text-sm font-medium text-center max-w-xs">
          {mode === 'focus'
            ? isActive
              ? 'Deep focus in progress.'
              : 'Ready to focus?'
            : isActive
              ? 'Enjoy your break.'
              : 'Ready for a break?'}
        </p>

        {/* Settings Overlay panel inside the card */}
        {showSettings && (
          <div className="absolute inset-0 bg-card/95 backdrop-blur-sm z-10 flex flex-col p-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Timer Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-muted hover:text-foreground p-2"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="flex-1 flex flex-col gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-medium">Focus (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={inputFocus}
                    onChange={(e) => setInputFocus(e.target.value)}
                    className="w-20 bg-background border border-border rounded-lg px-3 py-1.5 text-center focus:border-primary outline-none"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="font-medium">Short Break (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={inputShort}
                    onChange={(e) => setInputShort(e.target.value)}
                    className="w-20 bg-background border border-border rounded-lg px-3 py-1.5 text-center focus:border-success outline-none"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="font-medium">Long Break (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={inputLong}
                    onChange={(e) => setInputLong(e.target.value)}
                    className="w-20 bg-background border border-border rounded-lg px-3 py-1.5 text-center focus:border-warning outline-none"
                  />
                </div>
              </div>

              <div className="mt-auto">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-xl transition-all shadow-sm"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
