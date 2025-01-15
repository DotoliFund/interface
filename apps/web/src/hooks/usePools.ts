import { Interface } from '@ethersproject/abi'
import { BigintIsh, Currency, CurrencyAmount, Token, V3_CORE_FACTORY_ADDRESSES } from '@uniswap/sdk-core'
import IUniswapV3PoolStateJSON from '@uniswap/v3-core/artifacts/contracts/interfaces/pool/IUniswapV3PoolState.sol/IUniswapV3PoolState.json'
import { FeeAmount, Pool, computePoolAddress } from '@uniswap/v3-sdk'
import { useContractMultichain } from 'components/AccountDrawer/MiniPortfolio/Pools/hooks'
import { USDC_MAINNET, WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useAccount } from 'hooks/useAccount'
import JSBI from 'jsbi'
import { useMultipleContractSingleData } from 'lib/hooks/multicall'
import { useEffect, useMemo, useRef } from 'react'
import { IUniswapV3PoolStateInterface } from 'uniswap/src/abis/types/v3/IUniswapV3PoolState'
import { UniswapV3Pool } from 'uniswap/src/abis/types/v3/UniswapV3Pool'
import { UNIVERSE_CHAIN_INFO } from 'uniswap/src/constants/chains'
import { InterfaceChainId, UniverseChainId } from 'uniswap/src/types/chains'
import { logger } from 'utilities/src/logger/logger'

const POOL_STATE_INTERFACE = new Interface(IUniswapV3PoolStateJSON.abi) as IUniswapV3PoolStateInterface

// Classes are expensive to instantiate, so this caches the recently instantiated pools.
// This avoids re-instantiating pools as the other pools in the same request are loaded.
export class PoolCache {
  // Evict after 128 entries. Empirically, a swap uses 64 entries.
  private static MAX_ENTRIES = 128

  // These are FIFOs, using unshift/pop. This makes recent entries faster to find.
  private static pools: Pool[] = []
  private static addresses: { key: string; address: string }[] = []

  static getPoolAddress(
    factoryAddress: string,
    tokenA: Token,
    tokenB: Token,
    fee: FeeAmount,
    chainId: InterfaceChainId,
  ): string {
    if (this.addresses.length > this.MAX_ENTRIES) {
      this.addresses = this.addresses.slice(0, this.MAX_ENTRIES / 2)
    }

    const { address: addressA } = tokenA
    const { address: addressB } = tokenB
    const key = `${factoryAddress}:${addressA}:${addressB}:${fee.toString()}`
    const found = this.addresses.find((address) => address.key === key)
    if (found) {
      return found.address
    }

    const address = {
      key,
      address: computePoolAddress({
        factoryAddress,
        tokenA,
        tokenB,
        fee,
        chainId: UNIVERSE_CHAIN_INFO[chainId].sdkId,
      }),
    }
    this.addresses.unshift(address)
    return address.address
  }

  static getPool(
    tokenA: Token,
    tokenB: Token,
    fee: FeeAmount,
    sqrtPriceX96: BigintIsh,
    liquidity: BigintIsh,
    tick: number,
  ): Pool {
    if (this.pools.length > this.MAX_ENTRIES) {
      this.pools = this.pools.slice(0, this.MAX_ENTRIES / 2)
    }

    const found = this.pools.find(
      (pool) =>
        pool.token0 === tokenA &&
        pool.token1 === tokenB &&
        pool.fee === fee &&
        JSBI.EQ(pool.sqrtRatioX96, sqrtPriceX96) &&
        JSBI.EQ(pool.liquidity, liquidity) &&
        pool.tickCurrent === tick,
    )
    if (found) {
      return found
    }

    const pool = new Pool(tokenA, tokenB, fee, sqrtPriceX96, liquidity, tick)
    this.pools.unshift(pool)
    return pool
  }
}

export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function usePools(
  poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][],
): [PoolState, Pool | null][] {
  const { chainId } = useAccount()

  const poolTokens: ([Token, Token, FeeAmount] | undefined)[] = useMemo(() => {
    if (!chainId) {
      return new Array(poolKeys.length)
    }

    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = currencyA.wrapped
        const tokenB = currencyB.wrapped
        if (tokenA.equals(tokenB)) {
          return undefined
        }

        return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, feeAmount] : [tokenB, tokenA, feeAmount]
      }
      return undefined
    })
  }, [chainId, poolKeys])

  const poolAddresses: (string | undefined)[] = useMemo(() => {
    const v3CoreFactoryAddress = chainId && V3_CORE_FACTORY_ADDRESSES[chainId]
    if (!v3CoreFactoryAddress) {
      return new Array(poolTokens.length)
    }

    return poolTokens.map((value) => value && PoolCache.getPoolAddress(v3CoreFactoryAddress, ...value, chainId))
  }, [chainId, poolTokens])

  const slot0s = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'slot0')
  const liquidities = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'liquidity')

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const tokens = poolTokens[index]
      if (!tokens) {
        return [PoolState.INVALID, null]
      }
      const [token0, token1, fee] = tokens

      if (!slot0s[index]) {
        return [PoolState.INVALID, null]
      }
      const { result: slot0, loading: slot0Loading, valid: slot0Valid } = slot0s[index]

      if (!liquidities[index]) {
        return [PoolState.INVALID, null]
      }
      const { result: liquidity, loading: liquidityLoading, valid: liquidityValid } = liquidities[index]

      if (!tokens || !slot0Valid || !liquidityValid) {
        return [PoolState.INVALID, null]
      }
      if (slot0Loading || liquidityLoading) {
        return [PoolState.LOADING, null]
      }
      if (!slot0 || !liquidity) {
        return [PoolState.NOT_EXISTS, null]
      }
      if (!slot0.sqrtPriceX96 || slot0.sqrtPriceX96.eq(0)) {
        return [PoolState.NOT_EXISTS, null]
      }

      try {
        const pool = PoolCache.getPool(token0, token1, fee, slot0.sqrtPriceX96, liquidity[0], slot0.tick)
        return [PoolState.EXISTS, pool]
      } catch (error) {
        logger.error(error, {
          tags: {
            file: 'usePools',
            function: 'usePools',
          },
          extra: {
            token0: token0.address,
            token1: token1.address,
            chainId: token0.chainId,
            fee,
          },
        })
        return [PoolState.NOT_EXISTS, null]
      }
    })
  }, [liquidities, poolKeys, slot0s, poolTokens])
}

export function usePool(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
): [PoolState, Pool | null] {
  const poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount],
  )

  return usePools(poolKeys)[0]
}

export function usePoolMultichain(
  tokenA: Token | undefined,
  tokenB: Token | undefined,
  fee: number | undefined,
  chainId: InterfaceChainId,
): [PoolState, Pool | null] {
  const poolData = useRef<[PoolState, Pool | null]>([PoolState.LOADING, null])
  const poolAddress =
    tokenA && tokenB && fee
      ? PoolCache.getPoolAddress(V3_CORE_FACTORY_ADDRESSES[chainId], tokenA, tokenB, fee, chainId)
      : undefined

  const contractMap = useMemo(() => (poolAddress ? { [chainId]: poolAddress } : {}), [chainId, poolAddress])
  const contract = useContractMultichain<UniswapV3Pool>(contractMap, IUniswapV3PoolStateJSON.abi)[chainId]

  useEffect(() => {
    async function getPool() {
      try {
        if (!tokenA || !tokenB || !fee || !poolAddress || !contract) {
          poolData.current = [PoolState.INVALID, null]
          return
        }

        const slot0 = await contract.slot0()
        const liquidity = await contract.liquidity()
        poolData.current = [PoolState.NOT_EXISTS, null]

        const pool = new Pool(tokenA, tokenB, fee, slot0.sqrtPriceX96.toString(), liquidity.toString(), slot0.tick)
        poolData.current = [PoolState.EXISTS, pool]
      } catch (e) {
        poolData.current = [PoolState.INVALID, null]
      }
    }
    getPool()
  }, [contract, fee, poolAddress, tokenA, tokenB])
  return poolData.current
}

//return [Token, best pool's token price in ETH]
function useTokensPriceInETH(
  chainId: number | undefined,
  poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][],
): [Token, number][] | undefined {
  const pools = usePools(poolKeys)

  if (chainId !== UniverseChainId.Mainnet || chainId === undefined) {
    return undefined
  }

  const weth9 = WRAPPED_NATIVE_CURRENCY[chainId]

  //
  // Remain only one pool fee which is the largest liquidity
  // and filter other small liquidity pool fee
  // ex)
  //   ETH, USDC, 0.05% fee pool = 1000 liquidity
  //   ETH, USDC, 0.3% fee pool = 700 liquidity
  //   ETH, USDC, 1% fee pool = 500 liquidity
  //   => remain only ETH, USDC, 1% fee pool
  //
  const bestPools: Pool[] = []

  pools.map((data) => {
    const poolState = data[0]
    const newPool = data[1]
    if (poolState === PoolState.EXISTS && newPool) {
      if (bestPools.length === 0) {
        bestPools.push(newPool)
      } else {
        const bestPoolToken0 = bestPools[bestPools.length - 1].token0
        const bestPoolToken1 = bestPools[bestPools.length - 1].token1
        const bestPoolFee = bestPools[bestPools.length - 1].fee
        const newPooltoken0 = newPool.token0
        const newPooltoken1 = newPool.token1
        const newPoolfee = newPool.fee

        // in case of same tokens but different fee pool
        if (
          (bestPoolToken0.equals(newPooltoken0) &&
            bestPoolToken1.equals(newPooltoken1) &&
            bestPoolFee !== newPoolfee) ||
          (bestPoolToken0.equals(newPooltoken1) && bestPoolToken1.equals(newPooltoken0) && bestPoolFee !== newPoolfee)
        ) {
          const bestPoolLiquidity = bestPools[bestPools.length - 1].liquidity
          const newliquidity = newPool.liquidity
          if (JSBI.lessThan(bestPoolLiquidity, newliquidity)) {
            bestPools.pop()
            bestPools.push(newPool)
          }
        } else {
          // if new tokens pool
          bestPools.push(newPool)
        }
      }
    }
    return null
  })

  // [Token, best pool's token price in ETH]
  const tokensPriceInETH: [Token, number][] = []

  for (let i = 0; i < bestPools.length; i++) {
    if (weth9 && bestPools[i].token0.equals(weth9)) {
      const token1Price = bestPools[i].token1Price.quote(
        CurrencyAmount.fromRawAmount(
          bestPools[i].token1,
          JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(bestPools[i].token1.decimals)),
        ),
      ).quotient
      const ethDecimal = Math.pow(10, 18).toFixed(18)
      const token1PriceInETH = parseFloat(token1Price.toString()) / parseFloat(ethDecimal)
      tokensPriceInETH.push([bestPools[i].token1, token1PriceInETH])
    } else {
      const token0Price = bestPools[i].token0Price.quote(
        CurrencyAmount.fromRawAmount(
          bestPools[i].token0,
          JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(bestPools[i].token0.decimals)),
        ),
      ).quotient
      const ethDecimal = Math.pow(10, 18).toFixed(18)
      const token1PriceInETH = parseFloat(token0Price.toString()) / parseFloat(ethDecimal)
      tokensPriceInETH.push([bestPools[i].token0, token1PriceInETH])
    }
  }

  return tokensPriceInETH
}

export function useETHPriceInUSD(chainId: number | undefined): number | undefined {
  const poolTokens: [Token | undefined, Token | undefined, FeeAmount | undefined][] = []
  if (chainId === UniverseChainId.Mainnet) {
    poolTokens.push([WRAPPED_NATIVE_CURRENCY[chainId], USDC_MAINNET, FeeAmount.HIGH])
    poolTokens.push([WRAPPED_NATIVE_CURRENCY[chainId], USDC_MAINNET, FeeAmount.MEDIUM])
    poolTokens.push([WRAPPED_NATIVE_CURRENCY[chainId], USDC_MAINNET, FeeAmount.LOW])
  }

  const pools = usePools(poolTokens)
  if (chainId === undefined) {
    return undefined
  }

  const weth9 = WRAPPED_NATIVE_CURRENCY[chainId]
  let bestLiquidity = '0'
  let bestPool = 0
  pools.map((data, index) => {
    const poolState = data[0]
    const newPool = data[1]
    if (poolState === PoolState.EXISTS && newPool) {
      if (JSBI.GT(newPool.liquidity, JSBI.BigInt(bestLiquidity))) {
        bestLiquidity = newPool.liquidity.toString()
        bestPool = index
      }
    }
    return null
  })

  const poolState = pools[bestPool][0]
  const pool = pools[bestPool][1]
  if (poolState === PoolState.EXISTS && pool) {
    const token0 = pool.token0
    if (weth9 && token0.equals(weth9)) {
      const token0Price = pool.token0Price.quote(
        CurrencyAmount.fromRawAmount(
          pool.token0,
          JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(pool.token0.decimals)),
        ),
      ).quotient
      const token0PriceDecimal = parseFloat(token0Price.toString()).toFixed(18)
      const usdcDecimal = Math.pow(10, USDC_MAINNET.decimals).toFixed(18)
      const priceInUSD = parseFloat(token0PriceDecimal) / parseFloat(usdcDecimal)
      return priceInUSD
    } else {
      const token1Price = pool.token1Price.quote(
        CurrencyAmount.fromRawAmount(
          pool.token1,
          JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(pool.token1.decimals)),
        ),
      ).quotient
      const token1PriceDecimal = parseFloat(token1Price.toString()).toFixed(18)
      const usdcDecimal = Math.pow(10, USDC_MAINNET.decimals).toFixed(18)
      const priceInUSD = parseFloat(token1PriceDecimal) / parseFloat(usdcDecimal)
      return priceInUSD
    }
  } else {
    return undefined
  }
}

function getCurrencyAmount(tokens: CurrencyAmount<Token>[], tokenAddress: string): CurrencyAmount<Token> | undefined {
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].currency.address.toUpperCase() === tokenAddress.toUpperCase()) {
      return tokens[i]
    }
  }
  return undefined
}

// return : [Token, token's amount, token's price in USD]
export function useTokensPriceInUSD(
  chainId: number | undefined,
  weth9: Token | undefined,
  ethPriceInUSDC: number | undefined,
  tokens: CurrencyAmount<Token>[] | undefined,
): [CurrencyAmount<Token>, number][] {
  const tokensPools: [Token | undefined, Token | undefined, FeeAmount | undefined][] = []
  // // get token's amount
  if (tokens) {
    tokens.map((data) => {
      tokensPools.push([
        new Token(
          chainId ?? UniverseChainId.Mainnet,
          data.currency.address,
          data.currency.decimals,
          data.currency.symbol,
        ),
        weth9,
        FeeAmount.HIGH,
      ])
      tokensPools.push([
        new Token(
          chainId ?? UniverseChainId.Mainnet,
          data.currency.address,
          data.currency.decimals,
          data.currency.symbol,
        ),
        weth9,
        FeeAmount.MEDIUM,
      ])
      tokensPools.push([
        new Token(
          chainId ?? UniverseChainId.Mainnet,
          data.currency.address,
          data.currency.decimals,
          data.currency.symbol,
        ),
        weth9,
        FeeAmount.LOW,
      ])

      return null
    })
  }

  // get token's price in ETH
  // weth9 is removed after useTokensPriceInETH()
  const tokensPriceInETH = useTokensPriceInETH(chainId, tokensPools)
  //[Token, token's amount, token's price in USD]
  const tokensPriceInUSD: [CurrencyAmount<Token>, number][] = []
  if (tokens && ethPriceInUSDC && tokensPriceInETH && weth9 !== undefined) {
    tokensPriceInETH.map((data) => {
      const tokenAddress = data[0].address
      const priceInETH = data[1]

      const currencyAmount = getCurrencyAmount(tokens, tokenAddress)
      if (currencyAmount) {
        const decimals = currencyAmount.currency.decimals
        const decimal = 10 ** decimals
        const tokenAmount = Number(currencyAmount.quotient.toString()) / decimal
        tokensPriceInUSD.push([currencyAmount, tokenAmount * priceInETH * ethPriceInUSDC])
      }
      return null
    })

    // if weth9 exist add amount
    const weth9CurrencyAmount = getCurrencyAmount(tokens, weth9.address)
    if (weth9CurrencyAmount) {
      const weth9Decimal = 10 ** 18
      const weth9Amount = Number(weth9CurrencyAmount.quotient.toString()) / Number(weth9Decimal)
      tokensPriceInUSD.push([
        CurrencyAmount.fromRawAmount(weth9, weth9CurrencyAmount.quotient),
        weth9Amount * ethPriceInUSDC,
      ])
    }
  }

  return tokensPriceInUSD
}
