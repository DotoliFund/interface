export interface FundDetails {
  fundId: string
  investor: string
}

export interface FundToken {
  token: string
  amount: number
}

export interface Token {
  address: string
  decimals: string
  symbol: string
  updatedTimestamp: string
}

export interface TopFund {
  id: string
  fundId: string
  createdAtTimestamp: number
  updatedAtTimestamp: number
  manager: string
  investorCount: number
  currentUSD: number
}

export interface Manager {
  id: string
  createdAtTimestamp: number
  updatedAtTimestamp: number
  fundId: string
  investor: string
  isManager: boolean
  principalUSD: number
  currentUSD: number
  profitRatio: number
}

export interface TopManager {
  id: string
  createdAtTimestamp: number
  updatedAtTimestamp: number
  fundId: string
  investor: string
  isManager: boolean
  principalUSD: number
  currentUSD: number
  profitRatio: number
}

export interface Investor {
  id: string
  createdAtTimestamp: number
  updatedAtTimestamp: number
  fundId: string
  investor: string
  isManager: boolean
  principalUSD: number
  currentUSD: number
  profitRatio: number
}

export enum TransactionType {
  SWAP,
  DEPOSIT,
  WITHDRAW,
}

export interface Transaction {
  type: TransactionType
  hash: string
  timestamp: string
  sender: string
  token0: string
  token1: string
  token0Symbol: string
  token1Symbol: string
  amount0: number
  amount1: number
  amountUSD: number
}

export enum LiquidityTransactionType {
  MINT,
  ADD,
  COLLECT,
  REMOVE,
}

export interface LiquidityTransaction {
  type: LiquidityTransactionType
  hash: string
  timestamp: string
  sender: string
  token0: string
  token1: string
  token0Symbol: string
  token1Symbol: string
  amount0: number
  amount1: number
  amountUSD: number
}
