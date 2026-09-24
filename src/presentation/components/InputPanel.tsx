import { formatMultiplier, formatUsd } from '../format'
import type { PlanField, PlanFields } from '../planFields'

interface InputPanelProps {
  fields: PlanFields
  fireNumber: number
  fireSpending: number
  multiplier: number
  dirty: boolean
  errors: string[]
  canCalculate: boolean
  onChange: (field: PlanField, value: string) => void
  onCalculate: () => void
}

const FIELDS: { field: PlanField; label: string }[] = [
  { field: 'currentAge', label: 'Current age' },
  { field: 'currentPortfolio', label: 'Current portfolio value ($)' },
  { field: 'yearlyContribution', label: 'Yearly contribution ($/yr)' },
  { field: 'annualSpending', label: 'Expected retirement spending ($/yr)' },
  { field: 'targetAge', label: 'Target retirement age' },
]

export function InputPanel({
  fields,
  fireNumber,
  fireSpending,
  multiplier,
  dirty,
  errors,
  canCalculate,
  onChange,
  onCalculate,
}: InputPanelProps) {
  const parsedStocks = Number(fields.stockWeight)
  const stocks = Number.isFinite(parsedStocks)
    ? Math.min(100, Math.max(0, Math.round(parsedStocks)))
    : 0
  const hasErrors = errors.length > 0
  return (
    <section aria-label="Plan inputs">
      {FIELDS.map(({ field, label }) => (
        <div key={field}>
          <label htmlFor={field}>{label}</label>
          <input
            id={field}
            name={field}
            type="number"
            value={fields[field]}
            onChange={(event) => onChange(field, event.target.value)}
          />
        </div>
      ))}
      <div>
        <label htmlFor="stockWeight">Stocks {stocks}% / Bonds {100 - stocks}%</label>
        <input
          id="stockWeight"
          name="stockWeight"
          type="range"
          min={0}
          max={100}
          step={1}
          value={stocks}
          onChange={(event) => onChange('stockWeight', event.target.value)}
        />
      </div>
      {hasErrors && (
        <div role="alert" className="warning">
          <strong>Please fix these before calculating:</strong>
          <ul>
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="calculate-row">
        <button type="button" onClick={onCalculate} disabled={!canCalculate}>
          Calculate
        </button>
        {dirty && !hasErrors && (
          <span role="status">Inputs changed — press Calculate to update the charts</span>
        )}
      </div>
      <p>
        FIRE number: {formatUsd(fireNumber)} ({formatMultiplier(multiplier)} × {formatUsd(fireSpending)})
      </p>
    </section>
  )
}