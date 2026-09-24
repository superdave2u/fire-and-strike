import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the input panel and both chart sections', () => {
    render(<App />)
    expect(screen.getByText('FIRE number: $1,500,000 (25 × $60,000)')).toBeInTheDocument()
    expect(screen.getByText(/Median FI at age/)).toBeInTheDocument()
    expect(screen.getByText(/Extra yearly contribution needed/)).toBeInTheDocument()
    expect(document.querySelectorAll('svg.recharts-surface').length).toBeGreaterThanOrEqual(2)
  })

  it('updates the FIRE number and charts live when spending changes', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Expected retirement spending ($/yr)'), {
      target: { value: '65000' },
    })
    expect(screen.getByText('FIRE number: $1,625,000 (25 × $65,000)')).toBeInTheDocument()
  })
})