import { describe, expect, it } from 'vitest'
import { StrikePaceSolver, UnreachableStrikeTargetError } from './StrikePaceSolver'
import { MonteCarloFireProjector } from './MonteCarloFireProjector'
import { PercentileAggregator } from './PercentileAggregator'
import { GaussianReturnModel } from './GaussianReturnModel'
import { CyclingDraws, fakePercentile } from './testFixtures'
import { FireGoal } from '../model/FireGoal'
import { Money } from '../model/Money'
import type { ProjectionInput } from './MonteCarloFireProjector'

const MEAN = 0.06
const START_AGE = 35
const TARGET_AGE = 55

function deterministicProjector(): MonteCarloFireProjector {
  return new MonteCarloFireProjector({
    runs: 200,
    returnModelFactory: () =>
      new GaussianReturnModel(new CyclingDraws([0]), { mean: 0.06, std: 0 }),
    aggregator: new PercentileAggregator(fakePercentile),
  })
}

function solverFor(): StrikePaceSolver {
  const projector = deterministicProjector()
  return new StrikePaceSolver(projector.project.bind(projector))
}

function baseInput(goalSpending: number): ProjectionInput {
  return {
    currentPortfolio: Money.of(100_000),
    yearlyContribution: Money.of(30_000),
    startAge: START_AGE,
    horizonAge: 75,
    fireGoal: FireGoal.of(goalSpending),
    returnParameters: { mean: MEAN, std: 0 },
  }
}

describe('StrikePaceSolver', () => {
  it('matches the closed-form extra contribution for a deterministic model', () => {
    const plan = solverFor().solve({ base: baseInput(60_000), targetAge: TARGET_AGE })
    const growth = Math.pow(1 + MEAN, TARGET_AGE - START_AGE)
    const annuity = (growth - 1) / MEAN
    const totalNeeded = (1_500_000 - 100_000 * growth) / annuity
    const expectedExtra = totalNeeded - 30_000
    expect(plan.extraYearlyContribution.value).toBeGreaterThanOrEqual(expectedExtra)
    expect(plan.extraYearlyContribution.value - expectedExtra).toBeLessThanOrEqual(1)
  })

  it('returns zero extra when the goal is already reached at the target age', () => {
    const plan = solverFor().solve({ base: baseInput(1_000), targetAge: 55 })
    expect(plan.extraYearlyContribution.value).toBe(0)
    expect(plan.acceleratedP50.at(-1)).toBeGreaterThan(0)
  })

  it('requires a larger extra contribution for an earlier target age', () => {
    const late = solverFor().solve({ base: baseInput(60_000), targetAge: 55 })
    const early = solverFor().solve({ base: baseInput(60_000), targetAge: 50 })
    expect(late.extraYearlyContribution.value).toBeGreaterThan(0)
    expect(early.extraYearlyContribution.value).toBeGreaterThan(late.extraYearlyContribution.value)
  })

  it('reaches the goal exactly at the target age on the accelerated path', () => {
    const plan = solverFor().solve({ base: baseInput(60_000), targetAge: TARGET_AGE })
    const value = plan.acceleratedP50[TARGET_AGE - START_AGE]
    expect(value).toBeGreaterThanOrEqual(1_500_000)
    expect(plan.ages[TARGET_AGE - START_AGE]).toBe(TARGET_AGE)
  })

  it('throws when the target is unreachable even at the bracket cap', () => {
    const projector = deterministicProjector()
    const solver = new StrikePaceSolver(projector.project.bind(projector), { maxExtra: 1_000 })
    expect(() => solver.solve({ base: baseInput(60_000), targetAge: 55 })).toThrow(
      UnreachableStrikeTargetError,
    )
  })

  it('auto-extends the horizon to cover the target age', () => {
    const base = { ...baseInput(60_000), horizonAge: 45 }
    const plan = solverFor().solve({ base, targetAge: 55 })
    expect(plan.ages.at(-1)).toBe(55)
  })
})