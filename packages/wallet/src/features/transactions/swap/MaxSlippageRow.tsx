import { useTranslation } from 'react-i18next'
import { Flex, Text, TouchableArea } from 'ui/src'
import { CurrencyInfo } from 'uniswap/src/features/dataApi/types'
import { useLocalizationContext } from 'uniswap/src/features/language/LocalizationContext'
import { DerivedSwapInfo } from 'uniswap/src/features/transactions/swap/types/derivedSwapInfo'
import { IndicativeLoadingWrapper } from 'wallet/src/features/transactions/TransactionDetails/TransactionDetails'
import { SlippageWarningContent } from 'wallet/src/features/transactions/swap/SlippageWarningContent'

interface MaxSlippageRowProps {
  acceptedDerivedSwapInfo: DerivedSwapInfo<CurrencyInfo, CurrencyInfo>
  autoSlippageTolerance?: number
  customSlippageTolerance?: number
}

export function MaxSlippageRow({
  acceptedDerivedSwapInfo,
  autoSlippageTolerance,
  customSlippageTolerance,
}: MaxSlippageRowProps): JSX.Element {
  const { t } = useTranslation()

  const formatter = useLocalizationContext()
  const { formatPercent } = formatter

  const acceptedTrade = acceptedDerivedSwapInfo.trade.trade ?? acceptedDerivedSwapInfo.trade.indicativeTrade

  if (!acceptedTrade) {
    throw new Error('Invalid render of `MaxSlippageInfo` with no `acceptedTrade`')
  }

  // If we don't have a custom slippage tolerance set, we won't have a tolerance to display for an indicative quote,
  // since only the full quote has a slippage tolerance. In this case, we display a loading state until the full quote is received.
  const showLoadingState = acceptedTrade.indicative && !acceptedTrade.slippageTolerance

  // Make text the warning color if user is setting custom slippage higher than auto slippage value
  const showSlippageWarning =
    acceptedTrade.slippageTolerance && autoSlippageTolerance
      ? acceptedTrade.slippageTolerance > autoSlippageTolerance
      : false

  return (
    <Flex row alignItems="center" gap="$spacing12" justifyContent="space-between">
      <SlippageWarningContent
        autoSlippageTolerance={autoSlippageTolerance}
        isCustomSlippage={!!customSlippageTolerance}
        trade={acceptedTrade}
      >
        <TouchableArea flexShrink={1}>
          <Flex row alignItems="center" gap="$spacing4">
            <Text color="$neutral2" numberOfLines={3} variant="body3">
              {t('swap.details.slippage')}
            </Text>
          </Flex>
        </TouchableArea>
      </SlippageWarningContent>
      <IndicativeLoadingWrapper loading={showLoadingState}>
        <Flex centered row gap="$spacing8">
          {!customSlippageTolerance ? (
            <Flex centered backgroundColor="$surface3" borderRadius="$roundedFull" px="$spacing4" py="$spacing2">
              <Text color="$neutral2" variant="buttonLabel3">
                {t('swap.settings.slippage.control.auto')}
              </Text>
            </Flex>
          ) : null}
          <Text color={showSlippageWarning ? '$DEP_accentWarning' : '$neutral1'} variant="body3">
            {formatPercent(acceptedTrade?.slippageTolerance)}
          </Text>
        </Flex>
      </IndicativeLoadingWrapper>
    </Flex>
  )
}
