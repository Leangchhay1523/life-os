import { useState, ChangeEvent } from 'react'

export default function CurrencyConverter() {
  const [usd, setUsd] = useState('1')
  const [khr, setKhr] = useState('4100')
  const rate = 4100 // Mock rate for USD to KHR

  const handleUsdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setUsd(val)
    if (!val || isNaN(parseFloat(val))) {
      setKhr('')
      return
    }
    setKhr((parseFloat(val) * rate).toString())
  }

  const handleKhrChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setKhr(val)
    if (!val || isNaN(parseFloat(val))) {
      setUsd('')
      return
    }
    // Limit to 2 decimals for USD
    setUsd(parseFloat((parseFloat(val) / rate).toFixed(2)).toString())
  }

  return (
    <div className="space-y-6 w-full">
      <div className="p-6 bg-card border border-border rounded-xl">
        <h2 className="font-bold text-lg mb-4">Currency Converter</h2>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
              US Dollar (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-bold">
                $
              </span>
              <input
                type="number"
                value={usd}
                onChange={handleUsdChange}
                className="w-full pl-8 p-3 bg-background border border-border rounded-lg text-lg font-bold focus:border-primary focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="w-10 h-10 flex items-center justify-center bg-surface hover:bg-border cursor-pointer rounded-full transition-colors flex-shrink-0 md:mt-6">
            ⇄
          </div>

          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
              Cambodian Riel (KHR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-bold">
                ៛
              </span>
              <input
                type="number"
                value={khr}
                onChange={handleKhrChange}
                className="w-full pl-8 p-3 bg-background border border-border rounded-lg text-lg font-bold focus:border-primary focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-muted mt-6 text-center">
          Fixed Exchange Rate: 1.00 USD = {rate.toLocaleString()} KHR
        </p>
      </div>
    </div>
  )
}
