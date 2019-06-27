import { getLuminance } from 'polished'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemeColors } from '@devhub/core'
import { ThemedView } from '../themed/ThemedView'

export const separatorSize = 2
export const separatorThickSize = 5

export function getSeparatorThemeColors(
  backgroundColor: string,
): [keyof ThemeColors, keyof ThemeColors | undefined] {
  const luminance = getLuminance(backgroundColor)

  if (luminance >= 0.6)
    return ['backgroundColorDarker2', 'backgroundColorLighther3']

  if (luminance <= 0.01)
    return ['backgroundColorDarker3', 'backgroundColorLighther2']

  return ['backgroundColorDarker2', 'backgroundColorLighther2']
}

const styles = StyleSheet.create({
  absoluteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  absoluteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  absoluteLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },

  absoluteRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
  },
})

export interface SeparatorProps {
  absolute?: 'none' | 'top' | 'bottom' | 'left' | 'right'
  backgroundThemeColor1?: keyof ThemeColors
  backgroundThemeColor2?: keyof ThemeColors
  half?: boolean
  horizontal?: boolean
  inverted?: boolean
  thick?: boolean
  zIndex?: number
}

export const Separator = React.memo((props: SeparatorProps) => {
  const {
    absolute,
    backgroundThemeColor1: _backgroundThemeColor1,
    backgroundThemeColor2: _backgroundThemeColor2,
    half,
    horizontal,
    inverted,
    thick,
    zIndex,
  } = props

  const backgroundThemeColor1 =
    _backgroundThemeColor1 ||
    ((theme: ThemeColors) => getSeparatorThemeColors(theme.backgroundColor)[0])

  const backgroundThemeColor2 = _backgroundThemeColor1
    ? _backgroundThemeColor2
    : (theme: ThemeColors) => getSeparatorThemeColors(theme.backgroundColor)[1]

  const _twoSeparators = !!(backgroundThemeColor1 && backgroundThemeColor2)

  const size =
    (thick ? separatorThickSize : separatorSize) /
    (half ? 2 : 1) /
    (_twoSeparators ? 2 : 1)

  const absoluteStyle =
    absolute === 'top'
      ? styles.absoluteTop
      : absolute === 'bottom'
      ? styles.absoluteBottom
      : absolute === 'left'
      ? styles.absoluteLeft
      : absolute === 'right'
      ? styles.absoluteRight
      : undefined

  const separatorStyle = [
    horizontal
      ? { width: '100%', height: size }
      : { width: size, height: '100%' },
  ]

  return (
    <View
      style={[
        horizontal
          ? {
              flexDirection: inverted ? 'column-reverse' : 'column',
              width: '100%',
            }
          : { flexDirection: inverted ? 'row-reverse' : 'row', height: '100%' },
        absoluteStyle,
        !!zIndex && { zIndex },
      ]}
    >
      {!!backgroundThemeColor1 && (
        <ThemedView
          backgroundColor={backgroundThemeColor1}
          style={separatorStyle}
          pointerEvents="none"
        />
      )}

      {!!backgroundThemeColor2 && (
        <ThemedView
          backgroundColor={backgroundThemeColor2}
          style={separatorStyle}
          pointerEvents="none"
        />
      )}
    </View>
  )
})

Separator.displayName = 'Separator'
