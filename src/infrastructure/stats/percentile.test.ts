import { describe, expect, it } from 'vitest'
import { linearInterpolationPercentile } from './percentile'

const HUNDRED = Array.from({ length: 100 }, (_, i) => i + 1)

describe('linearInterpolationPercentile', () => {
  it('interpolates within the sorted distribution', () => {
    expect(linearInterpolationPercentile(HUNDRED, 50)).toBeCloseTo(50.5, 12)
    expect(linearInterpolationPercentile(HUNDRED, 10)).toBeCloseTo(10.9, 12)
    expect(linearInterpolationPercentile(HUNDRED, 90)).toBeCloseTo(90.1, 12)
  })

  it('sorts internally, so pre-sorting is not required', () => {
    expect(linearInterpolationPercentile([3, 1, 2], 50)).toBe(2)
  })

  it('handles single-element distributions', () => {
    expect(linearInterpolationPercentile([5], 0)).toBe(5)
    expect(linearInterpolationPercentile([5], 100)).toBe(5)
  })

  it('returns the extremes at p=0 and p=100', () => {
    expect(linearInterpolationPercentile(HUNDRED, 0)).toBe(1)
    expect(linearInterpolationPercentile(HUNDRED, 100)).toBe(100)
  })

  it('rejects percentiles outside [0, 100] and empty input', () => {
    expect(() => linearInterpolationPercentile(HUNDRED, -1)).toThrow()
    expect(() => linearInterpolationPercentile(HUNDRED, 101)).toThrow()
    expect(() => linearInterpolationPercentile([], 50)).toThrow()
  })
})