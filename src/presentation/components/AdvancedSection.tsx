import type { PlanField, PlanFields } from '../planFields'

interface AdvancedSectionProps {
  fields: PlanFields
  invalidFields: PlanField[]
  onChange: (field: PlanField, value: string) => void
}

const PERCENT_FIELDS: { field: PlanField; label: string }[] = [
  { field: 'drawRate', label: 'Draw rate (%)' },
  { field: 'stockMean', label: 'Expected stock return (%, real)' },
  { field: 'bondMean', label: 'Expected bond return (%, real)' },
  { field: 'stockStd', label: 'Stock volatility (%)' },
  { field: 'bondStd', label: 'Bond volatility (%)' },
]

export function AdvancedSection({ fields, invalidFields, onChange }: AdvancedSectionProps) {
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
              value={fields[field]}
              aria-invalid={invalidFields.includes(field)}
              onChange={(event) => onChange(field, event.target.value)}
            />
          </div>
        ))}
      </div>
    </details>
  )
}