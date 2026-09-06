import { useState } from 'react'
import NumberConverter from './NumberConverter'

export default function DeveloperUtils() {
  const [jsonInput, setJsonInput] = useState('')
  const [jsonOutput, setJsonOutput] = useState('')
  const [jsonError, setJsonError] = useState('')

  const formatJson = () => {
    try {
      if (!jsonInput.trim()) return
      const parsed = JSON.parse(jsonInput)
      setJsonOutput(JSON.stringify(parsed, null, 2))
      setJsonError('')
    } catch (e: any) {
      setJsonError(e.message || 'Invalid JSON format')
    }
  }

  const [b64Input, setB64Input] = useState('')
  const [b64Output, setB64Output] = useState('')

  const handleBase64 = (mode: 'encode' | 'decode') => {
    try {
      if (mode === 'encode') {
        setB64Output(btoa(b64Input))
      } else {
        setB64Output(atob(b64Input))
      }
    } catch {
      setB64Output('Invalid input for base64')
    }
  }

  const [urlInput, setUrlInput] = useState('')
  const [urlOutput, setUrlOutput] = useState('')

  const handleUrl = (mode: 'encode' | 'decode') => {
    try {
      if (mode === 'encode') {
        setUrlOutput(encodeURIComponent(urlInput))
      } else {
        setUrlOutput(decodeURIComponent(urlInput))
      }
    } catch {
      setUrlOutput('Invalid URL encoding format')
    }
  }

  return (
    <div className="flex flex-col space-y-8 pb-12 w-full mx-auto">
      <NumberConverter />

      {/* JSON Formatter */}
      <div className="space-y-6">
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <h2 className="font-bold text-lg mb-4">JSON Formatter</h2>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-32 p-3 font-mono text-sm rounded-lg border border-border bg-background resize-none focus:outline-none focus:border-primary"
            placeholder='{"minified": "json"}'
          ></textarea>

          <button
            onClick={formatJson}
            className="w-full py-2 my-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors"
          >
            Format JSON
          </button>

          <textarea
            readOnly
            value={jsonError || jsonOutput}
            className={`w-full h-48 p-3 font-mono text-sm rounded-lg border bg-surface resize-none focus:outline-none ${jsonError ? 'border-danger text-danger' : 'border-border'}`}
            placeholder="Formatted output..."
          ></textarea>
        </div>
      </div>

      {/* Base 64 Encoder/Decoder */}
      <div className="space-y-6">
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <h2 className="font-bold text-lg mb-4">Base64 Encoder / Decoder</h2>
          <textarea
            value={b64Input}
            onChange={(e) => setB64Input(e.target.value)}
            className="w-full h-24 p-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:border-primary font-mono text-sm"
            placeholder="Input string..."
          ></textarea>
          <div className="flex gap-2 my-2">
            <button
              onClick={() => handleBase64('encode')}
              className="flex-1 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors"
            >
              Encode Base64
            </button>
            <button
              onClick={() => handleBase64('decode')}
              className="flex-1 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors"
            >
              Decode Base64
            </button>
          </div>
          <textarea
            readOnly
            value={b64Output}
            className="w-full h-24 p-3 rounded-lg border border-border bg-surface resize-none focus:outline-none font-mono text-sm"
            placeholder="Output string..."
          ></textarea>
        </div>
      </div>

      {/* URL Encoder/Decoder */}
      <div className="space-y-6">
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm h-full">
          <h2 className="font-bold text-lg mb-4">URL Encoder / Decoder</h2>
          <textarea
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full h-24 p-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:border-primary font-mono text-sm"
            placeholder="URL parameter..."
          ></textarea>
          <div className="flex gap-2 my-2">
            <button
              onClick={() => handleUrl('encode')}
              className="flex-1 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors"
            >
              Encode URL
            </button>
            <button
              onClick={() => handleUrl('decode')}
              className="flex-1 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors"
            >
              Decode URL
            </button>
          </div>
          <textarea
            readOnly
            value={urlOutput}
            className="w-full h-24 p-3 rounded-lg border border-border bg-surface resize-none focus:outline-none font-mono text-sm break-all"
            placeholder="Output string..."
          ></textarea>
        </div>
      </div>
    </div>
  )
}
