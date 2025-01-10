import { Interface } from '@ethersproject/abi'
import DotoliInfoABI from '../abis/DotoliInfo.json'

import { MethodParameters, toHex } from './utils/calldata'

export abstract class DotoliInfo {
  public static INTERFACE: Interface = new Interface(DotoliInfoABI.abi)

  public static createCallParameters(): MethodParameters {
    const calldata: string = DotoliInfo.INTERFACE.encodeFunctionData('createFund')
    const value: string = toHex(0)
    return {
      calldata,
      value,
    }
  }

  public static subscribeCallParameters(fundId: string): MethodParameters {
    const calldata: string = DotoliInfo.INTERFACE.encodeFunctionData('subscribe', [fundId])
    const value: string = toHex(0)
    return {
      calldata,
      value,
    }
  }
}
