import { InterfacePageName } from '@uniswap/analytics-events'
import { useAccount } from 'hooks/useAccount'
import RecentTransactions from 'pages/Fund/tables/RecentTransactions'
import { useMemo } from 'react'
import { Flex, Text } from 'ui/src'
import Trace from 'uniswap/src/features/telemetry/Trace'
import { Trans } from 'uniswap/src/i18n'
// import { useDotoliInfoContract } from 'hooks/useContract'
// import { useSingleCallResult } from 'lib/hooks/multicall'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useFundData } from 'data/Fund/fundData'
import { useVolumeChartData } from 'data/Fund/volumeChartData'
import { useETHPriceInUSD, useTokensPriceInUSD } from 'hooks/usePools'
import { useParams } from 'react-router-dom'

export enum ExploreTab {
  Tokens = 'tokens',
  Pools = 'pools',
  Transactions = 'transactions',
}

// enum ChartView {
//   CURRENT_ASSET_TOKENS,
//   TOKENS,
//   FEES,
// }

const Explore = () => {
  // const tabNavRef = useRef<HTMLDivElement>(null)
  const account = useAccount()
  const params = useParams()
  const currentPageFund = params.fundId
  const nowDate = Math.floor(new Date().getTime() / 1000)

  // useEffect(() => {
  //   if (tabNavRef.current && initialTab) {
  //     const offsetTop = tabNavRef.current.getBoundingClientRect().top + window.scrollY
  //     window.scrollTo({ top: offsetTop - 90, behavior: 'smooth' })
  //   }
  //   // scroll to tab navbar on initial page mount only
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  // const DotoliInfoContract = useDotoliInfoContract()
  // const { loading: myManagingFundLoading, result: [myManagingFund] = [] } = useSingleCallResult(
  //   DotoliInfoContract,
  //   'managingFund',
  //   [account.address]
  // )
  // const [userIsManager, setUserIsManager] = useState<boolean>(false)
  // useEffect(() => {
  //   if (!myManagingFundLoading) {
  //     setState()
  //   }
  //   async function setState() {
  //     if (myManagingFund && currentPageFund && myManagingFund.toString() === currentPageFund.toString()) {
  //       setUserIsManager(true)
  //     } else {
  //       setUserIsManager(false)
  //     }
  //   }
  // }, [myManagingFundLoading, myManagingFund, currentPageFund])

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

  // const [view, setView] = useState(ChartView.CURRENT_ASSET_TOKENS)

  // chart hover index
  // const [volumeIndexHover] = useState<number | undefined>()
  // const [tokenIndexHover, setTokenIndexHover] = useState<number | undefined>()
  // const [feeIndexHover, setFeeIndexHover] = useState<number | undefined>()

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

  // const formattedFeeTokens = useMemo(() => {
  //   if (fundData && fundData.fund) {
  //     return fundData.fund.feeTokens.map((data: any, index: number) => {
  //       return {
  //         token: fundData.fund,
  //         symbol: fundData.fund.feeSymbols[index],
  //         amount: fundData.fund.feeTokensAmount[index],
  //         index,
  //       }
  //     })
  //   } else {
  //     return []
  //   }
  // }, [fundData])

  const weth9 = account.chainId ? WRAPPED_NATIVE_CURRENCY[account.chainId] : undefined
  const ethPriceInUSDC = useETHPriceInUSD(account.chainId)

  // console.log(1,fundData)
  // console.log(2,fundData?.fund)
  // console.log(3,fundData?.fund?.currentTokens)

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
    <Trace logImpression page={InterfacePageName.EXPLORE_PAGE} properties={{ chainName: account.chainId }}>
      <Flex width="100%" minWidth={320} pt="$spacing48" px="$spacing40" $md={{ p: '$spacing16', pb: 0 }}>
        <Flex
          row
          gap="$spacing24"
          flexWrap="wrap"
          justifyContent="flex-start"
          $md={{ gap: '$spacing16' }}
          data-testid="explore-navbar"
        >
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
        </Flex>
        <RecentTransactions />
      </Flex>
    </Trace>
  )
}

export default Explore
