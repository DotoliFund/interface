import { Interface } from '@ethersproject/abi'
import { BigintIsh, NativeCurrency } from '@uniswap/sdk-core'
import IDotoliFactory from 'abis/DotoliFactory.json'
import JSBI from 'jsbi'

import { MethodParameters, toHex } from './utils/calldata'

const MaxUint128 = toHex(JSBI.subtract(JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(128)), JSBI.BigInt(1)))

export interface MintSpecificOptions {
  /**
   * The account that should receive the minted NFT.
   */
  recipient: string

  /**
   * When the transaction expires, in epoch seconds.
   */
  deadline: BigintIsh
}

export interface IncreaseSpecificOptions {
  /**
   * Indicates the ID of the position to increase liquidity for.
   */
  tokenId: BigintIsh
}

/**
 * Options for producing the calldata to add liquidity.
 */
export interface CommonAddLiquidityOptions {
  /**
   * When the transaction expires, in epoch seconds.
   */
  deadline: BigintIsh

  /**
   * Whether to spend ether. If true, one of the pool tokens must be WETH, by default false
   */
  useNative?: NativeCurrency
}

export type MintOptions = CommonAddLiquidityOptions & MintSpecificOptions
export type IncreaseOptions = CommonAddLiquidityOptions & IncreaseSpecificOptions

export type AddLiquidityOptions = MintOptions | IncreaseOptions

export abstract class DotoliFactory {
  public static INTERFACE: Interface = new Interface(IDotoliFactory.abi)

  public static createCallParameters(): MethodParameters {
    const calldata: string = DotoliFactory.INTERFACE.encodeFunctionData('createFund')
    const value: string = toHex(0)
    return {
      calldata,
      value,
    }
  }

  public static subscribeCallParameters(fund: string): MethodParameters {
    const calldata: string = DotoliFactory.INTERFACE.encodeFunctionData('subscribe', [fund])
    const value: string = toHex(0)
    return {
      calldata,
      value,
    }
  }
}
