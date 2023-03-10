/// <reference types="react-scripts" />

declare module '@metamask/jazzicon' {
  export default function (diameter: number, seed: number): HTMLElement
}

interface Window {
  // walletLinkExtension is injected by the Coinbase Wallet extension
  walletLinkExtension?: any
  ethereum?: {
    // value that is populated and returns true by the Coinbase Wallet mobile dapp browser
    isCoinbaseWallet?: true
    isMetaMask?: true
    autoRefreshOnNetworkChange?: boolean
  }
  web3?: Record<string, unknown>
}

declare module 'babel-plugin-relay/macro' {
  export { graphql as default } from 'react-relay'
}
