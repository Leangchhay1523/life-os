import UnitConverter from './UnitConverter'
import CurrencyConverter from './CurrencyConverter'
import PercentageCalculator from './PercentageCalculator'

export default function MathAndConverters() {
  return (
    <div className="flex flex-col space-y-8 pb-12 w-full mx-auto">
      <PercentageCalculator />
      <UnitConverter />
      <CurrencyConverter />
    </div>
  )
}
