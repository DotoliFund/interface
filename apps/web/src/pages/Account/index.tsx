import { InterfacePageName } from '@uniswap/analytics-events'
import { useWeb3React } from '@web3-react/core'
// import { useAccountDrawer } from 'components/AccountDrawer/MiniPortfolio/hooks'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
// import FundList from 'components/FundList'
import { SwitchLocaleLink } from 'components/SwitchLocaleLink'
import { useIsSupportedChainId } from 'constants/chains'
import { FundDetails } from 'dotoli/src/types/fund'
import { useAccount } from 'hooks/useAccount'
import { useDotoliInfoContract } from 'hooks/useContract'
// import { useFilterPossiblyMaliciousPositions } from 'hooks/useFilterPossiblyMaliciousPositions'
// import { useV3Positions } from 'hooks/useV3Positions'
import JSBI from 'jsbi'
import { useSingleCallResult } from 'lib/hooks/multicall'
import deprecatedStyled, { css } from 'lib/styled-components'
import CTACards from 'pages/Account/CTACards'
// import { LoadingRows } from 'pages/Account/styled'
import { useEffect, useState } from 'react'
import { AlertTriangle } from 'react-feather'
import { Link } from 'react-router-dom'
// import { useUserHideClosedPositions } from 'state/user/hooks'
import { HideSmall } from 'theme/components'
// import { PositionDetails } from 'types/position'
import { Flex, Text } from 'ui/src'
import Trace from 'uniswap/src/features/telemetry/Trace'
import { t, useTranslation } from 'uniswap/src/i18n'

const PageWrapper = deprecatedStyled(AutoColumn)`
  padding: 68px 8px 0px;
  max-width: 870px;
  width: 100%;

  @media (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    max-width: 800px;
    padding-top: 48px;
  }

  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    max-width: 500px;
    padding-top: 20px;
  }
`

const ErrorContainer = deprecatedStyled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  max-width: 300px;
  min-height: 25vh;
`

const IconStyle = css`
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
`

const NetworkIcon = deprecatedStyled(AlertTriangle)`
  ${IconStyle}
`

// const InboxIcon = deprecatedStyled(Inbox)`
//   ${IconStyle}
// `

const ResponsiveButtonPrimary = deprecatedStyled(ButtonPrimary)`
  border-radius: 12px;
  font-size: 16px;
  padding: 6px 8px;
  white-space: nowrap;
  @media (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    flex: 1 1 auto;
    width: 50%;
  }
`

const MainContentWrapper = deprecatedStyled.main`
  background-color: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.surface3};
  padding: 0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

// function PositionsLoadingPlaceholder() {
//   return (
//     <LoadingRows>
//       <div />
//       <div />
//       <div />
//       <div />
//       <div />
//       <div />
//       <div />
//       <div />
//       <div />
//       <div />
//       <div />
//       <div />
//     </LoadingRows>
//   )
// }

function WrongNetworkCard() {
  return (
    <>
      <PageWrapper>
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <Flex row p="$none" gap="$gap12">
              <Text variant="heading2">{t('myaccount.title')}</Text>
            </Flex>

            <MainContentWrapper>
              <ErrorContainer>
                <Text variant="body1" color="$neutral3" textAlign="center">
                  <NetworkIcon strokeWidth={1.2} />
                </Text>
              </ErrorContainer>
            </MainContentWrapper>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
      <SwitchLocaleLink />
    </>
  )
}

export default function Account() {
  const { t } = useTranslation()
  const { provider } = useWeb3React()
  const account = useAccount()
  const isSupportedChain = useIsSupportedChainId(account.chainId)
  // const accountDrawer = useAccountDrawer()

  // const theme = useTheme()

  const DotoliInfoContract = useDotoliInfoContract()
  const { loading: managingFundLoading, result: [managingFund] = [] } = useSingleCallResult(
    DotoliInfoContract,
    'managingFund',
    [account.address ?? undefined],
  )

  const [managingFundInfo, setManagingFundInfo] = useState<FundDetails[]>()
  const [managingFundInfoLoading, setManagingFundInfoLoading] = useState(false)
  useEffect(() => {
    if (managingFundLoading) {
      setManagingFundInfoLoading(true)
    }
    if (!managingFundLoading) {
      getInfo()
      setManagingFundInfoLoading(false)
    }
    async function getInfo() {
      if (managingFund && JSBI.BigInt(managingFund).toString() !== '0' && provider && account.address) {
        setManagingFundInfo([
          {
            fundId: JSBI.BigInt(managingFund).toString(),
            investor: account.address ?? '',
          },
        ])
      } else {
        setManagingFundInfo(undefined)
      }
    }
  }, [managingFundLoading, managingFund, provider, account.address])

  // const [userHideClosedPositions, setUserHideClosedPositions] = useUserHideClosedPositions()
  // const { positions } = useV3Positions(account.address)
  // const [closedPositions] = positions?.reduce<[PositionDetails[], PositionDetails[]]>(
  //   (acc, p) => {
  //     acc[p.liquidity?.isZero() ? 1 : 0].push(p)
  //     return acc
  //   },
  //   [[], []],
  // ) ?? [[], []]

  // const userSelectedPositionSet = useMemo(
  //   () => [...openPositions, ...(userHideClosedPositions ? [] : closedPositions)],
  //   [closedPositions, openPositions, userHideClosedPositions],
  // )

  // const filteredPositions = useFilterPossiblyMaliciousPositions(userSelectedPositionSet)

  if (!isSupportedChain) {
    return <WrongNetworkCard />
  }

  // const showConnectAWallet = !account

  return (
    <Trace logImpression page={InterfacePageName.POOL_PAGE}>
      <PageWrapper>
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <Flex
              row
              alignItems="center"
              justifyContent="space-between"
              p="$none"
              gap="$gap12"
              $md={{ flexWrap: 'wrap', width: '100%' }}
            >
              <Flex row alignItems="center" gap="$spacing8" width="content">
                <Text variant="heading2">{t('myaccount.title')}</Text>
              </Flex>
              <Flex row gap="8px" $md={{ width: '100%' }}>
                <ResponsiveButtonPrimary data-cy="join-pool-button" id="join-pool-button" as={Link} to="/add/ETH">
                  {t('pool.newPosition.plus')}
                </ResponsiveButtonPrimary>
              </Flex>
            </Flex>

            <MainContentWrapper>
              <div>
                {managingFundInfo && !managingFundInfoLoading && managingFundInfo.length > 0
                  ? managingFundInfo?.[0].investor.toString()
                  : 'test123'}
              </div>
            </MainContentWrapper>
            <HideSmall>
              <CTACards />
            </HideSmall>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
      <SwitchLocaleLink />
    </Trace>
  )
}
