import { describe, expect, it } from 'vitest'
import { ReturnAssumptions } from './ReturnAssumptions'

describe('ReturnAssumptions', () => {
  it('defaults to stocks 7%/18% and bonds 2.5%/6% real', () => {
    const assumptions = ReturnAssumptions.defaults()
    expect(assumptions.stock).toEqual({ mean: 0.07, std: 0.18 })
    expect(assumptions.bond).toEqual({ mean: 0.025, std: 0.06 })
  })

  it('accepts custom asset assumptions', () => {
    const assumptions = ReturnAssumptions.of({ mean: 0.1, std: 0.2 }, { mean: 0.01, std: 0.03 })
    expect(assumptions.stock).toEqual({ mean: 0.1, std: 0.2 })
    expect(assumptions.bond).toEqual({ mean: 0.01, std: 0.03 })
  })

  it('rejects negative volatility and non-finite means', () => {
    expect(() =>
      ReturnAssumptions.of({ mean: 0.07, std: -0.01 }, { mean: 0.02, std: 0.06 }),
    ).toThrow()
    expect(() =>
      ReturnAssumptions.of({ mean: Number.NaN, std: 0.18 }, { mean: 0.02, std: 0.06 }),
    ).toThrow()
    expect(() =>
      ReturnAssumptions.of({ mean: 0.07, std: 0.18 }, { mean: Number.POSITIVE_INFINITY, std: 0.06 }),
    ).toThrow()
  })
})