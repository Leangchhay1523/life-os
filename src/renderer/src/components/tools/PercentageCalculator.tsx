import { useState } from 'react'

export default function PercentageCalculator() {
  // Mode 1: What is X% of Y?
  const [m1X, setM1X] = useState('20')
  const [m1Y, setM1Y] = useState('150')

  // Mode 2: X is what % of Y?
  const [m2X, setM2X] = useState('30')
  const [m2Y, setM2Y] = useState('150')

  // Mode 3: % Change from X to Y
  const [m3X, setM3X] = useState('100')
  const [m3Y, setM3Y] = useState('120')

  return (
    <div className="space-y-6 w-full">
      <div className="p-6 bg-card border border-border rounded-xl flex flex-col gap-8">
        <h2 className="font-bold text-lg">Percentage Calculators</h2>

        {/* Mode 1 */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center text-sm md:text-base flex-wrap">
            <span className="font-bold text-muted whitespace-nowrap">What is</span>
            <input
              type="number"
              value={m1X}
              onChange={(e) => setM1X(e.target.value)}
              className="w-20 p-2 bg-background border border-border rounded-lg focus:border-primary outline-none"
            />
            <span className="font-bold text-muted whitespace-nowrap">% of</span>
            <input
              type="number"
              value={m1Y}
              onChange={(e) => setM1Y(e.target.value)}
              className="flex-1 min-w-[80px] p-2 bg-background border border-border rounded-lg focus:border-primary outline-none"
            />
            <span className="font-bold text-muted">?</span>
            <div className="ml-auto bg-primary/10 text-primary border border-primary/20 p-2 px-4 rounded-lg font-bold min-w-[100px] text-center">
              {m1X && m1Y && !isNaN(parseFloat(m1X)) && !isNaN(parseFloat(m1Y))
                ? parseFloat(
                    ((parseFloat(m1X) / 100) * parseFloat(m1Y)).toFixed(4)
                  ).toLocaleString()
                : '0'}
            </div>
          </div>
        </div>

        {/* Mode 2 */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center text-sm md:text-base flex-wrap">
            <input
              type="number"
              value={m2X}
              onChange={(e) => setM2X(e.target.value)}
              className="w-24 p-2 bg-background border border-border rounded-lg focus:border-primary outline-none"
            />
            <span className="font-bold text-muted whitespace-nowrap">is what % of</span>
            <input
              type="number"
              value={m2Y}
              onChange={(e) => setM2Y(e.target.value)}
              className="flex-1 min-w-[80px] p-2 bg-background border border-border rounded-lg focus:border-primary outline-none"
            />
            <span className="font-bold text-muted">?</span>
            <div className="ml-auto bg-primary/10 text-primary border border-primary/20 p-2 px-4 rounded-lg font-bold min-w-[100px] text-center">
              {m2X &&
              m2Y &&
              !isNaN(parseFloat(m2X)) &&
              !isNaN(parseFloat(m2Y)) &&
              parseFloat(m2Y) !== 0
                ? parseFloat(
                    ((parseFloat(m2X) / parseFloat(m2Y)) * 100).toFixed(4)
                  ).toLocaleString() + '%'
                : '0%'}
            </div>
          </div>
        </div>

        {/* Mode 3 */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center text-sm md:text-base flex-wrap">
            <span className="font-bold text-muted whitespace-nowrap">% change from</span>
            <input
              type="number"
              value={m3X}
              onChange={(e) => setM3X(e.target.value)}
              className="w-24 p-2 bg-background border border-border rounded-lg focus:border-primary outline-none"
            />
            <span className="font-bold text-muted whitespace-nowrap">to</span>
            <input
              type="number"
              value={m3Y}
              onChange={(e) => setM3Y(e.target.value)}
              className="flex-1 min-w-[80px] p-2 bg-background border border-border rounded-lg focus:border-primary outline-none"
            />
            <div className="ml-auto bg-primary/10 text-primary border border-primary/20 p-2 px-4 rounded-lg font-bold min-w-[100px] text-center">
              {m3X &&
              m3Y &&
              !isNaN(parseFloat(m3X)) &&
              !isNaN(parseFloat(m3Y)) &&
              parseFloat(m3X) !== 0
                ? (() => {
                    const diff = parseFloat(m3Y) - parseFloat(m3X)
                    const percent = (diff / parseFloat(m3X)) * 100
                    return (
                      (percent > 0 ? '+' : '') +
                      parseFloat(percent.toFixed(4)).toLocaleString() +
                      '%'
                    )
                  })()
                : '0%'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
