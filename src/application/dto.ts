import type { GaussianParameters } from '../domain/services/GaussianReturnModel'
import type { ProjectionInput } from '../domain/services/MonteCarloFireProjector'
import { AllocationMix } from '../domain/model/AllocationMix'
import { FireGoal } from '../domain/model/FireGoal'
import { Money } from '../domain/model/Money'
import { ReturnAssumptions } from '../domain/model/ReturnAssumptions'

export const DEFAULT_HORIZON_AGE = 75
export const SEED = 42
export const RUNS = 10_000
export const SOLVER_RUNS = 3_000

export interface PlanInputs {
  currentAge: number
  currentPortfolio: number
  yearlyContribution: number
  annualSpending: number
  stockWeight: number
  targetAge: number
  drawRate: number
  stockMean: number
  bondMean: number
  stockStd: number
  bondStd: number
}

export const DEFAULT_PLAN_INPUTS: PlanInputs = {
  currentAge: 35,
  currentPortfolio: 100_000,
  yearlyContribution: 30_000,
  annualSpending: 60_000,
  stockWeight: 0.8,
  targetAge: 55,
  drawRate: 0.04,
  stockMean: 0.07,
  bondMean: 0.025,
  stockStd: 0.18,
  bondStd: 0.06,
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

export function fireMultiplier(drawRate: number): number {
  return 1 / drawRate
}

export function assumptionsOf(inputs: PlanInputs): ReturnAssumptions {
  return ReturnAssumptions.of(
    { mean: inputs.stockMean, std: inputs.stockStd },
    { mean: inputs.bondMean, std: inputs.bondStd },
  )
}

export function toProjectionInput(inputs: PlanInputs): ProjectionInput {
  return {
    currentPortfolio: Money.of(inputs.currentPortfolio),
    yearlyContribution: Money.of(inputs.yearlyContribution),
    startAge: inputs.currentAge,
    horizonAge: Math.max(DEFAULT_HORIZON_AGE, inputs.currentAge + 1),
    fireGoal: FireGoal.of(inputs.annualSpending, fireMultiplier(inputs.drawRate)),
    returnParameters: AllocationMix.of(inputs.stockWeight, assumptionsOf(inputs)),
  }
}

export function mixParameters(inputs: PlanInputs): GaussianParameters {
  const mix = AllocationMix.of(inputs.stockWeight, assumptionsOf(inputs))
  return { mean: mix.mean, std: mix.std }
}