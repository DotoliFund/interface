export { escapeRegExp } from './escapeRegExp'

// // returns the checksummed address if the address is valid, otherwise returns false
// function isAddress(value: any): string | false {
//   try {
//     return getAddress(value)
//   } catch {
//     return false
//   }
// }

// // shorten the checksummed version of the input address to have 0x + 4 characters at start and end
// function shortenAddress(address: string, chars = 4): string {
//   const parsed = isAddress(address)
//   if (!parsed) {
//     throw Error(`Invalid 'address' parameter '${address}'.`)
//   }
//   return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
// }

export function getEtherscanLink(
  data: string | undefined,
  type: 'transaction' | 'token' | 'address' | 'block',
): string {
  if (!data) {
    return ''
  }
  const prefix = `https://etherscan.io`

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'block': {
      return `${prefix}/block/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}
