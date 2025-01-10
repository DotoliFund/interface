import { Interface } from '@ethersproject/abi'
import { Protocol, RouteV3, Trade } from '@uniswap/router-sdk'
import { BigintIsh, Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'
import { encodeRouteToPath, Position, Trade as V3Trade } from '@uniswap/v3-sdk'
import DotoliFundABI from '../abis/DotoliFund.json'
import { NULL_ADDRESS } from '../constants/addresses'
import JSBI from 'jsbi'
import invariant from 'tiny-invariant'

import { MethodParameters, toHex } from './utils/calldata'

const MaxUint128 = toHex(JSBI.subtract(JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(128)), JSBI.BigInt(1)))

enum SwapType {
  EXACT_INPUT_SINGLE_HOP,
  EXACT_INPUT_MULTI_HOP,
  EXACT_OUTPUT_SINGLE_HOP,
  EXACT_OUTPUT_MULTI_HOP,
}

/**
 * SwapParams for producing the arguments to send calls to the router.
 */
interface SwapParams {
  swapType: SwapType
  tokenIn: string
  tokenOut: string
  fee: number
  amountIn: string
  amountOut: string
  amountInMaximum: string
  amountOutMinimum: string
  sqrtPriceLimitX96: number
  path: string
}

interface MintPositionParams {
  token0: string
  token1: string
  fee: number
  tickLower: number
  tickUpper: number
  amount0Desired: string
  amount1Desired: string
  amount0Min: string
  amount1Min: string
  deadline: string
}

interface IncreaseLiquidityParams {
  tokenId: string
  amount0Desired: string
  amount1Desired: string
  amount0Min: string
  amount1Min: string
  deadline: string
}

interface CollectPositionFeeParams {
  tokenId: string
  amount0Max: string
  amount1Max: string
}

interface DecreaseLiquidityParams {
  tokenId: string
  liquidity: string
  amount0Min: string
  amount1Min: string
  deadline: string
}

/**
 * Options for producing the arguments to send calls to the router.
 */
interface SwapOptions {
  /**
   * How much the execution price is allowed to move unfavorably from the trade execution price.
   */
  slippageTolerance: Percent
}

interface MintSpecificOptions {
  /**
   * Creates pool if not initialized before mint.
   */
  createPool?: boolean
}

interface IncreaseSpecificOptions {
  /**
   * Indicates the ID of the position to increase liquidity for.
   */
  tokenId: BigintIsh
}

/**
 * Options for producing the calldata to add liquidity.
 */
interface CommonAddLiquidityOptions {
  /**
   * How much the pool price is allowed to move.
   */
  slippageTolerance: Percent

  /**
   * When the transaction expires, in epoch seconds.
   */
  deadline: BigintIsh
}

type MintOptions = CommonAddLiquidityOptions & MintSpecificOptions
type IncreaseOptions = CommonAddLiquidityOptions & IncreaseSpecificOptions

type AddLiquidityOptions = MintOptions | IncreaseOptions

const ZERO = JSBI.BigInt(0)

// type guard
function isMint(options: AddLiquidityOptions): options is MintOptions {
  return Object.keys(options).some((k) => k === 'createPool')
}

interface CollectOptions {
  /**
   * Indicates the ID of the position to collect for.
   */
  tokenId: BigintIsh

  /**
   * Expected value of tokensOwed0, including as-of-yet-unaccounted-for fees/liquidity value to be burned
   */
  expectedCurrencyOwed0: CurrencyAmount<Currency>

  /**
   * Expected value of tokensOwed1, including as-of-yet-unaccounted-for fees/liquidity value to be burned
   */
  expectedCurrencyOwed1: CurrencyAmount<Currency>
}

interface NFTPermitOptions {
  v: 0 | 1 | 27 | 28
  r: string
  s: string
  deadline: BigintIsh
  spender: string
}

/**
 * Options for producing the calldata to exit a position.
 */
interface RemoveLiquidityOptions {
  /**
   * The ID of the token to exit
   */
  tokenId: BigintIsh

  /**
   * The percentage of position liquidity to exit.
   */
  liquidityPercentage: Percent

  /**
   * How much the pool price is allowed to move.
   */
  slippageTolerance: Percent

  /**
   * When the transaction expires, in epoch seconds.
   */
  deadline: BigintIsh

  /**
   * Whether the NFT should be burned if the entire position is being exited, by default false.
   */
  burnToken?: boolean

  /**
   * The optional permit of the token ID being exited, in case the exit transaction is being sent by an account that does not own the NFT
   */
  permit?: NFTPermitOptions

  /**
   * Parameters to be passed on to collect
   */
  collectOptions: Omit<CollectOptions, 'tokenId'>
}

export abstract class DotoliFund {
  public static INTERFACE: Interface = new Interface(DotoliFundABI.abi)

  public static depositCallParameters(
    fundId: string,
    token: string,
    amount: CurrencyAmount<Currency>
  ): MethodParameters {
    const calldata: string = DotoliFund.INTERFACE.encodeFunctionData('deposit', [fundId, token, toHex(amount.quotient)])
    const value: string = toHex(0)
    return {
      calldata,
      value,
    }
  }

  public static withdrawCallParameters(
    fundId: string,
    token: string,
    amount: CurrencyAmount<Currency>
  ): MethodParameters {
    const calldata: string = DotoliFund.INTERFACE.encodeFunctionData('withdraw', [
      fundId,
      token,
      toHex(amount.quotient),
    ])
    const value: string = toHex(0)
    return {
      calldata,
      value,
    }
  }

  public static withdrawFeeCallParameters(
    fundId: string,
    token: string,
    amount: CurrencyAmount<Currency>
  ): MethodParameters {
    const calldata: string = DotoliFund.INTERFACE.encodeFunctionData('withdrawFee', [
      fundId,
      token,
      toHex(amount.quotient),
    ])
    const value: string = toHex(0)
    return {
      calldata,
      value,
    }
  }

  /**
   * @notice Generates the calldata for a Swap with a V3 Route.
   * @param trade The V3Trade to encode.
   * @param options SwapOptions to use for the trade.
   * @returns A string array of calldatas for the trade.
   */
  private static encodeV3Swap(trade: V3Trade<Currency, Currency, TradeType>, options: SwapOptions): SwapParams[] {
    const params: SwapParams[] = []

    for (const { route, inputAmount, outputAmount } of trade.swaps) {
      const amountIn: string = toHex(trade.maximumAmountIn(options.slippageTolerance, inputAmount).quotient)
      const amountOut: string = toHex(trade.minimumAmountOut(options.slippageTolerance, outputAmount).quotient)

      // flag for whether the trade is single hop or not
      const singleHop = route.pools.length === 1

      if (singleHop) {
        if (trade.tradeType === TradeType.EXACT_INPUT) {
          invariant(route.tokenPath[0] && route.tokenPath[1] && route.pools[0], 'MISSING_PATH_OR_POOL')
          params.push({
            swapType: SwapType.EXACT_INPUT_SINGLE_HOP,
            tokenIn: route.tokenPath[0].address,
            tokenOut: route.tokenPath[1].address,
            fee: route.pools[0].fee,
            amountIn,
            amountOut: toHex(0),
            amountInMaximum: toHex(0),
            amountOutMinimum: amountOut,
            sqrtPriceLimitX96: 0,
            path: toHex(''),
          })
        }
      } else {
        const path: string = encodeRouteToPath(route, trade.tradeType === TradeType.EXACT_OUTPUT)

        if (trade.tradeType === TradeType.EXACT_INPUT) {
          //exactInputParams
          params.push({
            swapType: SwapType.EXACT_INPUT_MULTI_HOP,
            tokenIn: NULL_ADDRESS,
            tokenOut: NULL_ADDRESS,
            fee: 0,
            amountIn,
            amountOut: toHex(0),
            amountInMaximum: toHex(0),
            amountOutMinimum: amountOut,
            sqrtPriceLimitX96: 0,
            path,
          })
        }
      }
    }

    return params
  }

  /**
   * @notice Generates the calldata for a Swap with a V3 Route.
   * @param trade The V3Trade to encode.
   * @param options SwapOptions to use for the trade.
   * @returns A string array of calldatas for the trade.
   */
  private static encodeSwaps(
    trades:
      | Trade<Currency, Currency, TradeType>
      | V3Trade<Currency, Currency, TradeType>
      | V3Trade<Currency, Currency, TradeType>[],
    options: SwapOptions
  ): {
    params: SwapParams[]
  } {
    // If dealing with an instance of the aggregated Trade object, unbundle it to individual trade objects.
    if (trades instanceof Trade) {
      invariant(
        trades.swaps.every((swap) => swap.route.protocol === Protocol.V3),
        'UNSUPPORTED_PROTOCOL'
      )

      const individualTrades: V3Trade<Currency, Currency, TradeType>[] = []

      for (const { route, inputAmount, outputAmount } of trades.swaps) {
        if (route.protocol === Protocol.V3) {
          individualTrades.push(
            V3Trade.createUncheckedTrade({
              route: route as RouteV3<Currency, Currency>,
              inputAmount,
              outputAmount,
              tradeType: trades.tradeType,
            })
          )
        } else {
          throw new Error('UNSUPPORTED_TRADE_PROTOCOL')
        }
      }
      trades = individualTrades
    }

    if (!Array.isArray(trades)) {
      trades = [trades]
    }

    invariant(trades.length > 0, 'NO_TRADES')
    const firstTrade = trades[0]
    invariant(firstTrade instanceof V3Trade, 'INVALID_TRADE_TYPE')
    const sampleTrade: V3Trade<Currency, Currency, TradeType> = firstTrade

    // All trades should have the same starting/ending currency and trade type
    invariant(
      trades.every((trade) => trade.inputAmount.currency.equals(sampleTrade.inputAmount.currency)),
      'TOKEN_IN_DIFF'
    )
    invariant(
      trades.every((trade) => trade.outputAmount.currency.equals(sampleTrade.outputAmount.currency)),
      'TOKEN_OUT_DIFF'
    )
    invariant(
      trades.every((trade) => trade.tradeType === sampleTrade.tradeType),
      'TRADE_TYPE_DIFF'
    )

    const params: SwapParams[] = []

    for (const trade of trades) {
      if (trade instanceof V3Trade) {
        for (const param of DotoliFund.encodeV3Swap(trade, options)) {
          params.push(param)
        }
      } else {
        throw new Error('Unsupported trade object')
      }
    }

    return {
      params,
    }
  }

  public static swapCallParameters(
    fundId: string,
    investor: string,
    trades:
      | Trade<Currency, Currency, TradeType>
      | V3Trade<Currency, Currency, TradeType>
      | V3Trade<Currency, Currency, TradeType>[],
    options: SwapOptions
  ): MethodParameters {
    const value = toHex(0)

    const { params } = DotoliFund.encodeSwaps(trades, options)

    return {
      calldata: DotoliFund.INTERFACE.encodeFunctionData('swap', [fundId, investor, params]),
      value,
    }
  }

  public static addLiquidityCallParameters(
    fundId: string,
    investor: string,
    position: Position,
    options: AddLiquidityOptions
  ): MethodParameters {
    invariant(JSBI.greaterThan(position.liquidity, ZERO), 'ZERO_LIQUIDITY')

    // get amounts
    const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts

    // adjust for slippage
    const minimumAmounts = position.mintAmountsWithSlippage(options.slippageTolerance)
    const amount0Min = toHex(minimumAmounts.amount0)
    const amount1Min = toHex(minimumAmounts.amount1)

    const deadline = toHex(options.deadline)

    // mint
    if (isMint(options)) {
      const params: MintPositionParams = {
        token0: position.pool.token0.address,
        token1: position.pool.token1.address,
        fee: position.pool.fee,
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
        amount0Desired: toHex(amount0Desired),
        amount1Desired: toHex(amount1Desired),
        amount0Min,
        amount1Min,
        deadline,
      }

      return {
        calldata: DotoliFund.INTERFACE.encodeFunctionData('mintNewPosition', [fundId, investor, params]),
        value: toHex(0),
      }
    } else {
      // increase
      const params: IncreaseLiquidityParams = {
        tokenId: toHex(options.tokenId),
        amount0Desired: toHex(amount0Desired),
        amount1Desired: toHex(amount1Desired),
        amount0Min,
        amount1Min,
        deadline,
      }
      return {
        calldata: DotoliFund.INTERFACE.encodeFunctionData('increaseLiquidity', [fundId, params]),
        value: toHex(0),
      }
    }
  }

  public static collectPositionFeeCallParameters(fundId: string, options: CollectOptions): MethodParameters {
    const tokenId = toHex(options.tokenId)

    // collect
    const params: CollectPositionFeeParams = {
      tokenId,
      amount0Max: MaxUint128,
      amount1Max: MaxUint128,
    }

    return {
      calldata: DotoliFund.INTERFACE.encodeFunctionData('collectPositionFee', [fundId, params]),
      value: toHex(0),
    }
  }

  public static decreaseLiquidityCallParameters(
    fundId: string,
    position: Position,
    options: RemoveLiquidityOptions
  ): MethodParameters {
    const deadline = toHex(options.deadline)
    const tokenId = toHex(options.tokenId)

    // construct a partial position with a percentage of liquidity
    const partialPosition = new Position({
      pool: position.pool,
      liquidity: options.liquidityPercentage.multiply(position.liquidity).quotient,
      tickLower: position.tickLower,
      tickUpper: position.tickUpper,
    })
    invariant(JSBI.greaterThan(partialPosition.liquidity, ZERO), 'ZERO_LIQUIDITY')

    // slippage-adjusted underlying amounts
    const { amount0: amount0Min, amount1: amount1Min } = partialPosition.burnAmountsWithSlippage(
      options.slippageTolerance
    )

    // remove liquidity
    const params: DecreaseLiquidityParams = {
      tokenId,
      liquidity: toHex(partialPosition.liquidity),
      amount0Min: toHex(amount0Min),
      amount1Min: toHex(amount1Min),
      deadline,
    }

    return {
      calldata: DotoliFund.INTERFACE.encodeFunctionData('decreaseLiquidity', [fundId, params]),
      value: toHex(0),
    }
  }
}
