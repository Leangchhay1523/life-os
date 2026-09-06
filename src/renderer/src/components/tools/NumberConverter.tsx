import { useState } from 'react'

export default function NumberConverter() {
  const [val, setVal] = useState('')

  return (
    <div className="space-y-6 w-full">
      <div className="p-6 bg-card border border-border rounded-xl">
        <h2 className="font-bold text-lg mb-4">Number Converter</h2>

        <input
          type="number"
          placeholder="Enter decimal number..."
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-full mb-6 p-2 bg-background border border-border rounded-lg text-lg font-bold"
        />

        <div className="space-y-3">
          <div className="flex justify-between items-center bg-surface p-3 rounded-lg border border-border">
            <span className="font-bold text-muted">Binary</span>
            <span className="font-mono">{val ? parseInt(val, 10).toString(2) : '0'}</span>
          </div>
          <div className="flex justify-between items-center bg-surface p-3 rounded-lg border border-border">
            <span className="font-bold text-muted">Hexadecimal</span>
            <span className="font-mono uppercase">
              {val ? parseInt(val, 10).toString(16) : '0'}
            </span>
          </div>
          <div className="flex justify-between items-center bg-surface p-3 rounded-lg border border-border">
            <span className="font-bold text-muted">Octal</span>
            <span className="font-mono">{val ? parseInt(val, 10).toString(8) : '0'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
