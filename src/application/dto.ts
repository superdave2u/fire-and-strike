import type { GaussianParameters } from '../domain/services/GaussianReturnModel'
import type { ProjectionInput } from '../domain/services/MonteCarloFireProjector'
import { AllocationMix } from '../domain/model/AllocationMix'
import { FireGoal } from '../domain/model/FireGoal'
import { Money } from '../domain/model/Money'

export const DEFAULT_HORIZON_AGE = 75
export const SEED = 42
export const RUNS = 10_000

export interface PlanInputs {
  currentAge: number
  currentPortfolio: number
  yearlyContribution: number
  annualSpending: number
  stockWeight: number
  targetAge: number
}

export const DEFAULT_PLAN_INPUTS: PlanInputs = {
  currentAge: 35,
  currentPortfolio: 100_000,
  yearlyContribution: 30_000,
  annualSpending: 60_000,
  stockWeight: 0.8,
  targetAge: 55,
}

export interface FireProjectionView {
  ages: number[]
  p10: number[]
  p50: number[]
  p90: number[]
  fireNumber: number
  crossings: {
    p10: number | null
    p50: number | null
    p90: number | null
  }
}

export interface StrikePlanView {
  achievable: boolean
  extraYearlyContribution: number
  acceleratedP50: number[]
  ages: number[]
  targetAge: number
}

export function toProjectionInput(inputs: PlanInputs): ProjectionInput {
  return {
    currentPortfolio: Money.of(inputs.currentPortfolio),
    yearlyContribution: Money.of(inputs.yearlyContribution),
    startAge: inputs.currentAge,
    horizonAge: Math.max(DEFAULT_HORIZON_AGE, inputs.currentAge + 1),
    fireGoal: FireGoal.of(inputs.annualSpending),
    returnParameters: AllocationMix.of(inputs.stockWeight),
  }
}

export function mixParameters(inputs: PlanInputs): GaussianParameters {
  const mix = AllocationMix.of(inputs.stockWeight)
  return { mean: mix.mean, std: mix.std }
}