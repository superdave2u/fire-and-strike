import { ReturnAssumptions } from './ReturnAssumptions'

export class AllocationMix {
  readonly stockWeight: number
  readonly mean: number
  readonly std: number

  private constructor(stockWeight: number, mean: number, std: number) {
    this.stockWeight = stockWeight
    this.mean = mean
    this.std = std
  }

  static of(
    stockWeight: number,
    assumptions: ReturnAssumptions = ReturnAssumptions.defaults(),
  ): AllocationMix {
    if (!Number.isFinite(stockWeight) || stockWeight < 0 || stockWeight > 1) {
      throw new Error(`AllocationMix stock weight must be within [0, 1], got: ${stockWeight}`)
    }
    const { stock, bond } = assumptions
    const mean = stockWeight * stock.mean + (1 - stockWeight) * bond.mean
    const std = stockWeight * stock.std + (1 - stockWeight) * bond.std
    return new AllocationMix(stockWeight, mean, std)
  }
}