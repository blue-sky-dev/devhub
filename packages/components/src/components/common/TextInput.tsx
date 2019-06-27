import React, { useRef, useState } from 'react'
import {
  TextInput as TextInputOriginal,
  TextInputProps as TextInputOriginalProps,
} from 'react-native'

import { ThemeTransformer } from '@devhub/core'
import { useHover } from '../../hooks/use-hover'
import { contentPadding } from '../../styles/variables'
import { useTheme } from '../context/ThemeContext'

export interface TextInputProps extends Omit<TextInputOriginalProps, 'style'> {
  backgroundColor?: string
  backgroundFocusColor?: string
  backgroundHoverColor?: string
  borderColor?: string
  borderFocusColor?: string
  borderHoverColor?: string
  disableBlurOnEsc?: boolean
  fontSize?: number
  placeholderTextColor?: string
  size?: number
  style?: Omit<
    TextInputOriginalProps['style'],
    'backgroundColor' | 'borderColor' | 'color' | 'fontSize' | 'height'
  >
  textColor?: string
  textFocusColor?: string
  textHoverColor?: string
  textInputKey: string
  themeTransformer?: ThemeTransformer
}

export const defaultTextInputHeight = 36

export const TextInput = React.forwardRef(
  (props: TextInputProps, receivedRef: any) => {
    const {
      disableBlurOnEsc,
      fontSize = 14,
      size = defaultTextInputHeight,
      style,
      textInputKey,
      themeTransformer,
      ..._otherProps
    } = props

    const [isFocused, setIsFocused] = useState(false)

    const theme = useTheme({ themeTransformer })

    const fallbackRef = useRef(null)
    const ref = receivedRef || fallbackRef
    const isHovered = useHover(ref)

    const {
      backgroundFocusColor,
      backgroundHoverColor,
      backgroundColor: _backgroundColor = 'transparent',
      borderFocusColor = theme.primaryBackgroundColor,
      borderHoverColor = theme.foregroundColor,
      borderColor: _borderColor = theme.foregroundColorMuted60,
      placeholderTextColor = theme.foregroundColorMuted40,
      textFocusColor,
      textHoverColor,
      textColor: _textColor = theme.foregroundColor,
      ...otherProps
    } = _otherProps

    const backgroundColor =
      (isFocused && backgroundFocusColor) ||
      (isHovered && backgroundHoverColor) ||
      _backgroundColor ||
      'transparent'

    const borderColor =
      (isFocused && borderFocusColor) ||
      (isHovered && borderHoverColor) ||
      _borderColor ||
      'transparent'

    const color =
      (isFocused && textFocusColor) ||
      (isHovered && textHoverColor) ||
      _textColor ||
      theme.foregroundColor

    return (
      <TextInputOriginal
        key={textInputKey}
        ref={ref}
        placeholderTextColor={placeholderTextColor}
        {...otherProps}
        onBlur={e => {
          setIsFocused(false)
          if (otherProps.onBlur) otherProps.onBlur(e)
        }}
        onFocus={e => {
          setIsFocused(true)
          if (otherProps.onFocus) otherProps.onFocus(e)
        }}
        onKeyPress={e => {
          if (!disableBlurOnEsc && e.nativeEvent.key === 'Escape') {
            if (ref && ref.current && ref.current.blur) ref.current.blur()
          }

          if (otherProps.onKeyPress) otherProps.onKeyPress(e)
        }}
        style={[
          {
            lineHeight: Math.min(fontSize + 4, size),
            height: size,
            margin: 0,
            paddingVertical: 0,
            paddingHorizontal: contentPadding,
            borderRadius: size / 2,
            borderWidth: 1,
            fontSize,
          },
          style,
          {
            backgroundColor,
            borderColor,
            color,
          },
        ]}
      />
    )
  },
)

TextInput.displayName = 'TextInput'

export type TextInput = typeof TextInputOriginal
