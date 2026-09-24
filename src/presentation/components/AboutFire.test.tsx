import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AboutFire } from './AboutFire'

describe('AboutFire', () => {
  it('explains FIRE for newcomers', () => {
    render(<AboutFire />)
    expect(screen.getByText(/Financial Independence, Retire Early/)).toBeInTheDocument()
  })

  it('makes clear that retirement is a financial milestone, not an age gate', () => {
    render(<AboutFire />)
    expect(screen.getAllByText(/financial milestone/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/not an age/i).length).toBeGreaterThan(0)
  })
})