import type { FireProjectionView, StrikePlanView } from '../../application/dto'

export interface FireChartRow {
  age: number
  p10: number
  p50: number
  p90: number
  fire: number
}

export interface StrikeChartRow {
  age: number
  current: number
  accelerated: number | null
  fire: number
}

export function toFireRows(view: FireProjectionView): FireChartRow[] {
  return view.ages.map((age, k) => ({
    age,
    p10: view.p10[k],
    p50: view.p50[k],
    p90: view.p90[k],
    fire: view.fireNumber,
  }))
}

export function toStrikeRows(
  strike: StrikePlanView,
  currentP50: readonly number[],
  allAges: readonly number[],
  fireNumber: number,
): StrikeChartRow[] {
  return allAges.map((age, k) => {
    const index = strike.achievable ? strike.ages.indexOf(age) : -1
    return {
      age,
      current: currentP50[k],
      accelerated: index >= 0 ? strike.acceleratedP50[index] : null,
      fire: fireNumber,
    }
  })
}

export function describeCrossing(crossing: number | null, horizonAge: number): string {
  return crossing === null ? `not by age ${horizonAge}` : `age ${crossing}`
}