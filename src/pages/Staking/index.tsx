import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { PageName, SectionName } from 'components/AmplitudeAnalytics/constants'
import { Trace } from 'components/AmplitudeAnalytics/Trace'
import { sendEvent } from 'components/analytics'
import { ButtonConfirmed, ButtonError, ButtonLight } from 'components/Button'
import Card from 'components/Card'
import { AutoColumn } from 'components/Column'
import RewardCurrencyInputPanel from 'components/CurrencyInputPanel/RewardCurrencyInputPanel'
import StakingCurrencyInputPanel from 'components/CurrencyInputPanel/StakingCurrencyInputPanel'
import UnstakingCurrencyInputPanel from 'components/CurrencyInputPanel/UnstakingCurrencyInputPanel'
import Loader from 'components/Loader'
import { AutoRow, RowBetween, RowFixed, RowFlat } from 'components/Row'
import { PageWrapper, SwapWrapper as StakingWrapper } from 'components/swap/styleds'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { ToggleElement, ToggleWrapper } from 'components/Toggle/MultiToggle'
import { MouseoverTooltip } from 'components/Tooltip'
import { DOTOLI_ADDRESS, DOTOLI_STAKING_ADDRESS } from 'constants/addresses'
import { isSupportedChain } from 'constants/chains'
import { useCurrency } from 'hooks/Tokens'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { DotoliStaking } from 'interface/DotoliStaking'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { ErrorContainer, NetworkIcon } from 'pages/Account'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle, HelpCircle } from 'react-feather'
import { Text } from 'rebass'
import { useToggleWalletModal } from 'state/application/hooks'
import { useStakingInfo } from 'state/stake/hooks'
import { useExpertModeManager } from 'state/user/hooks'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import { DTL } from '../../constants/tokens'

const StyledStakingHeader = styled.div`
  padding: 8px 12px;
  margin-bottom: 8px;
  width: 100%;
  color: ${({ theme }) => theme.deprecated_text2};
`

const StakingSection = styled.div`
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

const ToggleRow = styled(RowFlat)`
  justify-content: flex-end;
  margin-bottom: 10px;

  @media screen and (max-width: 600px) {
    flex-direction: row;
  }
`

enum StakeView {
  STAKE,
  UNSTAKE,
  REWARD,
}

export default function Staking() {
  const { account, chainId, provider } = useWeb3React()
  const dtl = chainId ? DTL[chainId] : undefined

  const theme = useTheme()

  const [view, setView] = useState(StakeView.STAKE)

  // toggle wallet when disconnected
  const toggleWalletModal = useToggleWalletModal()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  // stake state
  const [typedValue, setTypedValue] = useState<string>()
  const handleTypeInput = useCallback(
    (value: string) => {
      setTypedValue(value)
    },
    [setTypedValue]
  )

  const stakingInfo = useStakingInfo()
  const currency = useCurrency(chainId ? DOTOLI_ADDRESS[chainId] : undefined)
  const parsedAmount = useMemo(() => (dtl ? tryParseCurrencyAmount(typedValue, dtl) : undefined), [dtl, typedValue])
  const formattedAmounts = useMemo(() => typedValue, [typedValue])

  const maxStakingInputAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(stakingInfo?.unStakingBalance),
    [stakingInfo]
  )
  const showMaxStakingButton = Boolean(
    maxStakingInputAmount?.greaterThan(0) && !parsedAmount?.equalTo(maxStakingInputAmount)
  )

  const maxUnstakingInputAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(stakingInfo?.stakedAmount),
    [stakingInfo]
  )
  const showMaxUnstakingButton = Boolean(
    maxUnstakingInputAmount?.greaterThan(0) && !parsedAmount?.equalTo(maxUnstakingInputAmount)
  )

  const maxRewardInputAmount: CurrencyAmount<Currency> | undefined = useMemo(
    () => maxAmountSpend(stakingInfo?.earnedAmount),
    [stakingInfo]
  )
  const showMaxRewardButton = Boolean(
    maxRewardInputAmount?.greaterThan(0) && !parsedAmount?.equalTo(maxRewardInputAmount)
  )

  const [approvalState, approveCallback] = useApproveCallback(
    parsedAmount,
    chainId ? DOTOLI_STAKING_ADDRESS[chainId] : undefined
  )

  const handleApprove = useCallback(async () => {
    await approveCallback()
  }, [approveCallback])

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approvalState, approvalSubmitted])

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    approvalState === ApprovalState.NOT_APPROVED ||
    approvalState === ApprovalState.PENDING ||
    (approvalSubmitted && approvalState === ApprovalState.APPROVED)

  async function onStake() {
    if (!chainId || !provider || !account) return
    if (!currency || !parsedAmount) return

    const { calldata, value } = DotoliStaking.stakeCallParameters(parsedAmount)
    const txn: { to: string; data: string; value: string } = {
      to: DOTOLI_STAKING_ADDRESS[chainId],
      data: calldata,
      value,
    }
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
          .then((response) => {
            console.log(response)
          })
      })
      .catch((error) => {
        //setAttemptingTxn(false)
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
  }

  async function onGetReward() {
    if (!chainId || !provider || !account) return
    if (!currency || !parsedAmount) return

    const { calldata, value } = DotoliStaking.claimRewardCallParameters(parsedAmount)

    const txn: { to: string; data: string; value: string } = {
      to: DOTOLI_STAKING_ADDRESS[chainId],
      data: calldata,
      value,
    }
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
          .then((response) => {
            console.log(response)
          })
      })
      .catch((error) => {
        //setAttemptingTxn(false)
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
  }

  async function onUnstake() {
    if (!chainId || !provider || !account) return
    if (!currency || !parsedAmount) return

    const { calldata, value } = DotoliStaking.unstakingCallParameters(parsedAmount)
    const txn: { to: string; data: string; value: string } = {
      to: DOTOLI_STAKING_ADDRESS[chainId],
      data: calldata,
      value,
    }
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
          .then((response) => {
            console.log(response)
          })
      })
      .catch((error) => {
        //setAttemptingTxn(false)
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
  }

  const handleMaxStakeInput = useCallback(() => {
    maxStakingInputAmount && setTypedValue(maxStakingInputAmount.toExact())
    sendEvent({
      category: 'Staking',
      action: 'Max',
    })
  }, [maxStakingInputAmount, setTypedValue])

  const handleMaxUnstakingInput = useCallback(() => {
    maxUnstakingInputAmount && setTypedValue(maxUnstakingInputAmount.toExact())
    sendEvent({
      category: 'UnStaking',
      action: 'Max',
    })
  }, [maxUnstakingInputAmount, setTypedValue])

  const handleMaxRewardInput = useCallback(() => {
    maxRewardInputAmount && setTypedValue(maxRewardInputAmount.toExact())
    sendEvent({
      category: 'Staking Reward',
      action: 'Max',
    })
  }, [maxRewardInputAmount, setTypedValue])

  const approveTokenButtonDisabled = approvalState !== ApprovalState.NOT_APPROVED || approvalSubmitted

  return (
    <Trace page={PageName.STAKING_PAGE} shouldLogImpression>
      {isSupportedChain(chainId) ? (
        <>
          <PageWrapper>
            <StakingWrapper id="staking-page">
              <StyledStakingHeader>
                <RowBetween>
                  <RowFixed>
                    <ThemedText.DeprecatedBlack fontWeight={500} fontSize={16} style={{ marginRight: '8px' }}>
                      <Trans>Staking</Trans>
                    </ThemedText.DeprecatedBlack>
                  </RowFixed>
                  <ToggleRow style={{ marginRight: '30px', marginTop: '10px' }}>
                    <ToggleWrapper width="240px">
                      <ToggleElement
                        isActive={view === StakeView.STAKE}
                        fontSize="12px"
                        onClick={() => (view === StakeView.STAKE ? {} : setView(StakeView.STAKE))}
                      >
                        <Trans>Stake</Trans>
                      </ToggleElement>
                      <ToggleElement
                        isActive={view === StakeView.UNSTAKE}
                        fontSize="12px"
                        onClick={() => (view === StakeView.UNSTAKE ? {} : setView(StakeView.UNSTAKE))}
                      >
                        <Trans>Unstake</Trans>
                      </ToggleElement>

                      <ToggleElement
                        isActive={view === StakeView.REWARD}
                        fontSize="12px"
                        onClick={() => (view === StakeView.REWARD ? {} : setView(StakeView.REWARD))}
                      >
                        <Trans>Reward</Trans>
                      </ToggleElement>
                    </ToggleWrapper>
                  </ToggleRow>
                </RowBetween>
              </StyledStakingHeader>
              <AutoColumn gap={'12px'}>
                <Card backgroundColor={'#202B58'}>
                  <RowBetween>
                    <AutoColumn gap="10px">
                      <Text ml={'20px'}>
                        <Trans>Holding</Trans>
                      </Text>
                      <Text ml={'20px'}>
                        <Trans>Reward</Trans>
                      </Text>
                      <Text ml={'20px'}>
                        <Trans>Staked</Trans>
                      </Text>
                    </AutoColumn>
                    <AutoColumn gap="10px" justify="end">
                      <Text mr={'20px'}>{formatCurrencyAmount(stakingInfo?.unStakingBalance, 12)}</Text>
                      <Text mr={'20px'}>{formatCurrencyAmount(stakingInfo?.earnedAmount, 12)}</Text>
                      <Text mr={'20px'}>{formatCurrencyAmount(stakingInfo?.stakedAmount, 12)}</Text>
                    </AutoColumn>
                  </RowBetween>
                </Card>
                {view === StakeView.STAKE ? (
                  <>
                    <div style={{ display: 'relative' }}>
                      <StakingSection>
                        <Trace section={SectionName.CURRENCY_INPUT_PANEL}>
                          <StakingCurrencyInputPanel
                            label={<Trans>staking</Trans>}
                            value={formattedAmounts ?? ''}
                            showMaxButton={showMaxStakingButton}
                            currency={currency ?? null}
                            onUserInput={handleTypeInput}
                            onMax={handleMaxStakeInput}
                            fiatValue={undefined}
                            onCurrencySelect={undefined}
                            otherCurrency={undefined}
                            showCommonBases={true}
                            id={SectionName.CURRENCY_INPUT_PANEL}
                            loading={false}
                          />
                        </Trace>
                      </StakingSection>
                    </div>
                    <AutoColumn gap={'8px'}>
                      <div>
                        {!account ? (
                          <ButtonLight onClick={toggleWalletModal}>
                            <Trans>Connect Wallet</Trans>
                          </ButtonLight>
                        ) : showApproveFlow ? (
                          <AutoRow style={{ flexWrap: 'nowrap', width: '100%' }}>
                            <AutoColumn style={{ width: '100%' }} gap="12px">
                              <ButtonConfirmed
                                onClick={handleApprove}
                                disabled={approveTokenButtonDisabled}
                                width="100%"
                                altDisabledStyle={approvalState === ApprovalState.PENDING} // show solid button while waiting
                                confirmed={approvalState === ApprovalState.APPROVED}
                              >
                                <AutoRow justify="space-between" style={{ flexWrap: 'nowrap' }}>
                                  <span style={{ display: 'flex', alignItems: 'center' }}>
                                    {/* we need to shorten this string on mobile */}
                                    {approvalState === ApprovalState.APPROVED ? (
                                      <Trans>You can now stake {currency?.symbol}</Trans>
                                    ) : (
                                      <Trans>Allow the Dotoli Protocol to use your {currency?.symbol}</Trans>
                                    )}
                                  </span>
                                  {approvalState === ApprovalState.PENDING ? (
                                    <Loader stroke="white" />
                                  ) : approvalSubmitted && approvalState === ApprovalState.APPROVED ? (
                                    <CheckCircle size="20" color={theme.deprecated_green1} />
                                  ) : (
                                    <MouseoverTooltip
                                      text={
                                        <Trans>
                                          You must give the Dotoli smart contracts permission to use your{' '}
                                          {currency?.symbol}. You only have to do this once per token.
                                        </Trans>
                                      }
                                    >
                                      <HelpCircle size="20" color={'deprecated_white'} style={{ marginLeft: '8px' }} />
                                    </MouseoverTooltip>
                                  )}
                                </AutoRow>
                              </ButtonConfirmed>
                              <ButtonError
                                onClick={() => {
                                  if (isExpertMode) {
                                    //onStake()
                                  } else {
                                    onStake()
                                  }
                                }}
                                width="100%"
                                id="staking-button"
                                disabled={approvalState !== ApprovalState.APPROVED}
                                error={true}
                              >
                                <Text fontSize={16} fontWeight={500}>
                                  <Trans>Stake</Trans>
                                </Text>
                              </ButtonError>
                            </AutoColumn>
                          </AutoRow>
                        ) : (
                          <ButtonError
                            onClick={() => {
                              if (isExpertMode) {
                                //onStake()
                              } else {
                                onStake()
                              }
                            }}
                            id="staking-button"
                            disabled={false}
                            error={true}
                          >
                            <Text fontSize={20} fontWeight={500}>
                              <Trans>Stake</Trans>
                            </Text>
                          </ButtonError>
                        )}
                      </div>
                    </AutoColumn>
                  </>
                ) : view === StakeView.UNSTAKE ? (
                  <>
                    <div style={{ display: 'relative' }}>
                      <StakingSection>
                        <Trace section={SectionName.CURRENCY_INPUT_PANEL}>
                          <UnstakingCurrencyInputPanel
                            label={<Trans>unstaking</Trans>}
                            value={formattedAmounts ?? ''}
                            showMaxButton={showMaxUnstakingButton}
                            currency={currency ?? null}
                            unstakingCurrencyBalance={stakingInfo?.stakedAmount}
                            onUserInput={handleTypeInput}
                            onMax={handleMaxUnstakingInput}
                            fiatValue={undefined}
                            onCurrencySelect={undefined}
                            otherCurrency={undefined}
                            showCommonBases={true}
                            id={SectionName.CURRENCY_INPUT_PANEL}
                            loading={false}
                          />
                        </Trace>
                      </StakingSection>
                    </div>
                    <AutoColumn gap={'8px'}>
                      <div>
                        {!account ? (
                          <ButtonLight onClick={toggleWalletModal}>
                            <Trans>Connect Wallet</Trans>
                          </ButtonLight>
                        ) : (
                          <ButtonError
                            onClick={() => {
                              if (isExpertMode) {
                                //onUnstake()
                              } else {
                                onUnstake()
                              }
                            }}
                            id="unstake-button"
                            disabled={false}
                            error={true}
                          >
                            <Text fontSize={20} fontWeight={500}>
                              <Trans>Unstake</Trans>
                            </Text>
                          </ButtonError>
                        )}
                      </div>
                    </AutoColumn>
                  </>
                ) : view === StakeView.REWARD ? (
                  <>
                    <div style={{ display: 'relative' }}>
                      <StakingSection>
                        <Trace section={SectionName.CURRENCY_INPUT_PANEL}>
                          <RewardCurrencyInputPanel
                            label={<Trans>reward</Trans>}
                            value={formattedAmounts ?? ''}
                            showMaxButton={showMaxRewardButton}
                            currency={currency ?? null}
                            rewardCurrencyBalance={stakingInfo?.earnedAmount}
                            onUserInput={handleTypeInput}
                            onMax={handleMaxRewardInput}
                            fiatValue={undefined}
                            onCurrencySelect={undefined}
                            otherCurrency={undefined}
                            showCommonBases={true}
                            id={SectionName.CURRENCY_INPUT_PANEL}
                            loading={false}
                          />
                        </Trace>
                      </StakingSection>
                    </div>
                    <AutoColumn gap={'8px'}>
                      <div>
                        {!account ? (
                          <ButtonLight onClick={toggleWalletModal}>
                            <Trans>Connect Wallet</Trans>
                          </ButtonLight>
                        ) : (
                          <ButtonError
                            onClick={() => {
                              if (isExpertMode) {
                                //onGetReward()
                              } else {
                                onGetReward()
                              }
                            }}
                            id="reward-button"
                            disabled={false}
                            error={true}
                          >
                            <Text fontSize={20} fontWeight={500}>
                              <Trans>Get Reward</Trans>
                            </Text>
                          </ButtonError>
                        )}
                      </div>
                    </AutoColumn>
                  </>
                ) : (
                  <></>
                )}
              </AutoColumn>
            </StakingWrapper>
          </PageWrapper>
          <SwitchLocaleLink />
        </>
      ) : chainId !== undefined ? (
        <ErrorContainer>
          <ThemedText.DeprecatedBody color={theme.deprecated_text2} textAlign="center">
            <NetworkIcon strokeWidth={1.2} />
            <div data-testid="pools-unsupported-err">
              <Trans>Your connected network is unsupported.</Trans>
            </div>
          </ThemedText.DeprecatedBody>
        </ErrorContainer>
      ) : null}
    </Trace>
  )
}
