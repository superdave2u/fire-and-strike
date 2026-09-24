import type { PlanInputs } from '../../application/dto'

interface AdvancedSectionProps {
  inputs: PlanInputs
  onChange: (field: keyof PlanInputs, value: number) => void
}

const PERCENT_FIELDS: { field: keyof PlanInputs; label: string }[] = [
  { field: 'drawRate', label: 'Draw rate (%)' },
  { field: 'stockMean', label: 'Expected stock return (%, real)' },
  { field: 'bondMean', label: 'Expected bond return (%, real)' },
  { field: 'stockStd', label: 'Stock volatility (%)' },
  { field: 'bondStd', label: 'Bond volatility (%)' },
]

function asPercent(fraction: number): number {
  return Number((fraction * 100).toFixed(2))
}

export function AdvancedSection({ inputs, onChange }: AdvancedSectionProps) {
  return (
    <details className="advanced">
      <summary>Advanced assumptions</summary>
      <p className="advanced-hint">
        Defaults follow historical US real returns. The FIRE multiple is 1 ÷ draw rate.
      </p>
      <div className="advanced-grid">
        {PERCENT_FIELDS.map(({ field, label }) => (
          <div key={field}>
            <label htmlFor={field}>{label}</label>
            <input
              id={field}
              name={field}
              type="number"
              step={0.1}
              value={asPercent(inputs[field])}
              onChange={(event) => onChange(field, Number(event.target.value) / 100)}
            />
          </div>
        ))}
      </div>
    </details>
  )
}