import { describe, expect, it } from 'vitest'
import { GaussianReturnModel } from './GaussianReturnModel'
import type { RandomGenerator } from '../ports/RandomGenerator'

class FixedDraw implements RandomGenerator {
  private readonly z: number

  constructor(z: number) {
    this.z = z
  }

  standardNormal(): number {
    return this.z
  }
}

describe('GaussianReturnModel', () => {
  it('maps standard-normal draws to mean + std * z', () => {
    const model = new GaussianReturnModel(new FixedDraw(1.5), { mean: 0.06, std: 0.18 })
    expect(model.next()).toBeCloseTo(0.06 + 0.18 * 1.5, 12)
  })

  it('returns exactly the mean when the source draws zero', () => {
    const model = new GaussianReturnModel(new FixedDraw(0), { mean: 0.06, std: 0.18 })
    expect(model.next()).toBe(0.06)
    expect(model.next()).toBe(0.06)
  })

  it('returns exactly std * z when the mean is zero', () => {
    const model = new GaussianReturnModel(new FixedDraw(-2), { mean: 0, std: 0.1 })
    expect(model.next()).toBeCloseTo(-0.2, 12)
  })
})