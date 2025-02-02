import { useQuery } from '@tanstack/react-query'
import { THE_GRAPH_QUERY_URL } from 'constants/query'
import { gql, request } from 'graphql-request'

const INVESTOR_DATA = gql`
  query investors($fundId: String!) {
    investors(
      first: 100
      orderBy: principalUSD
      orderDirection: desc
      where: { fundId: $fundId }
      subgraphError: allow
    ) {
      id
      createdAtTimestamp
      updatedAtTimestamp
      fundId
      investor
      isManager
      principalUSD
      currentUSD
      profitRatio
    }
  }
`

export interface Investor {
  id: string
  createdAtTimestamp: string
  updatedAtTimestamp: string
  fundId: string
  investor: string
  isManager: string
  principalUSD: string
  currentUSD: string
  profitRatio: string
}

interface Data {
  investors: Investor[]
}

/**
 * Fetch investor data
 */
export function useInvestorData(fundId: string | undefined): {
  data?: Data
} {
  const { data } = useQuery({
    queryKey: ['investors', fundId],
    async queryFn() {
      return await request(THE_GRAPH_QUERY_URL, INVESTOR_DATA, { fundId })
    },
  })
  const jsonString = JSON.stringify(data ?? {})
  const investors: Data = JSON.parse(jsonString)

  return { data: investors }
}
