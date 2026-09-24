import { describe, expect, it } from 'vitest'
import { validatePlan } from './validatePlan'
import { DEFAULT_PLAN_INPUTS } from './dto'

describe('validatePlan', () => {
  it('accepts the defaults', () => {
    expect(validatePlan(DEFAULT_PLAN_INPUTS)).toEqual([])
  })

  it('flags a non-positive current age against the field', () => {
    expect(validatePlan({ ...DEFAULT_PLAN_INPUTS, currentAge: 0 })).toEqual([
      { field: 'currentAge', message: 'Current age must be a whole number between 1 and 100' },
    ])
  })

  it('flags fractional ages', () => {
    expect(validatePlan({ ...DEFAULT_PLAN_INPUTS, currentAge: 35.5 })).toHaveLength(1)
  })

  it('flags non-positive spending', () => {
    expect(validatePlan({ ...DEFAULT_PLAN_INPUTS, annualSpending: 0 })).toEqual([
      { field: 'annualSpending', message: 'Expected retirement spending must be greater than 0' },
    ])
  })

  it('flags a target age that is not after the current age', () => {
    expect(validatePlan({ ...DEFAULT_PLAN_INPUTS, targetAge: 35 })).toEqual([
      {
        field: 'targetAge',
        message:
          'Target retirement age must be a whole number greater than current age and at most 101',
      },
    ])
  })

  it('flags out-of-range allocation, draw rate and volatility per field', () => {
    const errors = validatePlan({
      ...DEFAULT_PLAN_INPUTS,
      stockWeight: 1.5,
      drawRate: 0,
      stockStd: -1,
      bondStd: 2,
    })
    expect(errors.map((error) => error.field)).toEqual([
      'stockWeight',
      'drawRate',
      'stockStd',
      'bondStd',
    ])
    expect(errors.map((error) => error.message)).toEqual([
      'Stock allocation must be between 0 and 100%',
      'Draw rate must be greater than 0% and at most 100%',
      'Stock volatility must be between 0 and 100%',
      'Bond volatility must be between 0 and 100%',
    ])
  })

  it('flags non-finite values', () => {
    expect(validatePlan({ ...DEFAULT_PLAN_INPUTS, stockMean: Number.NaN })).toContainEqual({
      field: 'stockMean',
      message: 'Expected stock return must be between -50% and 50%',
    })
  })
})