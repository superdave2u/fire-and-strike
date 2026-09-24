import { useMemo, useState } from 'react'
import {
  DEFAULT_PLAN_INPUTS,
  RUNS,
  SEED,
  SOLVER_RUNS,
  type FireProjectionView,
  type PlanInputs,
  type StrikePlanView,
} from '../../application/dto'
import { ProjectFireTrajectory } from '../../application/ProjectFireTrajectory'
import { SolveStrikePlan } from '../../application/SolveStrikePlan'
import { PercentileAggregator } from '../../domain/services/PercentileAggregator'
import { Mulberry32Normal } from '../../infrastructure/rng/Mulberry32Normal'
import { linearInterpolationPercentile } from '../../infrastructure/stats/percentile'

const MAX_AGE = 99

function clampInt(value: number, min: number, max: number): number {
  const rounded = Number.isFinite(value) ? Math.round(value) : min
  return Math.min(max, Math.max(min, rounded))
}

function clampRange(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min
}

function clampField(field: keyof PlanInputs, value: number, current: PlanInputs): number {
  switch (field) {
    case 'currentAge':
      return clampInt(value, 1, MAX_AGE)
    case 'currentPortfolio':
    case 'yearlyContribution':
      return clampRange(value, 0, Number.MAX_SAFE_INTEGER)
    case 'annualSpending':
      return clampRange(value, 1, Number.MAX_SAFE_INTEGER)
    case 'stockWeight':
      return clampRange(value, 0, 1)
    case 'targetAge':
      return clampInt(value, current.currentAge + 1, MAX_AGE + 1)
    case 'drawRate':
      return clampRange(value, 0.001, 0.5)
    case 'stockMean':
    case 'bondMean':
      return clampRange(value, -0.5, 0.5)
    case 'stockStd':
    case 'bondStd':
      return clampRange(value, 0, 1)
  }
}

function sameInputs(a: PlanInputs, b: PlanInputs): boolean {
  return (Object.keys(a) as (keyof PlanInputs)[]).every((field) => a[field] === b[field])
}

export interface FirePlan {
  inputs: PlanInputs
  applied: PlanInputs
  setField: (field: keyof PlanInputs, value: number) => void
  calculate: () => void
  dirty: boolean
  fire: FireProjectionView
  strike: StrikePlanView
}

export function useFirePlan(): FirePlan {
  const [draft, setDraft] = useState<PlanInputs>(DEFAULT_PLAN_INPUTS)
  const [applied, setApplied] = useState<PlanInputs>(DEFAULT_PLAN_INPUTS)

  const fire = useMemo<FireProjectionView>(
    () =>
      new ProjectFireTrajectory({
        seed: SEED,
        runs: RUNS,
        randomStreamFactory: (seed) => new Mulberry32Normal(seed),
        aggregator: new PercentileAggregator(linearInterpolationPercentile),
      }).run(applied),
    [applied],
  )

  const strike = useMemo<StrikePlanView>(
    () =>
      new SolveStrikePlan({
        seed: SEED,
        runs: SOLVER_RUNS,
        randomStreamFactory: (seed) => new Mulberry32Normal(seed),
        aggregator: new PercentileAggregator(linearInterpolationPercentile),
      }).run(applied),
    [applied],
  )

  const setField = (field: keyof PlanInputs, value: number): void => {
    setDraft((prev) => {
      const next: PlanInputs = { ...prev, [field]: clampField(field, value, prev) }
      if (field === 'currentAge' && next.targetAge <= next.currentAge) {
        next.targetAge = Math.min(MAX_AGE + 1, next.currentAge + 1)
      }
      return next
    })
  }

  const calculate = (): void => setApplied(draft)

  return {
    inputs: draft,
    applied,
    setField,
    calculate,
    dirty: !sameInputs(draft, applied),
    fire,
    strike,
  }
}