import { TopFundTable } from 'components/Tables/TopFundTable'
import { WhiteListTable } from 'components/Tables/WhiteListTable'
import { useFundAndWhiteList } from 'data/Overview/fundAndWhiteList'
import { useEffect, useRef } from 'react'
import { Flex } from 'ui/src'

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

  const fundAndWhiteList = useFundAndWhiteList().data

  return (
    <Flex width="100%" minWidth={320} pt="$spacing48" px="$spacing40" $md={{ p: '$spacing16', pb: 0 }}>
      {/* <ExploreChartsSection /> */}
      <TopFundTable funds={fundAndWhiteList?.funds ?? []} />
      <WhiteListTable whiteLists={fundAndWhiteList?.whiteListTokens ?? []} />
    </Flex>
  )
}

export default OverviewPage
