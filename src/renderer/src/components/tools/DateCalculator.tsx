import { useState, useMemo } from 'react'

export default function DateCalculator() {
  const [date1, setDate1] = useState('')
  const [date2, setDate2] = useState('')

  const difference = useMemo(() => {
    if (!date1 || !date2) return null

    const d1 = new Date(date1)
    const d2 = new Date(date2)

    // Ensure both are valid dates
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null

    // Normalize to midnight UTC to avoid daylight saving time glitches
    const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate())
    const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate())

    // Absolute difference in milliseconds
    const diffMs = Math.abs(utc2 - utc1)

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    // Calculate years, months, days for a relative human span calculation
    // Sort dates
    let start = d1 < d2 ? d1 : d2
    const end = d1 < d2 ? d2 : d1

    let years = end.getFullYear() - start.getFullYear()
    let months = end.getMonth() - start.getMonth()
    let days = end.getDate() - start.getDate()

    if (days < 0) {
      months--
      // Get number of days in the previous month
      const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0)
      days += previousMonth.getDate()
    }
    if (months < 0) {
      years--
      months += 12
    }

    return {
      totalDays: diffDays,
      years,
      months,
      days
    }
  }, [date1, date2])

  return (
    <div className="space-y-6 w-full">
      <div className="p-6 bg-card border border-border rounded-xl">
        <h2 className="font-bold text-lg mb-4">Date Calculator (Difference between dates)</h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                First Date
              </label>
              <input
                type="date"
                value={date1}
                onChange={(e) => setDate1(e.target.value)}
                className="w-full p-3 bg-background border border-border rounded-lg outline-none focus:border-primary font-mono text-lg"
              />
            </div>
            <div className="text-muted font-bold text-lg mt-6 hidden md:block">↔</div>
            <div className="flex-1 w-full">
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                Second Date
              </label>
              <input
                type="date"
                value={date2}
                onChange={(e) => setDate2(e.target.value)}
                className="w-full p-3 bg-background border border-border rounded-lg outline-none focus:border-primary font-mono text-lg"
              />
            </div>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-center flex flex-col gap-1 items-center justify-center min-h-[80px]">
            {difference ? (
              <>
                <span className="font-bold text-xl text-primary">
                  {difference.totalDays.toLocaleString()} day{difference.totalDays !== 1 && 's'}
                </span>
                {difference.totalDays > 30 && (
                  <span className="text-sm font-bold text-primary/70">
                    (approx.{' '}
                    {difference.years > 0
                      ? `${difference.years} year${difference.years !== 1 ? 's' : ''}, `
                      : ''}
                    {difference.months > 0
                      ? `${difference.months} month${difference.months !== 1 ? 's' : ''}, `
                      : ''}
                    {difference.days} day{difference.days !== 1 ? 's' : ''})
                  </span>
                )}
              </>
            ) : (
              <span className="text-primary/70 font-bold text-lg">Select two dates</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
