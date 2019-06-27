import React from 'react'
import { Image, View } from 'react-native'

import { Column, EnhancedLoadState } from '@devhub/core'
import { sharedStyles } from '../../styles/shared'
import { contentPadding } from '../../styles/variables'
import {
  getEmojiImageURL,
  GitHubEmoji,
} from '../../utils/helpers/github/emojis'
import { Button, defaultButtonSize } from '../common/Button'
import { fabSize } from '../common/FAB'
import { Spacer } from '../common/Spacer'
import { fabSpacing } from '../layout/FABRenderer'
import { ThemedActivityIndicator } from '../themed/ThemedActivityIndicator'
import { ThemedText } from '../themed/ThemedText'
import {
  GenericMessageWithButtonView,
  GenericMessageWithButtonViewProps,
} from './GenericMessageWithButtonView'

const clearMessages = [
  "You're doing great!",
  'All clear!',
  'Awesome!',
  'Good job!',
  'Great work!',
  'You rock!',
]

const emojis: GitHubEmoji[] = ['+1', 'muscle', 'tada', '100']

const getRandomClearMessage = () => {
  const randomIndex = Math.floor(Math.random() * clearMessages.length)
  return clearMessages[randomIndex]
}

const getRandomEmoji = () => {
  const randomIndex = Math.floor(Math.random() * emojis.length)
  return emojis[randomIndex]
}

// only one emoji per app session
// because dynamic content is bit distractive
const randomClearMessage = getRandomClearMessage()
const randomEmoji = getRandomEmoji()

export const defaultCardFooterSpacing =
  fabSpacing + Math.abs(fabSize - defaultButtonSize) / 2
export const defaultCardFooterHeight =
  defaultButtonSize + 2 * defaultCardFooterSpacing

export interface EmptyCardsProps {
  clearEmoji?: GitHubEmoji | null
  clearMessage?: string
  column: Column
  disableLoadingIndicator?: boolean
  emoji?: GitHubEmoji | null
  errorButtonView?: GenericMessageWithButtonViewProps['buttonView']
  errorMessage?: string
  errorTitle?: string
  fetchNextPage: (() => void) | undefined
  loadState: EnhancedLoadState
  refresh: (() => void | Promise<void>) | undefined
}

export const EmptyCards = React.memo((props: EmptyCardsProps) => {
  const {
    clearEmoji = randomEmoji,
    clearMessage = randomClearMessage,
    disableLoadingIndicator,
    emoji = 'warning',
    errorButtonView,
    errorMessage,
    errorTitle = 'Something went wrong',
    fetchNextPage,
    loadState,
    refresh,
  } = props

  const clearEmojiURL = clearEmoji ? getEmojiImageURL(clearEmoji) : undefined
  const hasError = errorMessage || loadState === 'error'

  const renderContent = () => {
    if (
      loadState === 'loading_first' ||
      (loadState === 'loading' && !refresh && !fetchNextPage)
    ) {
      if (disableLoadingIndicator) return null
      return <ThemedActivityIndicator color="foregroundColor" />
    }

    if (hasError) {
      return (
        <GenericMessageWithButtonView
          buttonView={
            errorButtonView ||
            (!!refresh && (
              <Button
                analyticsLabel="try_again"
                children="Try again"
                disabled={loadState !== 'error'}
                loading={!disableLoadingIndicator && loadState === 'loading'}
                onPress={() => refresh()}
              />
            ))
          }
          emoji={emoji}
          title={errorTitle}
          subtitle={errorMessage}
        />
      )
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          padding: contentPadding,
        }}
      >
        {!!clearMessage && (
          <ThemedText
            color="foregroundColorMuted40"
            style={{
              fontSize: 20,
              fontWeight: '200',
              textAlign: 'center',
            }}
          >
            {clearMessage}
          </ThemedText>
        )}

        {!!clearEmojiURL && (
          <>
            {!!clearMessage && <Spacer width={contentPadding / 2} />}

            <Image
              source={{ uri: clearEmojiURL }}
              style={{ width: 24, height: 24 }}
            />
          </>
        )}
      </View>
    )
  }

  return (
    <View style={[sharedStyles.flex, sharedStyles.center]}>
      {renderContent()}
    </View>
  )
})

EmptyCards.displayName = 'EmptyCards'
