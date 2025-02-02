import { useQuery } from '@tanstack/react-query'
import { THE_GRAPH_QUERY_URL } from 'constants/query'
import { gql, request } from 'graphql-request'

const MANAGER_DATA = gql`
  query managerData($fundId: String!) {
    investors(first: 1, where: { isManager: true, fundId: $fundId }, subgraphError: allow) {
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

export interface Manager {
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
  investors: Manager[]
}

/**
 * Fetch manager data
 */
export function useManagerData(fundId: string | undefined): {
  data?: Data
} {
  const { data } = useQuery({
    queryKey: ['investors', fundId],
    async queryFn() {
      return await request(THE_GRAPH_QUERY_URL, MANAGER_DATA, { fundId })
    },
  })
  const jsonString = JSON.stringify(data ?? {})
  const managers: Data = JSON.parse(jsonString)

  return { data: managers }
}
