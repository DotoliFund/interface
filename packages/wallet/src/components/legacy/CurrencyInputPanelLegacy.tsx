import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { NativeSyntheticEvent, TextInput, TextInputProps, TextInputSelectionChangeEventData } from 'react-native'
import { Flex, FlexProps, SpaceTokens, Text, TouchableArea } from 'ui/src'
import { fonts } from 'ui/src/theme'
import { CurrencyInfo } from 'uniswap/src/features/dataApi/types'
import { useAppFiatCurrencyInfo } from 'uniswap/src/features/fiatCurrency/hooks'
import { useLocalizationContext } from 'uniswap/src/features/language/LocalizationContext'
import { Warning, WarningLabel } from 'uniswap/src/features/transactions/WarningModal/types'
import { TransactionType } from 'uniswap/src/features/transactions/types/transactionDetails'
import { TestID } from 'uniswap/src/test/fixtures/testIDs'
import { CurrencyField } from 'uniswap/src/types/currency'
import { getSymbolDisplayText } from 'uniswap/src/utils/currency'
import { NumberType } from 'utilities/src/format/types'
import { SelectTokenButton } from 'wallet/src/components/TokenSelector/SelectTokenButton'
import { AmountInput } from 'wallet/src/components/input/AmountInput'
import { MaxAmountButton } from 'wallet/src/components/input/MaxAmountButton'
import { useTokenAndFiatDisplayAmounts } from 'wallet/src/features/transactions/hooks/useTokenAndFiatDisplayAmounts'
import { useDynamicFontSizing } from 'wallet/src/utils/useDynamicFontSizing'

type CurrentInputPanelProps = {
  currencyInfo: Maybe<CurrencyInfo>
  currencyAmount: Maybe<CurrencyAmount<Currency>>
  currencyBalance: Maybe<CurrencyAmount<Currency>>
  onShowTokenSelector: () => void
  onSetExactAmount: (amount: string) => void
  value?: string
  showSoftInputOnFocus?: boolean
  autoFocus?: boolean
  focus?: boolean
  isOutput?: boolean
  isFiatInput?: boolean
  onToggleFiatInput?: (isFiatInput: boolean) => void
  onSetMax?: (amount: string) => void
  onPressIn?: () => void
  warnings: Warning[]
  dimTextColor?: boolean
  selection?: TextInputProps['selection']
  onSelectionChange?: (start: number, end: number) => void
  usdValue: Maybe<CurrencyAmount<Currency>>
  transactionType?: TransactionType

  // sometimes CurrencyInputPanel rendered off screen like with Send input -> selector flow
  isOnScreen?: boolean
} & FlexProps

const MAX_INPUT_FONT_SIZE = 42
const MIN_INPUT_FONT_SIZE = 28

// if font changes from `fontFamily.sansSerif.regular` or `MAX_INPUT_FONT_SIZE`
// changes from 36 then width value must be adjusted
const MAX_CHAR_PIXEL_WIDTH = 23

interface DynamicSwapPanelPaddingValues {
  paddingBottom: SpaceTokens
  paddingTop: SpaceTokens
  paddingHorizontal?: SpaceTokens
}

const getSwapPanelPaddingValues = (
  isOutputBox: boolean,
  hasCurrencyValue: boolean,
): { outerPadding: DynamicSwapPanelPaddingValues; innerPadding: DynamicSwapPanelPaddingValues } => {
  const outerPadding: DynamicSwapPanelPaddingValues = hasCurrencyValue
    ? {
        // when there is a currency value, and the box is on the top, add a bit more
        // padding (spacing24) to account for the swap direction button
        paddingBottom: isOutputBox ? '$spacing16' : '$spacing16',
        paddingTop: isOutputBox ? '$spacing24' : '$spacing16',
        paddingHorizontal: '$spacing16',
      }
    : {
        // spacing48 to account for the direction button (on the top or the bottom, depending
        // on whether this component is the top or bottom swap box)
        paddingBottom: isOutputBox ? '$spacing36' : '$spacing48',
        paddingTop: isOutputBox ? '$spacing48' : '$spacing36',
        paddingHorizontal: '$spacing16',
      }

  const innerPadding: DynamicSwapPanelPaddingValues = {
    // when there is a currency value, and the box is on the top, add a bit more
    // 20px is the desired amount, so we're adding outer padding and inner padding (16px + 4px)
    paddingBottom: '$none',
    // 20px is the desired amount, so we're adding outer padding and inner padding (16px + 4px)
    paddingTop: isOutputBox ? '$none' : '$spacing4',
  }

  return { outerPadding, innerPadding }
}

/** Input panel for a single side of a transfer action. */
export function _CurrencyInputPanel(props: CurrentInputPanelProps): JSX.Element {
  const {
    currencyAmount,
    currencyBalance,
    currencyInfo,
    onSetExactAmount,
    onSetMax,
    onShowTokenSelector,
    value,
    showSoftInputOnFocus = false,
    focus,
    autoFocus,
    isOutput = false,
    isFiatInput = false,
    onToggleFiatInput,
    onPressIn,
    warnings,
    dimTextColor,
    onSelectionChange: selectionChange,
    usdValue,
    isOnScreen,
    transactionType,
    ...rest
  } = props

  const inputRef = useRef<TextInput>(null)
  const { formatCurrencyAmount } = useLocalizationContext()

  const insufficientBalanceWarning = warnings.find((warning) => warning.type === WarningLabel.InsufficientFunds)

  const showInsufficientBalanceWarning = insufficientBalanceWarning && !isOutput

  // the focus state for native Inputs can sometimes be out of sync with the controlled `focus`
  // prop. When the internal focus state differs from our `focus` prop, sync the internal
  // focus state to be what our prop says it should be
  const isTextInputRefActuallyFocused = inputRef.current?.isFocused()
  useEffect(() => {
    if (focus && !isTextInputRefActuallyFocused && isOnScreen) {
      inputRef.current?.focus()
    } else if (!focus && isTextInputRefActuallyFocused) {
      inputRef.current?.blur()
    }
  }, [focus, inputRef, isTextInputRefActuallyFocused, isOnScreen])

  const { onLayout, fontSize, onSetFontSize } = useDynamicFontSizing(
    MAX_CHAR_PIXEL_WIDTH,
    MAX_INPUT_FONT_SIZE,
    MIN_INPUT_FONT_SIZE,
  )

  // Handle native numpad keyboard input
  const onChangeText = useCallback(
    (newAmount: string) => {
      onSetFontSize(newAmount)
      onSetExactAmount(newAmount)
    },
    [onSetFontSize, onSetExactAmount],
  )

  // This is needed to ensure that the text resizes when modified from outside the component (e.g. custom numpad)
  useEffect(() => {
    if (value) {
      onSetFontSize(value)
    }
  }, [value, onSetFontSize])

  const handleSetMax = useCallback(
    (amount: string) => {
      if (!onSetMax) {
        return
      }

      onSetMax(amount)
      onChangeText(amount)
    },
    [onChangeText, onSetMax],
  )

  const onSelectionChange = useCallback(
    ({
      nativeEvent: {
        selection: { start, end },
      },
    }: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => selectionChange && selectionChange(start, end),
    [selectionChange],
  )

  const paddingStyles = useMemo(
    () => getSwapPanelPaddingValues(isOutput, Boolean(currencyInfo)),
    [isOutput, currencyInfo],
  )

  const handleToggleFiatInput = useCallback(() => {
    onToggleFiatInput?.(!isFiatInput)
  }, [isFiatInput, onToggleFiatInput])

  const { outerPadding, innerPadding } = paddingStyles
  const { paddingBottom, paddingTop, paddingHorizontal } = outerPadding
  const { paddingBottom: innerPaddingBottom, paddingTop: innerPaddingTop } = innerPadding

  const inputColor = !value ? '$neutral3' : '$neutral1'
  const { symbol: fiatCurrencySymbol } = useAppFiatCurrencyInfo()

  const inputPanelFormattedValue = useTokenAndFiatDisplayAmounts({
    value,
    currencyInfo,
    currencyAmount,
    usdValue,
    isFiatMode: isFiatInput,
  })

  return (
    <Flex gap="$spacing8" pb={paddingBottom} pt={paddingTop} px={paddingHorizontal} {...rest}>
      <Flex
        row
        alignItems="center"
        justifyContent={!currencyInfo ? 'center' : 'space-between'}
        pb={innerPaddingBottom}
        pt={innerPaddingTop}
      >
        {isFiatInput && (
          <Text
            allowFontScaling
            color={inputColor}
            fontSize={fontSize}
            height={fontSize}
            lineHeight={fontSize}
            mr="$spacing2"
          >
            {fiatCurrencySymbol}
          </Text>
        )}
        {currencyInfo && (
          <Flex fill grow row alignItems="center" height={MAX_INPUT_FONT_SIZE} overflow="hidden" onLayout={onLayout}>
            <AmountInput
              ref={inputRef}
              autoFocus={autoFocus ?? focus}
              backgroundColor="$transparent"
              borderWidth={0}
              dimTextColor={dimTextColor}
              flex={1}
              fontFamily="$heading"
              fontSize={fontSize}
              maxDecimals={currencyInfo.currency.decimals}
              maxFontSizeMultiplier={fonts.heading2.maxFontSizeMultiplier}
              // This is a hacky workaround for Android to prevent text from being cut off
              // (the text input height is greater than the font size and the input is
              // centered vertically, so the caret is cut off but the text is not)
              minHeight={2 * MAX_INPUT_FONT_SIZE}
              overflow="visible"
              placeholder="0"
              placeholderTextColor="$neutral3"
              px="$none"
              py="$none"
              returnKeyType={showSoftInputOnFocus ? 'done' : undefined}
              showSoftInputOnFocus={showSoftInputOnFocus}
              testID={isOutput ? TestID.AmountInputOut : TestID.AmountInputIn}
              value={value}
              onChangeText={onChangeText}
              onPressIn={onPressIn}
              onSelectionChange={onSelectionChange}
            />
          </Flex>
        )}
        <Flex row alignItems="center" pl="$spacing8">
          <SelectTokenButton
            selectedCurrencyInfo={currencyInfo}
            testID={TestID.TokenSelectorToggle}
            onPress={onShowTokenSelector}
          />
        </Flex>
      </Flex>

      {currencyInfo && (
        <Flex row alignItems="center" gap="$spacing8" justifyContent="space-between" mb="$spacing4">
          <TouchableArea onPress={handleToggleFiatInput}>
            <Flex shrink>
              <Text color="$neutral2" numberOfLines={1} variant="body3">
                {inputPanelFormattedValue}
              </Text>
            </Flex>
          </TouchableArea>
          <Flex row alignItems="center" gap="$spacing8" justifyContent="flex-end">
            <Text color={showInsufficientBalanceWarning ? '$DEP_accentWarning' : '$neutral2'} variant="body3">
              {formatCurrencyAmount({
                value: currencyBalance,
                type: NumberType.TokenNonTx,
              })}{' '}
              {getSymbolDisplayText(currencyInfo.currency.symbol)}
            </Text>

            {onSetMax && (
              <MaxAmountButton
                currencyAmount={currencyAmount}
                currencyBalance={currencyBalance}
                currencyField={isOutput ? CurrencyField.OUTPUT : CurrencyField.INPUT}
                transactionType={transactionType}
                onSetMax={handleSetMax}
              />
            )}
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}

/**
 * @deprecated
 * Flows should use the new CurrencyInputPanel component instead of this one.
 * Requires small changes in the props.
 */
export const CurrencyInputPanelLegacy = memo(_CurrencyInputPanel)
