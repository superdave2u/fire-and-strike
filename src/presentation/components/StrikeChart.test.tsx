import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StrikeChart } from './StrikeChart'
import type { FireProjectionView, StrikePlanView } from '../../application/dto'

const FIRE: FireProjectionView = {
  ages: [35, 36, 37],
  p10: [100_000, 110_000, 120_000],
  p50: [150_000, 200_000, 260_000],
  p90: [200_000, 300_000, 400_000],
  fireNumber: 1_500_000,
  crossings: { p10: null, p50: 36, p90: null },
}

const STRIKE: StrikePlanView = {
  achievable: true,
  extraYearlyContribution: 2_054,
  acceleratedP50: [150_000, 900_000, 1_500_000],
  ages: [35, 36, 37],
  targetAge: 36,
}

describe('StrikeChart', () => {
  it('renders both p50 paths, the FIRE line, the target marker and the extra-contribution card', () => {
    const { container } = render(<StrikeChart strike={STRIKE} fire={FIRE} />)
    expect(container.querySelector('svg.recharts-surface')).not.toBeNull()
    expect(screen.getByText('Current pace')).toBeInTheDocument()
    expect(screen.getByText('Accelerated pace')).toBeInTheDocument()
    expect(screen.getByText('FIRE number')).toBeInTheDocument()
    expect(screen.getByText('Target age')).toBeInTheDocument()
    expect(screen.getByText('Extra yearly contribution needed: $2,054')).toBeInTheDocument()
  })

  it('says already on pace when no extra contribution is needed', () => {
    const strike = { ...STRIKE, extraYearlyContribution: 0 }
    render(<StrikeChart strike={strike} fire={FIRE} />)
    expect(screen.getByText('Already on pace to hit FIRE at age 36')).toBeInTheDocument()
  })

  it('says not achievable when the solver could not reach the target', () => {
    const strike: StrikePlanView = { ...STRIKE, achievable: false, acceleratedP50: [] }
    render(<StrikeChart strike={strike} fire={FIRE} />)
    expect(screen.getByText(/not achievable/i)).toBeInTheDocument()
  })
})