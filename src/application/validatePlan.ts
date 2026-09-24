import type { PlanInputs } from './dto'

export function validatePlan(inputs: PlanInputs): string[] {
  const errors: string[] = []
  const {
    currentAge,
    currentPortfolio,
    yearlyContribution,
    annualSpending,
    targetAge,
    stockWeight,
    drawRate,
    stockMean,
    bondMean,
    stockStd,
    bondStd,
  } = inputs

  if (!Number.isInteger(currentAge) || currentAge < 1 || currentAge > 100) {
    errors.push('Current age must be a whole number between 1 and 100')
  }
  if (!(Number.isFinite(currentPortfolio) && currentPortfolio >= 0)) {
    errors.push('Current portfolio value must be 0 or greater')
  }
  if (!(Number.isFinite(yearlyContribution) && yearlyContribution >= 0)) {
    errors.push('Yearly contribution must be 0 or greater')
  }
  if (!(Number.isFinite(annualSpending) && annualSpending > 0)) {
    errors.push('Expected retirement spending must be greater than 0')
  }
  if (!Number.isInteger(targetAge) || targetAge <= currentAge || targetAge > 101) {
    errors.push('Target retirement age must be a whole number greater than current age and at most 101')
  }
  if (!(Number.isFinite(stockWeight) && stockWeight >= 0 && stockWeight <= 1)) {
    errors.push('Stock allocation must be between 0 and 100%')
  }
  if (!(Number.isFinite(drawRate) && drawRate > 0 && drawRate <= 1)) {
    errors.push('Draw rate must be greater than 0% and at most 100%')
  }
  if (!(Number.isFinite(stockMean) && stockMean >= -0.5 && stockMean <= 0.5)) {
    errors.push('Expected stock return must be between -50% and 50%')
  }
  if (!(Number.isFinite(bondMean) && bondMean >= -0.5 && bondMean <= 0.5)) {
    errors.push('Expected bond return must be between -50% and 50%')
  }
  if (!(Number.isFinite(stockStd) && stockStd >= 0 && stockStd <= 1)) {
    errors.push('Stock volatility must be between 0 and 100%')
  }
  if (!(Number.isFinite(bondStd) && bondStd >= 0 && bondStd <= 1)) {
    errors.push('Bond volatility must be between 0 and 100%')
  }
  return errors
}