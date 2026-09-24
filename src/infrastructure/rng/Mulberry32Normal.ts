import type { RandomGenerator } from '../../domain/ports/RandomGenerator'

export class Mulberry32Normal implements RandomGenerator {
  private nextUniform: () => number
  private cachedPair: number | null = null

  constructor(seed: number) {
    if (!Number.isInteger(seed)) {
      throw new Error(`Mulberry32Normal seed must be an integer, got: ${seed}`)
    }
    this.nextUniform = mulberry32(seed)
  }

  standardNormal(): number {
    if (this.cachedPair !== null) {
      const cached = this.cachedPair
      this.cachedPair = null
      return cached
    }
    let u = this.nextUniform()
    while (u === 0) {
      u = this.nextUniform()
    }
    const v = this.nextUniform()
    const magnitude = Math.sqrt(-2 * Math.log(u))
    const angle = 2 * Math.PI * v
    this.cachedPair = magnitude * Math.sin(angle)
    return magnitude * Math.cos(angle)
  }
}

function mulberry32(seed: number): () => number {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}