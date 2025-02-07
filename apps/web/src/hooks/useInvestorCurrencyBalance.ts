import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { useCurrency } from 'hooks/Tokens'
import { useDotoliInfoContract } from 'hooks/useContract'
import JSBI from 'jsbi'
import { useSingleCallResult } from 'lib/hooks/multicall'

export default function useInvestorCurrencyBalance(
  fundId: string | undefined,
  investor: string | undefined,
  token: string | undefined,
): CurrencyAmount<Currency> | undefined {
  const DotoliInfoContract = useDotoliInfoContract()
  const inputCurrency = useCurrency(token)

  const { loading: tokenBalancesLoading, result: [tokenBalances] = [] } = useSingleCallResult(
    DotoliInfoContract,
    'getInvestorTokenAmount',
    [fundId, investor, token],
  )
  if (!tokenBalancesLoading && inputCurrency && tokenBalances) {
    return CurrencyAmount.fromRawAmount(inputCurrency, JSBI.BigInt(tokenBalances.toString()))
  } else {
    return undefined
  }
}
