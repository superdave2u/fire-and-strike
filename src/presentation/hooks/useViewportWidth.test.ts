import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useViewportWidth } from './useViewportWidth'

function setViewport(width: number): void {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width })
}

describe('useViewportWidth', () => {
  it('tracks the viewport width minus page padding', () => {
    setViewport(375)
    const { result } = renderHook(() => useViewportWidth())
    expect(result.current).toBe(327)
  })

  it('updates on resize and clamps to sane chart widths', () => {
    setViewport(375)
    const { result } = renderHook(() => useViewportWidth())

    setViewport(1440)
    act(() => window.dispatchEvent(new Event('resize')))
    expect(result.current).toBe(880)

    setViewport(200)
    act(() => window.dispatchEvent(new Event('resize')))
    expect(result.current).toBe(280)
  })
})