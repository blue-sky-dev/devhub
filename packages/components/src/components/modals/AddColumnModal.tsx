import { rgba } from 'polished'
import React, { useEffect, useRef } from 'react'
import { View } from 'react-native'
import { useSpring } from 'react-spring/native-hooks'

import {
  AddColumnDetailsPayload,
  ColumnSubscription,
  constants,
  GitHubIcon,
} from '@devhub/core'
import { useCSSVariablesOrSpringAnimatedTheme } from '../../hooks/use-css-variables-or-spring--animated-theme'
import { useHover } from '../../hooks/use-hover'
import { useReduxAction } from '../../hooks/use-redux-action'
import { useReduxState } from '../../hooks/use-redux-state'
import { Platform } from '../../libs/platform'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { contentPadding, radius } from '../../styles/variables'
import { SpringAnimatedText } from '../animated/spring/SpringAnimatedText'
import { SpringAnimatedTouchableOpacity } from '../animated/spring/SpringAnimatedTouchableOpacity'
import { ColumnHeaderItem } from '../columns/ColumnHeaderItem'
import { ModalColumn } from '../columns/ModalColumn'
import { separatorTickSize } from '../common/Separator'
import { SubHeader } from '../common/SubHeader'
import { useColumnWidth } from '../context/ColumnWidthContext'
import { useTheme } from '../context/ThemeContext'

export interface AddColumnModalProps {
  showBackButton: boolean
}

const columnTypes: Array<{
  title: string
  type: ColumnSubscription['type']
  icon: GitHubIcon
  items: Array<{
    title: string
    icon: GitHubIcon
    payload: AddColumnDetailsPayload
  }>
}> = [
  {
    title: 'Notifications',
    type: 'notifications',
    icon: 'bell',
    items: [
      {
        title: 'Notifications',
        icon: 'bell',
        payload: {
          icon: 'bell',
          title: 'All notifications',
          subscription: {
            type: 'notifications',
            subtype: undefined,
          },
          paramList: ['all'],
        },
      },
      {
        title: 'Repository',
        icon: 'repo',
        payload: {
          icon: 'bell',
          title: 'Repository notifications',
          subscription: {
            type: 'notifications',
            subtype: 'REPO_NOTIFICATIONS',
          },
          paramList: ['all', 'owner', 'repo'],
        },
      },
    ],
  },
  {
    title: 'Activity',
    type: 'activity',
    icon: 'rss',
    items: [
      {
        title: 'Dashboard',
        icon: 'home',
        payload: {
          icon: 'home',
          title: 'User dashboard',
          subscription: {
            type: 'activity',
            subtype: 'USER_RECEIVED_EVENTS',
          },
          paramList: ['username'],
        },
      },
      {
        title: 'User',
        icon: 'person',
        payload: {
          icon: 'person',
          title: 'User activity',
          subscription: {
            type: 'activity',
            subtype: 'USER_EVENTS',
          },
          paramList: ['username'],
        },
      },
      {
        title: 'Organization',
        icon: 'organization',
        payload: {
          icon: 'organization',
          title: 'Organization activity',
          subscription: {
            type: 'activity',
            subtype: 'ORG_PUBLIC_EVENTS',
          },
          paramList: ['org'],
        },
      },
      {
        title: 'Repository',
        icon: 'repo',
        payload: {
          icon: 'repo',
          title: 'Repository activity',
          subscription: {
            type: 'activity',
            subtype: 'REPO_EVENTS',
          },
          paramList: ['owner', 'repo'],
        },
      },
    ],
  },
]

function AddColumnModalItem({
  availableWidth,
  disabled,
  icon,
  payload,
  title,
}: {
  availableWidth: number
  disabled?: boolean
  icon: GitHubIcon
  payload: AddColumnDetailsPayload
  title: string
}) {
  const initialTheme = useTheme(theme => {
    cacheRef.current.theme = theme
    updateStyles()
  })

  const touchableRef = useRef(null)
  const initialIsHovered = useHover(touchableRef, isHovered => {
    cacheRef.current.isHovered = isHovered
    updateStyles()
  })

  const cacheRef = useRef({
    isHovered: initialIsHovered,
    isPressing: false,
    theme: initialTheme,
  })

  const [springAnimatedStyles, setSpringAnimatedStyles] = useSpring(getStyles)

  useEffect(
    () => {
      updateStyles()
    },
    [disabled],
  )

  const springAnimatedTheme = useCSSVariablesOrSpringAnimatedTheme()

  const pushModal = useReduxAction(actions.pushModal)

  function getStyles() {
    const { isHovered, isPressing, theme } = cacheRef.current

    return {
      config: { duration: 100 },
      native: true,
      backgroundColor:
        (isHovered || isPressing) && !disabled
          ? theme.backgroundColorLess1
          : rgba(theme.backgroundColor, 0),
    }
  }

  function updateStyles() {
    setSpringAnimatedStyles(getStyles())
  }

  if (!(availableWidth > 0)) return null

  return (
    <SpringAnimatedTouchableOpacity
      ref={touchableRef}
      analyticsLabel={undefined}
      disabled={disabled}
      onPress={() =>
        pushModal({
          name: 'ADD_COLUMN_DETAILS',
          params: payload,
        })
      }
      onPressIn={() => {
        if (Platform.realOS === 'web') return

        cacheRef.current.isPressing = true
        updateStyles()
      }}
      onPressOut={() => {
        if (Platform.realOS === 'web') return

        cacheRef.current.isPressing = false
        updateStyles()
      }}
      style={{
        width:
          availableWidth / Math.floor(availableWidth / (82 + contentPadding)),
        borderRadius: radius,
        backgroundColor: springAnimatedStyles.backgroundColor,
      }}
    >
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: contentPadding / 4,
          paddingVertical: contentPadding,
        }}
      >
        <ColumnHeaderItem
          analyticsLabel={undefined}
          iconName={icon}
          iconStyle={{ lineHeight: undefined }}
          noPadding
          size={24}
          style={{ alignSelf: 'center', marginBottom: contentPadding / 2 }}
        />

        <SpringAnimatedText
          style={{
            color: springAnimatedTheme.foregroundColor,
            textAlign: 'center',
          }}
        >
          {title}
        </SpringAnimatedText>
      </View>
    </SpringAnimatedTouchableOpacity>
  )
}

export function AddColumnModal(props: AddColumnModalProps) {
  const { showBackButton } = props

  const springAnimatedTheme = useCSSVariablesOrSpringAnimatedTheme()

  const columnIds = useReduxState(selectors.columnIdsSelector)
  const columnWidth = useColumnWidth()

  const outerSpacing = (3 / 4) * contentPadding
  const availableWidth = columnWidth - 2 * separatorTickSize - 2 * outerSpacing

  const hasReachedColumnLimit = columnIds.length >= constants.COLUMNS_LIMIT

  return (
    <ModalColumn
      columnId="add-column-modal"
      iconName="plus"
      showBackButton={showBackButton}
      title="Add Column"
    >
      <View style={{ flex: 1 }}>
        {columnTypes.map((group, groupIndex) => (
          <View key={`add-column-header-group-${groupIndex}`}>
            <SubHeader
              analyticsLabel={undefined}
              iconName={group.icon}
              title={group.title}
            />

            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignContent: 'flex-start',
                padding: outerSpacing,
              }}
            >
              {group.items.map((item, itemIndex) => (
                <AddColumnModalItem
                  key={`add-column-button-group-${groupIndex}-item-${itemIndex}`}
                  availableWidth={availableWidth}
                  disabled={hasReachedColumnLimit}
                  icon={item.icon}
                  payload={item.payload}
                  title={item.title}
                />
              ))}
            </View>
          </View>
        ))}

        {!!hasReachedColumnLimit && (
          <SpringAnimatedText
            style={{
              marginTop: contentPadding,
              lineHeight: 20,
              fontSize: 14,
              color: springAnimatedTheme.foregroundColorMuted50,
              textAlign: 'center',
            }}
          >
            {`You have reached the limit of ${
              constants.COLUMNS_LIMIT
            } columns. This is to maintain a healthy usage of the GitHub API.`}
          </SpringAnimatedText>
        )}
      </View>
    </ModalColumn>
  )
}
