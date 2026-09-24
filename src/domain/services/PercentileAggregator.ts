import type { PercentileFn } from '../ports/PercentileFn'

export interface PercentilePaths {
  p10: number[]
  p50: number[]
  p90: number[]
}

export class PercentileAggregator {
  private readonly percentile: PercentileFn

  constructor(percentile: PercentileFn) {
    this.percentile = percentile
  }

  aggregate(runs: readonly (readonly number[])[]): PercentilePaths {
    if (runs.length === 0) {
      throw new Error('PercentileAggregator requires at least one run')
    }
    const ages = runs[0].length
    if (runs.some((run) => run.length !== ages)) {
      throw new Error('PercentileAggregator requires all runs to have equal length')
    }
    const crossSections: number[][] = Array.from({ length: ages }, (_, age) =>
      runs.map((run) => run[age]),
    )
    const reduce = (p: number): number[] =>
      crossSections.map((values) => this.percentile(values, p))
    return { p10: reduce(10), p50: reduce(50), p90: reduce(90) }
  }
}