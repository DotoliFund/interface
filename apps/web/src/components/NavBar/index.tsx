import { Bag } from 'components/NavBar/Bag'
import { ChainSelector } from 'components/NavBar/ChainSelector'
import { CompanyMenu } from 'components/NavBar/CompanyMenu'
import { PreferenceMenu } from 'components/NavBar/PreferencesMenu'
import { useTabsVisible } from 'components/NavBar/ScreenSizes'
import { SearchBar } from 'components/NavBar/SearchBar'
import { Tabs } from 'components/NavBar/Tabs/Tabs'
import Row from 'components/Row'
import Web3Status from 'components/Web3Status'
import { useScreenSize } from 'hooks/screenSize'
import { useAccount } from 'hooks/useAccount'
import { useIsExplorePage } from 'hooks/useIsExplorePage'
import { useIsLandingPage } from 'hooks/useIsLandingPage'
import { useIsLimitPage } from 'hooks/useIsLimitPage'
import { useIsNftPage } from 'hooks/useIsNftPage'
import { useIsSendPage } from 'hooks/useIsSendPage'
import { useIsSwapPage } from 'hooks/useIsSwapPage'
import styled, { css } from 'lib/styled-components'
import { useProfilePageState } from 'nft/hooks'
import { ProfilePageStateType } from 'nft/types'
import { BREAKPOINTS, NAV_HEIGHT } from 'theme'
import { Z_INDEX } from 'theme/zIndex'
import { Experiments } from 'uniswap/src/features/gating/experiments'
import { FeatureFlags } from 'uniswap/src/features/gating/flags'
import { useExperimentGroupName, useFeatureFlagWithLoading } from 'uniswap/src/features/gating/hooks'

export enum AccountCTAsExperimentGroup {
  Control = 'Control', // Get the app / Connect
  SignInSignUp = 'SignIn-SignUp',
  LogInCreateAccount = 'LogIn-CreateAccount',
}

export function useIsAccountCTAExperimentControl() {
  const experimentGroupName = useExperimentGroupName(Experiments.AccountCTAs)
  return experimentGroupName === AccountCTAsExperimentGroup.Control || experimentGroupName === null
}

const Nav = styled.nav`
  padding: 0px 12px;
  width: 100%;
  height: ${NAV_HEIGHT}px;
  z-index: ${Z_INDEX.sticky};
  display: flex;
  align-items: center;
  justify-content: center;
`
const NavContents = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex: 1 auto 1;
`
const NavItems = css`
  gap: 12px;
  @media screen and (max-width: ${BREAKPOINTS.sm}px) {
    gap: 4px;
  }
`
const Left = styled(Row)`
  display: flex;
  align-items: center;
  wrap: nowrap;
  ${NavItems}
`
const Right = styled(Row)`
  justify-content: flex-end;
  ${NavItems}
`

function useShouldHideChainSelector() {
  const isNftPage = useIsNftPage()
  const isLandingPage = useIsLandingPage()
  const isSendPage = useIsSendPage()
  const isSwapPage = useIsSwapPage()
  const isLimitPage = useIsLimitPage()
  const isExplorePage = useIsExplorePage()
  const { value: multichainFlagEnabled, isLoading: isMultichainFlagLoading } = useFeatureFlagWithLoading(
    FeatureFlags.MultichainUX,
  )
  const { value: multichainExploreFlagEnabled, isLoading: isMultichainExploreFlagLoading } = useFeatureFlagWithLoading(
    FeatureFlags.MultichainExplore,
  )

  const baseHiddenPages = isNftPage
  const multichainHiddenPages = isLandingPage || isSendPage || isSwapPage || isLimitPage || baseHiddenPages
  const multichainExploreHiddenPages = multichainHiddenPages || isExplorePage

  const hideChainSelector =
    multichainExploreFlagEnabled || isMultichainExploreFlagLoading
      ? multichainExploreHiddenPages
      : multichainFlagEnabled || isMultichainFlagLoading
        ? multichainHiddenPages
        : baseHiddenPages

  return hideChainSelector
}

export default function Navbar() {
  const isNftPage = useIsNftPage()

  const sellPageState = useProfilePageState((state) => state.state)
  const isSmallScreen = !useScreenSize()['sm']
  const areTabsVisible = useTabsVisible()
  const collapseSearchBar = !useScreenSize()['lg']
  const account = useAccount()
  const NAV_SEARCH_MAX_HEIGHT = 'calc(100vh - 30px)'

  const hideChainSelector = useShouldHideChainSelector()

  return (
    <Nav>
      <NavContents>
        <Left>
          <CompanyMenu />
          {areTabsVisible && <Tabs />}
        </Left>
        <Right>
          {collapseSearchBar && <SearchBar maxHeight={NAV_SEARCH_MAX_HEIGHT} fullScreen={isSmallScreen} />}
          {isNftPage && sellPageState !== ProfilePageStateType.LISTING && <Bag />}
          {!account.isConnected && !account.isConnecting && <PreferenceMenu />}
          {!hideChainSelector && <ChainSelector isNavSelector />}
          <Web3Status />
        </Right>
      </NavContents>
    </Nav>
  )
}
