import { describe, expect, it } from 'vitest'
import { PercentileAggregator } from './PercentileAggregator'
import type { PercentileFn } from '../ports/PercentileFn'

const nearestRank: PercentileFn = (values, p) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.round((p / 100) * (sorted.length - 1))]
}

describe('PercentileAggregator', () => {
  it('reduces cross-sections of runs into percentile paths', () => {
    const runs = [
      [1, 10, 100],
      [2, 20, 200],
      [3, 30, 300],
    ]
    const result = new PercentileAggregator(nearestRank).aggregate(runs)
    expect(result.p10).toEqual([1, 10, 100])
    expect(result.p50).toEqual([2, 20, 200])
    expect(result.p90).toEqual([3, 30, 300])
  })

  it('produces ordered p10 <= p50 <= p90 at every age', () => {
    const runs = [
      [5, 1, 9],
      [0, 7, 3],
      [2, 4, 8],
    ]
    const result = new PercentileAggregator(nearestRank).aggregate(runs)
    result.p10.forEach((v, i) => {
      expect(v).toBeLessThanOrEqual(result.p50[i])
      expect(result.p50[i]).toBeLessThanOrEqual(result.p90[i])
    })
  })

  it('rejects empty runs and ragged run lengths', () => {
    const aggregator = new PercentileAggregator(nearestRank)
    expect(() => aggregator.aggregate([])).toThrow()
    expect(() => aggregator.aggregate([[1, 2], [1]])).toThrow()
  })
})