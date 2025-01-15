import { useQuery } from '@tanstack/react-query'
import { THE_GRAPH_QUERY_URL } from 'constants/query'
import { gql, request } from 'graphql-request'

const VOLUME_CHART = gql`
  query volumeChart($fundId: String!) {
    fundSnapshots(
      first: 100
      orderBy: timestamp
      orderDirection: asc
      where: { fundId: $fundId }
      subgraphError: allow
    ) {
      id
      timestamp
      currentUSD
      currentTokens
      currentTokensSymbols
      currentTokensAmountUSD
    }
  }
`

interface VolumeChart {
  id: string
  timestamp: number
  currentUSD: number
  currentTokens: string[]
  currentTokensSymbols: string[]
  currentTokensAmountUSD: number[]
}

interface Data {
  fundSnapshots: VolumeChart[]
}

/**
 * Fetch fund volume chart data
 */
export function useVolumeChartData(fundId: string | undefined): {
  data?: Data
} {
  const { data } = useQuery({
    queryKey: ['fundSnapshots', fundId],
    async queryFn() {
      return await request(THE_GRAPH_QUERY_URL, VOLUME_CHART, { fundId })
    },
  })
  const jsonString = JSON.stringify(data ?? {})
  const fundSnapshots: Data = JSON.parse(jsonString)

  return { data: fundSnapshots }
}
