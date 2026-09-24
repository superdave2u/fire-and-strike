import { describe, expect, it } from 'vitest'
import { FireGoal } from './FireGoal'
import { Money } from './Money'

describe('Money', () => {
  it('accepts zero and positive finite amounts', () => {
    expect(Money.of(0).value).toBe(0)
    expect(Money.of(1_500_000).value).toBe(1_500_000)
  })

  it('rejects negative, NaN and Infinity', () => {
    expect(() => Money.of(-1)).toThrow()
    expect(() => Money.of(NaN)).toThrow()
    expect(() => Money.of(Infinity)).toThrow()
  })
})

describe('FireGoal', () => {
  it('derives the FIRE number as 25x annual spending', () => {
    expect(FireGoal.of(60_000).target.value).toBe(1_500_000)
  })

  it('supports a custom multiplier', () => {
    expect(FireGoal.of(60_000, 30).target.value).toBe(1_800_000)
  })

  it('rejects non-positive spending', () => {
    expect(() => FireGoal.of(0)).toThrow()
    expect(() => FireGoal.of(-5)).toThrow()
  })
})