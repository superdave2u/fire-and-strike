import { useMemo, useState } from 'react'
import {
  DEFAULT_PLAN_INPUTS,
  RUNS,
  SEED,
  SOLVER_RUNS,
  type FireProjectionView,
  type PlanError,
  type PlanField,
  type PlanInputs,
  type StrikePlanView,
} from '../../application/dto'
import { ProjectFireTrajectory } from '../../application/ProjectFireTrajectory'
import { SolveStrikePlan } from '../../application/SolveStrikePlan'
import { PercentileAggregator } from '../../domain/services/PercentileAggregator'
import { Mulberry32Normal } from '../../infrastructure/rng/Mulberry32Normal'
import { linearInterpolationPercentile } from '../../infrastructure/stats/percentile'
import { parseFields, toFields, type PlanFields } from '../planFields'

const NO_ERRORS: PlanError[] = []

function sameInputs(a: PlanInputs, b: PlanInputs): boolean {
  return (Object.keys(a) as (keyof PlanInputs)[]).every((field) => a[field] === b[field])
}

export interface FirePlan {
  fields: PlanFields
  applied: PlanInputs
  setField: (field: PlanField, value: string) => void
  calculate: () => void
  dirty: boolean
  errors: PlanError[]
  invalidFields: PlanField[]
  fire: FireProjectionView
  strike: StrikePlanView
}

export function useFirePlan(): FirePlan {
  const [fields, setFields] = useState<PlanFields>(() => toFields(DEFAULT_PLAN_INPUTS))
  const [applied, setApplied] = useState<PlanInputs>(DEFAULT_PLAN_INPUTS)
  const [submitted, setSubmitted] = useState(false)
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

  const errors = submitted ? parsed.errors : NO_ERRORS
  const invalidFields = useMemo(
    () => Array.from(new Set(errors.map((error) => error.field))),
    [errors],
  )

  const setField = (field: PlanField, value: string): void => {
    setFields((prev) => ({ ...prev, [field]: value }))
  }

  const calculate = (): void => {
    if (parsed.inputs) {
      setApplied(parsed.inputs)
      setSubmitted(false)
    } else {
      setSubmitted(true)
    }
  }

  return {
    fields,
    applied,
    setField,
    calculate,
    dirty: !(parsed.inputs && sameInputs(parsed.inputs, applied)),
    errors,
    invalidFields,
    fire,
    strike,
  }
}