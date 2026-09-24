import type { RandomGenerator } from '../ports/RandomGenerator'
import type { ReturnModel } from '../ports/ReturnModel'

export interface GaussianParameters {
  mean: number
  std: number
}

export class GaussianReturnModel implements ReturnModel {
  private readonly rng: RandomGenerator
  private readonly parameters: GaussianParameters

  constructor(rng: RandomGenerator, parameters: GaussianParameters) {
    this.rng = rng
    this.parameters = parameters
  }

  next(): number {
    return this.parameters.mean + this.parameters.std * this.rng.standardNormal()
  }
}