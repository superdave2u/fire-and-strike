import type { PercentileFn } from '../ports/PercentileFn'
import type { RandomGenerator } from '../ports/RandomGenerator'

export class CyclingDraws implements RandomGenerator {
  private i = 0
  private readonly draws: number[]

  constructor(draws: number[]) {
    this.draws = draws
  }

  standardNormal(): number {
    return this.draws[this.i++ % this.draws.length]
  }
}

export const fakePercentile: PercentileFn = (values, p) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.round((p / 100) * (sorted.length - 1))]
}