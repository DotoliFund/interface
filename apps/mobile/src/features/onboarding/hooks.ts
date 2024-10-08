import { SharedEventName } from '@uniswap/analytics-events'
import { useDispatch } from 'react-redux'
import { OnboardingStackBaseParams, useOnboardingStackNavigation } from 'src/app/navigation/types'
import { Experiments, OnboardingRedesignRecoveryBackupProperties } from 'uniswap/src/features/gating/experiments'
import { getExperimentValue } from 'uniswap/src/features/gating/hooks'
import { MobileAppsFlyerEvents } from 'uniswap/src/features/telemetry/constants'
import { sendAnalyticsEvent, sendAppsFlyerEvent } from 'uniswap/src/features/telemetry/send'
import { ImportType, OnboardingEntryPoint } from 'uniswap/src/types/onboarding'
import { MobileScreens } from 'uniswap/src/types/screens/mobile'
import { logger } from 'utilities/src/logger/logger'
import { useOnboardingContext } from 'wallet/src/features/onboarding/OnboardingContext'
import { setFinishedOnboarding } from 'wallet/src/features/wallet/slice'

export type OnboardingCompleteProps = OnboardingStackBaseParams

/**
 * Bundles various actions that should be performed to complete onboarding.
 *
 * Used within the final screen of various onboarding flows.
 */
export function useCompleteOnboardingCallback({
  entryPoint,
  importType,
}: OnboardingStackBaseParams): () => Promise<void> {
  const dispatch = useDispatch()
  const { getAllOnboardingAccounts, finishOnboarding } = useOnboardingContext()
  const navigation = useOnboardingStackNavigation()

  const onboardingAccounts = getAllOnboardingAccounts()
  const onboardingAddresses = Object.keys(onboardingAccounts)

  return async () => {
    const createdFromOnboardingRedesign =
      importType === ImportType.CreateNew &&
      getExperimentValue(
        Experiments.OnboardingRedesignRecoveryBackup,
        OnboardingRedesignRecoveryBackupProperties.Enabled,
        false,
      )

    // Run all shared onboarding completion logic
    await finishOnboarding({ importType, createdFromOnboardingRedesign })

    // Send appsflyer event for mobile attribution
    if (entryPoint === OnboardingEntryPoint.FreshInstallOrReplace) {
      sendAppsFlyerEvent(MobileAppsFlyerEvents.OnboardingCompleted, { importType }).catch((error) =>
        logger.debug('hooks', 'useCompleteOnboardingCallback', error),
      )
    }

    // Log TOS acceptance for new wallets after they are activated
    if (entryPoint === OnboardingEntryPoint.FreshInstallOrReplace) {
      onboardingAddresses.forEach((address: string) => {
        sendAnalyticsEvent(SharedEventName.TERMS_OF_SERVICE_ACCEPTED, { address })
      })
    }

    // Exit flow
    dispatch(setFinishedOnboarding({ finishedOnboarding: true }))
    if (entryPoint === OnboardingEntryPoint.Sidebar) {
      navigation.navigate(MobileScreens.Home)
    }
  }
}
