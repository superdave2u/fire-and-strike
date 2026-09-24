import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the input panel, both chart sections and the newcomer guide', () => {
    render(<App />)
    expect(screen.getByText('FIRE number: $1,500,000 (25 × $60,000)')).toBeInTheDocument()
    expect(screen.getByText(/Median FI at age/)).toBeInTheDocument()
    expect(screen.getByText(/Extra yearly contribution needed/)).toBeInTheDocument()
    expect(document.querySelectorAll('svg.recharts-surface').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Advanced assumptions')).toBeInTheDocument()
    expect(document.querySelector('details')).not.toHaveAttribute('open')
    expect(screen.getByText('New to FIRE?')).toBeInTheDocument()
  })

  it('only updates the charts and readout when Calculate is pressed', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Expected retirement spending ($/yr)'), {
      target: { value: '65000' },
    })
    expect(screen.getByText('FIRE number: $1,500,000 (25 × $60,000)')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/press Calculate/i)

    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }))
    expect(screen.getByText('FIRE number: $1,625,000 (25 × $65,000)')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('surfaces warnings only after Calculate, then clears them when corrected', () => {
    render(<App />)
    const field = screen.getByLabelText('Expected retirement spending ($/yr)')
    fireEvent.change(field, { target: { value: '' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(field).toHaveAttribute('aria-invalid', 'false')

    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Expected retirement spending is required')
    expect(field).toHaveAttribute('aria-invalid', 'true')

    fireEvent.change(field, { target: { value: '65000' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(field).toHaveAttribute('aria-invalid', 'false')
  })
})