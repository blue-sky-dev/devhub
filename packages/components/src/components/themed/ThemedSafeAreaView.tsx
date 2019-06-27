import React from 'react'
import { StyleProp, TextProps, TextStyle } from 'react-native'

import { ThemeColors } from '@devhub/core'
import { SpringAnimatedSafeAreaView } from '../animated/spring/SpringAnimatedSafeAreaView'
import { useSpringAnimatedTheme } from '../context/SpringAnimatedThemeContext'
import { getThemeColorOrItself } from './helpers'

export interface ThemedSafeAreaViewProps extends Omit<TextProps, 'style'> {
  backgroundColor?: keyof ThemeColors | ((theme: ThemeColors) => string)
  borderColor?: keyof ThemeColors | ((theme: ThemeColors) => string)
  children?: React.ReactNode
  style?: StyleProp<Omit<TextStyle, 'backgroundColor' | 'borderColor'>>
  // themeTransformer?: ThemeTransformer
}

export const ThemedSafeAreaView = React.forwardRef<
  SpringAnimatedSafeAreaView,
  ThemedSafeAreaViewProps
>((props, ref) => {
  const { backgroundColor, borderColor, style, ...otherProps } = props
  const springAnimatedTheme = useSpringAnimatedTheme()

  return (
    <SpringAnimatedSafeAreaView
      {...otherProps}
      ref={ref}
      style={[
        style,
        getStyle(springAnimatedTheme, { backgroundColor, borderColor }),
      ]}
    />
  )
})

ThemedSafeAreaView.displayName = 'ThemedSafeAreaView'

function getStyle(
  theme: ThemeColors & { isInverted: boolean | 0 | 1 },
  {
    backgroundColor: _backgroundColor,
    borderColor: _borderColor,
  }: Pick<ThemedSafeAreaViewProps, 'backgroundColor' | 'borderColor'>,
) {
  const backgroundColor = getThemeColorOrItself(theme, _backgroundColor, {
    enableCSSVariable: true,
  })
  const borderColor = getThemeColorOrItself(theme, _borderColor, {
    enableCSSVariable: true,
  })

  const style: TextStyle = {}
  if (backgroundColor) style.backgroundColor = backgroundColor
  if (borderColor) style.color = borderColor

  return style
}
