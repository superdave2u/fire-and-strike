import { formatUsd } from '../format'
import type { PlanInputs } from '../../application/dto'

interface InputPanelProps {
  inputs: PlanInputs
  fireNumber: number
  onChange: (field: keyof PlanInputs, value: number) => void
}

const FIELDS: { field: keyof PlanInputs; label: string }[] = [
  { field: 'currentAge', label: 'Current age' },
  { field: 'currentPortfolio', label: 'Current portfolio value ($)' },
  { field: 'yearlyContribution', label: 'Yearly contribution ($/yr)' },
  { field: 'annualSpending', label: 'Expected retirement spending ($/yr)' },
  { field: 'targetAge', label: 'Target retirement age' },
]

export function InputPanel({ inputs, fireNumber, onChange }: InputPanelProps) {
  const stocks = Math.round(inputs.stockWeight * 100)
  return (
    <section aria-label="Plan inputs">
      {FIELDS.map(({ field, label }) => (
        <div key={field}>
          <label htmlFor={field}>{label}</label>
          <input
            id={field}
            name={field}
            type="number"
            value={inputs[field]}
            onChange={(event) => onChange(field, Number(event.target.value))}
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
          onChange={(event) => onChange('stockWeight', Number(event.target.value) / 100)}
        />
      </div>
      <p>
        FIRE number: {formatUsd(fireNumber)} (25 × {formatUsd(inputs.annualSpending)})
      </p>
    </section>
  )
}