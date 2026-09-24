import { describe, expect, it } from 'vitest'
import { toFireRows, toStrikeRows, describeCrossing } from './chartData'
import type { FireProjectionView, StrikePlanView } from '../../application/dto'

const fireView: FireProjectionView = {
  ages: [35, 36],
  p10: [10, 20],
  p50: [30, 40],
  p90: [50, 60],
  fireNumber: 1_500_000,
  crossings: { p10: null, p50: 56, p90: 52 },
}

const strikeView: StrikePlanView = {
  achievable: true,
  extraYearlyContribution: 2_054,
  acceleratedP50: [100, 200],
  ages: [35, 36],
  targetAge: 55,
}

describe('toFireRows', () => {
  it('zips percentile paths with ages and the FIRE number', () => {
    expect(toFireRows(fireView)).toEqual([
      { age: 35, p10: 10, p50: 30, p90: 50, fire: 1_500_000 },
      { age: 36, p10: 20, p50: 40, p90: 60, fire: 1_500_000 },
    ])
  })
})

describe('toStrikeRows', () => {
  it('pairs accelerated and current p50 paths over the strike horizon', () => {
    const rows = toStrikeRows(strikeView, [30, 40, 50], [35, 36, 37], 1_500_000)
    expect(rows).toEqual([
      { age: 35, current: 30, accelerated: 100, fire: 1_500_000 },
      { age: 36, current: 40, accelerated: 200, fire: 1_500_000 },
      { age: 37, current: 50, accelerated: null, fire: 1_500_000 },
    ])
  })

  it('leaves the accelerated series null when the strike is unachievable', () => {
    const unachievable: StrikePlanView = { ...strikeView, achievable: false, acceleratedP50: [], ages: [] }
    const rows = toStrikeRows(unachievable, [30, 40], [35, 36], 1_500_000)
    expect(rows).toEqual([
      { age: 35, current: 30, accelerated: null, fire: 1_500_000 },
      { age: 36, current: 40, accelerated: null, fire: 1_500_000 },
    ])
  })
})

describe('describeCrossing', () => {
  it('formats a crossing age or a not-reached phrase', () => {
    expect(describeCrossing(56, 75)).toBe('age 56')
    expect(describeCrossing(null, 75)).toBe('not by age 75')
  })
})