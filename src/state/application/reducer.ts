import { createSlice, nanoid } from '@reduxjs/toolkit'
import { DEFAULT_TXN_DISMISS_MS } from 'constants/misc'
import { EthereumNetworkInfo } from 'constants/networks'
import { NetworkInfo } from 'constants/networks'

import { SupportedChainId } from '../../constants/chains'

export type PopupContent =
  | {
      txn: {
        hash: string
      }
    }
  | {
      failedSwitchNetwork: SupportedChainId
    }

export enum ApplicationModal {
  ADDRESS_CLAIM,
  BLOCKED_ACCOUNT,
  DELEGATE,
  CLAIM_POPUP,
  MENU,
  NETWORK_SELECTOR,
  POOL_OVERVIEW_OPTIONS,
  PRIVACY_POLICY,
  SELF_CLAIM,
  SETTINGS,
  VOTE,
  WALLET,
  WALLET_DROPDOWN,
  QUEUE,
  EXECUTE,
  TIME_SELECTOR,
  SHARE,
  NETWORK_FILTER,
  FEATURE_FLAGS,
}

type PopupList = Array<{ key: string; show: boolean; content: PopupContent; removeAfterMs: number | null }>

interface ApplicationState {
  readonly chainId: number | null
  readonly openModal: ApplicationModal | null
  readonly popupList: PopupList
  readonly activeNetworkVersion: NetworkInfo
}

const initialState: ApplicationState = {
  chainId: null,
  openModal: null,
  popupList: [],
  activeNetworkVersion: EthereumNetworkInfo,
}

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    updateChainId(state, action) {
      const { chainId } = action.payload
      state.chainId = chainId
    },
    setOpenModal(state, action) {
      state.openModal = action.payload
    },
    addPopup(state, { payload: { content, key, removeAfterMs = DEFAULT_TXN_DISMISS_MS } }) {
      state.popupList = (key ? state.popupList.filter((popup) => popup.key !== key) : state.popupList).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs,
        },
      ])
    },
    removePopup(state, { payload: { key } }) {
      state.popupList.forEach((p) => {
        if (p.key === key) {
          p.show = false
        }
      })
    },
    updateActiveNetworkVersion(state, { payload: { activeNetworkVersion } }) {
      state.activeNetworkVersion = activeNetworkVersion
    },
  },
})

export const { updateChainId, setOpenModal, addPopup, removePopup, updateActiveNetworkVersion } =
  applicationSlice.actions
export default applicationSlice.reducer
