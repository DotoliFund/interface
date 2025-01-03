import { SupportedChainId } from './chains'

type AddressMap = { [chainId: number]: string }

const DEFAULT_NETWORKS = [SupportedChainId.MAINNET, SupportedChainId.GOERLI]

export function constructSameAddressMap<T extends string>(
  address: T,
  additionalNetworks: SupportedChainId[] = []
): { [chainId: number]: T } {
  return DEFAULT_NETWORKS.concat(additionalNetworks).reduce<{ [chainId: number]: T }>((memo, chainId) => {
    memo[chainId] = address
    return memo
  }, {})
}

//mainnet
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
export const DOTOLI_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0xFd78b26D1E5fcAC01ba43479a44afB69a8073716', [SupportedChainId.MAINNET]),
}
export const DOTOLI_STAKING_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0x480E6993dA410D5026D7bD3652F53D99845B6fc3', [SupportedChainId.MAINNET]),
}
export const DOTOLI_SETTING_ADDRESSES = '0x5E1cE0e492f956b4a1A1963E4A465256C060966c'
export const DOTOLI_INFO_ADDRESSES = '0xD72008394f456362765446aD8638a0B0ee226d70'
export const DOTOLI_FUND_ADDRESSES = '0x5EA02ce75D173f03C88831893C69724C3F38df5e'
export const VOTE_URL = 'https://www.tally.xyz/gov/dotoli3'
