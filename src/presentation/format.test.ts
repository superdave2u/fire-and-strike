import { describe, expect, it } from 'vitest'
import { formatUsd, compactUsd, formatMultiplier } from './format'

describe('formatUsd', () => {
  it('formats whole-dollar currency', () => {
    expect(formatUsd(1_500_000)).toBe('$1,500,000')
    expect(formatUsd(0)).toBe('$0')
  })

  it('rounds fractional amounts down to the dollar', () => {
    expect(formatUsd(1234.56)).toBe('$1,235')
  })
})

describe('compactUsd', () => {
  it('abbreviates large amounts for chart axes', () => {
    expect(compactUsd(1_500_000)).toBe('$1.5M')
    expect(compactUsd(450_000)).toBe('$450K')
    expect(compactUsd(999)).toBe('$999')
  })
})

describe('formatMultiplier', () => {
  it('formats the FIRE multiplier without trailing noise', () => {
    expect(formatMultiplier(25)).toBe('25')
    expect(formatMultiplier(1 / 0.035)).toBe('28.57')
  })
})