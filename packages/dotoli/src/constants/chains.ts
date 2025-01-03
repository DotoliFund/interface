/**
 * List of all the networks supported by the Uniswap Interface
 */
export enum SupportedChainId {
    MAINNET = 1,
    GOERLI = 5,
  
    // ARBITRUM_ONE = 42161,
  
    // OPTIMISM = 10,
    // OPTIMISM_GOERLI = 420,
  
    // POLYGON = 137,
    // POLYGON_MUMBAI = 80001,
  }
  
  export const CHAIN_IDS_TO_NAMES = {
    [SupportedChainId.MAINNET]: 'mainnet',
    [SupportedChainId.GOERLI]: 'goerli',
  }
  
  /**
   * Array of all the supported chain IDs
   */
  export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
    (id) => typeof id === 'number'
  ) as SupportedChainId[]
  
  export function isSupportedChain(chainId: number | null | undefined): chainId is SupportedChainId {
    return !!chainId && !!SupportedChainId[chainId]
  }
  
  export const SUPPORTED_GAS_ESTIMATE_CHAIN_IDS = [SupportedChainId.MAINNET]
  
  /**
   * All the chain IDs that are running the Ethereum protocol.
   */
  const L1_CHAIN_IDS = [SupportedChainId.MAINNET, SupportedChainId.GOERLI] as const
  
  export type SupportedL1ChainId = (typeof L1_CHAIN_IDS)[number]
  
  /**
   * Controls some L2 specific behavior, e.g. slippage tolerance, special UI behavior.
   * The expectation is that all of these networks have immediate transaction confirmation.
   */
  const L2_CHAIN_IDS = [] as const
  
  export type SupportedL2ChainId = (typeof L2_CHAIN_IDS)[number]
  