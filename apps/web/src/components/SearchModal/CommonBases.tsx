import { InterfaceElementName } from '@uniswap/analytics-events'
import { Currency } from '@uniswap/sdk-core'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { AutoRow } from 'components/Row'
import { COMMON_BASES } from 'constants/routing'
import { useTotalBalancesUsdForAnalytics } from 'graphql/data/apollo/TokenBalancesProvider'
import styled from 'lib/styled-components'
import { getTokenAddress } from 'lib/utils/analytics'
import { useCallback } from 'react'
import { Text } from 'rebass'
import { CurrencyInfo } from 'uniswap/src/features/dataApi/types'
import Trace from 'uniswap/src/features/telemetry/Trace'
import { UniswapEventName } from 'uniswap/src/features/telemetry/constants'
import { currencyId } from 'utils/currencyId'

const BaseWrapper = styled.div<{ disable?: boolean }>`
  border: 1px solid ${({ theme }) => theme.surface3};
  border-radius: 18px;
  display: flex;
  padding: 6px;
  padding-top: 5px;
  padding-bottom: 5px;
  padding-right: 12px;
  line-height: 0px;

  align-items: center;
  :hover {
    cursor: ${({ disable }) => (disable ? 'not-allowed' : 'pointer')};
    background-color: ${({ theme }) => theme.deprecated_hoverDefault};
  }

  color: ${({ theme, disable }) => disable && theme.neutral1};
  background-color: ${({ theme, disable }) => disable && theme.surface3};
`

const formatAnalyticsEventProperties = (
  currency: Currency,
  searchQuery: string,
  isAddressSearch: string | false,
  portfolioBalanceUsd: number | undefined,
) => ({
  token_symbol: currency?.symbol,
  token_chain_id: currency?.chainId,
  token_address: getTokenAddress(currency),
  is_suggested_token: true,
  is_selected_from_list: false,
  is_imported_by_user: false,
  total_balances_usd: portfolioBalanceUsd,
  ...(isAddressSearch === false
    ? { search_token_symbol_input: searchQuery }
    : { search_token_address_input: isAddressSearch }),
})

export default function CommonBases({
  chainId,
  onSelect,
  closeModal,
  selectedCurrency,
  searchQuery,
  isAddressSearch,
}: {
  chainId?: number
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
  closeModal: () => void
  searchQuery: string
  isAddressSearch: string | false
  portfolioBalanceUsd?: number
}) {
  const bases = chainId !== undefined ? COMMON_BASES[chainId] ?? [] : []
  const portfolioBalanceUsd = useTotalBalancesUsdForAnalytics()

  const handleSelect = useCallback(
    (currency: Currency, isSelected?: boolean) => {
      if (isSelected) {
        closeModal()
      } else {
        onSelect(currency)
      }
    },
    [onSelect, closeModal],
  )

  return bases.length > 0 ? (
    <AutoRow gap="4px">
      {bases.map((currencyInfo: CurrencyInfo) => {
        const currency = currencyInfo.currency
        const isSelected = selectedCurrency?.equals(currency)

        return (
          <Trace
            logPress
            logKeyPress
            eventOnTrigger={UniswapEventName.TokenSelected}
            properties={formatAnalyticsEventProperties(currency, searchQuery, isAddressSearch, portfolioBalanceUsd)}
            element={InterfaceElementName.COMMON_BASES_CURRENCY_BUTTON}
            key={currencyId(currency)}
          >
            <BaseWrapper
              tabIndex={0}
              onKeyPress={(e) => !isSelected && e.key === 'Enter' && onSelect(currency)}
              onClick={() => handleSelect(currency, isSelected)}
              disable={isSelected}
              key={currencyId(currency)}
              data-testid={`common-base-${currency.symbol}`}
            >
              <CurrencyLogo currency={currency} style={{ marginRight: 8 }} />
              <Text fontWeight={535} fontSize={16} lineHeight="16px">
                {currency.symbol}
              </Text>
            </BaseWrapper>
          </Trace>
        )
      })}
    </AutoRow>
  ) : null
}
