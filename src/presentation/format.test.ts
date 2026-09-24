import { describe, expect, it } from 'vitest'
import { formatUsd } from './format'

describe('formatUsd', () => {
  it('formats whole-dollar currency', () => {
    expect(formatUsd(1_500_000)).toBe('$1,500,000')
    expect(formatUsd(0)).toBe('$0')
  })

  it('rounds fractional amounts down to the dollar', () => {
    expect(formatUsd(1234.56)).toBe('$1,235')
  })
})