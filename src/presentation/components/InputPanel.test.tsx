import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InputPanel } from './InputPanel'
import { toFields } from '../planFields'
import { DEFAULT_PLAN_INPUTS } from '../../application/dto'
import type { PlanError, PlanField } from '../../application/dto'

const requiredError: PlanError = {
  field: 'annualSpending',
  message: 'Expected retirement spending is required',
}

const baseProps = {
  fields: toFields(DEFAULT_PLAN_INPUTS),
  fireNumber: 1_500_000,
  fireSpending: 60_000,
  multiplier: 25,
  dirty: false,
  errors: [] as PlanError[],
  invalidFields: [] as PlanField[],
  onChange: vi.fn(),
  onCalculate: vi.fn(),
}

describe('InputPanel', () => {
  it('renders all inputs with their default values', () => {
    render(<InputPanel {...baseProps} />)
    expect(screen.getByLabelText('Current age')).toHaveValue(35)
    expect(screen.getByLabelText('Current portfolio value ($)')).toHaveValue(100_000)
    expect(screen.getByLabelText('Yearly contribution ($/yr)')).toHaveValue(30_000)
    expect(screen.getByLabelText('Expected retirement spending ($/yr)')).toHaveValue(60_000)
    expect(screen.getByLabelText('Target retirement age')).toHaveValue(55)
    expect(screen.getByRole('slider')).toHaveValue('80')
  })

  it('shows the derived FIRE number readout from the applied inputs', () => {
    render(<InputPanel {...baseProps} />)
    expect(screen.getByText('FIRE number: $1,500,000 (25 × $60,000)')).toBeInTheDocument()
    expect(screen.getByText(/Stocks 80% \/ Bonds 20%/)).toBeInTheDocument()
  })

  it('reports changed fields as raw text through onChange', () => {
    const onChange = vi.fn()
    render(<InputPanel {...baseProps} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Expected retirement spending ($/yr)'), {
      target: { value: '65000' },
    })
    expect(onChange).toHaveBeenCalledWith('annualSpending', '65000')
    fireEvent.change(screen.getByRole('slider'), { target: { value: '50' } })
    expect(onChange).toHaveBeenLastCalledWith('stockWeight', '50')
  })

  it('shows the warning box and marks invalid fields when errors are surfaced', () => {
    render(
      <InputPanel
        {...baseProps}
        dirty
        errors={[requiredError]}
        invalidFields={['annualSpending']}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(requiredError.message)
    expect(screen.getByLabelText('Expected retirement spending ($/yr)')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByLabelText('Current age')).toHaveAttribute('aria-invalid', 'false')
  })

  it('keeps Calculate clickable even while invalid so it can surface warnings', () => {
    const onCalculate = vi.fn()
    render(
      <InputPanel
        {...baseProps}
        errors={[requiredError]}
        invalidFields={['annualSpending']}
        onCalculate={onCalculate}
      />,
    )
    const button = screen.getByRole('button', { name: 'Calculate' })
    expect(button).toBeEnabled()
    fireEvent.click(button)
    expect(onCalculate).toHaveBeenCalledTimes(1)
  })

  it('warns while the draft differs from the applied plan and is valid', () => {
    const { rerender } = render(<InputPanel {...baseProps} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    rerender(<InputPanel {...baseProps} dirty />)
    expect(screen.getByRole('status')).toHaveTextContent(/press Calculate/i)
  })

  it('does not show the stale hint while warnings are present', () => {
    render(<InputPanel {...baseProps} dirty errors={[requiredError]} invalidFields={['annualSpending']} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})