import { useMemo, useState } from 'react'
import {
  DEFAULT_PLAN_INPUTS,
  RUNS,
  SOLVER_RUNS,
  SEED,
  type FireProjectionView,
  type PlanInputs,
  type StrikePlanView,
} from '../../application/dto'
import { ProjectFireTrajectory } from '../../application/ProjectFireTrajectory'
import { SolveStrikePlan } from '../../application/SolveStrikePlan'
import { PercentileAggregator } from '../../domain/services/PercentileAggregator'
import { Mulberry32Normal } from '../../infrastructure/rng/Mulberry32Normal'
import { linearInterpolationPercentile } from '../../infrastructure/stats/percentile'

const HORIZON_MIN_AGE = 100

function clampInt(value: number, min: number, max: number): number {
  const rounded = Number.isFinite(value) ? Math.round(value) : min
  return Math.min(max, Math.max(min, rounded))
}

function clampMoney(value: number, min: number): number {
  return Number.isFinite(value) ? Math.max(min, value) : min
}

function clampField(field: keyof PlanInputs, value: number, current: PlanInputs): number {
  switch (field) {
    case 'currentAge':
      return clampInt(value, 1, HORIZON_MIN_AGE - 1)
    case 'currentPortfolio':
      return clampMoney(value, 0)
    case 'yearlyContribution':
      return clampMoney(value, 0)
    case 'annualSpending':
      return clampMoney(value, 1)
    case 'stockWeight':
      return Math.min(1, clampMoney(value, 0))
    case 'targetAge':
      return clampInt(value, current.currentAge + 1, HORIZON_MIN_AGE)
  }
}

export function useFirePlan(): {
  inputs: PlanInputs
  setField: (field: keyof PlanInputs, value: number) => void
  fire: FireProjectionView
  strike: StrikePlanView
} {
  const [inputs, setInputs] = useState<PlanInputs>(DEFAULT_PLAN_INPUTS)

  const fire = useMemo<FireProjectionView>(
    () =>
      new ProjectFireTrajectory({
        seed: SEED,
        runs: RUNS,
        randomStreamFactory: (seed) => new Mulberry32Normal(seed),
        aggregator: new PercentileAggregator(linearInterpolationPercentile),
      }).run(inputs),
    [inputs],
  )

  const strike = useMemo<StrikePlanView>(
    () =>
      new SolveStrikePlan({
        seed: SEED,
        runs: SOLVER_RUNS,
        randomStreamFactory: (seed) => new Mulberry32Normal(seed),
        aggregator: new PercentileAggregator(linearInterpolationPercentile),
      }).run(inputs),
    [inputs],
  )

  const setField = (field: keyof PlanInputs, value: number): void => {
    setInputs((prev) => {
      const next: PlanInputs = { ...prev, [field]: clampField(field, value, prev) }
      if (field === 'currentAge' && next.targetAge <= next.currentAge) {
        next.targetAge = Math.min(HORIZON_MIN_AGE, next.currentAge + 1)
      }
      return next
    })
  }

  return { inputs, setField, fire, strike }
}