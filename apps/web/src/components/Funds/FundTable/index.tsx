import { ApolloError } from '@apollo/client'
import { createColumnHelper } from '@tanstack/react-table'
import { InterfaceElementName } from '@uniswap/analytics-events'
import { Table } from 'components/Table'
import { Cell } from 'components/Table/Cell'
import { ClickableHeaderRow, HeaderArrow, HeaderSortText } from 'components/Table/styled'
import { DeltaArrow, DeltaText } from 'components/Tokens/TokenDetails/Delta'
import { MAX_WIDTH_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import { TokenSortMethod, sortAscendingAtom, sortMethodAtom, useSetSortMethod } from 'components/Tokens/state'
import { MouseoverTooltip } from 'components/Tooltip'
import { useChainFromUrlParam } from 'constants/chains'
import { SparklineMap, TopToken, useTopTokens } from 'graphql/data/TopTokens'
import { OrderDirection, getSupportedGraphQlChain } from 'graphql/data/util'
import { useAtomValue } from 'jotai/utils'
import { ReactElement, ReactNode, useMemo } from 'react'
import { useTopTokens as useRestTopTokens } from 'state/explore/topTokens'
import { TokenStat } from 'state/explore/types'
import { Flex, Text, styled } from 'ui/src'
import { FeatureFlags } from 'uniswap/src/features/gating/flags'
import { useFeatureFlag } from 'uniswap/src/features/gating/hooks'
import { Trans } from 'uniswap/src/i18n'
import { NumberType, useFormatter } from 'utils/formatNumbers'

import { useQuery } from '@tanstack/react-query'
import { gql, request } from 'graphql-request'

const query = gql`
  {
    funds(orderBy: currentUSD, orderDirection: desc, subgraphError: allow) {
      id
      createdAtTimestamp
      manager
      investorCount
      currentUSD
    }
  }
`

interface Fund {
  id: string
  createdAtTimestamp: string
  manager: string
  investorCount: string
  currentUSD: string
}

interface TopFunds {
  funds: Fund[]
}

const url = 'https://api.studio.thegraph.com/query/44946/dotoli/version/latest'

const TableWrapper = styled(Flex, {
  m: '0 auto',
  maxWidth: MAX_WIDTH_MEDIA_BREAKPOINT,
})

const EllipsisText = styled(Text, {
  variant: 'body2',
  color: '$neutral1',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
})

const SparklineContainer = styled(Flex, {
  width: '124px',
  height: '$spacing40',
})

const TokenTableText = styled(Text, {
  variant: 'body2',
  color: '$neutral2',
  maxWidth: '100%',
})

interface TokenTableValue {
  index: number
  tokenDescription: ReactElement
  price: number
  percentChange1hr: ReactElement
  percentChange1d: ReactElement
  fdv: number
  volume: number
  sparkline: ReactElement
  link: string
  /** Used for pre-loading TDP with logo to extract color from */
  linkState: { preloadedLogoSrc?: string }
}

export function TopFundsTable() {
  const chain = getSupportedGraphQlChain(useChainFromUrlParam(), { fallbackToEthereum: true })
  const isRestExploreEnabled = useFeatureFlag(FeatureFlags.RestExplore)
  const {
    tokens: gqlTokens,
    tokenSortRank: gqlTokenSortRank,
    loadingTokens: gqlLoadingTokens,
    sparklines: gqlSparklines,
    error: gqlError,
  } = useTopTokens(chain.backendChain.chain, isRestExploreEnabled /* skip */)
  const {
    topTokens: restTopTokens,
    tokenSortRank: restTokenSortRank,
    isLoading: restIsLoading,
    sparklines: restSparklines,
    isError: restError,
  } = useRestTopTokens()

  const { tokens, tokenSortRank, sparklines, loading, error } = useMemo(() => {
    return isRestExploreEnabled
      ? {
          tokens: restTopTokens,
          tokenSortRank: restTokenSortRank,
          loading: restIsLoading,
          sparklines: restSparklines,
          error: restError,
        }
      : {
          tokens: gqlTokens,
          tokenSortRank: gqlTokenSortRank,
          loading: gqlLoadingTokens,
          sparklines: gqlSparklines,
          error: gqlError,
        }
  }, [
    isRestExploreEnabled,
    restTopTokens,
    restTokenSortRank,
    restIsLoading,
    restSparklines,
    restError,
    gqlTokens,
    gqlTokenSortRank,
    gqlLoadingTokens,
    gqlSparklines,
    gqlError,
  ])

  return (
    <TableWrapper data-testid="top-tokens-explore-table">
      <TokenTable
        tokens={tokens}
        tokenSortRank={tokenSortRank}
        sparklines={sparklines}
        loading={loading}
        error={error}
      />
    </TableWrapper>
  )
}

const HEADER_TEXT: Record<TokenSortMethod, ReactNode> = {
  [TokenSortMethod.FULLY_DILUTED_VALUATION]: <Trans i18nKey="stats.fdv" />,
  [TokenSortMethod.PRICE]: <Trans i18nKey="common.price" />,
  [TokenSortMethod.VOLUME]: <Trans i18nKey="common.volume" />,
  [TokenSortMethod.HOUR_CHANGE]: <Trans i18nKey="common.oneHour" />,
  [TokenSortMethod.DAY_CHANGE]: <Trans i18nKey="common.oneDay" />,
}

const HEADER_DESCRIPTIONS: Record<TokenSortMethod, ReactNode | undefined> = {
  [TokenSortMethod.PRICE]: undefined,
  [TokenSortMethod.DAY_CHANGE]: undefined,
  [TokenSortMethod.HOUR_CHANGE]: undefined,
  [TokenSortMethod.FULLY_DILUTED_VALUATION]: <Trans i18nKey="stats.fdv.description" />,
  [TokenSortMethod.VOLUME]: <Trans i18nKey="stats.volume.description" />,
}

function TokenTableHeader({
  category,
  isCurrentSortMethod,
  direction,
}: {
  category: TokenSortMethod
  isCurrentSortMethod: boolean
  direction: OrderDirection
}) {
  const handleSortCategory = useSetSortMethod(category)

  return (
    <MouseoverTooltip disabled={!HEADER_DESCRIPTIONS[category]} text={HEADER_DESCRIPTIONS[category]} placement="top">
      <ClickableHeaderRow justifyContent="flex-end" onPress={handleSortCategory}>
        {isCurrentSortMethod && <HeaderArrow direction={direction} />}
        <HeaderSortText active={isCurrentSortMethod}>{HEADER_TEXT[category]}</HeaderSortText>
      </ClickableHeaderRow>
    </MouseoverTooltip>
  )
}

function TokenTable({
  loading,
  error,
  loadMore,
}: {
  tokens?: readonly TopToken[] | TokenStat[]
  tokenSortRank: Record<string, number>
  sparklines: SparklineMap
  loading: boolean
  error?: ApolloError | boolean
  loadMore?: ({ onComplete }: { onComplete?: () => void }) => void
}) {
  const { formatFiatPrice, formatNumber } = useFormatter()
  const sortAscending = useAtomValue(sortAscendingAtom)
  const orderDirection = sortAscending ? OrderDirection.Asc : OrderDirection.Desc
  const sortMethod = useAtomValue(sortMethodAtom)

  const { data } = useQuery({
    queryKey: ['data'],
    async queryFn() {
      return await request(url, query)
    },
  })

  const jsonString = JSON.stringify(data ?? {})
  const jsonData: TopFunds = JSON.parse(jsonString)

  const tokenTableValues: TokenTableValue[] | undefined = useMemo(
    () =>
      jsonData.funds?.map((fund, i) => {
        return {
          index: i + 1,
          tokenDescription: (
            <Flex row gap="$gap8">
              <EllipsisText data-testid="fund-id">{fund.id.slice(0, 8)}...</EllipsisText>
              <TokenTableText>{fund.manager.slice(0, 6)}...</TokenTableText>
            </Flex>
          ),
          price: parseFloat(fund.currentUSD),
          testId: `fund-table-row-${fund.id}`,
          percentChange1hr: (
            <>
              <DeltaArrow delta={0} />
              <DeltaText delta={0}>0%</DeltaText>
            </>
          ),
          percentChange1d: (
            <>
              <DeltaArrow delta={0} />
              <DeltaText delta={0}>0%</DeltaText>
            </>
          ),
          fdv: parseFloat(fund.currentUSD),
          volume: parseInt(fund.investorCount),
          sparkline: <SparklineContainer></SparklineContainer>,
          link: `/fund/${fund.id}`,
          analytics: {
            elementName: InterfaceElementName.TOKENS_TABLE_ROW,
            properties: {
              fund_id: fund.id,
              fund_manager: fund.manager,
              investor_count: fund.investorCount,
              current_value: fund.currentUSD,
            },
          },
          linkState: {},
        }
      }) ?? [],
    [jsonData.funds],
  )

  const showLoadingSkeleton = loading || !!error
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<TokenTableValue>()
    return [
      columnHelper.accessor((row) => row.index, {
        id: 'index',
        header: () => (
          <Cell justifyContent="center" minWidth={44}>
            <TokenTableText>#</TokenTableText>
          </Cell>
        ),
        cell: (index) => (
          <Cell justifyContent="center" loading={showLoadingSkeleton} minWidth={44}>
            <TokenTableText>{index.getValue?.()}</TokenTableText>
          </Cell>
        ),
      }),
      columnHelper.accessor((row) => row.tokenDescription, {
        id: 'tokenDescription',
        header: () => (
          <Cell justifyContent="flex-start" width={240} grow>
            <TokenTableText>
              <Trans i18nKey="common.tokenName" />
            </TokenTableText>
          </Cell>
        ),
        cell: (tokenDescription) => (
          <Cell justifyContent="flex-start" width={240} loading={showLoadingSkeleton} grow testId="name-cell">
            <TokenTableText>{tokenDescription.getValue?.()}</TokenTableText>
          </Cell>
        ),
      }),
      columnHelper.accessor((row) => row.price, {
        id: 'price',
        header: () => (
          <Cell minWidth={133} grow>
            <TokenTableHeader
              category={TokenSortMethod.PRICE}
              isCurrentSortMethod={sortMethod === TokenSortMethod.PRICE}
              direction={orderDirection}
            />
          </Cell>
        ),
        cell: (price) => (
          <Cell loading={showLoadingSkeleton} minWidth={133} grow testId="price-cell">
            <Text variant="body2" color="$neutral1">
              {/* A simple 0 price indicates the price is not currently available from the api */}
              {price.getValue?.() === 0
                ? '-'
                : formatFiatPrice({ price: price.getValue?.(), type: NumberType.FiatTokenPrice })}
            </Text>
          </Cell>
        ),
      }),
      columnHelper.accessor((row) => row.percentChange1hr, {
        id: 'percentChange1hr',
        header: () => (
          <Cell minWidth={133} grow>
            <TokenTableHeader
              category={TokenSortMethod.HOUR_CHANGE}
              isCurrentSortMethod={sortMethod === TokenSortMethod.HOUR_CHANGE}
              direction={orderDirection}
            />
          </Cell>
        ),
        cell: (percentChange1hr) => (
          <Cell loading={showLoadingSkeleton} minWidth={133} grow>
            {percentChange1hr.getValue?.()}
          </Cell>
        ),
      }),
      columnHelper.accessor((row) => row.percentChange1d, {
        id: 'percentChange1d',
        header: () => (
          <Cell minWidth={133} grow>
            <TokenTableHeader
              category={TokenSortMethod.DAY_CHANGE}
              isCurrentSortMethod={sortMethod === TokenSortMethod.DAY_CHANGE}
              direction={orderDirection}
            />
          </Cell>
        ),
        cell: (percentChange1d) => (
          <Cell loading={showLoadingSkeleton} minWidth={133} grow>
            {percentChange1d.getValue?.()}
          </Cell>
        ),
      }),
      columnHelper.accessor((row) => row.fdv, {
        id: 'fdv',
        header: () => (
          <Cell width={133} grow>
            <TokenTableHeader
              category={TokenSortMethod.FULLY_DILUTED_VALUATION}
              isCurrentSortMethod={sortMethod === TokenSortMethod.FULLY_DILUTED_VALUATION}
              direction={orderDirection}
            />
          </Cell>
        ),
        cell: (fdv) => (
          <Cell loading={showLoadingSkeleton} width={133} grow testId="fdv-cell">
            <EllipsisText>{formatNumber({ input: fdv.getValue?.(), type: NumberType.FiatTokenStats })}</EllipsisText>
          </Cell>
        ),
      }),
      columnHelper.accessor((row) => row.volume, {
        id: 'volume',
        header: () => (
          <Cell width={133} grow>
            <TokenTableHeader
              category={TokenSortMethod.VOLUME}
              isCurrentSortMethod={sortMethod === TokenSortMethod.VOLUME}
              direction={orderDirection}
            />
          </Cell>
        ),
        cell: (volume) => (
          <Cell width={133} loading={showLoadingSkeleton} grow testId="volume-cell">
            <EllipsisText>{formatNumber({ input: volume.getValue?.(), type: NumberType.FiatTokenStats })}</EllipsisText>
          </Cell>
        ),
      }),
      columnHelper.accessor((row) => row.sparkline, {
        id: 'sparkline',
        header: () => <Cell minWidth={172} />,
        cell: (sparkline) => (
          <Cell minWidth={172} loading={showLoadingSkeleton}>
            {sparkline.getValue?.()}
          </Cell>
        ),
      }),
    ]
  }, [formatFiatPrice, formatNumber, orderDirection, showLoadingSkeleton, sortMethod])

  return (
    <>
      <Table
        columns={columns}
        data={tokenTableValues}
        loading={loading}
        error={error}
        loadMore={loadMore}
        maxWidth={1200}
      />
    </>
  )
}
