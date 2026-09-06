import { useState } from 'react'

export default function Calculator() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')

  const handleInput = (val: string) => setInput((prev) => prev + val)

  const calculate = () => {
    try {
      const fn = new Function('return ' + input)
      setResult(String(fn()))
    } catch {
      setResult('Error')
    }
  }

  const clear = () => {
    setInput('')
    setResult('')
  }

  const backspace = () => {
    setInput((prev) => prev.slice(0, -1))
  }

  const buttons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+']

  return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="flex flex-col gap-4 w-full max-w-sm bg-card p-6 rounded-2xl shadow-sm border border-border">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-end gap-1">
          <div className="text-muted text-sm min-h-[20px]">{input}</div>
          <div className="text-3xl font-bold">{result || '0'}</div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={clear}
            className="col-span-3 py-3 bg-danger/10 text-danger rounded-xl font-bold hover:bg-danger/20 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={backspace}
            className="col-span-1 py-3 bg-surface text-muted rounded-xl font-bold hover:bg-border transition-colors text-xl"
          >
            ⌫
          </button>
          {buttons.map((btn) => (
            <button
              key={btn}
              onClick={() => (btn === '=' ? calculate() : handleInput(btn))}
              className={`py-4 rounded-xl font-bold text-lg transition-colors ${
                ['/', '*', '-', '+', '='].includes(btn)
                  ? 'bg-primary/20 text-primary hover:bg-primary/30'
                  : 'bg-surface hover:bg-border'
              }`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
