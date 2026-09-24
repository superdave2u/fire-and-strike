import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FireChart } from './FireChart'
import type { FireProjectionView } from '../../application/dto'

const VIEW: FireProjectionView = {
  ages: [35, 36, 37],
  p10: [100_000, 110_000, 120_000],
  p50: [150_000, 200_000, 260_000],
  p90: [200_000, 300_000, 400_000],
  fireNumber: 1_500_000,
  crossings: { p10: null, p50: 36, p90: null },
}

describe('FireChart', () => {
  it('renders percentile lines, the FIRE line and the median marker', () => {
    const { container } = render(<FireChart view={VIEW} />)
    expect(container.querySelector('svg.recharts-surface')).not.toBeNull()
    expect(screen.getByText('p10')).toBeInTheDocument()
    expect(screen.getByText('p50')).toBeInTheDocument()
    expect(screen.getByText('p90')).toBeInTheDocument()
    expect(screen.getByText('FIRE number')).toBeInTheDocument()
    expect(screen.getByText('Median FI')).toBeInTheDocument()
  })

  it('omits the median marker when p50 never reaches the goal', () => {
    const view = { ...VIEW, crossings: { p10: null, p50: null, p90: null } }
    render(<FireChart view={view} />)
    expect(screen.queryByText('Median FI')).not.toBeInTheDocument()
  })
})