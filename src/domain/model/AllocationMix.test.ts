import { describe, expect, it } from 'vitest'
import { AllocationMix } from './AllocationMix'
import { ReturnAssumptions } from './ReturnAssumptions'

describe('AllocationMix', () => {
  it('blends stock and bond real-return parameters by weight', () => {
    const mix = AllocationMix.of(0.8)
    expect(mix.mean).toBeCloseTo(0.061, 12)
    expect(mix.std).toBeCloseTo(0.156, 12)
  })

  it('is pure stocks at weight 1', () => {
    const mix = AllocationMix.of(1)
    expect(mix.mean).toBeCloseTo(0.07, 12)
    expect(mix.std).toBeCloseTo(0.18, 12)
  })

  it('is pure bonds at weight 0', () => {
    const mix = AllocationMix.of(0)
    expect(mix.mean).toBeCloseTo(0.025, 12)
    expect(mix.std).toBeCloseTo(0.06, 12)
  })

  it('blends custom return assumptions', () => {
    const assumptions = ReturnAssumptions.of({ mean: 0.1, std: 0.2 }, { mean: 0, std: 0 })
    const mix = AllocationMix.of(0.5, assumptions)
    expect(mix.mean).toBeCloseTo(0.05, 12)
    expect(mix.std).toBeCloseTo(0.1, 12)
  })

  it('rejects weights outside [0, 1]', () => {
    expect(() => AllocationMix.of(-0.1)).toThrow()
    expect(() => AllocationMix.of(1.1)).toThrow()
    expect(() => AllocationMix.of(Number.NaN)).toThrow()
  })
})