const STOCK_MEAN = 0.07
const STOCK_STD = 0.18
const BOND_MEAN = 0.025
const BOND_STD = 0.06

export class AllocationMix {
  readonly stockWeight: number
  readonly mean: number
  readonly std: number

  private constructor(stockWeight: number, mean: number, std: number) {
    this.stockWeight = stockWeight
    this.mean = mean
    this.std = std
  }

  static of(stockWeight: number): AllocationMix {
    if (!Number.isFinite(stockWeight) || stockWeight < 0 || stockWeight > 1) {
      throw new Error(`AllocationMix stock weight must be within [0, 1], got: ${stockWeight}`)
    }
    const mean = stockWeight * STOCK_MEAN + (1 - stockWeight) * BOND_MEAN
    const std = stockWeight * STOCK_STD + (1 - stockWeight) * BOND_STD
    return new AllocationMix(stockWeight, mean, std)
  }
}