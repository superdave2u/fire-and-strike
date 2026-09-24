import { FireGoal } from '../domain/model/FireGoal'
import { GaussianReturnModel } from '../domain/services/GaussianReturnModel'
import { MonteCarloFireProjector } from '../domain/services/MonteCarloFireProjector'
import { PercentileAggregator } from '../domain/services/PercentileAggregator'
import type { RandomGenerator } from '../domain/ports/RandomGenerator'
import {
  mixParameters,
  toProjectionInput,
  fireMultiplier,
  type PlanInputs,
  type FireProjectionView,
} from './dto'

export type RandomStreamFactory = (seed: number) => RandomGenerator

interface ProjectionDependencies {
  seed: number
  runs: number
  randomStreamFactory: RandomStreamFactory
  aggregator: PercentileAggregator
}

export class ProjectFireTrajectory {
  private readonly seed: number
  private readonly runs: number
  private readonly randomStreamFactory: RandomStreamFactory
  private readonly aggregator: PercentileAggregator

  constructor(dependencies: ProjectionDependencies) {
    this.seed = dependencies.seed
    this.runs = dependencies.runs
    this.randomStreamFactory = dependencies.randomStreamFactory
    this.aggregator = dependencies.aggregator
  }

  run(inputs: PlanInputs): FireProjectionView {
    const stream = this.randomStreamFactory(this.seed)
    const projector = new MonteCarloFireProjector({
      runs: this.runs,
      returnModelFactory: () => new GaussianReturnModel(stream, mixParameters(inputs)),
      aggregator: this.aggregator,
    })
    const projection = projector.project(toProjectionInput(inputs))
    return {
      ages: projection.ages,
      p10: projection.p10,
      p50: projection.p50,
      p90: projection.p90,
      fireNumber: FireGoal.of(inputs.annualSpending, fireMultiplier(inputs.drawRate)).target.value,
      crossings: projection.crossings,
    }
  }
}