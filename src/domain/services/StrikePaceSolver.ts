import { Money } from '../model/Money'
import type { FireProjection, ProjectionInput } from './MonteCarloFireProjector'
import { StrikePlan } from '../model/StrikePlan'

export class UnreachableStrikeTargetError extends Error {
  constructor(targetAge: number) {
    super(`STRIKE target age ${targetAge} is unreachable even at the maximum extra contribution`)
  }
}

export interface StrikeSolveInput {
  base: ProjectionInput
  targetAge: number
}

export class StrikePaceSolver {
  private readonly project: (input: ProjectionInput) => FireProjection
  private readonly maxExtra: number

  constructor(project: (input: ProjectionInput) => FireProjection, options?: { maxExtra?: number }) {
    this.project = project
    this.maxExtra = options?.maxExtra ?? DEFAULT_MAX_EXTRA
  }

  solve(input: StrikeSolveInput): StrikePlan {
    const { base, targetAge } = input
    if (!Number.isInteger(targetAge) || targetAge <= base.startAge) {
      throw new Error(
        `Strike target age must be an integer greater than ${base.startAge}, got: ${targetAge}`,
      )
    }
    const withHorizon: ProjectionInput = { ...base, horizonAge: Math.max(base.horizonAge, targetAge) }
    const target = base.fireGoal.target.value

    const atTargetAge = (projection: FireProjection): number =>
      projection.p50[targetAge - withHorizon.startAge]

    const projectWithExtra = (extra: number): FireProjection =>
      this.project({
        ...withHorizon,
        yearlyContribution: Money.of(withHorizon.yearlyContribution.value + extra),
      })

    if (atTargetAge(projectWithExtra(0)) >= target) {
      const projection = projectWithExtra(0)
      return StrikePlan.of(0, projection.ages, projection.p50)
    }

    let lo = 0
    let hi = BRACKET_START
    while (atTargetAge(projectWithExtra(hi)) < target) {
      lo = hi
      hi *= 2
      if (hi > this.maxExtra) {
        throw new UnreachableStrikeTargetError(targetAge)
      }
    }
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2)
      if (atTargetAge(projectWithExtra(mid)) >= target) {
        hi = mid
      } else {
        lo = mid
      }
    }
    const projection = projectWithExtra(hi)
    return StrikePlan.of(hi, projection.ages, projection.p50)
  }
}

const DEFAULT_MAX_EXTRA = 5_000_000
const BRACKET_START = 1_000