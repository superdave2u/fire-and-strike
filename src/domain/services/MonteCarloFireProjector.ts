import type { FireGoal } from '../model/FireGoal'
import type { Money } from '../model/Money'
import type { ReturnModelFactory } from '../ports/ReturnModel'
import type { GaussianParameters } from './GaussianReturnModel'
import { PercentileAggregator } from './PercentileAggregator'

export interface ProjectedCrossings {
  p10: number | null
  p50: number | null
  p90: number | null
}

export interface FireProjection {
  ages: number[]
  p10: number[]
  p50: number[]
  p90: number[]
  crossings: ProjectedCrossings
}

export interface ProjectionInput {
  currentPortfolio: Money
  yearlyContribution: Money
  startAge: number
  horizonAge: number
  fireGoal: FireGoal
  returnParameters: GaussianParameters
}

interface ProjectorDependencies {
  runs: number
  returnModelFactory: ReturnModelFactory
  aggregator: PercentileAggregator
}

export class MonteCarloFireProjector {
  private readonly runs: number
  private readonly returnModelFactory: ReturnModelFactory
  private readonly aggregator: PercentileAggregator

  constructor(dependencies: ProjectorDependencies) {
    if (!Number.isInteger(dependencies.runs) || dependencies.runs <= 0) {
      throw new Error(`MonteCarloFireProjector requires a positive run count, got: ${dependencies.runs}`)
    }
    this.runs = dependencies.runs
    this.returnModelFactory = dependencies.returnModelFactory
    this.aggregator = dependencies.aggregator
  }

  project(input: ProjectionInput): FireProjection {
    const { startAge, horizonAge } = input
    if (!Number.isInteger(startAge) || !Number.isInteger(horizonAge) || horizonAge <= startAge) {
      throw new Error(
        `Projection requires integer ages with horizonAge > startAge, got ${startAge}..${horizonAge}`,
      )
    }
    const years = horizonAge - startAge
    const ages = Array.from({ length: years + 1 }, (_, k) => startAge + k)
    const simulationRuns: number[][] = []
    for (let run = 0; run < this.runs; run++) {
      const model = this.returnModelFactory()
      let value = input.currentPortfolio.value
      const values = [value]
      for (let year = 0; year < years; year++) {
        value = value * (1 + model.next()) + input.yearlyContribution.value
        values.push(value)
      }
      simulationRuns.push(values)
    }
    const paths = this.aggregator.aggregate(simulationRuns)
    const target = input.fireGoal.target.value
    return {
      ages,
      p10: paths.p10,
      p50: paths.p50,
      p90: paths.p90,
      crossings: {
        p10: firstCrossingAge(ages, paths.p10, target),
        p50: firstCrossingAge(ages, paths.p50, target),
        p90: firstCrossingAge(ages, paths.p90, target),
      },
    }
  }
}

function firstCrossingAge(ages: readonly number[], path: readonly number[], target: number): number | null {
  for (let k = 0; k < path.length; k++) {
    if (path[k] >= target) return ages[k]
  }
  return null
}