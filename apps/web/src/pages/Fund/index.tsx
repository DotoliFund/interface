import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import FeeBarChart from 'components/BarChart/fee'
import TokenBarChart from 'components/BarChart/token'
import VolumeBarChart from 'components/BarChart/volume'
import { DarkGrayCard } from 'components/Card'
import Column, { AutoColumn } from 'components/Column'
import Row, { AutoRow, RowFlat } from 'components/Row'
import { ToggleElement, ToggleWrapper } from 'components/Toggle/MultiToggle'
import { MonoSpace } from 'components/shared'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useFundData } from 'data/Fund/fundData'
import { useVolumeChartData } from 'data/Fund/volumeChartData'
import { useAccount } from 'hooks/useAccount'
import { useDotoliInfoContract } from 'hooks/useContract'
import { useETHPriceInUSD, useTokensPriceInUSD } from 'hooks/usePools'
import { useSingleCallResult } from 'lib/hooks/multicall'
import styled, { useTheme } from 'lib/styled-components'
import RecentTransactions from 'pages/Fund/tables/RecentTransactions'
import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async/lib/index'
import { useParams } from 'react-router-dom'
import { BREAKPOINTS, ThemeProvider } from 'theme'
import { Text } from 'ui/src'
import { Trans } from 'uniswap/src/i18n'
import { shortenAddress } from 'uniswap/src/utils/addresses'
import { formatAmount, formatDollarAmount } from 'utils/numbers'
import { formatTime, unixToDate } from 'utils/time'

export enum ExploreTab {
  Tokens = 'tokens',
  Pools = 'pools',
  Transactions = 'transactions',
}

enum ChartView {
  CURRENT_ASSET_TOKENS,
  TOKENS,
  FEES,
}

const ChartWrapper = styled(DarkGrayCard)`
  border: 1px solid ${({ theme }) => theme.background};
`

const ToggleRow = styled(RowFlat)`
  justify-content: flex-end;
  margin-bottom: 10px;

  @media screen and (max-width: 600px) {
    flex-direction: row;
  }
`

const PageWrapper = styled(Row)`
  padding: 0 16px 52px;
  justify-content: center;
  width: 100%;
  gap: 40px;
  align-items: flex-start;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    padding: 48px 20px;
  }
  @media screen and (max-width: ${({ theme }) => theme.breakpoint.lg}px) {
    flex-direction: column;
    align-items: center;
    gap: 0px;
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.xl}px) {
    gap: 60px;
  }
`

const LeftColumn = styled(Column)`
  gap: 20px;
  max-width: 780px;
  overflow: hidden;
  justify-content: flex-start;

  @media (max-width: ${BREAKPOINTS.lg}px) {
    width: 100%;
    max-width: unset;
  }
`

const HR = styled.hr`
  border: 0.5px solid ${({ theme }) => theme.surface3};
  width: 100%;
`

const RightColumn = styled(Column)`
  gap: 24px;
  width: 360px;

  @media (max-width: ${BREAKPOINTS.lg}px) {
    margin: 44px 0px;
    width: 100%;
    min-width: unset;
    & > *:first-child {
      margin-top: -24px;
    }
  }
`

const TokenDetailsWrapper = styled(Column)`
  gap: 24px;
  padding: 20px;

  @media (max-width: ${BREAKPOINTS.lg}px) and (min-width: ${BREAKPOINTS.sm}px) {
    flex-direction: row;
    flex-wrap: wrap;
    padding: unset;
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    padding: unset;
  }
`

const TokenDetailsHeader = styled(Text)`
  width: 100%;
  font-size: 24px;
  font-weight: 485;
  line-height: 32px;
`

const LinksContainer = styled(Column)`
  gap: 16px;
  width: 100%;
`

const Fund = () => {
  // const tabNavRef = useRef<HTMLDivElement>(null)
  const account = useAccount()
  const params = useParams()
  const currentPageFund = params.fundId
  const nowDate = Math.floor(new Date().getTime() / 1000)

  const { accent1 } = useTheme()

  // useEffect(() => {
  //   if (tabNavRef.current && initialTab) {
  //     const offsetTop = tabNavRef.current.getBoundingClientRect().top + window.scrollY
  //     window.scrollTo({ top: offsetTop - 90, behavior: 'smooth' })
  //   }
  //   // scroll to tab navbar on initial page mount only
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  const DotoliInfoContract = useDotoliInfoContract()
  const { loading: myManagingFundLoading, result: [myManagingFund] = [] } = useSingleCallResult(
    DotoliInfoContract,
    'managingFund',
    [account.address],
  )
  const [userIsManager, setUserIsManager] = useState<boolean>(false)
  useEffect(() => {
    if (!myManagingFundLoading) {
      setState()
    }
    async function setState() {
      if (myManagingFund && currentPageFund && myManagingFund.toString() === currentPageFund.toString()) {
        setUserIsManager(true)
      } else {
        setUserIsManager(false)
      }
    }
  }, [myManagingFundLoading, myManagingFund, currentPageFund])

  // const { loading: isSubscribedLoading, result: [isSubscribed] = [] } = useSingleCallResult(
  //   DotoliInfoContract,
  //   'isSubscribed',
  //   [account.address, currentPageFund]
  // )
  // const [userIsInvestor, setUserIsInvestor] = useState<boolean>(false)
  // useEffect(() => {
  //   if (!isSubscribedLoading) {
  //     setState()
  //   }
  //   async function setState() {
  //     if (isSubscribed) {
  //       setUserIsInvestor(true)
  //     } else {
  //       setUserIsInvestor(false)
  //     }
  //   }
  // }, [isSubscribedLoading, isSubscribed])

  const fundData = useFundData(currentPageFund).data
  const volumeChartData = useVolumeChartData(currentPageFund).data

  const [view, setView] = useState(ChartView.CURRENT_ASSET_TOKENS)

  // console.log(1,fundData)
  // console.log(2,fundData?.fund)
  // console.log(3,fundData?.fund?.feeTokens)

  // chart hover index
  const [volumeIndexHover, setVolumeIndexHover] = useState<number | undefined>()
  const [tokenIndexHover, setTokenIndexHover] = useState<number | undefined>()
  const [feeIndexHover, setFeeIndexHover] = useState<number | undefined>()

  const formattedVolumeUSD = useMemo(() => {
    if (volumeChartData && volumeChartData.fundSnapshots) {
      return volumeChartData.fundSnapshots.map((data: any, index: number) => {
        return {
          time: data.timestamp,
          current: data.currentUSD,
          tokens: data.currentTokens,
          symbols: data.currentTokensSymbols,
          tokensVolume: data.currentTokensAmountUSD,
          index,
        }
      })
    } else {
      return []
    }
  }, [volumeChartData])

  const formattedFeeTokens = useMemo(() => {
    if (fundData && fundData.fund && fundData.fund.feeTokens) {
      return fundData.fund.feeTokens.map((data: any, index: number) => {
        return {
          token: fundData.fund.feeTokens[index],
          symbol: fundData.fund.feeSymbols[index],
          amount: fundData.fund.feeTokensAmount[index],
          index,
        }
      })
    } else {
      return []
    }
  }, [fundData])

  const weth9 = account.chainId ? WRAPPED_NATIVE_CURRENCY[account.chainId] : undefined
  const ethPriceInUSDC = useETHPriceInUSD(account.chainId)

  const currentTokensAmount = useMemo(() => {
    if (account.chainId && fundData && fundData.fund && fundData.fund.currentTokens) {
      return fundData.fund.currentTokens.map((data: any, index: number) => {
        const decimals = fundData.fund.currentTokensDecimals[index]
        const symbol = fundData.fund.currentTokensSymbols[index]
        const token = new Token(Number(account.chainId), data, Number(decimals), symbol)
        const decimal = 10 ** decimals
        return CurrencyAmount.fromRawAmount(token, Math.floor(fundData.fund.currentTokensAmount[index] * decimal))
      })
    } else {
      return []
    }
  }, [fundData, account.chainId])

  const currentTokensAmountUSD: [CurrencyAmount<Token>, number][] = useTokensPriceInUSD(
    account.chainId,
    weth9,
    ethPriceInUSDC,
    currentTokensAmount,
  )

  const formattedLatestTokens = useMemo(() => {
    if (currentTokensAmountUSD) {
      const tokensData = currentTokensAmountUSD.map((data, index) => {
        const token = data[0].currency
        const tokenAddress = token.address
        const symbol = token.symbol ? token.symbol : 'Unknown'
        const decimal = token.decimals
        const amount = Number(data[0].quotient.toString()) / Number(10 ** decimal)
        const amountUSD = data[1]
        return {
          token: tokenAddress,
          symbol,
          decimal,
          amount,
          volume: amountUSD,
          index,
        }
      })
      return tokensData
    } else {
      return []
    }
  }, [currentTokensAmountUSD])

  if (
    formattedVolumeUSD &&
    formattedVolumeUSD.length > 1 &&
    formattedLatestTokens &&
    formattedLatestTokens.length > 0
  ) {
    let totalCurrentAmountUSD = 0
    currentTokensAmountUSD.map((value) => {
      const tokenAmountUSD = value[1]
      totalCurrentAmountUSD += tokenAmountUSD
      return null
    })

    const tokens = formattedLatestTokens.map((data) => {
      return data.token
    })

    const symbols = formattedLatestTokens.map((data) => {
      return data.symbol
    })

    const tokensVolume = formattedLatestTokens.map((data) => {
      return data.volume
    })

    formattedVolumeUSD.push({
      time: nowDate,
      current: totalCurrentAmountUSD,
      tokens,
      symbols,
      tokensVolume,
      index: formattedVolumeUSD.length,
    })
  }

  // const volumeChartHoverIndex = volumeIndexHover !== undefined ? volumeIndexHover : undefined

  // const formattedHoverToken = useMemo(() => {
  //   if (volumeChartHoverIndex !== undefined && formattedVolumeUSD) {
  //     const volumeUSDData = formattedVolumeUSD[volumeChartHoverIndex]
  //     const tokens = volumeUSDData.tokens
  //     return tokens.map((data: any, index: any) => {
  //       return {
  //         token: data,
  //         symbol: volumeUSDData.symbols[index],
  //         volume: volumeUSDData.tokensVolume[index],
  //       }
  //     })
  //   } else {
  //     return undefined
  //   }
  // }, [volumeChartHoverIndex, formattedVolumeUSD])

  return (
    <ThemeProvider token0={accent1} token1={accent1}>
      <Helmet>
        <title>TEST</title>
      </Helmet>
      <PageWrapper>
        <LeftColumn>
          <Column gap="20px">
            <Column>
              {/* <PoolDetailsBreadcrumb
                chainId={chainInfo?.id}
                poolAddress={poolAddress}
                token0={token0}
                token1={token1}
                loading={loading}
              />
              <PoolDetailsHeader
                chainId={chainInfo?.id}
                poolAddress={poolAddress}
                token0={token0}
                token1={token1}
                feeTier={poolData?.feeTier}
                protocolVersion={poolData?.protocolVersion}
                toggleReversed={toggleReversed}
                loading={loading}
              /> */}
            </Column>
            {/* <ChartSection
              poolData={poolData}
              loading={loading}
              isReversed={isReversed}
              chain={chainInfo?.backendChain.chain}
            /> */}

            <ChartWrapper>
              <ToggleRow>
                <ToggleWrapper width="260px">
                  <ToggleElement
                    isActive={view === ChartView.CURRENT_ASSET_TOKENS}
                    fontSize="12px"
                    onClick={() =>
                      view === ChartView.CURRENT_ASSET_TOKENS ? {} : setView(ChartView.CURRENT_ASSET_TOKENS)
                    }
                  >
                    <Trans>Current Asset</Trans>
                  </ToggleElement>
                  <ToggleElement
                    isActive={view === ChartView.TOKENS}
                    fontSize="12px"
                    onClick={() => (view === ChartView.TOKENS ? {} : setView(ChartView.TOKENS))}
                  >
                    <Trans>Tokens</Trans>
                  </ToggleElement>
                  {userIsManager ? (
                    <ToggleElement
                      isActive={view === ChartView.FEES}
                      fontSize="12px"
                      onClick={() => (view === ChartView.FEES ? {} : setView(ChartView.FEES))}
                    >
                      <Trans>Fees</Trans>
                    </ToggleElement>
                  ) : (
                    <></>
                  )}
                </ToggleWrapper>
              </ToggleRow>
              {view === ChartView.CURRENT_ASSET_TOKENS ? (
                <VolumeBarChart
                  data={formattedVolumeUSD}
                  color={accent1}
                  setIndex={setVolumeIndexHover}
                  topLeft={
                    <AutoColumn gap="4px">
                      {formatDollarAmount(
                        volumeIndexHover !== undefined && formattedVolumeUSD && formattedVolumeUSD.length > 0
                          ? formattedVolumeUSD[volumeIndexHover].current
                          : formattedVolumeUSD && formattedVolumeUSD.length > 0
                            ? formattedVolumeUSD[formattedVolumeUSD.length - 1].current
                            : 0,
                      )}
                    </AutoColumn>
                  }
                  topRight={
                    <AutoColumn gap="4px" justify="end">
                      {volumeIndexHover !== undefined ? (
                        <MonoSpace>
                          {unixToDate(Number(formattedVolumeUSD[volumeIndexHover].time))} (
                          {formatTime(formattedVolumeUSD[volumeIndexHover].time.toString(), 8)})
                        </MonoSpace>
                      ) : formattedVolumeUSD && formattedVolumeUSD.length > 0 ? (
                        <MonoSpace>
                          {unixToDate(formattedVolumeUSD[formattedVolumeUSD.length - 1].time)} (
                          {formatTime(formattedVolumeUSD[formattedVolumeUSD.length - 1].time.toString(), 8)})
                        </MonoSpace>
                      ) : null}
                    </AutoColumn>
                  }
                />
              ) : view === ChartView.TOKENS ? (
                <TokenBarChart
                  data={formattedLatestTokens}
                  color={accent1}
                  setIndex={setTokenIndexHover}
                  topLeft={
                    <AutoColumn gap="4px">
                      <AutoRow>
                        {tokenIndexHover !== undefined && formattedLatestTokens && formattedLatestTokens.length > 0
                          ? formattedLatestTokens[tokenIndexHover].symbol === 'WETH'
                            ? 'ETH'
                            : formattedLatestTokens[tokenIndexHover].symbol
                          : formattedLatestTokens && formattedLatestTokens.length > 0
                            ? formattedLatestTokens[0].symbol === 'WETH'
                              ? 'ETH'
                              : formattedLatestTokens[0].symbol
                            : null}
                        &nbsp;&nbsp;
                        {tokenIndexHover !== undefined && formattedLatestTokens && formattedLatestTokens.length > 0 ? (
                          <MonoSpace>{shortenAddress(formattedLatestTokens[tokenIndexHover].token)}</MonoSpace>
                        ) : formattedLatestTokens && formattedLatestTokens.length > 0 ? (
                          <MonoSpace>{shortenAddress(formattedLatestTokens[0].token)}</MonoSpace>
                        ) : null}
                      </AutoRow>
                      {tokenIndexHover !== undefined && formattedLatestTokens && formattedLatestTokens.length > 0
                        ? formatDollarAmount(formattedLatestTokens[tokenIndexHover].volume)
                        : formattedLatestTokens && formattedLatestTokens.length > 0
                          ? formatDollarAmount(formattedLatestTokens[0].volume)
                          : null}
                      <br />
                    </AutoColumn>
                  }
                  topRight={
                    <AutoColumn gap="4px" justify="end">
                      <MonoSpace>
                        {unixToDate(nowDate)} ({formatTime(nowDate.toString(), 8)})
                      </MonoSpace>
                      <MonoSpace>
                        {tokenIndexHover !== undefined && formattedLatestTokens && formattedLatestTokens.length > 0
                          ? formatAmount(formattedLatestTokens[tokenIndexHover].amount)
                          : formattedLatestTokens && formattedLatestTokens.length > 0
                            ? formatAmount(formattedLatestTokens[0].amount)
                            : null}
                        <br />
                      </MonoSpace>
                    </AutoColumn>
                  }
                />
              ) : userIsManager && view === ChartView.FEES ? (
                <FeeBarChart
                  data={formattedFeeTokens}
                  color={accent1}
                  setIndex={setFeeIndexHover}
                  topLeft={
                    <AutoColumn gap="4px">
                      <AutoRow>
                        <>
                          {feeIndexHover !== undefined && formattedFeeTokens && formattedFeeTokens.length > 0
                            ? formattedFeeTokens[feeIndexHover].symbol === 'WETH'
                              ? 'ETH'
                              : formattedFeeTokens[feeIndexHover].symbol
                            : formattedFeeTokens && formattedFeeTokens.length > 0
                              ? formattedFeeTokens[0].symbol === 'WETH'
                                ? 'ETH'
                                : formattedFeeTokens[0].symbol
                              : null}
                          &nbsp;&nbsp;
                        </>
                        <>
                          {feeIndexHover !== undefined && formattedFeeTokens && formattedFeeTokens.length > 0 ? (
                            <MonoSpace>{shortenAddress(formattedFeeTokens[feeIndexHover].token)}</MonoSpace>
                          ) : formattedFeeTokens && formattedFeeTokens.length > 0 ? (
                            <MonoSpace>{shortenAddress(formattedFeeTokens[0].token)}</MonoSpace>
                          ) : null}
                        </>
                      </AutoRow>
                      <>
                        {feeIndexHover !== undefined && formattedFeeTokens && formattedFeeTokens.length > 0 ? (
                          formatAmount(formattedFeeTokens[feeIndexHover].amount)
                        ) : formattedFeeTokens && formattedFeeTokens.length > 0 ? (
                          formatAmount(formattedFeeTokens[0].amount)
                        ) : (
                          <br />
                        )}
                      </>
                    </AutoColumn>
                  }
                  topRight={
                    <AutoColumn gap="4px" justify="end">
                      {unixToDate(nowDate)} ({formatTime(nowDate.toString(), 8)})
                      <br />
                    </AutoColumn>
                  }
                />
              ) : null}
            </ChartWrapper>
          </Column>
          <HR />
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
          <RecentTransactions />
        </LeftColumn>
        <RightColumn>
          {/* <PoolDetailsStatsButtons
            chainId={chainInfo?.id}
            token0={token0}
            token1={token1}
            feeTier={poolData?.feeTier}
            loading={loading}
          />
          <PoolDetailsStats poolData={poolData} isReversed={isReversed} chainId={chainInfo?.id} loading={loading} /> */}
          <TokenDetailsWrapper>
            <TokenDetailsHeader>
              <Trans i18nKey="common.links" />
            </TokenDetailsHeader>
            <LinksContainer>
              {/* <PoolDetailsLink
                address={poolAddress}
                chainId={chainInfo?.id}
                tokens={[token0, token1]}
                loading={loading}
              />
              <PoolDetailsLink
                address={token0?.address}
                chainId={chainInfo?.id}
                tokens={[token0]}
                loading={loading}
              />
              <PoolDetailsLink
                address={token1?.address}
                chainId={chainInfo?.id}
                tokens={[token1]}
                loading={loading}
              /> */}
            </LinksContainer>
          </TokenDetailsWrapper>
        </RightColumn>
      </PageWrapper>
    </ThemeProvider>
  )
}

export default Fund
