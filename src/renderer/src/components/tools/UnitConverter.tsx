import { useState, useEffect } from 'react'

const unitsData = {
  Length: {
    meters: 1,
    kilometers: 0.001,
    centimeters: 100,
    millimeters: 1000,
    inches: 39.3701,
    feet: 3.28084,
    miles: 0.000621371
  },
  Weight: {
    kilograms: 1,
    grams: 1000,
    milligrams: 1e6,
    pounds: 2.20462,
    ounces: 35.274
  },
  Temperature: {
    Celsius: 'C',
    Fahrenheit: 'F',
    Kelvin: 'K'
  },
  Volume: {
    liters: 1,
    milliliters: 1000,
    'cubic meters': 0.001,
    gallons: 0.264172,
    ounces: 33.814
  }
}

type UnitCategory = keyof typeof unitsData

export default function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>('Length')
  const [fromUnit, setFromUnit] = useState('meters')
  const [toUnit, setToUnit] = useState('feet')
  const [fromValue, setFromValue] = useState('1')
  const [toValue, setToValue] = useState('')

  const handleCategoryChange = (val: UnitCategory) => {
    setCategory(val)
    const defaultUnits = Object.keys(unitsData[val])
    setFromUnit(defaultUnits[0])
    setToUnit(defaultUnits[1] || defaultUnits[0])
  }

  useEffect(() => {
    if (!fromValue || isNaN(parseFloat(fromValue))) {
      setToValue('')
      return
    }

    const val = parseFloat(fromValue)

    if (category === 'Temperature') {
      let c = 0
      // Convert to Celsius first
      if (fromUnit === 'Celsius') c = val
      if (fromUnit === 'Fahrenheit') c = ((val - 32) * 5) / 9
      if (fromUnit === 'Kelvin') c = val - 273.15

      // Convert Celsius to Target
      let res = 0
      if (toUnit === 'Celsius') res = c
      if (toUnit === 'Fahrenheit') res = (c * 9) / 5 + 32
      if (toUnit === 'Kelvin') res = c + 273.15

      setToValue(res.toFixed(2))
    } else {
      // Standard proportional conversion
      const catData = unitsData[category] as Record<string, number>
      const rateFrom = catData[fromUnit]
      const rateTo = catData[toUnit]

      if (rateFrom && rateTo) {
        // Value in base unit (e.g., meters) = val / rateFrom
        const baseVal = val / rateFrom
        // Result = baseVal * rateTo
        const res = baseVal * rateTo
        // clean up decimal
        setToValue(parseFloat(res.toFixed(6)).toString())
      }
    }
  }, [fromValue, fromUnit, toUnit, category])

  const handleSwap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    setFromValue(toValue)
  }

  return (
    <div className="space-y-6 w-full">
      <div className="p-6 bg-card border border-border rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Unit Converter</h2>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as UnitCategory)}
            className="p-2 bg-surface border border-border rounded-lg text-sm font-bold focus:outline-none focus:border-primary"
          >
            {Object.keys(unitsData).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* From */}
          <div className="flex-1 flex flex-col gap-2 w-full">
            <input
              type="number"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-lg text-lg font-mono focus:outline-none focus:border-primary"
              placeholder="Value"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="p-2 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary"
            >
              {Object.keys(unitsData[category]).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Swap */}
          <div
            onClick={handleSwap}
            className="w-10 h-10 flex items-center justify-center bg-surface hover:bg-border cursor-pointer rounded-full transition-colors flex-shrink-0 md:mt-6"
          >
            ⇄
          </div>

          {/* To */}
          <div className="flex-1 flex flex-col gap-2 w-full">
            <input
              type="text"
              readOnly
              value={toValue}
              className="w-full p-3 bg-surface border border-border rounded-lg text-lg font-mono text-primary outline-none"
              placeholder="Result"
            />
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="p-2 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary"
            >
              {Object.keys(unitsData[category]).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
