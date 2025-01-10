import { Interface } from '@ethersproject/abi'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import DotoliStakingJson from '../abis/DotoliStaking.json'

import { MethodParameters, toHex } from './utils/calldata'

export abstract class DotoliStaking {
  public static INTERFACE: Interface = new Interface(DotoliStakingJson.abi)

  public static stakeCallParameters(amount: CurrencyAmount<Currency>): MethodParameters {
    const calldata: string = DotoliStaking.INTERFACE.encodeFunctionData('stake', [toHex(amount.quotient)])
    const value: string = toHex(0)
    return {
      calldata,
      value,
    }
  }

  public static unstakingCallParameters(amount: CurrencyAmount<Currency>): MethodParameters {
    const calldata: string = DotoliStaking.INTERFACE.encodeFunctionData('withdraw', [toHex(amount.quotient)])
    const value: string = toHex(0)
    return {
      calldata,
      value,
    }
  }

  public static claimRewardCallParameters(amount: CurrencyAmount<Currency>): MethodParameters {
    const calldata: string = DotoliStaking.INTERFACE.encodeFunctionData('claimReward', [toHex(amount.quotient)])
    const value: string = toHex(0)
    return {
      calldata,
      value,
    }
  }
}
