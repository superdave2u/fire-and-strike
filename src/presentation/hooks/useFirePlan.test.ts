import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useFirePlan } from './useFirePlan'

describe('useFirePlan', () => {
  it('starts from the defaults with no visible warnings', () => {
    const { result } = renderHook(() => useFirePlan())
    expect(result.current.fields.annualSpending).toBe('60000')
    expect(result.current.applied.annualSpending).toBe(60_000)
    expect(result.current.errors).toEqual([])
    expect(result.current.invalidFields).toEqual([])
    expect(result.current.dirty).toBe(false)
    expect(result.current.fire.fireNumber).toBe(1_500_000)
    expect(result.current.strike.achievable).toBe(true)
  })

  it('shows no warnings while typing before Calculate is pressed', () => {
    const { result } = renderHook(() => useFirePlan())
    act(() => result.current.setField('annualSpending', ''))
    expect(result.current.errors).toEqual([])
    expect(result.current.invalidFields).toEqual([])
    expect(result.current.dirty).toBe(true)
  })

  it('surfaces warnings on Calculate and leaves the applied plan untouched', () => {
    const { result } = renderHook(() => useFirePlan())
    act(() => result.current.setField('annualSpending', ''))
    act(() => result.current.calculate())
    expect(result.current.errors).toEqual([
      { field: 'annualSpending', message: 'Expected retirement spending is required' },
    ])
    expect(result.current.invalidFields).toEqual(['annualSpending'])
    expect(result.current.applied.annualSpending).toBe(60_000)
    expect(result.current.fire.fireNumber).toBe(1_500_000)
  })

  it('hides warnings once the offending field is corrected', () => {
    const { result } = renderHook(() => useFirePlan())
    act(() => result.current.setField('annualSpending', ''))
    act(() => result.current.calculate())
    act(() => result.current.setField('annualSpending', '65000'))
    expect(result.current.errors).toEqual([])
    expect(result.current.invalidFields).toEqual([])

    act(() => result.current.calculate())
    expect(result.current.applied.annualSpending).toBe(65_000)
    expect(result.current.fire.fireNumber).toBe(1_625_000)
  })

  it('re-warns when a previously warned field becomes invalid again', () => {
    const { result } = renderHook(() => useFirePlan())
    act(() => result.current.setField('currentAge', ''))
    act(() => result.current.calculate())
    act(() => result.current.setField('currentAge', '40'))
    expect(result.current.errors).toEqual([])
    act(() => result.current.setField('currentAge', ''))
    expect(result.current.errors).toHaveLength(1)
  })

  it('lets the user clear and retype a field without clamping', () => {
    const { result } = renderHook(() => useFirePlan())
    act(() => result.current.setField('currentAge', ''))
    expect(result.current.fields.currentAge).toBe('')
    act(() => result.current.setField('currentAge', '4'))
    expect(result.current.fields.currentAge).toBe('4')
    act(() => result.current.setField('currentAge', '42'))
    expect(result.current.fields.currentAge).toBe('42')

    act(() => result.current.calculate())
    expect(result.current.applied.currentAge).toBe(42)
  })

  it('applies advanced draw-rate edits on calculate', () => {
    const { result } = renderHook(() => useFirePlan())
    act(() => result.current.setField('drawRate', '5'))
    act(() => result.current.calculate())
    expect(result.current.fire.fireNumber).toBe(1_200_000)
  })
})