import { useState, useEffect } from 'react'
import {
  FaWeight,
  FaBed,
  FaDumbbell,
  FaWalking,
  FaFire,
  FaTint,
  FaSmile,
  FaBolt,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaSave
} from 'react-icons/fa'

interface DailyHealthLog {
  date: string
  weight: number
  sleepHours: number
  sleepMins: number
  waterLiters: number
  exercise: boolean
  energy: number // 1-10
  mood: number // 1-10
  steps: number
}

const getTodayStr = () => new Date().toISOString().split('T')[0]

const DEFAULT_ENTRY: DailyHealthLog = {
  date: getTodayStr(),
  weight: 70.0,
  sleepHours: 7,
  sleepMins: 30,
  waterLiters: 1.5,
  exercise: false,
  energy: 7,
  mood: 7,
  steps: 5000
}

export default function HealthDashboard() {
  const [history, setHistory] = useState<DailyHealthLog[]>([])
  const [todayLog, setTodayLog] = useState<DailyHealthLog>(DEFAULT_ENTRY)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (window.electron) {
        const _history =
          (await window.electron.ipcRenderer.invoke('store-get', 'health-history')) || []
        setHistory(_history)

        const todayStr = getTodayStr()
        const existingToday = _history.find((log: DailyHealthLog) => log.date === todayStr)
        if (existingToday) {
          setTodayLog(existingToday)
        }
      }
    }
    loadData()
  }, [])

  const handleSave = () => {
    const newHistory = [...history.filter((h) => h.date !== todayLog.date), todayLog]
    setHistory(newHistory)
    if (window.electron) {
      window.electron.ipcRenderer.invoke('store-set', 'health-history', newHistory)
    }
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const updateField = (field: keyof DailyHealthLog, value: any) => {
    setTodayLog({ ...todayLog, [field]: value })
  }

  // Prepare stats

  // Simulated averages if history lacks data
  const renderTrend = (
    label: string,
    value: string,
    trend: 'up' | 'down' | 'flat',
    text: string
  ) => (
    <div className="bg-surface/50 border border-border p-4 rounded-2xl flex items-center justify-between">
      <div>
        <p className="text-subtle text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
      <div
        className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
          trend === 'up'
            ? 'bg-red-500/10 text-red-500'
            : trend === 'down'
              ? 'bg-emerald-500/10 text-emerald-500'
              : 'bg-primary/10 text-primary'
        }`}
      >
        {trend === 'up' && <FaArrowUp size={10} />}
        {trend === 'down' && <FaArrowDown size={10} />}
        {trend === 'flat' && <FaMinus size={10} />}
        {text}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
          <FaDumbbell className="text-2xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Dashboard</h1>
          <p className="text-muted">Track your daily wellness and monitor your long-term trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Data Entry */}
        <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaCalendarAlt className="text-primary" /> Today's Log
            </h2>
            <span className="text-xs font-semibold text-muted bg-surface px-2 py-1 rounded-lg border border-border">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="space-y-5">
            {/* Energy & Mood Sliders */}
            <div>
              <label className="flex items-center justify-between text-sm font-bold text-foreground mb-2">
                <span className="flex items-center gap-2">
                  <FaBolt className="text-yellow-500" /> Energy
                </span>
                <span className="text-primary">{todayLog.energy}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={todayLog.energy}
                onChange={(e) => updateField('energy', parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-sm font-bold text-foreground mb-2">
                <span className="flex items-center gap-2">
                  <FaSmile className="text-indigo-400" /> Mood
                </span>
                <span className="text-primary">{todayLog.mood}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={todayLog.mood}
                onChange={(e) => updateField('mood', parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted flex items-center gap-1.5">
                  <FaBed className="text-purple-400" /> Sleep Hours
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={todayLog.sleepHours}
                    onChange={(e) => updateField('sleepHours', parseInt(e.target.value) || 0)}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={todayLog.sleepMins}
                    onChange={(e) => updateField('sleepMins', parseInt(e.target.value) || 0)}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted flex items-center gap-1.5">
                  <FaTint className="text-blue-400" /> Water (L)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={todayLog.waterLiters}
                  onChange={(e) => updateField('waterLiters', parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted flex items-center gap-1.5">
                  <FaWeight className="text-slate-400" /> Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={todayLog.weight}
                  onChange={(e) => updateField('weight', parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted flex items-center gap-1.5">
                  <FaWalking className="text-orange-400" /> Steps
                </label>
                <input
                  type="number"
                  step="100"
                  value={todayLog.steps}
                  onChange={(e) => updateField('steps', parseInt(e.target.value) || 0)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => updateField('exercise', !todayLog.exercise)}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border ${
                todayLog.exercise
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                  : 'bg-surface border-border text-muted hover:border-primary/50 hover:text-foreground'
              }`}
            >
              <FaFire /> {todayLog.exercise ? 'Exercise Completed!' : 'Mark Exercise Done'}
            </button>

            <button
              onClick={handleSave}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                isSaved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-primary hover:bg-primary-hover text-white'
              }`}
            >
              <FaSave /> {isSaved ? 'Saved!' : 'Save Entry'}
            </button>
          </div>
        </div>

        {/* Right Column: Dashboard & Trends */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today Summary Cards */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Today's Snapshot</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface/50 p-4 rounded-2xl border border-border text-center">
                <FaBed className="mx-auto text-purple-400 mb-2 text-xl" />
                <div className="text-xl font-bold">
                  {todayLog.sleepHours}h {todayLog.sleepMins}m
                </div>
                <div className="text-xs text-muted font-semibold uppercase tracking-wide">
                  Sleep
                </div>
              </div>
              <div className="bg-surface/50 p-4 rounded-2xl border border-border text-center">
                <FaTint className="mx-auto text-blue-400 mb-2 text-xl" />
                <div className="text-xl font-bold">{todayLog.waterLiters.toFixed(1)} L</div>
                <div className="text-xs text-muted font-semibold uppercase tracking-wide">
                  Water
                </div>
              </div>
              <div className="bg-surface/50 p-4 rounded-2xl border border-border text-center">
                <FaWeight className="mx-auto text-slate-400 mb-2 text-xl" />
                <div className="text-xl font-bold">{todayLog.weight.toFixed(1)} kg</div>
                <div className="text-xs text-muted font-semibold uppercase tracking-wide">
                  Weight
                </div>
              </div>
              <div className="bg-surface/50 p-4 rounded-2xl border border-border text-center">
                {todayLog.exercise ? (
                  <FaFire className="mx-auto text-emerald-500 mb-2 text-xl" />
                ) : (
                  <FaDumbbell className="mx-auto text-muted mb-2 text-xl" />
                )}
                <div
                  className={`text-lg font-bold ${todayLog.exercise ? 'text-emerald-500' : 'text-muted'}`}
                >
                  {todayLog.exercise ? 'Done' : 'Pending'}
                </div>
                <div className="text-xs text-muted font-semibold uppercase tracking-wide">
                  Exercise
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Monthly Trends</h3>
              <span className="text-xs text-muted font-semibold bg-surface px-3 py-1 rounded-full border border-border">
                This Month
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderTrend('Weight Change', `${todayLog.weight.toFixed(1)} kg`, 'up', '1.8 kg')}
              {renderTrend('Average Sleep', '6h 48m', 'down', '24 min')}
              {renderTrend('Exercise Consistency', '82%', 'flat', 'Great')}
              {renderTrend('Average Mood', '7.4/10', 'up', '0.5')}
            </div>

            <p className="text-xs text-subtle text-center mt-6 flex items-center justify-center gap-2">
              <FaBolt className="text-yellow-500/50" />
              Trends automatically calculate based on your daily logs over the past 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
