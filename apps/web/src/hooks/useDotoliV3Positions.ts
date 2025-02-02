import { BigNumber } from '@ethersproject/bignumber'
import { PositionDetails } from 'dotoli/src/types/position'
import { CallStateResult, useSingleCallResult, useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useMemo } from 'react'

import { useDotoliInfoContract, useV3NFTPositionManagerContract } from 'hooks/useContract'

interface UseV3PositionsResults {
  loading: boolean
  positions?: PositionDetails[]
}

function useV3PositionsFromTokenIds(
  fundId: string | undefined,
  investor: string | undefined,
  tokenIds: BigNumber[] | undefined,
): UseV3PositionsResults {
  const positionManager = useV3NFTPositionManagerContract()
  const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : []), [tokenIds])
  const results = useSingleContractMultipleData(positionManager, 'positions', inputs)

  const loading = useMemo(() => results.some(({ loading }) => loading), [results])
  const error = useMemo(() => results.some(({ error }) => error), [results])

  const positions = useMemo(() => {
    if (!loading && !error && tokenIds && fundId && investor) {
      return results.map((call, i) => {
        const tokenId = tokenIds[i]
        const result = call.result as CallStateResult
        return {
          fundId,
          investor,
          tokenId,
          fee: result.fee,
          feeGrowthInside0LastX128: result.feeGrowthInside0LastX128,
          feeGrowthInside1LastX128: result.feeGrowthInside1LastX128,
          liquidity: result.liquidity,
          nonce: result.nonce,
          operator: result.operator,
          tickLower: result.tickLower,
          tickUpper: result.tickUpper,
          token0: result.token0,
          token1: result.token1,
          tokensOwed0: result.tokensOwed0,
          tokensOwed1: result.tokensOwed1,
        }
      })
    }
    return undefined
  }, [loading, error, results, fundId, investor, tokenIds])

  return {
    loading,
    positions: positions?.map((position, i) => ({ ...position, tokenId: inputs[i][0] })),
  }
}

export function useDotoliV3Positions(fundId: string | undefined, investor: string | undefined): UseV3PositionsResults {
  const DotoliInfoContract = useDotoliInfoContract()

  const { loading: tokenIdResultsLoading, result: [tokenIdResults] = [] } = useSingleCallResult(
    DotoliInfoContract,
    'getTokenIds',
    [fundId ?? undefined, investor ?? undefined],
  )

  const tokenIds = useMemo(() => {
    if (tokenIdResults) {
      return tokenIdResults.map((result: number) => BigNumber.from(result))
    }
    return []
  }, [tokenIdResults])

  const { positions, loading: positionsLoading } = useV3PositionsFromTokenIds(fundId, investor, tokenIds)

  return {
    loading: tokenIdResultsLoading || positionsLoading,
    positions,
  }
}
