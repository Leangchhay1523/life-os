import TimeCalculator from './TimeCalculator'
import DateCalculator from './DateCalculator'
import TimestampConverter from './TimestampConverter'

export default function DateTimeTools() {
  return (
    <div className="flex flex-col space-y-8 pb-12 w-full mx-auto">
      <TimeCalculator />
      <DateCalculator />
      <TimestampConverter />
    </div>
  )
}
