import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdvancedSection } from './AdvancedSection'
import { toFields } from '../planFields'
import { DEFAULT_PLAN_INPUTS } from '../../application/dto'
import type { PlanField } from '../../application/dto'

const baseProps = {
  fields: toFields(DEFAULT_PLAN_INPUTS),
  invalidFields: [] as PlanField[],
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

  it('reports tweaks as raw text', () => {
    const onChange = vi.fn()
    render(<AdvancedSection {...baseProps} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Draw rate (%)'), { target: { value: '3.5' } })
    expect(onChange).toHaveBeenCalledWith('drawRate', '3.5')
    fireEvent.change(screen.getByLabelText('Stock volatility (%)'), { target: { value: '22' } })
    expect(onChange).toHaveBeenCalledWith('stockStd', '22')
  })

  it('marks invalid fields red', () => {
    render(<AdvancedSection {...baseProps} invalidFields={['drawRate']} />)
    expect(screen.getByLabelText('Draw rate (%)')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Stock volatility (%)')).toHaveAttribute('aria-invalid', 'false')
  })
})