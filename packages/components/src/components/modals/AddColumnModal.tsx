import { rgba } from 'polished'
import React, { useCallback, useLayoutEffect, useRef } from 'react'
import { View } from 'react-native'
import { useSpring } from 'react-spring/native'

import {
  AddColumnDetailsPayload,
  ColumnSubscription,
  constants,
  GitHubIcon,
} from '@devhub/core'
import { useHover } from '../../hooks/use-hover'
import { useReduxAction } from '../../hooks/use-redux-action'
import { useReduxState } from '../../hooks/use-redux-state'
import { Platform } from '../../libs/platform'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { sharedStyles } from '../../styles/shared'
import { contentPadding } from '../../styles/variables'
import { getDefaultReactSpringAnimationConfig } from '../../utils/helpers/animations'
import { SpringAnimatedTouchableOpacity } from '../animated/spring/SpringAnimatedTouchableOpacity'
import { ColumnHeaderItem } from '../columns/ColumnHeaderItem'
import { ModalColumn } from '../columns/ModalColumn'
import { fabSize } from '../common/FAB'
import { FullHeightScrollView } from '../common/FullHeightScrollView'
import { H2 } from '../common/H2'
import { Link } from '../common/Link'
import { Separator } from '../common/Separator'
import { Spacer } from '../common/Spacer'
import { SubHeader } from '../common/SubHeader'
import { useAppLayout } from '../context/LayoutContext'
import { useTheme } from '../context/ThemeContext'
import { fabSpacing, shouldRenderFAB } from '../layout/FABRenderer'
import { ThemedText } from '../themed/ThemedText'

export interface AddColumnModalProps {
  showBackButton: boolean
}

const columnTypes: Array<{
  title: string
  type: ColumnSubscription['type']
  icon: GitHubIcon
  items: Array<{
    payload: AddColumnDetailsPayload | null
  }>
  soon?: boolean
  soonLink?: string
}> = [
  {
    title: 'Notifications',
    type: 'notifications',
    icon: 'bell',
    items: [
      {
        payload: {
          icon: 'bell',
          title: 'Notifications',
          subscription: {
            type: 'notifications',
            subtype: undefined,
          },
          isPrivateSupported: true,
        },
      },
    ],
  },
  {
    title: 'Issues & Pull Requests',
    type: 'issue_or_pr',
    icon: 'issue-opened',
    items: [
      {
        payload: {
          icon: 'issue-opened',
          title: 'Issues',
          subscription: {
            type: 'issue_or_pr',
            subtype: 'ISSUES',
          },
          isPrivateSupported: true,
        },
      },
      {
        payload: {
          icon: 'issue-opened',
          title: 'Issues & Pull Requests',
          subscription: {
            type: 'issue_or_pr',
            subtype: undefined,
          },
          isPrivateSupported: true,
        },
      },
      {
        payload: {
          icon: 'git-pull-request',
          title: 'Pull Requests',
          subscription: {
            type: 'issue_or_pr',
            subtype: 'PULLS',
          },
          isPrivateSupported: true,
        },
      },
    ],
  },
  {
    title: 'Activities',
    type: 'activity',
    icon: 'note',
    items: [
      {
        payload: {
          icon: 'person',
          title: 'User activity',
          subscription: {
            type: 'activity',
            subtype: 'USER_EVENTS',
          },
          isPrivateSupported: false,
        },
      },
      {
        payload: {
          icon: 'home',
          title: 'User dashboard',
          subscription: {
            type: 'activity',
            subtype: 'USER_RECEIVED_EVENTS',
          },
          isPrivateSupported: false,
        },
      },
      {
        payload: {
          icon: 'repo',
          title: 'Repository activity',
          subscription: {
            type: 'activity',
            subtype: 'REPO_EVENTS',
          },
          isPrivateSupported: false, // https://github.com/devhubapp/devhub/issues/140
        },
      },
      {
        payload: {
          icon: 'organization',
          title: 'Organization activity',
          subscription: {
            type: 'activity',
            subtype: 'ORG_PUBLIC_EVENTS',
          },
          isPrivateSupported: false,
        },
      },
    ],
  },
]

function AddColumnModalItem({
  disabled,
  icon,
  payload,
  title,
}: {
  disabled?: boolean
  icon: GitHubIcon
  payload: AddColumnDetailsPayload | null
  title: string
}) {
  const cacheRef = useRef({
    isHovered: false,
    isPressing: false,
  })

  const theme = useTheme()

  const touchableRef = useRef(null)
  const initialIsHovered = useHover(touchableRef, isHovered => {
    cacheRef.current.isHovered = isHovered
    updateStyles()
  })
  cacheRef.current.isHovered = initialIsHovered

  const pushModal = useReduxAction(actions.pushModal)

  const getStyles = useCallback(() => {
    const { isHovered, isPressing } = cacheRef.current

    const immediate =
      constants.DISABLE_ANIMATIONS || isHovered || Platform.realOS !== 'web'

    return {
      config: getDefaultReactSpringAnimationConfig(),
      immediate,
      backgroundColor:
        (isHovered || isPressing) && !disabled
          ? theme.backgroundColorLess2
          : rgba(theme.backgroundColor, 0),
    }
  }, [disabled, theme])

  const [springAnimatedStyles, setSpringAnimatedStyles] = useSpring(getStyles)

  const updateStyles = useCallback(() => {
    setSpringAnimatedStyles(getStyles())
  }, [getStyles])

  useLayoutEffect(() => {
    updateStyles()
  }, [updateStyles])

  return (
    <SpringAnimatedTouchableOpacity
      ref={touchableRef}
      activeOpacity={Platform.realOS !== 'web' ? 1 : undefined}
      analyticsLabel={undefined}
      disabled={disabled || !payload}
      onPress={
        payload
          ? () =>
              pushModal({
                name: 'ADD_COLUMN_DETAILS',
                params: payload,
              })
          : undefined
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
        flex: 1,
        ...springAnimatedStyles,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          padding: contentPadding,
        }}
      >
        <ColumnHeaderItem
          analyticsLabel={undefined}
          fixedIconSize
          iconName={icon}
          iconStyle={{ lineHeight: undefined }}
          noPadding
          size={18}
          tooltip={undefined}
        />

        <Spacer width={contentPadding / 2} />

        <ThemedText color="foregroundColor">{title}</ThemedText>
      </View>
    </SpringAnimatedTouchableOpacity>
  )
}

export function AddColumnModal(props: AddColumnModalProps) {
  const { showBackButton } = props

  const { sizename } = useAppLayout()
  const columnIds = useReduxState(selectors.columnIdsSelector)

  const hasReachedColumnLimit = columnIds.length >= constants.COLUMNS_LIMIT
  const isFabVisible = shouldRenderFAB({ sizename })

  return (
    <ModalColumn
      iconName="plus"
      name="ADD_COLUMN"
      showBackButton={showBackButton}
      title="Add Column"
    >
      <FullHeightScrollView style={sharedStyles.flex}>
        {columnTypes.map((group, groupIndex) => (
          <View key={`add-column-header-group-${groupIndex}`}>
            <SubHeader muted={group.soon} title={group.title}>
              {!!group.soon && (
                <Link
                  analyticsLabel={`add-column-${group.title}-soon`}
                  href={group.soonLink}
                >
                  <H2
                    muted
                    withMargin={false}
                    children={
                      group.soonLink && group.soonLink.includes('beta')
                        ? ' (beta)'
                        : ' (soon)'
                    }
                    style={sharedStyles.flex}
                  />
                </Link>
              )}
            </SubHeader>

            <View style={sharedStyles.flex}>
              {group.items.map((item, itemIndex) => (
                <AddColumnModalItem
                  key={`add-column-button-group-${groupIndex}-item-${itemIndex}`}
                  disabled={
                    hasReachedColumnLimit || !item.payload || group.soon
                  }
                  icon={item.payload ? item.payload.icon : 'mark-github'}
                  payload={item.payload}
                  title={item.payload ? item.payload.title : 'Not available'}
                />
              ))}
            </View>

            {groupIndex < columnTypes.length - 1 && (
              <>
                <Spacer height={contentPadding / 2} />
                <Separator horizontal />
                <Spacer height={contentPadding / 2} />
              </>
            )}
          </View>
        ))}

        <Spacer flex={1} minHeight={contentPadding} />

        {!!hasReachedColumnLimit && (
          <ThemedText
            color="foregroundColorMuted60"
            style={{
              marginTop: contentPadding,
              paddingHorizontal: contentPadding,
              lineHeight: 20,
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            {`You have reached the limit of ${
              constants.COLUMNS_LIMIT
            } columns. This is to maintain a healthy usage of the GitHub API.`}
          </ThemedText>
        )}

        <Spacer height={contentPadding} />

        <Spacer
          height={isFabVisible ? fabSize + 2 * fabSpacing : contentPadding}
        />
      </FullHeightScrollView>
    </ModalColumn>
  )
}
