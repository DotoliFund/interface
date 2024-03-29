import '@reach/dialog/styles.css'
import 'inter-ui'
import 'polyfills'
import 'components/analytics'

import Web3Provider from 'components/Web3Provider'
import { FeatureFlagsProvider } from 'featureFlags'
import { BlockNumberProvider } from 'lib/hooks/useBlockNumber'
import { MulticallUpdater } from 'lib/state/multicall'
import App from 'pages/App'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import store from 'state'
import ThemeProvider, { ThemedGlobalStyle } from 'theme'
import { SystemThemeUpdater } from 'theme/components/ThemeToggle'

import { LanguageProvider } from './i18n'
import reportWebVitals from './reportWebVitals'
import ApplicationUpdater from './state/application/updater'
import ListsUpdater from './state/lists/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import RadialGradientByChainUpdater from './theme/components/RadialGradientByChainUpdater'

if (window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

function Updaters() {
  return (
    <>
      <RadialGradientByChainUpdater />
      <ListsUpdater />
      <SystemThemeUpdater />
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
    </>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <FeatureFlagsProvider>
        <HashRouter>
          <LanguageProvider>
            <Web3Provider>
              <BlockNumberProvider>
                <Updaters />
                <ThemeProvider>
                  <ThemedGlobalStyle />
                  <App />
                </ThemeProvider>
              </BlockNumberProvider>
            </Web3Provider>
          </LanguageProvider>
        </HashRouter>
      </FeatureFlagsProvider>
    </Provider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
