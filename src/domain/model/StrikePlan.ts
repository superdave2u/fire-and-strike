import { Money } from './Money'

export class StrikePlan {
  readonly extraYearlyContribution: Money
  readonly ages: readonly number[]
  readonly acceleratedP50: readonly number[]

  private constructor(extra: Money, ages: readonly number[], acceleratedP50: readonly number[]) {
    this.extraYearlyContribution = extra
    this.ages = ages
    this.acceleratedP50 = acceleratedP50
  }

  static of(
    extraYearlyContribution: number,
    ages: readonly number[],
    acceleratedP50: readonly number[],
  ): StrikePlan {
    if (!Number.isInteger(extraYearlyContribution) || extraYearlyContribution < 0) {
      throw new Error(`Strike extra contribution must be a non-negative integer, got: ${extraYearlyContribution}`)
    }
    if (ages.length === 0 || ages.length !== acceleratedP50.length) {
      throw new Error('StrikePlan requires equal-length non-empty ages and p50 series')
    }
    return new StrikePlan(Money.of(extraYearlyContribution), [...ages], [...acceleratedP50])
  }
}