export interface AssetAssumptions {
  mean: number
  std: number
}

function validate(name: string, asset: AssetAssumptions): void {
  if (!Number.isFinite(asset.mean)) {
    throw new Error(`${name} mean must be a finite number, got: ${asset.mean}`)
  }
  if (!Number.isFinite(asset.std) || asset.std < 0) {
    throw new Error(`${name} volatility must be a non-negative finite number, got: ${asset.std}`)
  }
}

export class ReturnAssumptions {
  readonly stock: AssetAssumptions
  readonly bond: AssetAssumptions

  private constructor(stock: AssetAssumptions, bond: AssetAssumptions) {
    this.stock = stock
    this.bond = bond
  }

  static of(stock: AssetAssumptions, bond: AssetAssumptions): ReturnAssumptions {
    validate('Stock', stock)
    validate('Bond', bond)
    return new ReturnAssumptions({ ...stock }, { ...bond })
  }

  static defaults(): ReturnAssumptions {
    return ReturnAssumptions.of({ mean: 0.07, std: 0.18 }, { mean: 0.025, std: 0.06 })
  }
}