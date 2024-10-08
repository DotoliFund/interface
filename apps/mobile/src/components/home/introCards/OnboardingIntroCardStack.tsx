import { SharedEventName } from '@uniswap/analytics-events'
import React, { useCallback, useMemo, useState } from 'react'
import { FadeIn, FadeOut } from 'react-native-reanimated'
import { useDispatch, useSelector } from 'react-redux'
import { navigate } from 'src/app/navigation/rootNavigation'
import { FundWalletModal } from 'src/components/home/introCards/FundWalletModal'
import { CardType, IntroCardProps } from 'src/components/home/introCards/IntroCard'
import { INTRO_CARD_MIN_HEIGHT, IntroCardStack, IntroCardWrapper } from 'src/components/home/introCards/IntroCardStack'
import { UnitagBanner } from 'src/components/unitags/UnitagBanner'
import { useUnitagClaimHandler } from 'src/features/unitags/useUnitagClaimHandler'
import { Flex } from 'ui/src'
import { Buy, Person, ShieldCheck, UniswapLogo } from 'ui/src/components/icons'
import { AnimatedFlex } from 'ui/src/components/layout/AnimatedFlex'
import { AccountType } from 'uniswap/src/features/accounts/types'
import { ElementName, MobileEventName } from 'uniswap/src/features/telemetry/constants'
import { sendAnalyticsEvent } from 'uniswap/src/features/telemetry/send'
import { OnboardingCardLoggingName } from 'uniswap/src/features/telemetry/types'
import { useTranslation } from 'uniswap/src/i18n'
import { ImportType, OnboardingEntryPoint } from 'uniswap/src/types/onboarding'
import { MobileScreens, OnboardingScreens } from 'uniswap/src/types/screens/mobile'
import {
  selectHasSkippedUnitagPrompt,
  selectHasViewedWelcomeWalletCard,
} from 'wallet/src/features/behaviorHistory/selectors'
import { setHasViewedWelcomeWalletCard } from 'wallet/src/features/behaviorHistory/slice'
import { UNITAG_SUFFIX_NO_LEADING_DOT } from 'wallet/src/features/unitags/constants'
import { useCanActiveAddressClaimUnitag } from 'wallet/src/features/unitags/hooks'
import { useActiveAccountWithThrow } from 'wallet/src/features/wallet/hooks'

type IntroCardWithName = IntroCardWrapper & {
  loggingName: OnboardingCardLoggingName
}

type OnboardingIntroCardStackProps = {
  onboardingRedesignHomeEnabled: boolean
  onboardingRedesignBackupEnabled: boolean
  isLoading?: boolean
}
export function OnboardingIntroCardStack({
  onboardingRedesignHomeEnabled,
  onboardingRedesignBackupEnabled,
  isLoading = false,
}: OnboardingIntroCardStackProps): JSX.Element | null {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const activeAccount = useActiveAccountWithThrow()
  const hasBackups = activeAccount.backups && activeAccount.backups.length > 0

  const welcomeCardTitle = t('onboarding.home.intro.welcome.title')
  const hasViewedWelcomeWalletCard = useSelector(selectHasViewedWelcomeWalletCard)

  const hasSkippedUnitagPrompt = useSelector(selectHasSkippedUnitagPrompt)
  const { canClaimUnitag } = useCanActiveAddressClaimUnitag()
  const { handleClaim: handleUnitagClaim, handleDismiss: handleUnitagDismiss } = useUnitagClaimHandler({
    address: activeAccount.address,
    entryPoint: MobileScreens.Home,
    analyticsEntryPoint: 'home',
  })

  const [showFundModal, setShowFundModal] = useState(false)

  const shouldPromptUnitag =
    activeAccount.type === AccountType.SignerMnemonic && !hasSkippedUnitagPrompt && canClaimUnitag

  const cards = useMemo(() => {
    if (!onboardingRedesignHomeEnabled && !onboardingRedesignBackupEnabled) {
      return []
    }

    const output: IntroCardWithName[] = []

    if (!hasViewedWelcomeWalletCard) {
      output.push({
        loggingName: OnboardingCardLoggingName.WelcomeWallet,
        Icon: UniswapLogo,
        iconProps: {
          color: '$accent1',
        },
        iconContainerProps: {
          backgroundColor: '$accent2',
          borderRadius: '$rounded12',
        },
        title: welcomeCardTitle,
        description: t('onboarding.home.intro.welcome.description'),
        cardType: CardType.Swipe,
      })
    }

    if (onboardingRedesignHomeEnabled) {
      output.push({
        loggingName: OnboardingCardLoggingName.FundWallet,
        Icon: Buy,
        title: t('onboarding.home.intro.fund.title'),
        description: t('onboarding.home.intro.fund.description'),
        cardType: CardType.Required,
        onPress: (): void => {
          setShowFundModal(true)
          sendAnalyticsEvent(SharedEventName.ELEMENT_CLICKED, {
            element: ElementName.OnboardingIntroCardFundWallet,
          })
        },
      })
    }

    if (onboardingRedesignBackupEnabled && !hasBackups) {
      output.push({
        loggingName: OnboardingCardLoggingName.RecoveryBackup,
        Icon: ShieldCheck,
        title: t('onboarding.home.intro.backup.title'),
        description: t('onboarding.home.intro.backup.description'),
        cardType: CardType.Required,
        onPress: (): void => {
          navigate(MobileScreens.OnboardingStack, {
            screen: OnboardingScreens.Backup,
            params: {
              importType: ImportType.BackupOnly,
              entryPoint: OnboardingEntryPoint.BackupCard,
            },
          })
        },
      })
    }

    if (shouldPromptUnitag) {
      output.push({
        loggingName: OnboardingCardLoggingName.ClaimUnitag,
        Icon: Person,
        title: t('onboarding.home.intro.unitag.title', {
          unitagDomain: UNITAG_SUFFIX_NO_LEADING_DOT,
        }),
        description: t('onboarding.home.intro.unitag.description'),
        cardType: CardType.Dismissible,
        onPress: () => handleUnitagClaim(),
        onClose: () => handleUnitagDismiss(),
      })
    }

    return output
  }, [
    handleUnitagClaim,
    handleUnitagDismiss,
    hasBackups,
    hasViewedWelcomeWalletCard,
    onboardingRedesignBackupEnabled,
    onboardingRedesignHomeEnabled,
    shouldPromptUnitag,
    t,
    welcomeCardTitle,
  ])

  const handleSwiped = useCallback(
    (_card: IntroCardProps, index: number) => {
      const loggingName = cards[index]?.loggingName
      if (loggingName) {
        sendAnalyticsEvent(MobileEventName.OnboardingIntroCardSwiped, {
          card_name: loggingName,
        })
      }

      if (!hasViewedWelcomeWalletCard && cards[index]?.title === welcomeCardTitle) {
        dispatch(setHasViewedWelcomeWalletCard(true))
      }
    },
    [cards, dispatch, hasViewedWelcomeWalletCard, welcomeCardTitle],
  )

  if (cards.length) {
    return (
      <Flex pt="$spacing12">
        {isLoading ? (
          <Flex height={INTRO_CARD_MIN_HEIGHT} />
        ) : (
          <IntroCardStack cards={cards} keyExtractor={(card) => card.title} onSwiped={handleSwiped} />
        )}

        {showFundModal && <FundWalletModal onClose={() => setShowFundModal(false)} />}
      </Flex>
    )
  } else if (shouldPromptUnitag) {
    return (
      <AnimatedFlex entering={FadeIn} exiting={FadeOut}>
        <UnitagBanner address={activeAccount.address} entryPoint={MobileScreens.Home} />
      </AnimatedFlex>
    )
  }

  return null
}
