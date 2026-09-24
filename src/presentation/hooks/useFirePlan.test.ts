import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useFirePlan } from './useFirePlan'

describe('useFirePlan', () => {
  it('starts from the defaults as valid, clean fields', () => {
    const { result } = renderHook(() => useFirePlan())
    expect(result.current.fields.annualSpending).toBe('60000')
    expect(result.current.applied.annualSpending).toBe(60_000)
    expect(result.current.errors).toEqual([])
    expect(result.current.canCalculate).toBe(true)
    expect(result.current.dirty).toBe(false)
    expect(result.current.fire.fireNumber).toBe(1_500_000)
    expect(result.current.strike.achievable).toBe(true)
  })

  it('holds edits and only recomputes on calculate', () => {
    const { result } = renderHook(() => useFirePlan())
    act(() => result.current.setField('annualSpending', '65000'))
    expect(result.current.fields.annualSpending).toBe('65000')
    expect(result.current.dirty).toBe(true)
    expect(result.current.applied.annualSpending).toBe(60_000)
    expect(result.current.fire.fireNumber).toBe(1_500_000)

    act(() => result.current.calculate())
    expect(result.current.dirty).toBe(false)
    expect(result.current.applied.annualSpending).toBe(65_000)
    expect(result.current.fire.fireNumber).toBe(1_625_000)
  })

  it('lets the user clear and retype a field without clamping', () => {
    const { result } = renderHook(() => useFirePlan())
    act(() => result.current.setField('currentAge', ''))
    expect(result.current.fields.currentAge).toBe('')
    act(() => result.current.setField('currentAge', '4'))
    expect(result.current.fields.currentAge).toBe('4')
    act(() => result.current.setField('currentAge', '42'))
    expect(result.current.fields.currentAge).toBe('42')
    expect(result.current.errors).toEqual([])

    act(() => result.current.calculate())
    expect(result.current.applied.currentAge).toBe(42)
  })

  it('reports errors and refuses to calculate while invalid', () => {
    const { result } = renderHook(() => useFirePlan())
    act(() => result.current.setField('annualSpending', ''))
    expect(result.current.errors).toEqual(['Expected retirement spending is required'])
    expect(result.current.canCalculate).toBe(false)
    expect(result.current.dirty).toBe(true)

    act(() => result.current.calculate())
    expect(result.current.applied.annualSpending).toBe(60_000)
    expect(result.current.fire.fireNumber).toBe(1_500_000)
  })

  it('applies advanced draw-rate edits on calculate', () => {
    const { result } = renderHook(() => useFirePlan())
    act(() => result.current.setField('drawRate', '5'))
    act(() => result.current.calculate())
    expect(result.current.fire.fireNumber).toBe(1_200_000)
  })
})