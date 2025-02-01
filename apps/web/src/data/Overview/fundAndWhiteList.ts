import { useQuery } from '@tanstack/react-query'
import { THE_GRAPH_QUERY_URL } from 'constants/query'
import { gql, request } from 'graphql-request'

const url = THE_GRAPH_QUERY_URL
const query = gql`
  {
    funds(orderBy: currentUSD, orderDirection: desc, subgraphError: allow) {
      id
      createdAtTimestamp
      manager
      investorCount
      currentUSD
    }
    whiteListTokens(orderBy: id, orderDirection: asc, where: { isWhiteListToken: true }, subgraphError: allow) {
      id
      address
      symbol
      updatedTimestamp
    }
  }
`

export interface Fund {
  id: string
  createdAtTimestamp: string
  manager: string
  investorCount: string
  currentUSD: string
}

export interface WhiteList {
  id: string
  address: string
  symbol: string
  updatedTimestamp: string
}

interface Datas {
  funds: Fund[]
  whiteListTokens: WhiteList[]
}

/**
 * Fetch top funds by profit
 */
export function useFundAndWhiteList(): {
  data?: Datas
} {
  const { data } = useQuery({
    queryKey: ['data'],
    async queryFn() {
      return await request(url, query)
    },
  })
  const jsonString = JSON.stringify(data ?? {})
  const fundAndWhiteList: Datas = JSON.parse(jsonString)

  return { data: fundAndWhiteList }
}
