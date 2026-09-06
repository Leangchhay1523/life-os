import { useState, useEffect } from 'react'
import { FaSyncAlt, FaCopy } from 'react-icons/fa'

export default function TextAndDesign() {
  // Word & Char Counter state
  const [text, setText] = useState('')
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const charCount = text.length

  // Color Converter state
  const [color, setColor] = useState('#5b8fc9')
  const [rgb, setRgb] = useState('')

  useEffect(() => {
    // Convert hex to rgb
    let validHex = color.replace('#', '')
    if (validHex.length === 3) {
      validHex = validHex
        .split('')
        .map((c) => c + c)
        .join('')
    }
    if (validHex.length === 6) {
      const r = parseInt(validHex.substring(0, 2), 16)
      const g = parseInt(validHex.substring(2, 4), 16)
      const b = parseInt(validHex.substring(4, 6), 16)
      setRgb(`rgb(${r}, ${g}, ${b})`)
    }
  }, [color])

  // Password Generator state
  const [passLength, setPassLength] = useState(12)
  const [useUpper, setUseUpper] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)
  const [password, setPassword] = useState('')

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const nums = '0123456789'
    const syms = '!@#$%^&*'

    let validChars = chars
    if (useUpper) validChars += upper
    if (useNumbers) validChars += nums
    if (useSymbols) validChars += syms

    let generated = ''
    for (let i = 0; i < passLength; i++) {
      generated += validChars.charAt(Math.floor(Math.random() * validChars.length))
    }
    setPassword(generated)
  }

  // Generate initial password quickly
  useEffect(() => {
    generatePassword()
  }, [])

  return (
    <div className="flex flex-col space-y-8 pb-12 w-full mx-auto">
      {/* Word Counter */}
      <div className="space-y-6">
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm h-full flex flex-col">
          <h2 className="font-bold text-lg mb-4">Word / Character Counter</h2>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 p-3 rounded-lg border border-border bg-background flex-1 resize-none"
            placeholder="Start typing..."
          />
          <div className="flex gap-6 mt-4 font-bold text-primary bg-primary/5 p-3 rounded-lg border border-primary/10">
            <span className="flex-1 text-center">
              {wordCount} <span className="text-muted text-xs font-semibold ml-1">WORDS</span>
            </span>
            <div className="w-px bg-border"></div>
            <span className="flex-1 text-center">
              {charCount} <span className="text-muted text-xs font-semibold ml-1">CHARS</span>
            </span>
          </div>
        </div>
      </div>

      {/* Password Generator */}
      <div className="space-y-6">
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <h2 className="font-bold text-lg mb-4">Password Generator</h2>

          <div className="flex items-center gap-2 p-4 bg-surface border border-border rounded-lg mb-4">
            <div className="flex-1 text-xl font-mono tracking-widest font-bold text-foreground overflow-x-auto no-scrollbar">
              {password}
            </div>
            <button
              title="Copy"
              onClick={() => navigator.clipboard.writeText(password)}
              className="p-2 text-muted hover:text-primary transition-colors"
            >
              <FaCopy />
            </button>
          </div>

          <div className="space-y-4 text-sm font-semibold text-muted">
            <div className="flex justify-between items-center bg-background p-2 px-3 rounded border border-border">
              <span>Length: {passLength}</span>
              <input
                type="range"
                min="6"
                max="32"
                value={passLength}
                onChange={(e) => setPassLength(parseInt(e.target.value))}
                className="w-32"
              />
            </div>
            <label className="flex items-center gap-3 bg-background p-2 px-3 rounded border border-border cursor-pointer">
              <input
                type="checkbox"
                checked={useUpper}
                onChange={(e) => setUseUpper(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              Uppercase (A-Z)
            </label>
            <label className="flex items-center gap-3 bg-background p-2 px-3 rounded border border-border cursor-pointer">
              <input
                type="checkbox"
                checked={useNumbers}
                onChange={(e) => setUseNumbers(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              Numbers (0-9)
            </label>
            <label className="flex items-center gap-3 bg-background p-2 px-3 rounded border border-border cursor-pointer">
              <input
                type="checkbox"
                checked={useSymbols}
                onChange={(e) => setUseSymbols(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              Symbols (!@#)
            </label>
          </div>

          <button
            onClick={generatePassword}
            className="w-full mt-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FaSyncAlt /> Generate New
          </button>
        </div>
      </div>

      {/* Color Converter */}
      <div className="space-y-6">
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <h2 className="font-bold text-lg mb-4">Color Converter</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-20 rounded-xl cursor-pointer bg-background p-1 border border-border"
              />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-muted text-xs font-bold uppercase tracking-wider">HEX</span>
                <span className="font-mono text-sm font-bold uppercase">{color}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                <span className="text-muted text-xs font-bold uppercase tracking-wider">RGB</span>
                <span className="font-mono text-sm font-bold">{rgb}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
