import type { TransactionResponse } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { useAccountDrawer } from 'components/AccountDrawer/MiniPortfolio/hooks'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import FundList from 'components/FundList'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { useIsSupportedChainId } from 'constants/chains'
import { DOTOLI_INFO_ADDRESSES } from 'dotoli/src/constants/addresses'
import { DotoliInfo } from 'dotoli/src/interface/DotoliInfo'
import { FundDetails } from 'dotoli/src/types/fund'
import { useAccount } from 'hooks/useAccount'
import { useDotoliInfoContract } from 'hooks/useContract'
import { useEthersSigner } from 'hooks/useEthersSigner'
import JSBI from 'jsbi'
import { useSingleCallResult } from 'lib/hooks/multicall'
import deprecatedStyled, { css, useTheme } from 'lib/styled-components'
import CTACards from 'pages/Account/CTACards'
import { LoadingRows } from 'pages/Account/styled'
import { useEffect, useState } from 'react'
import { AlertTriangle, Inbox } from 'react-feather'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import { HideSmall, ThemedText } from 'theme/components'
import { Flex, Text } from 'ui/src'
import Trace from 'uniswap/src/features/telemetry/Trace'
import { t, useTranslation } from 'uniswap/src/i18n'
import { logger } from 'utilities/src/logger/logger'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { WrongChainError } from 'utils/errors'

const PageWrapper = deprecatedStyled(AutoColumn)`
  padding: 68px 8px 0px;
  max-width: 870px;
  width: 100%;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    max-width: 800px;
    padding-top: 48px;
  }

  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    max-width: 500px;
    padding-top: 20px;
  }
`

const ErrorContainer = deprecatedStyled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  max-width: 300px;
  min-height: 25vh;
`

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`

const NetworkIcon = deprecatedStyled(AlertTriangle)`
  ${IconStyle}
`

const InboxIcon = deprecatedStyled(Inbox)`
  ${IconStyle}
`

const ResponsiveButtonPrimary = deprecatedStyled(ButtonPrimary)`
  border-radius: 12px;
  font-size: 16px;
  padding: 6px 8px;
  white-space: nowrap;
  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    flex: 1 1 auto;
    width: 50%;
  }
`

const MainContentWrapper = deprecatedStyled.main`
  background-color: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.surface3};
  padding: 0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

function FundsLoadingPlaceholder() {
  return (
    <LoadingRows>
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </LoadingRows>
  )
}

function WrongNetworkCard() {
  return (
    <>
      <PageWrapper>
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <Flex row p="$none" gap="$gap12">
              <Text variant="heading2">{t('myaccount.title')}</Text>
            </Flex>

            <MainContentWrapper>
              <ErrorContainer>
                <Text variant="body1" color="$neutral3" textAlign="center">
                  <NetworkIcon strokeWidth={1.2} />
                </Text>
              </ErrorContainer>
            </MainContentWrapper>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  )
}

export default function Account() {
  const { t } = useTranslation()
  const { provider } = useWeb3React()
  const account = useAccount()
  const signer = useEthersSigner()
  const isSupportedChain = useIsSupportedChainId(account.chainId)
  const addTransaction = useTransactionAdder()
  const accountDrawer = useAccountDrawer()

  const theme = useTheme()

  const DotoliInfoContract = useDotoliInfoContract()
  const { loading: managingFundLoading, result: [managingFund] = [] } = useSingleCallResult(
    DotoliInfoContract,
    'managingFund',
    [account.address ?? undefined],
  )

  const [managingFundInfo, setManagingFundInfo] = useState<FundDetails[]>()
  const [managingFundInfoLoading, setManagingFundInfoLoading] = useState(false)
  useEffect(() => {
    if (managingFundLoading) {
      setManagingFundInfoLoading(true)
    }
    if (!managingFundLoading) {
      getInfo()
      setManagingFundInfoLoading(false)
    }
    async function getInfo() {
      if (managingFund && JSBI.BigInt(managingFund).toString() !== '0' && provider && account.address) {
        setManagingFundInfo([
          {
            fundId: JSBI.BigInt(managingFund).toString(),
            investor: account.address ?? '',
          },
        ])
      } else {
        setManagingFundInfo(undefined)
      }
    }
  }, [managingFundLoading, managingFund, provider, account.address])

  const { loading: investingFundsLoading, result: [investingFunds] = [] } = useSingleCallResult(
    DotoliInfoContract,
    'subscribedFunds',
    [account.address ?? undefined],
  )

  const [investingFundsInfo, setInvestingFundsInfo] = useState<FundDetails[]>()
  const [investingFundsInfoLoading, setInvestingFundsInfoLoading] = useState(false)
  useEffect(() => {
    if (investingFundsLoading) {
      setInvestingFundsInfoLoading(true)
      return
    }
    async function getInfo() {
      if (!investingFunds || !investingFunds.length || !provider || !account?.address) {
        setInvestingFundsInfo(undefined)
        setInvestingFundsInfoLoading(false)
        return
      }
      try {
        const investingFundList = investingFunds
        const investingFundsInfoList: FundDetails[] = []
        for (let i = 0; i < investingFundList.length; i++) {
          const investingFund: string = investingFundList[i]
          if (JSBI.BigInt(investingFund).toString() === JSBI.BigInt(managingFund).toString()) {
            continue
          }
          investingFundsInfoList.push({
            fundId: JSBI.BigInt(investingFund).toString(),
            investor: account.address,
          })
        }
        setInvestingFundsInfo(investingFundsInfoList.length ? investingFundsInfoList : undefined)
      } catch (error) {
        setInvestingFundsInfo(undefined)
      } finally {
        setInvestingFundsInfoLoading(false)
      }
    }
    getInfo()
  }, [investingFundsLoading, managingFund, investingFunds, provider, account?.address])

  if (!isSupportedChain) {
    return <WrongNetworkCard />
  }

  async function onCreate() {
    if (!account.isConnected) {
      accountDrawer.open()
    }
    if (account.status !== 'connected' || !signer || !account.chainId) {
      return
    }

    const { calldata, value } = DotoliInfo.createCallParameters()
    const txn: { to: string; data: string; value: string } = {
      to: DOTOLI_INFO_ADDRESSES,
      data: calldata,
      value,
    }

    const connectedChainId = await signer.getChainId()
    if (account.chainId !== connectedChainId) {
      throw new WrongChainError()
    }

    signer
      .estimateGas(txn)
      .then((estimate) => {
        const newTxn = {
          ...txn,
          gasLimit: calculateGasMargin(estimate),
        }

        return signer.sendTransaction(newTxn).then((response: TransactionResponse) => {
          addTransaction(response, {
            type: TransactionType.CREATE_FUND,
            manager: account.address,
          })
        })
      })
      .catch((error) => {
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          logger.warn('Create Fund', 'createFund', 'Error completing create fund tx', error)
        }
      })
  }

  return (
    <Trace>
      <PageWrapper>
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <Flex
              row
              alignItems="center"
              justifyContent="space-between"
              p="$none"
              gap="$gap12"
              $md={{ flexWrap: 'wrap', width: '100%' }}
            >
              <Flex row alignItems="center" gap="$spacing8" width="content">
                <Text variant="heading2">{t('myaccount.title')}</Text>
              </Flex>
              <Flex row gap="8px" $md={{ width: '100%' }}>
                {managingFundInfo && managingFundInfo.length > 0 ? (
                  <></>
                ) : (
                  <ResponsiveButtonPrimary
                    data-cy="join-pool-button"
                    id="join-pool-button"
                    onClick={() => {
                      onCreate()
                    }}
                  >
                    + <>Create Fund</>
                  </ResponsiveButtonPrimary>
                )}
              </Flex>
            </Flex>

            <MainContentWrapper>
              {managingFundLoading || managingFundInfoLoading ? (
                <FundsLoadingPlaceholder />
              ) : managingFundInfo && managingFundInfo.length > 0 ? (
                <>
                  <FundList isManagingFund={true} funds={managingFundInfo} />
                </>
              ) : (
                <ErrorContainer>
                  <ThemedText.BodyPrimary color={theme.neutral3} textAlign="center">
                    <InboxIcon strokeWidth={1} style={{ marginTop: '2em' }} />
                    <div>{t('pool.activePositions.appear')}</div>
                  </ThemedText.BodyPrimary>
                </ErrorContainer>
              )}
            </MainContentWrapper>
            <MainContentWrapper>
              {investingFundsLoading || investingFundsInfoLoading ? (
                <FundsLoadingPlaceholder />
              ) : investingFundsInfo && investingFundsInfo.length > 0 ? (
                <>
                  <FundList isManagingFund={false} funds={investingFundsInfo} />
                </>
              ) : (
                <ErrorContainer>
                  <ThemedText.BodyPrimary color={theme.neutral3} textAlign="center">
                    <InboxIcon strokeWidth={1} style={{ marginTop: '2em' }} />
                    <div>{t('pool.activePositions.appear')}</div>
                  </ThemedText.BodyPrimary>
                </ErrorContainer>
              )}
            </MainContentWrapper>
            <HideSmall>
              <CTACards />
            </HideSmall>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
      <SwitchLocaleLink />
    </Trace>
  )
}
