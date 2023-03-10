import { Trans } from '@lingui/macro'
// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import HoverInlineText from 'components/HoverInlineText'
import { MouseoverTooltip } from 'components/Tooltip'
import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { warningSeverity } from 'utils/prices'

export function FiatValue({
  fiatValue,
  priceImpact,
  isLoading = false,
}: {
  fiatValue: CurrencyAmount<Currency> | null | undefined
  priceImpact?: Percent
  isLoading?: boolean
}) {
  const theme = useTheme()
  const [showLoadingPlaceholder, setShowLoadingPlaceholder] = useState(false)
  const priceImpactColor = useMemo(() => {
    if (!priceImpact) return undefined
    if (priceImpact.lessThan('0')) return theme.deprecated_green1
    const severity = warningSeverity(priceImpact)
    if (severity < 1) return theme.deprecated_text3
    if (severity < 3) return theme.deprecated_yellow1
    return theme.deprecated_red1
  }, [priceImpact, theme.deprecated_green1, theme.deprecated_red1, theme.deprecated_text3, theme.deprecated_yellow1])

  const p = Number(fiatValue?.toFixed())
  const visibleDecimalPlaces = p < 1.05 ? 4 : 2

  useEffect(() => {
    const stale = false
    let timeoutId = 0
    if (isLoading && !fiatValue) {
      timeoutId = setTimeout(() => {
        if (!stale) setShowLoadingPlaceholder(true)
      }, 200) as unknown as number
    } else {
      setShowLoadingPlaceholder(false)
    }
    return () => clearTimeout(timeoutId)
  }, [isLoading, fiatValue])

  return (
    <ThemedText.DeprecatedBody fontSize={14} color={fiatValue ? theme.deprecated_text3 : theme.deprecated_text4}>
      {fiatValue ? (
        <Trans>
          $
          <HoverInlineText
            text={fiatValue?.toFixed(visibleDecimalPlaces, { groupSeparator: ',' })}
            textColor={fiatValue ? theme.deprecated_text3 : theme.deprecated_text4}
          />
        </Trans>
      ) : (
        ''
      )}
      {priceImpact ? (
        <span style={{ color: priceImpactColor }}>
          {' '}
          <MouseoverTooltip text={t`The estimated difference between the USD values of input and output amounts.`}>
            (<Trans>{priceImpact.multiply(-1).toSignificant(3)}%</Trans>)
          </MouseoverTooltip>
        </span>
      ) : null}
    </ThemedText.DeprecatedBody>
  )
}
