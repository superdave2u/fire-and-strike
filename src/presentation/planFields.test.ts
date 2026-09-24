import { describe, expect, it } from 'vitest'
import { parseFields, toFields } from './planFields'
import { DEFAULT_PLAN_INPUTS } from '../application/dto'

describe('toFields', () => {
  it('renders defaults in each widget unit (fractions as percentages)', () => {
    expect(toFields(DEFAULT_PLAN_INPUTS)).toEqual({
      currentAge: '35',
      currentPortfolio: '100000',
      yearlyContribution: '30000',
      annualSpending: '60000',
      targetAge: '55',
      stockWeight: '80',
      drawRate: '4',
      stockMean: '7',
      bondMean: '2.5',
      stockStd: '18',
      bondStd: '6',
    })
  })
})

describe('parseFields', () => {
  it('round-trips the defaults', () => {
    const { inputs, errors } = parseFields(toFields(DEFAULT_PLAN_INPUTS))
    expect(errors).toEqual([])
    expect(inputs).not.toBeNull()
    expect(inputs?.annualSpending).toBe(60_000)
    expect(inputs?.stockWeight).toBeCloseTo(0.8, 12)
    expect(inputs?.drawRate).toBeCloseTo(0.04, 12)
    expect(inputs?.bondMean).toBeCloseTo(0.025, 12)
    expect(inputs?.bondStd).toBeCloseTo(0.06, 12)
  })

  it('reports required fields instead of coercing blanks to zero', () => {
    const { inputs, errors } = parseFields({ ...toFields(DEFAULT_PLAN_INPUTS), annualSpending: '' })
    expect(inputs).toBeNull()
    expect(errors).toEqual([
      { field: 'annualSpending', message: 'Expected retirement spending is required' },
    ])
  })

  it('accepts partial editing states without clamping', () => {
    const { inputs, errors } = parseFields({
      ...toFields(DEFAULT_PLAN_INPUTS),
      currentAge: '4',
      stockWeight: '2.5',
    })
    expect(errors).toEqual([])
    expect(inputs?.currentAge).toBe(4)
    expect(inputs?.stockWeight).toBeCloseTo(0.025, 12)
  })

  it('reports non-numeric text against its field', () => {
    const { errors } = parseFields({ ...toFields(DEFAULT_PLAN_INPUTS), drawRate: 'abc' })
    expect(errors).toEqual([{ field: 'drawRate', message: 'Draw rate must be a number' }])
  })

  it('collects range errors from plan validation', () => {
    const { inputs, errors } = parseFields({ ...toFields(DEFAULT_PLAN_INPUTS), drawRate: '0' })
    expect(inputs).toBeNull()
    expect(errors).toEqual([
      { field: 'drawRate', message: 'Draw rate must be greater than 0% and at most 100%' },
    ])
  })
})