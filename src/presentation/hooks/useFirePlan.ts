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
import { parseFields, toFields, type PlanField, type PlanFields } from '../planFields'

function sameInputs(a: PlanInputs, b: PlanInputs): boolean {
  return (Object.keys(a) as (keyof PlanInputs)[]).every((field) => a[field] === b[field])
}

export interface FirePlan {
  fields: PlanFields
  applied: PlanInputs
  setField: (field: PlanField, value: string) => void
  calculate: () => void
  dirty: boolean
  errors: string[]
  canCalculate: boolean
  fire: FireProjectionView
  strike: StrikePlanView
}

export function useFirePlan(): FirePlan {
  const [fields, setFields] = useState<PlanFields>(() => toFields(DEFAULT_PLAN_INPUTS))
  const [applied, setApplied] = useState<PlanInputs>(DEFAULT_PLAN_INPUTS)
  const parsed = useMemo(() => parseFields(fields), [fields])

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

  const setField = (field: PlanField, value: string): void => {
    setFields((prev) => ({ ...prev, [field]: value }))
  }

  const calculate = (): void => {
    if (parsed.inputs) {
      setApplied(parsed.inputs)
    }
  }

  return {
    fields,
    applied,
    setField,
    calculate,
    dirty: !(parsed.inputs && sameInputs(parsed.inputs, applied)),
    errors: parsed.errors,
    canCalculate: parsed.inputs !== null,
    fire,
    strike,
  }
}