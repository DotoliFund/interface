import { RowBetween, RowFixed } from 'components/Row'
import SettingsTab from 'components/Settings'
import { SwapHeaderTabButton } from 'components/swap/styled'
import styled from 'lib/styled-components'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSwapAndLimitContext, useSwapContext } from 'state/swap/useSwapContext'
import { FeatureFlags } from 'uniswap/src/features/gating/flags'
import { useFeatureFlag } from 'uniswap/src/features/gating/hooks'
import { Trans } from 'uniswap/src/i18n'
import { SwapTab } from 'uniswap/src/types/screens/interface'
import { isIFramed } from 'utils/isIFramed'

const StyledSwapHeader = styled(RowBetween)`
  margin-bottom: 12px;
  padding-right: 4px;
  color: ${({ theme }) => theme.neutral2};
`

const HeaderButtonContainer = styled(RowFixed)<{ compact: boolean }>`
  gap: ${({ compact }) => (compact ? 0 : 16)}px;

  ${SwapHeaderTabButton} {
    ${({ compact }) => compact && 'padding: 8px 12px;'}
  }
`

const PathnameToTab: { [key: string]: SwapTab } = {
  '/swap': SwapTab.Swap,
  '/send': SwapTab.Send,
  '/limit': SwapTab.Limit,
  '/buy': SwapTab.Buy,
}

export default function SwapHeader2({ compact }: { compact: boolean; syncTabToUrl: boolean }) {
  const { initialChainId, currentTab, setCurrentTab } = useSwapAndLimitContext()
  const {
    derivedSwapInfo: { trade, autoSlippage },
  } = useSwapContext()
  const { pathname } = useLocation()
  const forAggregatorEnabled = useFeatureFlag(FeatureFlags.ForAggregator)

  useEffect(() => {
    if (pathname === '/buy') {
      setCurrentTab(forAggregatorEnabled ? SwapTab.Buy : SwapTab.Swap)
    } else if (pathname === '/send' && isIFramed()) {
      // Redirect to swap if send tab is iFramed (we do not allow the send tab to be iFramed due to clickjacking protections)
      // https://www.notion.so/uniswaplabs/What-is-not-allowed-to-be-iFramed-Clickjacking-protections-874f85f066c648afa0eb3480b3f47b5c#d0ebf1846c83475a86342a594f77eae5
      setCurrentTab(SwapTab.Swap)
    } else {
      setCurrentTab(PathnameToTab[pathname] ?? SwapTab.Swap)
    }
  }, [forAggregatorEnabled, pathname, setCurrentTab])

  return (
    <StyledSwapHeader>
      <HeaderButtonContainer compact={compact}>
        <Trans i18nKey="common.swap" />
      </HeaderButtonContainer>
      {currentTab === SwapTab.Swap && (
        <RowFixed>
          <SettingsTab autoSlippage={autoSlippage} chainId={initialChainId} compact={compact} trade={trade.trade} />
        </RowFixed>
      )}
    </StyledSwapHeader>
  )
}
