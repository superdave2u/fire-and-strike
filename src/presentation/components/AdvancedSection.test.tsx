import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdvancedSection } from './AdvancedSection'
import { DEFAULT_PLAN_INPUTS } from '../../application/dto'

const baseProps = {
  inputs: DEFAULT_PLAN_INPUTS,
  onChange: vi.fn(),
}

describe('AdvancedSection', () => {
  it('is collapsed by default with the defaults populated', () => {
    const { container } = render(<AdvancedSection {...baseProps} />)
    const details = container.querySelector('details')
    expect(details).not.toBeNull()
    expect(details).not.toHaveAttribute('open')
    expect(screen.getByText('Advanced assumptions')).toBeInTheDocument()
    expect(screen.getByLabelText('Draw rate (%)')).toHaveValue(4)
    expect(screen.getByLabelText('Expected stock return (%, real)')).toHaveValue(7)
    expect(screen.getByLabelText('Expected bond return (%, real)')).toHaveValue(2.5)
    expect(screen.getByLabelText('Stock volatility (%)')).toHaveValue(18)
    expect(screen.getByLabelText('Bond volatility (%)')).toHaveValue(6)
  })

  it('reports tweaks as fractions', () => {
    const onChange = vi.fn()
    render(<AdvancedSection {...baseProps} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Draw rate (%)'), { target: { value: '3.5' } })
    expect(onChange).toHaveBeenCalledWith('drawRate', 0.035)
    fireEvent.change(screen.getByLabelText('Expected stock return (%, real)'), {
      target: { value: '9' },
    })
    expect(onChange).toHaveBeenCalledWith('stockMean', 0.09)
    fireEvent.change(screen.getByLabelText('Stock volatility (%)'), { target: { value: '22' } })
    expect(onChange).toHaveBeenCalledWith('stockStd', 0.22)
  })
})