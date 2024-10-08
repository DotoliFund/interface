import { createContext, ReactNode, useContext } from 'react'
import { FiatOnRampCurrency } from 'uniswap/src/features/fiatOnRamp/types'
import { TransactionState } from 'uniswap/src/features/transactions/types/transactionState'
import { WalletChainId } from 'uniswap/src/types/chains'
import { CurrencyField } from 'uniswap/src/types/currency'
import { NFTItem } from 'wallet/src/features/nfts/types'
import { getSendPrefilledState } from 'wallet/src/features/transactions/send/getSendPrefilledState'
import { getSwapPrefilledState } from 'wallet/src/features/transactions/swap/hooks/useSwapPrefilledState'

type NavigateToTransactionFlowTransactionState = {
  initialState: TransactionState
}

type NavigateToSwapFlowPartialState = {
  currencyField: CurrencyField
  currencyAddress: Address
  currencyChainId: WalletChainId
}

type NavigateToSendFlowPartialState = {
  chainId: WalletChainId
  currencyAddress?: Address
}

export type NavigateToSwapFlowArgs =
  // Depending on how much control you need, you can either pass a complete `TransactionState` object or just the currency, address and chain.
  NavigateToTransactionFlowTransactionState | NavigateToSwapFlowPartialState | undefined

// Same as above, but for send flow
export type NavigateToSendFlowArgs =
  | NavigateToTransactionFlowTransactionState
  | NavigateToSendFlowPartialState
  | undefined

function isNavigateToTransactionFlowArgsInitialState(
  args: NavigateToSwapFlowArgs | NavigateToSendFlowArgs,
): args is NavigateToTransactionFlowTransactionState {
  return Boolean(args && (args as NavigateToTransactionFlowTransactionState).initialState !== undefined)
}

function isNavigateToSwapFlowArgsPartialState(args: NavigateToSwapFlowArgs): args is NavigateToSwapFlowPartialState {
  return Boolean(args && (args as NavigateToSwapFlowPartialState).currencyAddress !== undefined)
}

function isNavigateToSendFlowArgsPartialState(args: NavigateToSendFlowArgs): args is NavigateToSendFlowPartialState {
  return Boolean(args && (args as NavigateToSendFlowPartialState).chainId !== undefined)
}

export function getNavigateToSwapFlowArgsInitialState(args: NavigateToSwapFlowArgs): TransactionState | undefined {
  return isNavigateToTransactionFlowArgsInitialState(args)
    ? args.initialState
    : isNavigateToSwapFlowArgsPartialState(args)
      ? getSwapPrefilledState(args)
      : undefined
}

export function getNavigateToSendFlowArgsInitialState(args: NavigateToSendFlowArgs): TransactionState | undefined {
  return isNavigateToTransactionFlowArgsInitialState(args)
    ? args.initialState
    : isNavigateToSendFlowArgsPartialState(args)
      ? getSendPrefilledState(args)
      : undefined
}

export type NavigateToNftItemArgs = {
  owner?: Address
  address: Address
  tokenId: string
  chainId?: WalletChainId
  isSpam?: boolean
  fallbackData?: NFTItem
}

export type NavigateToNftCollectionArgs = {
  collectionAddress: Address
}

export type NavigateToFiatOnRampArgs = {
  prefilledCurrency?: FiatOnRampCurrency
}

export type NavigateToExternalProfileArgs = {
  address: Address
}

export type ShareTokenArgs = {
  currencyId: string
}

export type ShareNftArgs = {
  contractAddress: string
  tokenId: string
}

export type WalletNavigationContextState = {
  navigateToAccountActivityList: () => void
  navigateToAccountTokenList: () => void
  // Action that should be taken when the user presses the "Buy crypto" or "Receive tokens" button when they open the Send flow with an empty wallet.
  navigateToBuyOrReceiveWithEmptyWallet: () => void
  navigateToExternalProfile: (args: NavigateToExternalProfileArgs) => void
  navigateToFiatOnRamp: (args: NavigateToFiatOnRampArgs) => void
  navigateToNftDetails: (args: NavigateToNftItemArgs) => void
  navigateToNftCollection: (args: NavigateToNftCollectionArgs) => void
  navigateToSwapFlow: (args: NavigateToSwapFlowArgs) => void
  navigateToTokenDetails: (currencyId: string) => void
  navigateToReceive: () => void
  navigateToSend: (args: NavigateToSendFlowArgs) => void
  handleShareNft: (args: ShareNftArgs) => void
  handleShareToken: (args: ShareTokenArgs) => void
}

export const WalletNavigationContext = createContext<WalletNavigationContextState | undefined>(undefined)

export function WalletNavigationProvider({
  children,
  ...props
}: {
  children: ReactNode
} & WalletNavigationContextState): JSX.Element {
  return <WalletNavigationContext.Provider value={props}>{children}</WalletNavigationContext.Provider>
}

export const useWalletNavigation = (): WalletNavigationContextState => {
  const walletNavigationContext = useContext(WalletNavigationContext)

  if (walletNavigationContext === undefined) {
    throw new Error('`useWalletNavigation` must be used inside of `WalletNavigationProvider`')
  }

  return walletNavigationContext
}
