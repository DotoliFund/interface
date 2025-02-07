import { Interface } from '@ethersproject/abi'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import IERC20Metadata from '@uniswap/v3-periphery/artifacts/contracts/interfaces/IERC20Metadata.sol/IERC20Metadata.json'
import { FeeAmount, Pool, Position } from '@uniswap/v3-sdk'
import TokenBarChart from 'components/BarChart/token'
import { ButtonPrimary } from 'components/Button'
import { DarkGrayCard } from 'components/Card'
import Column from 'components/Column'
import ComposedChart from 'components/ComposedChart'
import Row, { RowFlat } from 'components/Row'
import { ToggleElement, ToggleWrapper } from 'components/Toggle/MultiToggle'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useInvestorData } from 'data/FundDetails/investorData'
import { useVolumeChartData } from 'data/FundDetails/volumeChartData'
import { PositionDetails } from 'dotoli/src/types/position'
import { useAccount } from 'hooks/useAccount'
import { useDotoliInfoContract } from 'hooks/useContract'
import { useDotoliV3Positions } from 'hooks/useDotoliV3Positions'
import { useETHPriceInUSD, usePools, useTokensPriceInUSD } from 'hooks/usePools'
import { useMultipleContractSingleData, useSingleCallResult } from 'lib/hooks/multicall'
import styled, { useTheme } from 'lib/styled-components'
import RecentTransactions from 'pages/Fund/tables/RecentTransactions'
import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async/lib/index'
import { useNavigate, useParams } from 'react-router-dom'
import { BREAKPOINTS, ThemeProvider } from 'theme'
import { Text } from 'ui/src'
import { IERC20MetadataInterface } from 'uniswap/src/abis/types/v3/IERC20Metadata'
import { Trans } from 'uniswap/src/i18n'
import { UniverseChainId } from 'uniswap/src/types/chains'

export enum ExploreTab {
  Tokens = 'tokens',
  Pools = 'pools',
  Transactions = 'transactions',
}

const ERC20_METADATA_INTERFACE = new Interface(IERC20Metadata.abi) as IERC20MetadataInterface

enum ChartView {
  TOTAL_ASSET,
  TOKENS,
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

// const CurrentAssetText = styled.div`
//   color: #eca53b;
//   font-size: 20px;
//   font-weight: 500;
// `
// const PoolAssetText = styled.div`
//   color: #3377ff;
//   font-size: 20px;
//   font-weight: 500;
// `
// const PrincipalText = styled.div`
//   color: #99ff99;
//   font-size: 20px;
//   font-weight: 500;
// `

const FundDetails = () => {
  // const tabNavRef = useRef<HTMLDivElement>(null)
  const account = useAccount()
  const params = useParams()
  const currentPageFund = params.fundId
  const investor = params.investor
  //const nowDate = Math.floor(new Date().getTime() / 1000)
  const navigate = useNavigate()

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
  const { loading: investorManagingFundLoading, result: [investorManagingFund] = [] } = useSingleCallResult(
    DotoliInfoContract,
    'managingFund',
    [investor ?? undefined],
  )

  const [, setIsManagerAccount] = useState<boolean>(false)
  useEffect(() => {
    if (!investorManagingFundLoading) {
      setState()
    }
    async function setState() {
      if (
        investorManagingFund &&
        currentPageFund &&
        investorManagingFund.toString() !== '0' &&
        investorManagingFund.toString() === currentPageFund.toString()
      ) {
        setIsManagerAccount(true)
      } else {
        setIsManagerAccount(false)
      }
    }
  }, [investorManagingFundLoading, investorManagingFund, currentPageFund, investor])

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

  const [, setUserIsInvestor] = useState<boolean>(false)
  useEffect(() => {
    if (investor && account.address) {
      if (!userIsManager && investor.toUpperCase() === account.address.toUpperCase()) {
        setUserIsInvestor(true)
      } else {
        setUserIsInvestor(false)
      }
    }
  }, [investor, userIsManager, account.address])

  const investorData = useInvestorData(currentPageFund, investor).data
  const volumeChartData = useVolumeChartData(currentPageFund, investor).data

  const [view, setView] = useState(ChartView.TOTAL_ASSET)

  // chart hover index
  const [, setVolumeIndexHover] = useState<number | undefined>()
  const [, setTokenIndexHover] = useState<number | undefined>()

  const { positions } = useDotoliV3Positions(currentPageFund, investor)
  const [openPositions] = positions?.reduce<[PositionDetails[], PositionDetails[]]>(
    (acc, p: PositionDetails) => {
      acc[p.liquidity?.isZero() ? 1 : 0].push(p)
      return acc
    },
    [[], []],
  ) ?? [[], []]

  // const filteredPositions = [...openPositions, ...(userHideClosedPositions ? [] : closedPositions)]

  const formattedVolumeChart = useMemo(() => {
    if (volumeChartData && volumeChartData.investorSnapshots) {
      return volumeChartData.investorSnapshots.map((data, index) => {
        return {
          time: data.timestamp,
          current: data.currentUSD,
          pool: data.poolUSD,
          principal: data.principalUSD,
          tokens: data.tokens,
          symbols: data.tokensSymbols,
          tokensVolume: data.tokensAmountUSD,
          index,
        }
      })
    } else {
      return []
    }
  }, [volumeChartData])

  const poolTokens = useMemo(() => {
    if (account.chainId && openPositions && openPositions.length > 0) {
      const tokens: string[] = []
      for (let i = 0; i < openPositions.length; i++) {
        const token0 = openPositions[i].token0
        const token1 = openPositions[i].token1

        if (!tokens.includes(token0)) {
          tokens.push(token0)
        }
        if (!tokens.includes(token1)) {
          tokens.push(token1)
        }
      }
      return tokens
    } else {
      return []
    }
  }, [account.chainId, openPositions])

  if (account.chainId && openPositions && openPositions.length > 0) {
    for (let i = 0; i < openPositions.length; i++) {
      const token0 = openPositions[i].token0
      const token1 = openPositions[i].token1

      if (!poolTokens.includes(token0)) {
        poolTokens.push(token0)
      }
      if (!poolTokens.includes(token1)) {
        poolTokens.push(token1)
      }
    }
  }

  const poolTokensDecimalsInfo = useMultipleContractSingleData(poolTokens, ERC20_METADATA_INTERFACE, 'decimals')
  const poolTokensDecimals = useMemo(() => {
    const decimals: number[] = []
    for (let i = 0; i < poolTokensDecimalsInfo.length; i++) {
      const decimal = poolTokensDecimalsInfo[i].result
      if (decimal) {
        decimals.push(Number(decimal))
      } else {
        decimals.push(0)
      }
    }
    return decimals
  }, [poolTokensDecimalsInfo])

  const poolTokensSymbolInfo = useMultipleContractSingleData(poolTokens, ERC20_METADATA_INTERFACE, 'symbol')
  const poolTokensSymbols = useMemo(() => {
    const symbols: string[] = []
    for (let i = 0; i < poolTokensSymbolInfo.length; i++) {
      const symbol = poolTokensSymbolInfo[i].result
      if (symbol) {
        symbols.push(symbol.toString())
      } else {
        symbols.push('Unknown')
      }
    }
    return symbols
  }, [poolTokensSymbolInfo])

  const positionTokens: [Token | undefined, Token | undefined, FeeAmount | undefined][] = useMemo(() => {
    if (account.chainId && openPositions && openPositions.length > 0) {
      return openPositions.map((data: PositionDetails) => {
        const token0: string = data.token0
        const token1: string = data.token1
        const fee: number = data.fee

        let token0Symbol = ''
        let token1Symbol = ''
        let token0Decimals = 0
        let token1Decimals = 0
        poolTokens.map((token, index) => {
          if (token.toUpperCase() === token0.toUpperCase()) {
            token0Symbol = poolTokensSymbols[index]
            token0Decimals = poolTokensDecimals[index]
          } else if (token.toUpperCase() === token1.toUpperCase()) {
            token1Symbol = poolTokensSymbols[index]
            token1Decimals = poolTokensDecimals[index]
          }
          return undefined
        })

        return [
          new Token(account.chainId ?? UniverseChainId.Mainnet, token0, token0Decimals, token0Symbol),
          new Token(account.chainId ?? UniverseChainId.Mainnet, token1, token1Decimals, token1Symbol),
          fee,
        ]
      })
    } else {
      return []
    }
  }, [account.chainId, openPositions, poolTokens, poolTokensSymbols, poolTokensDecimals])

  const positionPools = usePools(positionTokens)

  const poolPositions: Position[] = []
  if (openPositions && openPositions.length > 0 && positionPools && positionPools.length > 0) {
    for (let i = 0; i < openPositions.length; i++) {
      const liquidity = openPositions[i].liquidity
      const tickLower = openPositions[i].tickLower
      const tickUpper = openPositions[i].tickUpper
      const pool: Pool | null = positionPools[i][1]

      if (pool && liquidity) {
        poolPositions.push(new Position({ pool, liquidity: liquidity.toString(), tickLower, tickUpper }))
      }
    }
  }

  const currentTokensAmount: CurrencyAmount<Token>[] = useMemo(() => {
    if (investorData && investorData.investor) {
      return investorData.investor.currentTokens.map((data, index) => {
        const decimals = investorData.investor.currentTokensDecimals[index]
        const symbol = investorData.investor.currentTokensSymbols[index]
        const chainId = account.chainId ?? UniverseChainId.Mainnet
        const token = new Token(chainId, data, Number(decimals), symbol)
        const decimal = 10 ** Number(decimals)
        const amount = Number(investorData.investor.currentTokensAmount[index]) * decimal
        return CurrencyAmount.fromRawAmount(token, Math.floor(amount))
      })
    } else {
      return []
    }
  }, [account.chainId, investorData])

  const findTokenIndex = (tokens: CurrencyAmount<Token>[], token: string): number => {
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].currency.address.toUpperCase() === token.toUpperCase()) {
        return i
      }
    }
    return -1
  }

  const poolTokensAmount: CurrencyAmount<Token>[] = []
  if (poolPositions) {
    for (let i = 0; i < poolPositions.length; i++) {
      const token0Address = poolPositions[i].pool.token0.address
      const token1Address = poolPositions[i].pool.token1.address
      const token0Amount = poolPositions[i].amount0
      const token1Amount = poolPositions[i].amount1

      // sum if token0 duplicated
      const token0Index = findTokenIndex(poolTokensAmount, token0Address)
      if (token0Index > -1) {
        poolTokensAmount[token0Index] = poolTokensAmount[token0Index].add(token0Amount)
      } else {
        poolTokensAmount.push(poolPositions[i].amount0)
      }
      // sum if token1 duplicated
      const token1Index = findTokenIndex(poolTokensAmount, token1Address)
      if (token1Index > -1) {
        poolTokensAmount[token1Index] = poolTokensAmount[token1Index].add(token1Amount)
      } else {
        poolTokensAmount.push(poolPositions[i].amount1)
      }
    }
  }

  const weth9 = account.chainId ? WRAPPED_NATIVE_CURRENCY[account.chainId] : undefined
  const ethPriceInUSDC = useETHPriceInUSD(account.chainId)
  const currentTokensAmountUSD = useTokensPriceInUSD(account.chainId, weth9, ethPriceInUSDC, currentTokensAmount)
  const poolTokensAmountUSD = useTokensPriceInUSD(account.chainId, weth9, ethPriceInUSDC, poolTokensAmount)

  const formattedLatestTokens = useMemo(() => {
    if (currentTokensAmountUSD && poolTokensAmountUSD) {
      // 1. get current tokens
      const tokensData = currentTokensAmountUSD.map((data, index) => {
        const token = data[0].currency
        const tokenAddress = token.address
        const symbol = token.symbol ? token.symbol : 'Unknown'
        const decimal = token.decimals
        const currentAmount = Number(data[0].quotient.toString()) / Number(10 ** decimal)
        const currentAmountUSD = data[1]
        return {
          token: tokenAddress,
          symbol,
          decimal,
          currentAmount,
          current: currentAmountUSD,
          poolAmount: 0,
          pool: 0, //poolAmountUSD
          index,
        }
      })

      // 2. get pool tokens
      poolTokensAmountUSD.map((data) => {
        const token = data[0].currency
        const tokenAddress = token.address
        const symbol = token.symbol ? token.symbol : 'Unknown'
        const decimal = token.decimals
        const poolAmount = Number(data[0].quotient.toString()) / Number(10 ** decimal)

        const poolAmountUSD = data[1]
        let added = false
        for (let i = 0; i < tokensData.length; i++) {
          if (tokenAddress.toUpperCase() === tokensData[i].token.toUpperCase()) {
            tokensData[i].poolAmount = tokensData[i].poolAmount + poolAmount
            tokensData[i].pool = tokensData[i].pool + poolAmountUSD
            added = true
          }
        }
        if (!added) {
          tokensData.push({
            token: tokenAddress,
            symbol,
            decimal,
            currentAmount: 0,
            current: 0, //currentAmountUSD
            poolAmount,
            pool: poolAmountUSD,
            index: tokensData.length,
          })
        }
        return undefined
      })
      return tokensData
    } else {
      return []
    }
  }, [currentTokensAmountUSD, poolTokensAmountUSD])

  if (formattedVolumeChart && formattedVolumeChart.length > 1 && formattedLatestTokens) {
    let totalCurrentAmountUSD = 0
    currentTokensAmountUSD.map((value) => {
      const tokenAmountUSD = value[1]
      totalCurrentAmountUSD += tokenAmountUSD
      return undefined
    })
    let totalPoolAmountUSD = 0
    poolTokensAmountUSD.map((value) => {
      const tokenAmountUSD = value[1]
      totalPoolAmountUSD += tokenAmountUSD
      return undefined
    })

    const tokens = formattedLatestTokens.map((data) => {
      return data.token
    })

    const symbols = formattedLatestTokens.map((data) => {
      return data.symbol
    })

    const tokensVolume = formattedLatestTokens.map((data) => {
      return data.current + data.pool
    })

    formattedVolumeChart.push({
      time: Math.floor(new Date().getTime() / 1000),
      current: totalCurrentAmountUSD,
      pool: totalPoolAmountUSD,
      principal: formattedVolumeChart[formattedVolumeChart.length - 1].principal,
      tokens,
      symbols,
      tokensVolume,
      index: formattedVolumeChart.length,
    })
  }

  // const volumeChartHoverIndex = volumeIndexHover !== undefined ? volumeIndexHover : undefined

  // const principalHover = useMemo(() => {
  //   if (volumeChartHoverIndex !== undefined && formattedVolumeChart) {
  //     const volumeUSDData = formattedVolumeChart[volumeChartHoverIndex]
  //     return volumeUSDData.principal
  //   } else if (formattedVolumeChart.length > 0) {
  //     return formattedVolumeChart[formattedVolumeChart.length - 1].principal
  //   } else {
  //     return undefined
  //   }
  // }, [volumeChartHoverIndex, formattedVolumeChart])

  // const tokenHover = useMemo(() => {
  //   if (volumeChartHoverIndex !== undefined && formattedVolumeChart) {
  //     const volumeUSDData = formattedVolumeChart[volumeChartHoverIndex]
  //     const tokens = volumeUSDData.tokens
  //     return tokens.map((data: any, index: any) => {
  //       return {
  //         token: data,
  //         symbol: volumeUSDData.symbols[index],
  //         volume: volumeUSDData.tokensVolume[index],
  //       }
  //     })
  //   } else {
  //     if (formattedLatestTokens) {
  //       return formattedLatestTokens.map((data) => {
  //         return {
  //           token: data.token,
  //           symbol: data.symbol,
  //           volume: data.current + data.pool,
  //         }
  //       })
  //     } else {
  //       return []
  //     }
  //   }
  // }, [volumeChartHoverIndex, formattedVolumeChart, formattedLatestTokens])

  // const ratio = useMemo(() => {
  //   return volumeChartHoverIndex !== undefined && formattedVolumeChart[volumeChartHoverIndex].principal > 0
  //     ? Number(
  //         (
  //           ((formattedVolumeChart[volumeChartHoverIndex].current +
  //             formattedVolumeChart[volumeChartHoverIndex].pool -
  //             formattedVolumeChart[volumeChartHoverIndex].principal) /
  //             formattedVolumeChart[volumeChartHoverIndex].principal) *
  //           100
  //         ).toFixed(2)
  //       )
  //     : volumeChartHoverIndex !== undefined && formattedVolumeChart[volumeChartHoverIndex].principal === 0
  //     ? Number(0)
  //     : formattedVolumeChart && formattedVolumeChart.length > 0
  //     ? Number(
  //         (
  //           ((formattedVolumeChart[formattedVolumeChart.length - 1].current +
  //             formattedVolumeChart[formattedVolumeChart.length - 1].pool -
  //             formattedVolumeChart[formattedVolumeChart.length - 1].principal) /
  //             formattedVolumeChart[formattedVolumeChart.length - 1].principal) *
  //           100
  //         ).toFixed(2)
  //       )
  //     : Number(0)
  // }, [volumeChartHoverIndex, formattedVolumeChart])

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
                    isActive={view === ChartView.TOTAL_ASSET}
                    fontSize="12px"
                    onClick={() => (view === ChartView.TOTAL_ASSET ? {} : setView(ChartView.TOTAL_ASSET))}
                  >
                    <Trans>Total Asset</Trans>
                  </ToggleElement>
                  <ToggleElement
                    isActive={view === ChartView.TOKENS}
                    fontSize="12px"
                    onClick={() => (view === ChartView.TOKENS ? {} : setView(ChartView.TOKENS))}
                  >
                    <Trans>Tokens</Trans>
                  </ToggleElement>
                </ToggleWrapper>
              </ToggleRow>

              {view === ChartView.TOTAL_ASSET ? (
                <ComposedChart
                  data={formattedVolumeChart}
                  color={accent1}
                  setIndex={setVolumeIndexHover}
                  // topLeft={
                  //   <AutoColumn gap="4px">
                  //     <MonoSpace>
                  //       {formatDollarAmount(
                  //         volumeIndexHover !== undefined && formattedVolumeChart && formattedVolumeChart.length > 0
                  //           ? formattedVolumeChart[volumeIndexHover].current +
                  //               formattedVolumeChart[volumeIndexHover].pool
                  //           : formattedVolumeChart && formattedVolumeChart.length > 0
                  //           ? formattedVolumeChart[formattedVolumeChart.length - 1].current +
                  //             formattedVolumeChart[formattedVolumeChart.length - 1].pool
                  //           : 0
                  //       )}
                  //     </MonoSpace>
                  //     <>{ratio}</>
                  //   </AutoColumn>
                  // }
                  // topRight={
                  //   <AutoColumn gap="4px" justify="end">
                  //     <AutoRow justify="end">
                  //       <CurrentAssetText>
                  //         <MonoSpace>
                  //           {formatDollarAmount(
                  //             volumeIndexHover !== undefined
                  //               ? formattedVolumeChart[volumeIndexHover].current
                  //               : formattedVolumeChart && formattedVolumeChart.length > 0
                  //               ? formattedVolumeChart[formattedVolumeChart.length - 1].current
                  //               : 0
                  //           )}
                  //         </MonoSpace>
                  //       </CurrentAssetText>
                  //       &nbsp;&nbsp;
                  //       <PoolAssetText>
                  //         <MonoSpace>
                  //           {formatDollarAmount(
                  //             volumeIndexHover !== undefined
                  //               ? formattedVolumeChart[volumeIndexHover].pool
                  //               : formattedVolumeChart && formattedVolumeChart.length > 0
                  //               ? formattedVolumeChart[formattedVolumeChart.length - 1].pool
                  //               : 0
                  //           )}
                  //         </MonoSpace>
                  //       </PoolAssetText>
                  //       &nbsp;&nbsp;
                  //       <PrincipalText>
                  //         <MonoSpace>
                  //           {formatDollarAmount(
                  //             principalHover !== undefined
                  //               ? principalHover
                  //               : formattedVolumeChart && formattedVolumeChart.length > 0
                  //               ? formattedVolumeChart[formattedVolumeChart.length - 1].principal
                  //               : 0
                  //           )}
                  //         </MonoSpace>
                  //       </PrincipalText>
                  //     </AutoRow>
                  //     <>
                  //       {volumeIndexHover !== undefined ? (
                  //         <MonoSpace>
                  //           {unixToDate(Number(formattedVolumeChart[volumeIndexHover].time))} (
                  //           {formatTime(formattedVolumeChart[volumeIndexHover].time.toString(), 8)})
                  //         </MonoSpace>
                  //       ) : formattedVolumeChart && formattedVolumeChart.length > 0 ? (
                  //         <MonoSpace>
                  //           {unixToDate(formattedVolumeChart[formattedVolumeChart.length - 1].time)} (
                  //           {formatTime(formattedVolumeChart[formattedVolumeChart.length - 1].time.toString(), 8)})
                  //         </MonoSpace>
                  //       ) : null}
                  //     </>
                  //   </AutoColumn>
                  // }
                />
              ) : view === ChartView.TOKENS ? (
                <TokenBarChart
                  data={formattedLatestTokens}
                  color={accent1}
                  setIndex={setTokenIndexHover}
                  // topLeft={
                  //   <>
                  //     <>
                  //       {tokenIndexHover !== undefined && formattedLatestTokens && formattedLatestTokens.length > 0
                  //         ? formattedLatestTokens[tokenIndexHover].symbol === 'WETH'
                  //           ? 'ETH'
                  //           : formattedLatestTokens[tokenIndexHover].symbol
                  //         : formattedLatestTokens && formattedLatestTokens.length > 0
                  //         ? formattedLatestTokens[0].symbol === 'WETH'
                  //           ? 'ETH'
                  //           : formattedLatestTokens[0].symbol
                  //         : null}
                  //       &nbsp;&nbsp;
                  //     </>
                  //     <>
                  //       {tokenIndexHover !== undefined &&
                  //       formattedLatestTokens &&
                  //       formattedLatestTokens.length > 0 ? (
                  //         <ExternalLink
                  //           href={getEtherscanLink(formattedLatestTokens[tokenIndexHover].token, 'address')}
                  //         >
                  //           {shortenAddress(formattedLatestTokens[tokenIndexHover].token)}
                  //         </ExternalLink>
                  //       ) : formattedLatestTokens && formattedLatestTokens.length > 0 ? (
                  //         <ExternalLink href={getEtherscanLink(formattedLatestTokens[0].token, 'address')}>
                  //           {shortenAddress(formattedLatestTokens[0].token)}
                  //         </ExternalLink>
                  //       ) : null}
                  //     </>
                  //     <>
                  //       {tokenIndexHover !== undefined &&
                  //       formattedLatestTokens &&
                  //       formattedLatestTokens.length > 0 ? (
                  //         <MonoSpace>
                  //           {formatDollarAmount(
                  //             formattedLatestTokens[tokenIndexHover].current +
                  //               formattedLatestTokens[tokenIndexHover].pool
                  //           )}
                  //         </MonoSpace>
                  //       ) : formattedLatestTokens && formattedLatestTokens.length > 0 ? (
                  //         <MonoSpace>
                  //           {formatDollarAmount(formattedLatestTokens[0].current + formattedLatestTokens[0].pool)}
                  //         </MonoSpace>
                  //       ) : (
                  //         <br />
                  //       )}
                  //     </>
                  //   </>
                  // }
                  // topRight={
                  //   <AutoColumn gap="4px">
                  //     <AutoRow justify="end">
                  //       {tokenIndexHover !== undefined &&
                  //       formattedLatestTokens &&
                  //       formattedLatestTokens.length > 0 ? (
                  //         <>
                  //           <CurrentAssetText>
                  //             <MonoSpace>
                  //               {formatAmount(formattedLatestTokens[tokenIndexHover].currentAmount)}
                  //             </MonoSpace>
                  //           </CurrentAssetText>
                  //           <MonoSpace>
                  //             {' '}
                  //             ({formatDollarAmount(formattedLatestTokens[tokenIndexHover].current)})
                  //           </MonoSpace>
                  //         </>
                  //       ) : formattedLatestTokens && formattedLatestTokens.length > 0 ? (
                  //         <>
                  //           <CurrentAssetText>
                  //             <MonoSpace>{formatAmount(formattedLatestTokens[0].currentAmount)}</MonoSpace>
                  //           </CurrentAssetText>
                  //           <MonoSpace> ({formatDollarAmount(formattedLatestTokens[0].current)})</MonoSpace>
                  //         </>
                  //       ) : null}
                  //     </AutoRow>
                  //     <AutoRow justify="end">
                  //       {tokenIndexHover !== undefined &&
                  //       formattedLatestTokens &&
                  //       formattedLatestTokens.length > 0 ? (
                  //         <>
                  //           <PoolAssetText>
                  //             <MonoSpace>{formatAmount(formattedLatestTokens[tokenIndexHover].poolAmount)}</MonoSpace>
                  //           </PoolAssetText>
                  //           <MonoSpace>
                  //             {' '}
                  //             ({formatDollarAmount(formattedLatestTokens[tokenIndexHover].pool)})
                  //           </MonoSpace>
                  //         </>
                  //       ) : formattedLatestTokens && formattedLatestTokens.length > 0 ? (
                  //         <>
                  //           <PoolAssetText>
                  //             <MonoSpace>{formatAmount(formattedLatestTokens[0].poolAmount)}</MonoSpace>
                  //           </PoolAssetText>
                  //           <MonoSpace> ({formatDollarAmount(formattedLatestTokens[0].pool)})</MonoSpace>
                  //         </>
                  //       ) : null}2
                  //     </AutoRow>
                  //   </AutoColumn>
                  // }
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
            <ButtonPrimary
              $borderRadius="12px"
              mr="12px"
              padding="12px"
              onClick={() => {
                navigate(`/swap/${currentPageFund}/${investor}`)
              }}
            >
              <>Swap</>
            </ButtonPrimary>
          </TokenDetailsWrapper>
        </RightColumn>
      </PageWrapper>
    </ThemeProvider>
  )
}

export default FundDetails
