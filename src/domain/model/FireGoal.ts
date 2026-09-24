import { Money } from './Money'

const DEFAULT_MULTIPLIER = 25

export class FireGoal {
  readonly spending: Money
  readonly multiplier: number
  readonly target: Money

  private constructor(spending: Money, multiplier: number) {
    this.spending = spending
    this.multiplier = multiplier
    this.target = Money.of(spending.value * multiplier)
  }

  static of(spending: number, multiplier: number = DEFAULT_MULTIPLIER): FireGoal {
    if (!Number.isFinite(multiplier) || multiplier <= 0) {
      throw new Error(`FireGoal multiplier must be positive, got: ${multiplier}`)
    }
    return new FireGoal(Money.of(spending), multiplier)
  }
}