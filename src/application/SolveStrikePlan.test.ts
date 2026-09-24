import { describe, expect, it } from 'vitest'
import { SolveStrikePlan } from './SolveStrikePlan'
import { DEFAULT_PLAN_INPUTS } from './dto'
import { CyclingDraws, fakePercentile } from '../domain/services/testFixtures'
import { GaussianReturnModel } from '../domain/services/GaussianReturnModel'
import { PercentileAggregator } from '../domain/services/PercentileAggregator'

function useCaseWith(seed: number, maxExtra?: number): SolveStrikePlan {
  return new SolveStrikePlan({
    seed,
    runs: 200,
    randomStreamFactory: () => new CyclingDraws([0]),
    aggregator: new PercentileAggregator(fakePercentile),
    maxExtra,
  })
}

describe('SolveStrikePlan', () => {
  it('solves the extra contribution reaching the goal at the target age', () => {
    const view = useCaseWith(42).run(DEFAULT_PLAN_INPUTS)
    expect(view.achievable).toBe(true)
    expect(view.extraYearlyContribution).toBeGreaterThan(0)
    const atTarget = view.acceleratedP50[view.targetAge - DEFAULT_PLAN_INPUTS.currentAge]
    expect(atTarget).toBeGreaterThanOrEqual(1_500_000)
    expect(view.ages.at(-1)).toBe(75)
  })

  it('is deterministic for identical inputs', () => {
    const a = useCaseWith(42).run(DEFAULT_PLAN_INPUTS)
    const b = useCaseWith(42).run(DEFAULT_PLAN_INPUTS)
    expect(a.extraYearlyContribution).toBe(b.extraYearlyContribution)
    expect(a.acceleratedP50).toEqual(b.acceleratedP50)
  })

  it('rejects invalid plan inputs', () => {
    expect(() => useCaseWith(42).run({ ...DEFAULT_PLAN_INPUTS, annualSpending: 0 })).toThrow()
    expect(() => useCaseWith(42).run({ ...DEFAULT_PLAN_INPUTS, targetAge: 30 })).toThrow()
  })

  it('reports an unachievable target instead of throwing', () => {
    const view = useCaseWith(42, 1_000).run(DEFAULT_PLAN_INPUTS)
    expect(view.achievable).toBe(false)
    expect(view.extraYearlyContribution).toBe(0)
    expect(view.acceleratedP50).toEqual([])
  })
})