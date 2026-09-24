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
import { toFireRows } from '../mappers/chartData'
import { compactUsd, formatUsd } from '../format'
import type { FireProjectionView } from '../../application/dto'

interface FireChartProps {
  view: FireProjectionView
  width?: number
  height?: number
}

export function FireChart({ view, width = 800, height = 380 }: FireChartProps) {
  const rows = toFireRows(view)
  const yMax = Math.max(...rows.map((row) => Math.max(row.p90, row.fire)))
  return (
    <ComposedChart width={width} height={height} data={rows}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="age" />
      <YAxis domain={[0, yMax]} tickFormatter={compactUsd} />
      <Tooltip formatter={(value) => formatUsd(Number(value))} />
      <Legend />
      <Line type="monotone" dataKey="p10" name="p10" stroke="#dc2626" dot={false} />
      <Line type="monotone" dataKey="p50" name="p50" stroke="#16a34a" dot={false} />
      <Line type="monotone" dataKey="p90" name="p90" stroke="#2563eb" dot={false} />
      <ReferenceLine
        y={view.fireNumber}
        stroke="#6b7280"
        strokeDasharray="6 3"
        label={{ value: 'FIRE number', position: 'insideTopRight' }}
      />
      {view.crossings.p50 !== null && (
        <ReferenceLine
          x={view.crossings.p50}
          stroke="#111827"
          label={{ value: 'Median FI', position: 'top' }}
        />
      )}
    </ComposedChart>
  )
}