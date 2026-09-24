import { describe, expect, it } from 'vitest'
import { Mulberry32Normal } from './Mulberry32Normal'

function draws(rng: Mulberry32Normal, count: number): number[] {
  return Array.from({ length: count }, () => rng.standardNormal())
}

describe('Mulberry32Normal', () => {
  it('reproduces an identical stream for the same seed', () => {
    const a = draws(new Mulberry32Normal(42), 1_000)
    const b = draws(new Mulberry32Normal(42), 1_000)
    expect(a).toEqual(b)
  })

  it('produces different streams for different seeds', () => {
    const a = draws(new Mulberry32Normal(42), 100)
    const b = draws(new Mulberry32Normal(43), 100)
    expect(a).not.toEqual(b)
  })

  it('approximates a standard normal over 10,000 draws', () => {
    const values = draws(new Mulberry32Normal(42), 10_000)
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
    expect(Math.abs(mean)).toBeLessThan(0.05)
    expect(Math.abs(Math.sqrt(variance) - 1)).toBeLessThan(0.1)
  })

  it('satisfies the domain RandomGenerator port structurally', () => {
    const rng: import('../../domain/ports/RandomGenerator').RandomGenerator = new Mulberry32Normal(1)
    expect(typeof rng.standardNormal()).toBe('number')
  })
})