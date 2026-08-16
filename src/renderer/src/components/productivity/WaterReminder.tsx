import { useState } from 'react'
import { FaTint, FaPlay, FaPause, FaRedo } from 'react-icons/fa'

interface WaterReminderProps {
  cycleMinutes: number
  updateCycle: (min: number) => void
  timeLeft: number
  handleTimeLeftChange: (seconds: number) => void
  isActive: boolean
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  todayDrinks: number
}

export default function WaterReminder({
  cycleMinutes,
  updateCycle,
  timeLeft,
  isActive,
  startTimer,
  pauseTimer,
  resetTimer,
  todayDrinks
}: WaterReminderProps) {
  const goal = 8
  const [isEditing, setIsEditing] = useState(false)
  const [inputTimer, setInputTimer] = useState(cycleMinutes.toString())

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progress = ((cycleMinutes * 60 - timeLeft) / (cycleMinutes * 60)) * 100

  const handleCustomTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const mins = parseInt(inputTimer, 10)
    if (!isNaN(mins) && mins > 0) {
      updateCycle(mins)
    }
    setIsEditing(false)
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-8 overflow-y-auto">
      {/* Left side: Timer UI */}
      <div className="flex-1 bg-card border border-border shadow-card rounded-3xl p-8 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-8 text-foreground">Next Drink In</h2>

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
              className="transition-all duration-1000 ease-linear text-primary"
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
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6">
            <button
              onClick={resetTimer}
              className="w-14 h-14 flex items-center justify-center text-muted hover:text-foreground bg-surface hover:bg-border transition-colors rounded-full text-xl"
              title="Reset"
            >
              <FaRedo />
            </button>
            <button
              onClick={isActive ? pauseTimer : startTimer}
              className="w-20 h-20 flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-md rounded-full text-3xl bg-primary hover:bg-primary-hover"
            >
              {isActive ? <FaPause /> : <FaPlay className="ml-2" />}
            </button>
          </div>

          {/* Custom Time Form */}
          {isEditing ? (
            <form onSubmit={handleCustomTimeSubmit} className="flex items-center gap-2 mt-4">
              <input
                type="number"
                min="1"
                value={inputTimer}
                onChange={(e) => setInputTimer(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-1.5 w-20 text-center text-foreground outline-none focus:border-primary"
                autoFocus
                onBlur={handleCustomTimeSubmit}
              />
              <span className="text-muted text-sm font-medium">min</span>
            </form>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 px-4 py-2 bg-surface hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-muted hover:text-foreground text-sm font-medium transition-colors"
            >
              Set goal time: {cycleMinutes} minutes
            </button>
          )}
        </div>
      </div>

      {/* Right side: Data side */}
      <div className="md:w-80 flex flex-col gap-6">
        <div className="bg-card border border-border shadow-card rounded-2xl p-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-foreground mb-6">Today's Progress</h3>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                className="text-border drop-shadow-sm"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className="text-primary transition-all duration-1000 ease-in-out"
                strokeWidth="8"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * Math.min(todayDrinks, goal)) / goal}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <FaTint className="w-5 h-5 text-primary mb-1" />
              <span className="text-xl font-bold">{todayDrinks}</span>
            </div>
          </div>
          <div className="mt-4 text-sm font-medium text-muted">
            {todayDrinks} of {goal} cups goal
          </div>
          <p className="text-xs text-subtle text-center mt-4">
            Stay consistent with your hydration to keep your energy levels steady throughout the
            day.
          </p>
        </div>
      </div>
    </div>
  )
}
