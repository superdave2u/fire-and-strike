import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toStrikeRows } from '../mappers/chartData'
import { compactUsd, formatUsd } from '../format'
import type { FireProjectionView, StrikePlanView } from '../../application/dto'

interface StrikeChartProps {
  strike: StrikePlanView
  fire: FireProjectionView
  width?: number
  height?: number
}

export function StrikeChart({ strike, fire, width = 800, height = 380 }: StrikeChartProps) {
  const rows = toStrikeRows(strike, fire.p50, fire.ages, fire.fireNumber)
  const yMax = Math.max(
    ...rows.map((row) => Math.max(row.current, row.accelerated ?? 0, row.fire)),
  )
  const headline = !strike.achievable
    ? `Retiring at age ${strike.targetAge} is not achievable with this plan`
    : strike.extraYearlyContribution === 0
      ? `Already on pace to hit FIRE at age ${strike.targetAge}`
      : `Extra yearly contribution needed: ${formatUsd(strike.extraYearlyContribution)}`
  return (
    <figure>
      <figcaption>{headline}</figcaption>
      <ComposedChart width={width} height={height} data={rows}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="age" />
        <YAxis domain={[0, yMax]} tickFormatter={compactUsd} />
        <Tooltip formatter={(value) => formatUsd(Number(value))} />
        <Legend />
        <Line type="monotone" dataKey="current" name="Current pace" stroke="#6b7280" dot={false} />
        <Line
          type="monotone"
          dataKey="accelerated"
          name="Accelerated pace"
          stroke="#16a34a"
          dot={false}
          connectNulls={false}
        />
        <ReferenceLine
          y={fire.fireNumber}
          stroke="#6b7280"
          strokeDasharray="6 3"
          label={{ value: 'FIRE number', position: 'insideTopRight' }}
        />
        <ReferenceLine
          x={strike.targetAge}
          stroke="#111827"
          label={{ value: 'Target age', position: 'top' }}
        />
      </ComposedChart>
    </figure>
  )
}