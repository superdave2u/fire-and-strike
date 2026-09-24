export type PercentileFn = (sortedValues: readonly number[], p: number) => number

export function linearInterpolationPercentile(values: readonly number[], p: number): number {
  if (!Number.isFinite(p) || p < 0 || p > 100) {
    throw new Error(`Percentile must be within [0, 100], got: ${p}`)
  }
  if (values.length === 0) {
    throw new Error('Percentile requires at least one value')
  }
  const sorted = [...values].sort((a, b) => a - b)
  const index = ((sorted.length - 1) * p) / 100
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) {
    return sorted[lower]
  }
  const fraction = index - lower
  return sorted[lower] * (1 - fraction) + sorted[upper] * fraction
}