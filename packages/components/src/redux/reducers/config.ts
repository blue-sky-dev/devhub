import immer from 'immer'

import { AppViewMode, constants, ThemePair } from '@devhub/core'
import { loadTheme } from '../../styles/utils'
import { Reducer } from '../types'

export interface State {
  preferredDarkTheme?: ThemePair
  preferredLightTheme?: ThemePair
  theme?: ThemePair
  appViewMode?: AppViewMode
}

const initialState: State = {
  preferredDarkTheme: { id: constants.DEFAULT_DARK_THEME },
  preferredLightTheme: { id: constants.DEFAULT_LIGHT_THEME },
  theme: { id: 'auto' },
  appViewMode: 'single-column',
}

export const configReducer: Reducer<State> = (state = initialState, action) => {
  switch (action.type) {
    case 'DAY_NIGHT_SWITCH':
      return { ...state }

    case 'SET_THEME':
      return immer(state, draft => {
        const theme = loadTheme(action.payload)

        if (theme.id && theme.id === action.payload.id) {
          if (theme.isDark) draft.preferredDarkTheme = action.payload
          else draft.preferredLightTheme = action.payload
        }

        draft.theme = action.payload
      })

    case 'SET_PREFERRABLE_THEME':
      return immer(state, draft => {
        const theme = loadTheme(action.payload)

        if (theme.isDark) draft.preferredDarkTheme = action.payload
        else draft.preferredLightTheme = action.payload

        if (state.theme && state.theme.id !== 'auto')
          draft.theme = action.payload
      })

    case 'SET_APP_VIEW_MODE':
      return immer(state, draft => {
        draft.appViewMode =
          action.payload === 'single-column' ? 'single-column' : 'multi-column'
      })

    default:
      return state
  }
}
