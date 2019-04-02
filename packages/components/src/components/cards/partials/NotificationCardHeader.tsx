import { MomentInput } from 'moment'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import {
  getDateSmallText,
  getFullDateText,
  getGitHubURLForUser,
  GitHubIcon,
  GitHubNotificationReason,
  ThemeColors,
  trimNewLinesAndSpaces,
} from '@devhub/core'
import { useCSSVariablesOrSpringAnimatedTheme } from '../../../hooks/use-css-variables-or-spring--animated-theme'
import { Platform } from '../../../libs/platform'
import { SpringAnimatedText } from '../../animated/spring/SpringAnimatedText'
import { SpringAnimatedView } from '../../animated/spring/SpringAnimatedView'
import { Avatar } from '../../common/Avatar'
import { BookmarkButton } from '../../common/BookmarkButton'
import { IntervalRefresh } from '../../common/IntervalRefresh'
import { Link } from '../../common/Link'
import { ToggleReadButton } from '../../common/ToggleReadButton'
import { cardStyles, getCardStylesForTheme } from '../styles'
import { NotificationReason } from './rows/partials/NotificationReason'

export interface NotificationCardHeaderProps {
  avatarUrl: string | undefined
  backgroundThemeColor: keyof ThemeColors
  cardIconColor?: string
  cardIconName: GitHubIcon
  date: MomentInput
  ids: Array<string | number>
  isBot: boolean
  isPrivate: boolean
  isRead: boolean
  isSaved?: boolean
  reason: GitHubNotificationReason
  userLinkURL: string
  username: string
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },

  rightColumnCentered: {
    flex: 1,
    justifyContent: 'center',
  },

  outerContainer: {
    flexDirection: 'row',
  },

  innerContainer: {
    flex: 1,
  },
})

export function NotificationCardHeader(props: NotificationCardHeaderProps) {
  const {
    avatarUrl,
    backgroundThemeColor,
    date,
    ids,
    isBot,
    isPrivate,
    isRead,
    isSaved,
    reason,
    userLinkURL: _userLinkURL,
    username: _username,
  } = props

  const springAnimatedTheme = useCSSVariablesOrSpringAnimatedTheme()

  const smallLeftColumn = true
  const username = isBot ? _username!.replace('[bot]', '') : _username
  const userLinkURL = _userLinkURL || getGitHubURLForUser(username, { isBot })

  return (
    <View
      key={`notification-card-header-${ids.join(',')}-inner`}
      style={styles.container}
    >
      <SpringAnimatedView
        style={[
          cardStyles.leftColumn,
          smallLeftColumn
            ? cardStyles.leftColumn__small
            : cardStyles.leftColumn__big,
        ]}
      >
        <Avatar
          avatarUrl={avatarUrl}
          isBot={isBot}
          linkURL={userLinkURL}
          shape={isBot ? undefined : 'circle'}
          small
          style={cardStyles.avatar}
          username={username}
        />
      </SpringAnimatedView>

      <View style={styles.rightColumnCentered}>
        <View style={styles.outerContainer}>
          <View style={styles.innerContainer}>
            <SpringAnimatedView
              style={cardStyles.horizontalAndVerticallyAligned}
            >
              <Link href={userLinkURL}>
                <SpringAnimatedText
                  numberOfLines={1}
                  style={[
                    getCardStylesForTheme(springAnimatedTheme).usernameText,
                    isRead &&
                      getCardStylesForTheme(springAnimatedTheme).mutedText,
                  ]}
                >
                  {trimNewLinesAndSpaces(username, 18)}
                </SpringAnimatedText>
              </Link>
              {!!isBot && (
                <>
                  <Text children="  " />
                  <SpringAnimatedText
                    numberOfLines={1}
                    style={
                      getCardStylesForTheme(springAnimatedTheme).timestampText
                    }
                  >
                    <Text children="  " />
                    BOT
                  </SpringAnimatedText>
                </>
              )}
              <IntervalRefresh date={date}>
                {() => {
                  const dateText = getDateSmallText(date, false)
                  if (!dateText) return null

                  return (
                    <>
                      <Text children="  " />
                      <SpringAnimatedText
                        numberOfLines={1}
                        style={
                          getCardStylesForTheme(springAnimatedTheme)
                            .timestampText
                        }
                        {...Platform.select({
                          web: { title: getFullDateText(date) },
                        })}
                      >
                        <Text children="  " />
                        {dateText}
                      </SpringAnimatedText>
                    </>
                  )
                }}
              </IntervalRefresh>
            </SpringAnimatedView>

            <NotificationReason
              backgroundThemeColor={backgroundThemeColor}
              isPrivate={isPrivate}
              reason={reason}
            />

            {/* {!!(reasonDetails && reasonDetails.label) && (
              <>
                <Spacer height={4} />

                <Label
                  color={reasonDetails.color}
                  containerStyle={{ alignSelf: 'flex-start' }}
                  isPrivate={isPrivate}
                  // muted={isRead}
                  outline={false}
                  small
                >
                  {reasonDetails.label.toLowerCase()}
                </Label>
              </>
            )} */}
          </View>

          <ToggleReadButton
            isRead={isRead}
            itemIds={ids}
            style={{
              alignSelf: smallLeftColumn ? 'center' : 'flex-start',
              marginTop: 3,
            }}
            type="notifications"
          />

          <BookmarkButton
            isSaved={!!isSaved}
            itemIds={ids}
            style={{
              alignSelf: smallLeftColumn ? 'center' : 'flex-start',
              marginTop: 4,
            }}
          />
        </View>
      </View>
    </View>
  )
}
