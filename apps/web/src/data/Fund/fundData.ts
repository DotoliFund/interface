import { useQuery } from '@tanstack/react-query'
import { THE_GRAPH_QUERY_URL } from 'constants/query'
import { gql, request } from 'graphql-request'

const FUND_DATA = gql`
  query fundData($fundId: String!) {
    fund(id: $fundId, subgraphError: allow) {
      id
      fundId
      createdAtTimestamp
      updatedAtTimestamp
      manager
      investorCount
      currentUSD
      currentTokens
      currentTokensSymbols
      currentTokensDecimals
      currentTokensAmount
      feeTokens
      feeSymbols
      feeTokensAmount
    }
  }
`

interface Fund {
  id: string
  fundId: string
  createdAtTimestamp: number
  updatedAtTimestamp: number
  manager: string
  investorCount: number
  currentUSD: number
  currentTokens: string[]
  currentTokensSymbols: string[]
  currentTokensDecimals: number[]
  currentTokensAmount: number[]
  feeTokens: string[]
  feeSymbols: string[]
  feeTokensAmount: number[]
}

interface Data {
  fund: Fund
}

/**
 * Fetch top funds by profit
 */
export function useFundData(fundId: string | undefined): {
  data?: Data
} {
  const { data } = useQuery({
    queryKey: ['fund', fundId],
    async queryFn() {
      return await request(THE_GRAPH_QUERY_URL, FUND_DATA, { fundId })
    },
  })
  const jsonString = JSON.stringify(data ?? {})
  const fund: Data = JSON.parse(jsonString)

  return { data: fund }
}
