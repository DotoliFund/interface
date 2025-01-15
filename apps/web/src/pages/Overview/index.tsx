// import { TopPoolTable } from 'components/Pools/PoolTable/PoolTable'
//import { TopTokensTable } from 'components/Tokens/TokenTable'
import { useQuery } from '@tanstack/react-query'
import { TopFundsTable } from 'components/Funds/FundTable'
import { WhiteListsTable } from 'components/WhiteLists/WhiteListTable'
import { THE_GRAPH_QUERY_URL } from 'constants/query'
import { gql, request } from 'graphql-request'
import { useEffect, useRef } from 'react'
import { Flex } from 'ui/src'

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

export enum ExploreTab {
  Tokens = 'tokens',
  Pools = 'whiteListTokens',
  Transactions = 'transactions',
}

const OverviewPage = () => {
  const tabNavRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (tabNavRef.current) {
      const offsetTop = tabNavRef.current.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: offsetTop - 90, behavior: 'smooth' })
    }
    // scroll to tab navbar on initial page mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { data } = useQuery({
    queryKey: ['data'],
    async queryFn() {
      return await request(url, query)
    },
  })

  const jsonString = JSON.stringify(data ?? {})
  const jsonData: Datas = JSON.parse(jsonString)

  return (
    <Flex width="100%" minWidth={320} pt="$spacing48" px="$spacing40" $md={{ p: '$spacing16', pb: 0 }}>
      {/* <ExploreChartsSection /> */}
      <TopFundsTable funds={jsonData.funds ?? []} />
      <WhiteListsTable whiteLists={jsonData.whiteListTokens ?? []} />
    </Flex>
  )
}

export default OverviewPage
