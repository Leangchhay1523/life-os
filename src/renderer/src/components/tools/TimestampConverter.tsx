import { useState, useEffect } from 'react'

export default function TimestampConverter() {
  const [unix, setUnix] = useState('')
  const [human, setHuman] = useState('')

  // Sync human when unix changes
  const handleUnixChange = (val: string) => {
    setUnix(val)
    if (!val) {
      setHuman('')
      return
    }
    const num = parseInt(val)
    if (!isNaN(num)) {
      // Assuming JS ms. If it looks like seconds (no ms), multiply by 1000.
      const ms = val.length <= 10 ? num * 1000 : num
      const date = new Date(ms)
      if (!isNaN(date.getTime())) {
        setHuman(date.toISOString())
      } else {
        setHuman('Invalid Date')
      }
    } else {
      setHuman('Invalid Number')
    }
  }

  // Sync unix when human changes
  const handleHumanChange = (val: string) => {
    setHuman(val)
    if (!val) {
      setUnix('')
      return
    }
    const date = new Date(val)
    if (!isNaN(date.getTime())) {
      setUnix(Math.floor(date.getTime() / 1000).toString()) // Store as seconds for typical unix timestamp
    } else {
      setUnix('') // Or keep as is, invalid
    }
  }

  return (
    <div className="space-y-6 w-full">
      <div className="p-6 bg-card border border-border rounded-xl">
        <h2 className="font-bold text-lg mb-4">Timestamp Converter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-muted uppercase tracking-wider">
              Unix Timestamp (Seconds / ms)
            </label>
            <input
              type="text"
              value={unix}
              onChange={(e) => handleUnixChange(e.target.value)}
              className="p-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none font-mono"
              placeholder="1725653546"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-muted uppercase tracking-wider">
              Human Readable (ISO / Local)
            </label>
            <input
              type="text"
              value={human}
              onChange={(e) => handleHumanChange(e.target.value)}
              className="p-3 bg-background border border-border rounded-lg focus:border-primary focus:outline-none font-mono"
              placeholder="YYYY-MM-DDTHH:mm:ss.sssZ"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
