import { describe, expect, it } from 'vitest'
import { MonteCarloFireProjector } from './MonteCarloFireProjector'
import { PercentileAggregator } from './PercentileAggregator'
import { GaussianReturnModel } from './GaussianReturnModel'
import { CyclingDraws, fakePercentile } from './testFixtures'
import { FireGoal } from '../model/FireGoal'
import { Money } from '../model/Money'

function makeProjector(runs = 1_000): MonteCarloFireProjector {
  return new MonteCarloFireProjector({
    runs,
    returnModelFactory: () =>
      new GaussianReturnModel(new CyclingDraws([0]), { mean: 0.061, std: 0 }),
    aggregator: new PercentileAggregator(fakePercentile),
  })
}

function deterministicInput(horizonAge: number) {
  return {
    currentPortfolio: Money.of(100_000),
    yearlyContribution: Money.of(30_000),
    startAge: 35,
    horizonAge,
    fireGoal: FireGoal.of(6_000),
    returnParameters: { mean: 0.061, std: 0 },
  }
}

describe('MonteCarloFireProjector', () => {
  it('projects the exact compound curve when returns are deterministic', () => {
    const projection = makeProjector().project(deterministicInput(40))
    expect(projection.ages).toEqual([35, 36, 37, 38, 39, 40])
    expect(projection.p50[0]).toBe(100_000)
    expect(projection.p50[1]).toBeCloseTo(136_100, 6)
    expect(projection.p50[2]).toBeCloseTo(174_402.1, 6)
    expect(projection.p50[3]).toBeCloseTo(215_040.6281, 6)
  })

  it('returns identical percentile paths when volatility is zero', () => {
    const projection = makeProjector().project(deterministicInput(40))
    expect(projection.p10).toEqual(projection.p50)
    expect(projection.p90).toEqual(projection.p50)
  })

  it('finds the first age each percentile path reaches the goal', () => {
    const projection = makeProjector().project(deterministicInput(45))
    expect(projection.crossings.p50).toBe(37)
    expect(projection.crossings.p10).toBe(37)
    expect(projection.crossings.p90).toBe(37)
  })

  it('returns null crossings when the goal is never reached within the horizon', () => {
    const projection = makeProjector().project(deterministicInput(36))
    expect(projection.crossings.p50).toBeNull()
  })

  it('reports the current age as crossing when the goal is already met', () => {
    const input = { ...deterministicInput(40), fireGoal: FireGoal.of(4_000) }
    const projection = makeProjector().project(input)
    expect(projection.crossings.p50).toBe(35)
  })

  it('keeps p10 <= p50 <= p90 with volatile returns', () => {
    const projector = new MonteCarloFireProjector({
      runs: 500,
      returnModelFactory: () =>
        new GaussianReturnModel(new CyclingDraws([1, -1]), { mean: 0.06, std: 0.18 }),
      aggregator: new PercentileAggregator(fakePercentile),
    })
    const projection = projector.project(deterministicInput(45))
    projection.p10.forEach((v, i) => {
      expect(v).toBeLessThanOrEqual(projection.p50[i])
      expect(projection.p50[i]).toBeLessThanOrEqual(projection.p90[i])
    })
  })

  it('completes a 10,000-run projection in under a second', () => {
    const start = Date.now()
    makeProjector(10_000).project(deterministicInput(75))
    expect(Date.now() - start).toBeLessThan(1_000)
  })
})