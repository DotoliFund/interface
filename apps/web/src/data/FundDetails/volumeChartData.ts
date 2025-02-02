import { useQuery } from '@tanstack/react-query'
import { THE_GRAPH_QUERY_URL } from 'constants/query'
import { gql, request } from 'graphql-request'

const VOLUME_CHART = gql`
  query volumeChart($fundId: String!, $investor: String!) {
    investorSnapshots(
      first: 100
      orderBy: timestamp
      orderDirection: asc
      where: { fundId: $fundId, investor: $investor }
      subgraphError: allow
    ) {
      id
      timestamp
      fundId
      investor
      currentUSD
      poolUSD
      principalUSD
      tokens
      tokensSymbols
      tokensAmountUSD
    }
  }
`

interface VolumeChart {
  id: string
  timestamp: number
  fundId: string
  investor: string
  currentUSD: number
  poolUSD: number
  principalUSD: number
  tokens: string[]
  tokensSymbols: string[]
  tokensAmountUSD: number[]
}

interface Data {
  investorSnapshots: VolumeChart[]
}

/**
 * Fetch fund volume chart data
 */
export function useVolumeChartData(
  fundId: string | undefined,
  investor: string | undefined,
): {
  data?: Data
} {
  const { data } = useQuery({
    queryKey: ['investorSnapshots', fundId, investor],
    async queryFn() {
      return await request(THE_GRAPH_QUERY_URL, VOLUME_CHART, { fundId, investor })
    },
  })
  const jsonString = JSON.stringify(data ?? {})
  const investorSnapshots: Data = JSON.parse(jsonString)

  return { data: investorSnapshots }
}
