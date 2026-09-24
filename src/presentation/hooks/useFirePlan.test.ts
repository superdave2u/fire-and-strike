import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useFirePlan } from './useFirePlan'

describe('useFirePlan', () => {
  it('starts from the default plan inputs and derives both views', () => {
    const { result } = renderHook(() => useFirePlan())
    expect(result.current.inputs.annualSpending).toBe(60_000)
    expect(result.current.fire.fireNumber).toBe(1_500_000)
    expect(result.current.strike.achievable).toBe(true)
  })

  it('recomputes views when a field changes', () => {
    const { result } = renderHook(() => useFirePlan())
    act(() => result.current.setField('annualSpending', 65_000))
    expect(result.current.fire.fireNumber).toBe(1_625_000)
  })

  it('clamps out-of-range field changes', () => {
    const { result } = renderHook(() => useFirePlan())
    act(() => result.current.setField('currentAge', 999))
    expect(result.current.inputs.currentAge).toBe(99)
    act(() => result.current.setField('stockWeight', 2))
    expect(result.current.inputs.stockWeight).toBe(1)
    act(() => result.current.setField('annualSpending', Number.NaN))
    expect(result.current.inputs.annualSpending).toBeGreaterThanOrEqual(1)
    act(() => result.current.setField('targetAge', 10))
    expect(result.current.inputs.targetAge).toBeGreaterThan(result.current.inputs.currentAge)
  })
})