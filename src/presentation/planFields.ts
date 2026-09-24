import { validatePlan } from '../application/validatePlan'
import type { PlanError, PlanField, PlanInputs } from '../application/dto'

export type { PlanError, PlanField } from '../application/dto'
export type PlanFields = Record<PlanField, string>

export interface ParsedFields {
  inputs: PlanInputs | null
  errors: PlanError[]
}

const FIELD_LABELS: Record<PlanField, string> = {
  currentAge: 'Current age',
  currentPortfolio: 'Current portfolio value',
  yearlyContribution: 'Yearly contribution',
  annualSpending: 'Expected retirement spending',
  targetAge: 'Target retirement age',
  stockWeight: 'Stock allocation',
  drawRate: 'Draw rate',
  stockMean: 'Expected stock return',
  bondMean: 'Expected bond return',
  stockStd: 'Stock volatility',
  bondStd: 'Bond volatility',
}

const PERCENT_FIELDS: PlanField[] = [
  'stockWeight',
  'drawRate',
  'stockMean',
  'bondMean',
  'stockStd',
  'bondStd',
]

function asPercent(fraction: number): string {
  return String(Number((fraction * 100).toFixed(4)))
}

export function toFields(inputs: PlanInputs): PlanFields {
  return {
    currentAge: String(inputs.currentAge),
    currentPortfolio: String(inputs.currentPortfolio),
    yearlyContribution: String(inputs.yearlyContribution),
    annualSpending: String(inputs.annualSpending),
    targetAge: String(inputs.targetAge),
    stockWeight: asPercent(inputs.stockWeight),
    drawRate: asPercent(inputs.drawRate),
    stockMean: asPercent(inputs.stockMean),
    bondMean: asPercent(inputs.bondMean),
    stockStd: asPercent(inputs.stockStd),
    bondStd: asPercent(inputs.bondStd),
  }
}

export function parseFields(fields: PlanFields): ParsedFields {
  const errors: PlanError[] = []
  const numeric = {} as Record<PlanField, number>

  for (const field of Object.keys(FIELD_LABELS) as PlanField[]) {
    const raw = fields[field].trim()
    if (raw === '') {
      errors.push({ field, message: `${FIELD_LABELS[field]} is required` })
      continue
    }
    const value = Number(raw)
    if (!Number.isFinite(value)) {
      errors.push({ field, message: `${FIELD_LABELS[field]} must be a number` })
      continue
    }
    numeric[field] = PERCENT_FIELDS.includes(field) ? value / 100 : value
  }

  if (errors.length > 0) {
    return { inputs: null, errors }
  }

  const inputs: PlanInputs = {
    currentAge: numeric.currentAge,
    currentPortfolio: numeric.currentPortfolio,
    yearlyContribution: numeric.yearlyContribution,
    annualSpending: numeric.annualSpending,
    targetAge: numeric.targetAge,
    stockWeight: numeric.stockWeight,
    drawRate: numeric.drawRate,
    stockMean: numeric.stockMean,
    bondMean: numeric.bondMean,
    stockStd: numeric.stockStd,
    bondStd: numeric.bondStd,
  }
  const rangeErrors = validatePlan(inputs)
  return rangeErrors.length > 0 ? { inputs: null, errors: rangeErrors } : { inputs, errors: [] }
}