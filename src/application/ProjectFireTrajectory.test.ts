import { describe, expect, it } from 'vitest'
import { ProjectFireTrajectory } from './ProjectFireTrajectory'
import { DEFAULT_PLAN_INPUTS } from './dto'
import { CyclingDraws, fakePercentile } from '../domain/services/testFixtures'
import { PercentileAggregator } from '../domain/services/PercentileAggregator'

function useCaseWith(seed: number): ProjectFireTrajectory {
  return new ProjectFireTrajectory({
    seed,
    runs: 200,
    randomStreamFactory: () => new CyclingDraws([0]),
    aggregator: new PercentileAggregator(fakePercentile),
  })
}

describe('ProjectFireTrajectory', () => {
  it('returns the exact compound view for a zero-volatility stream', () => {
    const view = useCaseWith(42).run(DEFAULT_PLAN_INPUTS)
    expect(view.fireNumber).toBe(1_500_000)
    expect(view.ages[0]).toBe(35)
    expect(view.ages.at(-1)).toBe(75)
    expect(view.p50[0]).toBe(100_000)
    expect(view.p50[1]).toBeCloseTo(100_000 * 1.061 + 30_000, 6)
    expect(typeof view.crossings.p50).toBe('number')
  })

  it('replays identically for identical inputs (seeded determinism)', () => {
    const a = useCaseWith(42).run(DEFAULT_PLAN_INPUTS)
    const b = useCaseWith(42).run(DEFAULT_PLAN_INPUTS)
    expect(a.p50).toEqual(b.p50)
    expect(a.crossings).toEqual(b.crossings)
  })

  it('rejects invalid plan inputs through the value objects', () => {
    expect(() => useCaseWith(42).run({ ...DEFAULT_PLAN_INPUTS, annualSpending: 0 })).toThrow()
    expect(() => useCaseWith(42).run({ ...DEFAULT_PLAN_INPUTS, stockWeight: 1.5 })).toThrow()
    expect(() => useCaseWith(42).run({ ...DEFAULT_PLAN_INPUTS, currentPortfolio: -1 })).toThrow()
  })

  it('maps the allocation slider onto blended return parameters', () => {
    const view = useCaseWith(42).run({ ...DEFAULT_PLAN_INPUTS, stockWeight: 1 })
    expect(view.p50[1]).toBeCloseTo(100_000 * 1.07 + 30_000, 6)
  })
})