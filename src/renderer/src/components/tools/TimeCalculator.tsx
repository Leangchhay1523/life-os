import { useState, useMemo } from 'react'

export default function TimeCalculator() {
  const [time1, setTime1] = useState('')
  const [time2, setTime2] = useState('')

  const duration = useMemo(() => {
    if (!time1 || !time2) return null

    const [h1, m1] = time1.split(':').map(Number)
    const [h2, m2] = time2.split(':').map(Number)

    let totalMinutes1 = h1 * 60 + m1
    let totalMinutes2 = h2 * 60 + m2

    // If time2 is earlier in the day than time1, assume it crosses midnight.
    if (totalMinutes2 < totalMinutes1) {
      totalMinutes2 += 24 * 60
    }

    const diff = totalMinutes2 - totalMinutes1
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60

    return { hours, minutes }
  }, [time1, time2])

  return (
    <div className="space-y-6 w-full">
      <div className="p-6 bg-card border border-border rounded-xl">
        <h2 className="font-bold text-lg mb-4">Time Calculator (Duration between times)</h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                Start Time
              </label>
              <input
                type="time"
                value={time1}
                onChange={(e) => setTime1(e.target.value)}
                className="w-full p-3 bg-background border border-border rounded-lg outline-none focus:border-primary font-mono text-lg"
              />
            </div>
            <div className="text-muted font-bold text-lg mt-6 hidden md:block">➔</div>
            <div className="flex-1 w-full">
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                End Time
              </label>
              <input
                type="time"
                value={time2}
                onChange={(e) => setTime2(e.target.value)}
                className="w-full p-3 bg-background border border-border rounded-lg outline-none focus:border-primary font-mono text-lg"
              />
            </div>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-center font-bold text-lg text-primary min-h-[60px] flex items-center justify-center">
            {duration ? (
              <span>
                Duration: {duration.hours} hour{duration.hours !== 1 && 's'} and {duration.minutes}{' '}
                minute{duration.minutes !== 1 && 's'}
              </span>
            ) : (
              <span className="text-primary/70">Select start and end times</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
