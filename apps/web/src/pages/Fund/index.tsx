import { InterfacePageName } from '@uniswap/analytics-events'
import { MAX_WIDTH_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import { useAccount } from 'hooks/useAccount'
import RecentTransactions from 'pages/Explore/tables/RecentTransactions'
import { useEffect, useRef } from 'react'
import { ExploreContextProvider } from 'state/explore'
import { Flex, Text } from 'ui/src'
import Trace from 'uniswap/src/features/telemetry/Trace'
import { Trans } from 'uniswap/src/i18n'

export enum ExploreTab {
  Tokens = 'tokens',
  Pools = 'pools',
  Transactions = 'transactions',
}

const Explore = ({ initialTab }: { initialTab?: ExploreTab }) => {
  const tabNavRef = useRef<HTMLDivElement>(null)
  const account = useAccount()

  useEffect(() => {
    if (tabNavRef.current && initialTab) {
      const offsetTop = tabNavRef.current.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: offsetTop - 90, behavior: 'smooth' })
    }
    // scroll to tab navbar on initial page mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Trace logImpression page={InterfacePageName.EXPLORE_PAGE} properties={{ chainName: account.chainId }}>
      <ExploreContextProvider chainId={account.chainId}>
        <Flex width="100%" minWidth={320} pt="$spacing48" px="$spacing40" $md={{ p: '$spacing16', pb: 0 }}>
          <Flex
            ref={tabNavRef}
            row
            maxWidth={MAX_WIDTH_MEDIA_BREAKPOINT}
            mt={0}
            mx="auto"
            mb="$spacing4"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
            $lg={{
              row: false,
              flexDirection: 'column',
              mx: 'unset',
              alignItems: 'flex-start',
              gap: '$spacing16',
            }}
          >
            <Flex
              row
              gap="$spacing24"
              flexWrap="wrap"
              justifyContent="flex-start"
              $md={{ gap: '$spacing16' }}
              data-testid="explore-navbar"
            >
              <Text
                variant="heading3"
                fontSize={28}
                $lg={{ fontSize: 24, lineHeight: 32 }}
                fontWeight="$book"
                color="$neutral1"
                cursor="pointer"
                animation="quick"
                key={ExploreTab.Transactions}
              >
                <Trans i18nKey="common.transactions" />
              </Text>
            </Flex>
          </Flex>
          <RecentTransactions />
        </Flex>
      </ExploreContextProvider>
    </Trace>
  )
}

export default Explore
