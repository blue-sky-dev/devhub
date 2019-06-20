import React, { useRef, useState } from 'react'
import { StyleProp, TextStyle } from 'react-native'

import { GitHubIcon } from '@devhub/core'
import { useHover } from '../../hooks/use-hover'
import { contentPadding } from '../../styles/variables'
import { SpringAnimatedIcon } from '../animated/spring/SpringAnimatedIcon'
import { SpringAnimatedText } from '../animated/spring/SpringAnimatedText'
import {
  SpringAnimatedTouchableOpacity,
  SpringAnimatedTouchableOpacityProps,
} from '../animated/spring/SpringAnimatedTouchableOpacity'
import { SpringAnimatedView } from '../animated/spring/SpringAnimatedView'
import { useSpringAnimatedTheme } from '../context/SpringAnimatedThemeContext'

export const fabSize = 44

export interface FABProps extends SpringAnimatedTouchableOpacityProps {
  children?: string | React.ReactElement<any>
  iconName?: GitHubIcon
  iconStyle?: StyleProp<TextStyle> | any
  onPress: SpringAnimatedTouchableOpacityProps['onPress']
  tooltip: string
  useBrandColor?: boolean
}

export function FAB(props: FABProps) {
  const {
    children,
    iconName,
    iconStyle,
    style,
    tooltip,
    useBrandColor,
    ...otherProps
  } = props

  const springAnimatedTheme = useSpringAnimatedTheme()

  const [isPressing, setIsPressing] = useState(false)

  const touchableRef = useRef(null)
  const isHovered = useHover(touchableRef)

  return (
    <SpringAnimatedTouchableOpacity
      ref={touchableRef}
      analyticsCategory="fab"
      {...otherProps}
      hitSlop={{
        top: contentPadding / 2,
        bottom: contentPadding / 2,
        left: contentPadding,
        right: contentPadding,
      }}
      onPressIn={() => setIsPressing(true)}
      onPressOut={() => setIsPressing(false)}
      style={[
        {
          width: fabSize,
          height: fabSize,
          borderRadius: fabSize / 2,
          backgroundColor: useBrandColor
            ? springAnimatedTheme.primaryBackgroundColor
            : springAnimatedTheme.backgroundColorLess1,
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: isHovered || isPressing ? 6 : 3,
          },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          zIndex: 1,
          overflow: 'hidden',
        },
        style,
      ]}
      tooltip={tooltip}
    >
      <SpringAnimatedView
        style={[
          {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            width: fabSize,
            height: fabSize,
            borderRadius: fabSize / 2,
            overflow: 'hidden',
          },
          !!(isHovered || isPressing) && {
            backgroundColor: useBrandColor
              ? springAnimatedTheme.backgroundColorTransparent10
              : springAnimatedTheme.backgroundColorLess2,
          },
        ]}
      >
        {typeof iconName === 'string' ? (
          <SpringAnimatedIcon
            name={iconName}
            style={[
              {
                width: fabSize / 2,
                height: fabSize / 2,
                lineHeight: fabSize / 2,
                marginTop: 1,
                fontSize: fabSize / 2,
                textAlign: 'center',
                color: useBrandColor
                  ? springAnimatedTheme.primaryForegroundColor
                  : springAnimatedTheme.foregroundColor,
              },
              iconStyle,
            ]}
          />
        ) : typeof children === 'string' ? (
          <SpringAnimatedText
            style={{
              fontSize: 14,
              lineHeight: 14,
              fontWeight: '500',
              color: useBrandColor
                ? springAnimatedTheme.primaryForegroundColor
                : springAnimatedTheme.foregroundColor,
            }}
          >
            {children}
          </SpringAnimatedText>
        ) : (
          children
        )}
      </SpringAnimatedView>
    </SpringAnimatedTouchableOpacity>
  )
}
