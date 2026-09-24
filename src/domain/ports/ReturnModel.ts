export interface ReturnModel {
  next(): number
}

export type ReturnModelFactory = () => ReturnModel