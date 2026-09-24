import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InputPanel } from './InputPanel'
import { DEFAULT_PLAN_INPUTS } from '../../application/dto'

describe('InputPanel', () => {
  it('renders all inputs with their default values', () => {
    render(<InputPanel inputs={DEFAULT_PLAN_INPUTS} fireNumber={1_500_000} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Current age')).toHaveValue(35)
    expect(screen.getByLabelText('Current portfolio value ($)')).toHaveValue(100_000)
    expect(screen.getByLabelText('Yearly contribution ($/yr)')).toHaveValue(30_000)
    expect(screen.getByLabelText('Expected retirement spending ($/yr)')).toHaveValue(60_000)
    expect(screen.getByLabelText('Target retirement age')).toHaveValue(55)
    expect(screen.getByRole('slider')).toHaveValue('80')
  })

  it('shows the derived FIRE number readout', () => {
    render(<InputPanel inputs={DEFAULT_PLAN_INPUTS} fireNumber={1_500_000} onChange={vi.fn()} />)
    expect(screen.getByText('FIRE number: $1,500,000 (25 × $60,000)')).toBeInTheDocument()
    expect(screen.getByText(/Stocks 80% \/ Bonds 20%/)).toBeInTheDocument()
  })

  it('reports changed fields through onChange', () => {
    const onChange = vi.fn()
    render(<InputPanel inputs={DEFAULT_PLAN_INPUTS} fireNumber={1_500_000} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Expected retirement spending ($/yr)'), {
      target: { value: '65000' },
    })
    expect(onChange).toHaveBeenCalledWith('annualSpending', 65000)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '50' } })
    expect(onChange).toHaveBeenLastCalledWith('stockWeight', 0.5)
  })
})