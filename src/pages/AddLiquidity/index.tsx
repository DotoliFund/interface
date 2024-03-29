import { BigNumber } from '@ethersproject/bignumber'
import type { TransactionResponse } from '@ethersproject/providers'
import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { sendEvent } from 'components/analytics'
import AddLiquidityCurrencyInputPanel from 'components/CurrencyInputPanel/AddLiquidityInputPanel'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { DOTOLI_FUND_ADDRESSES } from 'constants/addresses'
import { isSupportedChain } from 'constants/chains'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { DotoliFund } from 'interface/DotoliFund'
import { ErrorContainer, NetworkIcon } from 'pages/Account'
import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { Text } from 'rebass'
import {
  useRangeHopCallbacks,
  useV3DerivedMintInfo,
  useV3MintActionHandlers,
  useV3MintState,
} from 'state/mint/v3/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { ExternalLink, ThemedText } from 'theme'

import { ButtonError, ButtonYellow } from '../../components/Button'
import { BlueCard, OutlineCard, YellowCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import FeeSelector from '../../components/FeeSelector'
import HoverInlineText from '../../components/HoverInlineText'
import LiquidityChartRangeInput from '../../components/LiquidityChartRangeInput'
import { NavigationsTabs } from '../../components/NavigationTabs'
import { PositionPreview } from '../../components/PositionPreview'
import RangeSelector from '../../components/RangeSelector'
import PresetsButtons from '../../components/RangeSelector/PresetsButtons'
import RateToggle from '../../components/RateToggle'
import Row, { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { SwitchLocaleLink } from '../../components/SwitchLocaleLink'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import { ZERO_PERCENT } from '../../constants/misc'
import { WRAPPED_NATIVE_CURRENCY } from '../../constants/tokens'
import { useCurrency } from '../../hooks/Tokens'
import { useV3NFTPositionManagerContract } from '../../hooks/useContract'
import { useDerivedPositionInfo } from '../../hooks/useDerivedPositionInfo'
import { useIsSwapUnsupported } from '../../hooks/useIsSwapUnsupported'
import { useStablecoinValue } from '../../hooks/useStablecoinPrice'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { useV3PositionFromTokenId } from '../../hooks/useV3Positions'
import { useToggleWalletModal } from '../../state/application/hooks'
import { Bound, Field } from '../../state/mint/v3/actions'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { TransactionType } from '../../state/transactions/types'
import { useIsExpertMode, useUserSlippageToleranceWithDefault } from '../../state/user/hooks'
import { calculateGasMargin } from '../../utils/calculateGasMargin'
import { currencyId } from '../../utils/currencyId'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { Review } from './Review'
import {
  CurrencyDropdown,
  DynamicSection,
  HideMedium,
  MediumOnly,
  PageWrapper,
  ResponsiveTwoColumns,
  RightContainer,
  ScrollablePage,
  StackedContainer,
  StackedItem,
  StyledInput,
  Wrapper,
} from './styled'

const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

const SwapSection = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.backgroundModule};
  border-radius: 12px;
  padding: 16px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  &:before {
    box-sizing: border-box;
    background-size: 100%;
    border-radius: inherit;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    content: '';
    border: 1px solid ${({ theme }) => theme.backgroundModule};
  }
  &:hover:before {
    border-color: ${({ theme }) => theme.stateOverlayHover};
  }
  &:focus-within:before {
    border-color: ${({ theme }) => theme.stateOverlayPressed};
  }
`

export default function AddLiquidity() {
  const navigate = useNavigate()
  const {
    fundId,
    investor,
    currencyIdA,
    currencyIdB,
    feeAmount: feeAmountFromUrl,
    tokenId,
  } = useParams<{
    fundId?: string
    investor?: string
    currencyIdA?: string
    currencyIdB?: string
    feeAmount?: string
    tokenId?: string
  }>()
  const { account, chainId, provider } = useWeb3React()
  const theme = useTheme()

  const toggleWalletModal = useToggleWalletModal() // toggle wallet when disconnected
  const expertMode = useIsExpertMode()
  const addTransaction = useTransactionAdder()
  const positionManager = useV3NFTPositionManagerContract()
  const parsedQs = useParsedQueryString()

  // check for existing position if tokenId in url
  const { position: existingPositionDetails, loading: positionLoading } = useV3PositionFromTokenId(
    fundId ?? undefined,
    investor ?? undefined,
    tokenId ? BigNumber.from(tokenId) : undefined
  )
  const hasExistingPosition = !!existingPositionDetails && !positionLoading
  const { position: existingPosition } = useDerivedPositionInfo(existingPositionDetails)

  // fee selection from url
  const feeAmount: FeeAmount | undefined =
    feeAmountFromUrl && Object.values(FeeAmount).includes(parseFloat(feeAmountFromUrl))
      ? parseFloat(feeAmountFromUrl)
      : undefined

  const baseCurrency = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)
  // prevent an error if they input ETH/WETH
  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped) ? undefined : currencyB

  // mint state
  const { independentField, typedValue, startPriceTypedValue, rightRangeTypedValue, leftRangeTypedValue } =
    useV3MintState()

  const {
    pool,
    ticks,
    dependentField,
    price,
    pricesAtTicks,
    parsedAmounts,
    currencyBalances,
    position,
    noLiquidity,
    currencies,
    errorMessage,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
  } = useV3DerivedMintInfo(
    fundId ?? undefined,
    investor ?? undefined,
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    existingPosition
  )

  const { onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput, onStartPriceInput } =
    useV3MintActionHandlers(noLiquidity)

  const isValid = !errorMessage && !invalidRange

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // capital efficiency warning
  const [showCapitalEfficiencyWarning, setShowCapitalEfficiencyWarning] = useState(false)

  useEffect(() => setShowCapitalEfficiencyWarning(false), [baseCurrency, quoteCurrency, feeAmount])

  useEffect(() => {
    if (
      parsedQs.minPrice &&
      typeof parsedQs.minPrice === 'string' &&
      parsedQs.minPrice !== leftRangeTypedValue &&
      !isNaN(parsedQs.minPrice as any)
    ) {
      onLeftRangeInput(parsedQs.minPrice)
    }

    if (
      parsedQs.maxPrice &&
      typeof parsedQs.maxPrice === 'string' &&
      parsedQs.maxPrice !== rightRangeTypedValue &&
      !isNaN(parsedQs.maxPrice as any)
    ) {
      onRightRangeInput(parsedQs.maxPrice)
    }
  }, [parsedQs, rightRangeTypedValue, leftRangeTypedValue, onRightRangeInput, onLeftRangeInput])

  // txn values
  const deadline = useTransactionDeadline() // custom from users settings

  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const usdcValues = {
    [Field.CURRENCY_A]: useStablecoinValue(parsedAmounts[Field.CURRENCY_A]),
    [Field.CURRENCY_B]: useStablecoinValue(parsedAmounts[Field.CURRENCY_B]),
  }

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      }
    },
    {}
  )

  const atMaxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      }
    },
    {}
  )

  const allowedSlippage = useUserSlippageToleranceWithDefault(
    outOfRange ? ZERO_PERCENT : DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE
  )

  async function onAdd() {
    if (!chainId || !provider || !account) return

    if (!positionManager || !baseCurrency || !quoteCurrency) {
      return
    }

    if (fundId && investor && position && account && deadline) {
      const { calldata, value } =
        hasExistingPosition && tokenId
          ? DotoliFund.addLiquidityCallParameters(fundId, investor, position, {
              tokenId,
              slippageTolerance: allowedSlippage,
              deadline: deadline.toString(),
            })
          : DotoliFund.addLiquidityCallParameters(fundId, investor, position, {
              slippageTolerance: allowedSlippage,
              deadline: deadline.toString(),
              createPool: noLiquidity,
            })

      const txn: { to: string; data: string; value: string } = {
        to: DOTOLI_FUND_ADDRESSES,
        data: calldata,
        value,
      }

      setAttemptingTxn(true)

      provider
        .getSigner()
        .estimateGas(txn)
        .then((estimate) => {
          const newTxn = {
            ...txn,
            gasLimit: calculateGasMargin(estimate),
          }

          return provider
            .getSigner()
            .sendTransaction(newTxn)
            .then((response: TransactionResponse) => {
              setAttemptingTxn(false)
              addTransaction(response, {
                type: TransactionType.ADD_LIQUIDITY_V3_POOL,
                baseCurrencyId: currencyId(baseCurrency),
                quoteCurrencyId: currencyId(quoteCurrency),
                createPool: Boolean(noLiquidity),
                expectedAmountBaseRaw: parsedAmounts[Field.CURRENCY_A]?.quotient?.toString() ?? '0',
                expectedAmountQuoteRaw: parsedAmounts[Field.CURRENCY_B]?.quotient?.toString() ?? '0',
                feeAmount: position.pool.fee,
              })
              setTxHash(response.hash)
              sendEvent({
                category: 'Liquidity',
                action: 'Add',
                label: [currencies[Field.CURRENCY_A]?.symbol, currencies[Field.CURRENCY_B]?.symbol].join('/'),
              })
            })
        })
        .catch((error) => {
          console.error('Failed to send transaction', error)
          setAttemptingTxn(false)
          // we only care if the error is something _other_ than the user rejected the tx
          if (error?.code !== 4001) {
            console.error(error)
          }
        })
    } else {
      return
    }
  }

  const handleCurrencySelect = useCallback(
    (currencyNew: Currency, currencyIdOther?: string): (string | undefined)[] => {
      const currencyIdNew = currencyId(currencyNew)

      if (currencyIdNew === currencyIdOther) {
        // not ideal, but for now clobber the other if the currency ids are equal
        return [currencyIdNew, undefined]
      } else {
        // prevent weth + eth
        const isETHOrWETHNew =
          currencyIdNew === 'ETH' ||
          (chainId !== undefined && currencyIdNew === WRAPPED_NATIVE_CURRENCY[chainId]?.address)
        const isETHOrWETHOther =
          currencyIdOther !== undefined &&
          (currencyIdOther === 'ETH' ||
            (chainId !== undefined && currencyIdOther === WRAPPED_NATIVE_CURRENCY[chainId]?.address))

        if (isETHOrWETHNew && isETHOrWETHOther) {
          return [currencyIdNew, undefined]
        } else {
          return [currencyIdNew, currencyIdOther]
        }
      }
    },
    [chainId]
  )

  const handleCurrencyASelect = useCallback(
    (currencyANew: Currency) => {
      const [idA, idB] = handleCurrencySelect(currencyANew, currencyIdB)
      if (idB === undefined) {
        navigate(`/add/${fundId}/${investor}/${idA}`)
      } else {
        navigate(`/add/${fundId}/${investor}/${idA}/${idB}`)
      }
    },
    [fundId, investor, handleCurrencySelect, currencyIdB, navigate]
  )

  const handleCurrencyBSelect = useCallback(
    (currencyBNew: Currency) => {
      const [idB, idA] = handleCurrencySelect(currencyBNew, currencyIdA)
      if (idA === undefined) {
        navigate(`/add/${fundId}/${investor}/${idB}`)
      } else {
        navigate(`/add/${fundId}/${investor}/${idA}/${idB}`)
      }
    },
    [fundId, investor, handleCurrencySelect, currencyIdA, navigate]
  )

  const handleFeePoolSelect = useCallback(
    (newFeeAmount: FeeAmount) => {
      onLeftRangeInput('')
      onRightRangeInput('')
      navigate(`/add/${fundId}/${investor}/${currencyIdA}/${currencyIdB}/${newFeeAmount}`)
    },
    [fundId, investor, currencyIdA, currencyIdB, navigate, onLeftRangeInput, onRightRangeInput]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
      // dont jump to pool page if creating
      navigate(`/fund/${fundId}/${investor}`)
    }
    setTxHash('')
  }, [navigate, onFieldAInput, txHash, fundId, investor])

  const addIsUnsupported = useIsSwapUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  // get value and prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange } =
    useRangeHopCallbacks(baseCurrency ?? undefined, quoteCurrency ?? undefined, feeAmount, tickLower, tickUpper, pool)

  const pendingText = `Supplying ${!depositADisabled ? parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) : ''} ${
    !depositADisabled ? currencies[Field.CURRENCY_A]?.symbol : ''
  } ${!outOfRange ? 'and' : ''} ${!depositBDisabled ? parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) : ''} ${
    !depositBDisabled ? currencies[Field.CURRENCY_B]?.symbol : ''
  }`

  const Buttons = () =>
    addIsUnsupported ? (
      <ButtonYellow disabled={true} $borderRadius="12px" padding="12px">
        <ThemedText.DeprecatedMain mb="4px">
          <Trans>Unsupported Asset</Trans>
        </ThemedText.DeprecatedMain>
      </ButtonYellow>
    ) : !account ? (
      <ButtonYellow onClick={toggleWalletModal} $borderRadius="12px" padding="12px">
        <Trans>Connect Wallet</Trans>
      </ButtonYellow>
    ) : (
      <AutoColumn gap="md">
        <ButtonError
          onClick={() => {
            expertMode ? onAdd() : setShowConfirm(true)
          }}
          disabled={!isValid || depositADisabled || depositBDisabled}
          error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
        >
          <Text fontWeight={500}>{errorMessage ? errorMessage : <Trans>Preview</Trans>}</Text>
        </ButtonError>
      </AutoColumn>
    )

  if (!isSupportedChain(chainId)) {
    return (
      <ErrorContainer>
        <ThemedText.DeprecatedBody color={theme.deprecated_text4} textAlign="center">
          <NetworkIcon strokeWidth={1.2} />
          <div data-testid="pools-unsupported-err">
            <Trans>Your connected network is unsupported.</Trans>
          </div>
        </ThemedText.DeprecatedBody>
      </ErrorContainer>
    )
  } else {
    return (
      <>
        <ScrollablePage>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            content={() => (
              <ConfirmationModalContent
                title={<Trans>Add Liquidity</Trans>}
                onDismiss={handleDismissConfirmation}
                topContent={() => (
                  <Review
                    parsedAmounts={parsedAmounts}
                    position={position}
                    existingPosition={existingPosition}
                    priceLower={priceLower}
                    priceUpper={priceUpper}
                    outOfRange={outOfRange}
                    ticksAtLimit={ticksAtLimit}
                  />
                )}
                bottomContent={() => (
                  <ButtonYellow style={{ marginTop: '1rem' }} onClick={onAdd}>
                    <Text fontWeight={500} fontSize={20}>
                      <Trans>Add</Trans>
                    </Text>
                  </ButtonYellow>
                )}
              />
            )}
            pendingText={pendingText}
          />
          <PageWrapper wide={!hasExistingPosition}>
            <NavigationsTabs
              adding={true}
              defaultSlippage={DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE}
              fundId={fundId}
              investor={investor}
              tokenId={tokenId}
            >
              {!hasExistingPosition && (
                <Row justifyContent="flex-end" style={{ width: 'fit-content', minWidth: 'fit-content' }}>
                  {baseCurrency && quoteCurrency ? (
                    <RateToggle
                      currencyA={baseCurrency}
                      currencyB={quoteCurrency}
                      handleRateToggle={() => {
                        if (!ticksAtLimit[Bound.LOWER] && !ticksAtLimit[Bound.UPPER]) {
                          onLeftRangeInput((invertPrice ? priceLower : priceUpper?.invert())?.toSignificant(6) ?? '')
                          onRightRangeInput((invertPrice ? priceUpper : priceLower?.invert())?.toSignificant(6) ?? '')
                          onFieldAInput(formattedAmounts[Field.CURRENCY_B] ?? '')
                        }
                        navigate(
                          `/add/${fundId}/${investor}/${currencyIdB as string}/${currencyIdA as string}${
                            feeAmount ? '/' + feeAmount : ''
                          }`
                        )
                      }}
                    />
                  ) : null}
                </Row>
              )}
            </NavigationsTabs>
            <Wrapper>
              <ResponsiveTwoColumns wide={!hasExistingPosition}>
                <AutoColumn gap="lg">
                  {!hasExistingPosition && (
                    <>
                      <AutoColumn gap="md">
                        <RowBetween paddingBottom="20px">
                          <ThemedText.DeprecatedLabel>
                            <Trans>Select Pair</Trans>
                          </ThemedText.DeprecatedLabel>
                        </RowBetween>
                        <RowBetween>
                          <CurrencyDropdown
                            value={formattedAmounts[Field.CURRENCY_A]}
                            onUserInput={onFieldAInput}
                            hideInput={true}
                            onMax={() => {
                              onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                            }}
                            onCurrencySelect={handleCurrencyASelect}
                            showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                            currency={currencies[Field.CURRENCY_A] ?? null}
                            id="add-liquidity-input-tokena"
                            showCommonBases
                          />

                          <div style={{ width: '12px' }} />

                          <CurrencyDropdown
                            value={formattedAmounts[Field.CURRENCY_B]}
                            hideInput={true}
                            onUserInput={onFieldBInput}
                            onCurrencySelect={handleCurrencyBSelect}
                            onMax={() => {
                              onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                            }}
                            showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                            currency={currencies[Field.CURRENCY_B] ?? null}
                            id="add-liquidity-input-tokenb"
                            showCommonBases
                          />
                        </RowBetween>

                        <FeeSelector
                          disabled={!quoteCurrency || !baseCurrency}
                          feeAmount={feeAmount}
                          handleFeePoolSelect={handleFeePoolSelect}
                          currencyA={baseCurrency ?? undefined}
                          currencyB={quoteCurrency ?? undefined}
                        />
                      </AutoColumn>{' '}
                    </>
                  )}
                  {hasExistingPosition && existingPosition && (
                    <PositionPreview
                      position={existingPosition}
                      title={<Trans>Selected Range</Trans>}
                      inRange={!outOfRange}
                      ticksAtLimit={ticksAtLimit}
                    />
                  )}
                </AutoColumn>
                <div>
                  <DynamicSection
                    disabled={tickLower === undefined || tickUpper === undefined || invalidPool || invalidRange}
                  >
                    <AutoColumn gap="md">
                      <ThemedText.DeprecatedLabel>
                        {hasExistingPosition ? <Trans>Add more liquidity</Trans> : <Trans>Deposit Amounts</Trans>}
                      </ThemedText.DeprecatedLabel>
                      <SwapSection>
                        <AddLiquidityCurrencyInputPanel
                          value={formattedAmounts[Field.CURRENCY_A]}
                          onUserInput={onFieldAInput}
                          onMax={() => {
                            onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                          }}
                          showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                          currency={currencies[Field.CURRENCY_A] ?? null}
                          id="add-liquidity-input-tokena"
                          fiatValue={usdcValues[Field.CURRENCY_A]}
                          showCommonBases
                          locked={depositADisabled}
                        />
                      </SwapSection>
                      <SwapSection>
                        <AddLiquidityCurrencyInputPanel
                          value={formattedAmounts[Field.CURRENCY_B]}
                          onUserInput={onFieldBInput}
                          onMax={() => {
                            onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                          }}
                          showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                          fiatValue={usdcValues[Field.CURRENCY_B]}
                          currency={currencies[Field.CURRENCY_B] ?? null}
                          id="add-liquidity-input-tokenb"
                          showCommonBases
                          locked={depositBDisabled}
                        />
                      </SwapSection>
                    </AutoColumn>
                  </DynamicSection>
                </div>

                {!hasExistingPosition ? (
                  <>
                    <HideMedium>
                      <Buttons />
                    </HideMedium>
                    <RightContainer gap="lg">
                      <DynamicSection gap="md" disabled={!feeAmount || invalidPool}>
                        {!noLiquidity ? (
                          <>
                            <RowBetween>
                              <ThemedText.DeprecatedLabel>
                                <Trans>Set Price Range</Trans>
                              </ThemedText.DeprecatedLabel>
                            </RowBetween>

                            {price && baseCurrency && quoteCurrency && !noLiquidity && (
                              <AutoRow gap="4px" justify="center" style={{ marginTop: '0.5rem' }}>
                                <Trans>
                                  <ThemedText.DeprecatedMain
                                    fontWeight={500}
                                    textAlign="center"
                                    fontSize={12}
                                    color="text1"
                                  >
                                    Current Price:
                                  </ThemedText.DeprecatedMain>
                                  <ThemedText.DeprecatedBody
                                    fontWeight={500}
                                    textAlign="center"
                                    fontSize={12}
                                    color="text1"
                                  >
                                    <HoverInlineText
                                      maxCharacters={20}
                                      text={invertPrice ? price.invert().toSignificant(6) : price.toSignificant(6)}
                                    />
                                  </ThemedText.DeprecatedBody>
                                  <ThemedText.DeprecatedBody color="text2" fontSize={12}>
                                    {quoteCurrency?.symbol} per {baseCurrency.symbol}
                                  </ThemedText.DeprecatedBody>
                                </Trans>
                              </AutoRow>
                            )}

                            <LiquidityChartRangeInput
                              currencyA={baseCurrency ?? undefined}
                              currencyB={quoteCurrency ?? undefined}
                              feeAmount={feeAmount}
                              ticksAtLimit={ticksAtLimit}
                              price={
                                price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8)) : undefined
                              }
                              priceLower={priceLower}
                              priceUpper={priceUpper}
                              onLeftRangeInput={onLeftRangeInput}
                              onRightRangeInput={onRightRangeInput}
                              interactive={!hasExistingPosition}
                            />
                          </>
                        ) : (
                          <AutoColumn gap="md">
                            <RowBetween>
                              <ThemedText.DeprecatedLabel>
                                <Trans>Set Starting Price</Trans>
                              </ThemedText.DeprecatedLabel>
                            </RowBetween>
                            {noLiquidity && (
                              <BlueCard
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  padding: '1rem 1rem',
                                }}
                              >
                                <ThemedText.DeprecatedBody
                                  fontSize={14}
                                  style={{ fontWeight: 500 }}
                                  textAlign="left"
                                  color={theme.deprecated_text4}
                                >
                                  <Trans>
                                    This pool must be initialized before you can add liquidity. To initialize, select a
                                    starting price for the pool. Then, enter your liquidity price range and deposit
                                    amount. Gas fees will be higher than usual due to the initialization transaction.
                                  </Trans>
                                </ThemedText.DeprecatedBody>
                              </BlueCard>
                            )}
                            <OutlineCard padding="12px">
                              <StyledInput
                                className="start-price-input"
                                value={startPriceTypedValue}
                                onUserInput={onStartPriceInput}
                              />
                            </OutlineCard>
                            <RowBetween
                              style={{ backgroundColor: theme.deprecated_bg1, padding: '12px', borderRadius: '12px' }}
                            >
                              <ThemedText.DeprecatedMain>
                                <Trans>Current {baseCurrency?.symbol} Price:</Trans>
                              </ThemedText.DeprecatedMain>
                              <ThemedText.DeprecatedMain>
                                {price ? (
                                  <ThemedText.DeprecatedMain>
                                    <RowFixed>
                                      <HoverInlineText
                                        maxCharacters={20}
                                        text={invertPrice ? price?.invert()?.toSignificant(5) : price?.toSignificant(5)}
                                      />{' '}
                                      <span style={{ marginLeft: '4px' }}>{quoteCurrency?.symbol}</span>
                                    </RowFixed>
                                  </ThemedText.DeprecatedMain>
                                ) : (
                                  '-'
                                )}
                              </ThemedText.DeprecatedMain>
                            </RowBetween>
                          </AutoColumn>
                        )}
                      </DynamicSection>

                      <DynamicSection
                        gap="md"
                        disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceTypedValue)}
                      >
                        <StackedContainer>
                          <StackedItem style={{ opacity: showCapitalEfficiencyWarning ? '0.05' : 1 }}>
                            <AutoColumn gap="md">
                              {noLiquidity && (
                                <RowBetween>
                                  <ThemedText.DeprecatedLabel>
                                    <Trans>Set Price Range</Trans>
                                  </ThemedText.DeprecatedLabel>
                                </RowBetween>
                              )}
                              <RangeSelector
                                priceLower={priceLower}
                                priceUpper={priceUpper}
                                getDecrementLower={getDecrementLower}
                                getIncrementLower={getIncrementLower}
                                getDecrementUpper={getDecrementUpper}
                                getIncrementUpper={getIncrementUpper}
                                onLeftRangeInput={onLeftRangeInput}
                                onRightRangeInput={onRightRangeInput}
                                currencyA={baseCurrency}
                                currencyB={quoteCurrency}
                                feeAmount={feeAmount}
                                ticksAtLimit={ticksAtLimit}
                              />
                              {!noLiquidity && (
                                <PresetsButtons
                                  setFullRange={() => {
                                    setShowCapitalEfficiencyWarning(true)
                                  }}
                                />
                              )}
                            </AutoColumn>
                          </StackedItem>

                          {showCapitalEfficiencyWarning && (
                            <StackedItem zIndex={1}>
                              <YellowCard
                                padding="15px"
                                $borderRadius="12px"
                                height="100%"
                                style={{
                                  borderColor: theme.deprecated_yellow1,
                                  border: '1px solid',
                                }}
                              >
                                <AutoColumn gap="8px" style={{ height: '100%' }}>
                                  <RowFixed>
                                    <AlertTriangle stroke={theme.deprecated_yellow1} size="16px" />
                                    <ThemedText.DeprecatedYellow ml="12px" fontSize="15px">
                                      <Trans>Efficiency Comparison</Trans>
                                    </ThemedText.DeprecatedYellow>
                                  </RowFixed>
                                  <RowFixed>
                                    <ThemedText.DeprecatedYellow ml="12px" fontSize="13px" margin={0} fontWeight={400}>
                                      <Trans>
                                        Full range positions may earn less fees than concentrated positions. Learn more{' '}
                                        <ExternalLink
                                          style={{ color: theme.deprecated_yellow1, textDecoration: 'underline' }}
                                          href="https://help.uniswap.org/en/articles/5434296-can-i-provide-liquidity-over-the-full-range-in-v3"
                                        >
                                          here
                                        </ExternalLink>
                                        .
                                      </Trans>
                                    </ThemedText.DeprecatedYellow>
                                  </RowFixed>
                                  <Row>
                                    <ButtonYellow
                                      padding="8px"
                                      marginRight="8px"
                                      $borderRadius="8px"
                                      width="auto"
                                      onClick={() => {
                                        setShowCapitalEfficiencyWarning(false)
                                        getSetFullRange()
                                      }}
                                    >
                                      <ThemedText.DeprecatedBlack fontSize={13} color="yellow">
                                        <Trans>I understand</Trans>
                                      </ThemedText.DeprecatedBlack>
                                    </ButtonYellow>
                                  </Row>
                                </AutoColumn>
                              </YellowCard>
                            </StackedItem>
                          )}
                        </StackedContainer>

                        {outOfRange ? (
                          <YellowCard padding="8px 12px" $borderRadius="12px">
                            <RowBetween>
                              <AlertTriangle stroke={theme.deprecated_yellow1} size="16px" />
                              <ThemedText.DeprecatedYellow ml="12px" fontSize="12px">
                                <Trans>
                                  Your position will not earn fees or be used in trades until the market price moves
                                  into your range.
                                </Trans>
                              </ThemedText.DeprecatedYellow>
                            </RowBetween>
                          </YellowCard>
                        ) : null}

                        {invalidRange ? (
                          <YellowCard padding="8px 12px" $borderRadius="12px">
                            <RowBetween>
                              <AlertTriangle stroke={theme.deprecated_yellow1} size="16px" />
                              <ThemedText.DeprecatedYellow ml="12px" fontSize="12px">
                                <Trans>Invalid range selected. The min price must be lower than the max price.</Trans>
                              </ThemedText.DeprecatedYellow>
                            </RowBetween>
                          </YellowCard>
                        ) : null}
                      </DynamicSection>

                      <MediumOnly>
                        <Buttons />
                      </MediumOnly>
                    </RightContainer>
                  </>
                ) : (
                  <Buttons />
                )}
              </ResponsiveTwoColumns>
            </Wrapper>
          </PageWrapper>
          {addIsUnsupported && (
            <UnsupportedCurrencyFooter
              show={addIsUnsupported}
              currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
            />
          )}
        </ScrollablePage>
        <SwitchLocaleLink />
      </>
    )
  }
}
