import { memo } from 'react'
import { Flex, Shine } from 'ui/src'
import { PollingInterval } from 'uniswap/src/constants/misc'
import { usePortfolioTotalValue } from 'uniswap/src/features/dataApi/balances'
import { FiatCurrency } from 'uniswap/src/features/fiatCurrency/constants'
import { useAppFiatCurrency, useAppFiatCurrencyInfo } from 'uniswap/src/features/fiatCurrency/hooks'
import { useLocalizationContext } from 'uniswap/src/features/language/LocalizationContext'
import { NumberType } from 'utilities/src/format/types'
import { RelativeChange } from 'wallet/src/components/text/RelativeChange'
import { isWarmLoadingStatus } from 'wallet/src/data/utils'
import AnimatedNumber from 'wallet/src/features/portfolio/AnimatedNumber'

interface PortfolioBalanceProps {
  owner: Address
}

export const PortfolioBalance = memo(function _PortfolioBalance({ owner }: PortfolioBalanceProps): JSX.Element {
  const { data, loading, networkStatus } = usePortfolioTotalValue({
    address: owner,
    // TransactionHistoryUpdater will refetch this query on new transaction.
    // No need to be super aggressive with polling here.
    pollInterval: PollingInterval.Normal,
  })

  const currency = useAppFiatCurrency()
  const currencyComponents = useAppFiatCurrencyInfo()
  const { convertFiatAmount, convertFiatAmountFormatted } = useLocalizationContext()

  const isLoading = loading && !data
  const isWarmLoading = !!data && isWarmLoadingStatus(networkStatus)

  const { percentChange, absoluteChangeUSD, balanceUSD } = data || {}

  const totalBalance = convertFiatAmountFormatted(balanceUSD, NumberType.PortfolioBalance)
  const absoluteChange = absoluteChangeUSD && convertFiatAmount(absoluteChangeUSD).amount
  // TODO gary re-enabling this for USD/Euros only, replace with more scalable approach
  const shouldFadePortfolioDecimals =
    (currency === FiatCurrency.UnitedStatesDollar || currency === FiatCurrency.Euro) && currencyComponents.symbolAtFront

  return (
    <Flex gap="$spacing4">
      <AnimatedNumber
        balance={balanceUSD}
        colorIndicationDuration={2000}
        loading={isLoading}
        loadingPlaceholderText="000000.00"
        shouldFadeDecimals={shouldFadePortfolioDecimals}
        value={totalBalance}
        warmLoading={isWarmLoading}
      />
      <Shine disabled={!isWarmLoading}>
        <RelativeChange
          absoluteChange={absoluteChange}
          arrowSize="$icon.16"
          change={percentChange}
          loading={isLoading}
          negativeChangeColor={isWarmLoading ? '$neutral2' : '$statusCritical'}
          positiveChangeColor={isWarmLoading ? '$neutral2' : '$statusSuccess'}
          variant="body3"
        />
      </Shine>
    </Flex>
  )
})
