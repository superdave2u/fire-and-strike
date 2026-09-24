const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function formatUsd(value: number): string {
  return usd.format(value)
}

export function compactUsd(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${trim((value / 1_000_000).toFixed(1))}M`
  }
  if (Math.abs(value) >= 1_000) {
    return `$${trim((value / 1_000).toFixed(0))}K`
  }
  return `$${Math.round(value)}`
}

function trim(value: string): string {
  return value.endsWith('.0') ? value.slice(0, -2) : value
}