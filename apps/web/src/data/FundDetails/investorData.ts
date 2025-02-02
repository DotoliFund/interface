import { useQuery } from '@tanstack/react-query'
import { THE_GRAPH_QUERY_URL } from 'constants/query'
import { gql, request } from 'graphql-request'

const INVESTOR_DATA = gql`
  query investor($fundId: String!) {
    investor(id: $id, subgraphError: allow) {
      id
      fundId
      investor
      isManager
      currentTokens
      currentTokensSymbols
      currentTokensDecimals
      currentTokensAmount
    }
  }
`

interface Investor {
  id: string
  fundId: string
  investor: string
  isManager: string
  currentTokens: string[]
  currentTokensSymbols: string[]
  currentTokensDecimals: string[]
  currentTokensAmount: string[]
}

interface Data {
  investor: Investor
}
/**
 * Fetch investor data
 */
export function useInvestorData(
  fundId: string | undefined,
  investor: string | undefined,
): {
  data?: Data
} {
  const id = fundId + '-' + investor?.toUpperCase()
  const { data } = useQuery({
    queryKey: ['investor', fundId],
    async queryFn() {
      return await request(THE_GRAPH_QUERY_URL, INVESTOR_DATA, { id })
    },
  })
  const jsonString = JSON.stringify(data ?? {})
  const investorData: Data = JSON.parse(jsonString)

  return { data: investorData }
}
