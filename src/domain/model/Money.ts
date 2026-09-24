export class Money {
  readonly value: number

  private constructor(value: number) {
    this.value = value
  }

  static of(value: number): Money {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`Money must be a non-negative finite number, got: ${value}`)
    }
    return new Money(value)
  }
}