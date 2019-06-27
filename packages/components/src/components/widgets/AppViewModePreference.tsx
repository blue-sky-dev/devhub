import React from 'react'
import { Image, View } from 'react-native'

import { AppViewMode, constants } from '@devhub/core'
import { useAppViewMode } from '../../hooks/use-app-view-mode'
import { useReduxAction } from '../../hooks/use-redux-action'
import { useReduxState } from '../../hooks/use-redux-state'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { sharedStyles } from '../../styles/shared'
import { contentPadding } from '../../styles/variables'
import { getEmojiImageURL } from '../../utils/helpers/github/emojis'
import { Checkbox } from '../common/Checkbox'
import { H2 } from '../common/H2'
import { Link } from '../common/Link'
import { SubHeader } from '../common/SubHeader'

export interface AppViewModePreferenceProps {
  children?: React.ReactNode
}

export const AppViewModePreference = React.memo(
  (props: AppViewModePreferenceProps) => {
    const { children } = props

    const {
      appViewMode: currentAppViewMode,
      canSwitchAppViewMode,
    } = useAppViewMode()

    const counters = useReduxState(selectors.countersSelector)
    const setAppViewMode = useReduxAction(actions.setAppViewMode)

    if (!canSwitchAppViewMode) return null

    function renderOption(appViewMode: AppViewMode) {
      return (
        <Checkbox
          analyticsLabel={undefined}
          key={`app-layout-item-checkbox-${appViewMode}`}
          checked={currentAppViewMode === appViewMode}
          circle
          containerStyle={{
            marginBottom: contentPadding / 2,
          }}
          disabled={constants.DISABLE_SINGLE_COLUMN || !canSwitchAppViewMode}
          label={
            appViewMode === 'single-column'
              ? 'Single-column'
              : appViewMode === 'multi-column'
              ? 'Multi-column'
              : appViewMode
          }
          onChange={checked => {
            if (checked) setAppViewMode(appViewMode)
          }}
        />
      )
    }

    return (
      <View>
        <SubHeader muted={constants.DISABLE_SINGLE_COLUMN} title="Layout mode">
          {!!constants.DISABLE_SINGLE_COLUMN && !constants.IS_BETA && (
            <Link
              analyticsLabel={`appview-mode-beta-link`}
              href={constants.DEVHUB_BETA_URL}
            >
              <H2
                muted
                withMargin={false}
                children=" (beta)"
                style={sharedStyles.flex}
              />
            </Link>
          )}

          {!(counters.appViewModeChange >= 1) && (
            <Image
              accessibilityLabel="New!"
              source={{ uri: getEmojiImageURL('sparkles') }}
              style={{ marginLeft: contentPadding / 2, width: 16, height: 16 }}
            />
          )}
        </SubHeader>

        <View style={{ paddingHorizontal: contentPadding }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={sharedStyles.flex}>
              {renderOption('single-column')}
            </View>

            <View style={sharedStyles.flex}>
              {renderOption('multi-column')}
            </View>
          </View>
        </View>

        {children}
      </View>
    )
  },
)

AppViewModePreference.displayName = 'AppViewModePreference'
