import { GaussianReturnModel } from '../domain/services/GaussianReturnModel'
import { MonteCarloFireProjector } from '../domain/services/MonteCarloFireProjector'
import { PercentileAggregator } from '../domain/services/PercentileAggregator'
import { StrikePaceSolver, UnreachableStrikeTargetError } from '../domain/services/StrikePaceSolver'
import type { RandomStreamFactory } from './ProjectFireTrajectory'
import { mixParameters, toProjectionInput, type PlanInputs, type StrikePlanView } from './dto'

interface SolveDependencies {
  seed: number
  runs: number
  randomStreamFactory: RandomStreamFactory
  aggregator: PercentileAggregator
  maxExtra?: number
}

const UNACHIEVABLE_VIEW = (targetAge: number): StrikePlanView => ({
  achievable: false,
  extraYearlyContribution: 0,
  acceleratedP50: [],
  ages: [],
  targetAge,
})

export class SolveStrikePlan {
  private readonly seed: number
  private readonly runs: number
  private readonly randomStreamFactory: RandomStreamFactory
  private readonly aggregator: PercentileAggregator
  private readonly maxExtra: number | undefined

  constructor(dependencies: SolveDependencies) {
    this.seed = dependencies.seed
    this.runs = dependencies.runs
    this.randomStreamFactory = dependencies.randomStreamFactory
    this.aggregator = dependencies.aggregator
    this.maxExtra = dependencies.maxExtra
  }

  run(inputs: PlanInputs): StrikePlanView {
    const solver = new StrikePaceSolver(
      (input) => {
        const stream = this.randomStreamFactory(this.seed)
        return new MonteCarloFireProjector({
          runs: this.runs,
          returnModelFactory: () => new GaussianReturnModel(stream, mixParameters(inputs)),
          aggregator: this.aggregator,
        }).project(input)
      },
      { maxExtra: this.maxExtra },
    )
    try {
      const plan = solver.solve({ base: toProjectionInput(inputs), targetAge: inputs.targetAge })
      return {
        achievable: true,
        extraYearlyContribution: plan.extraYearlyContribution.value,
        acceleratedP50: [...plan.acceleratedP50],
        ages: [...plan.ages],
        targetAge: inputs.targetAge,
      }
    } catch (error) {
      if (error instanceof UnreachableStrikeTargetError) {
        return UNACHIEVABLE_VIEW(inputs.targetAge)
      }
      throw error
    }
  }
}