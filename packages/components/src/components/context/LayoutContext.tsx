import React, { useContext } from 'react'
import { Dimensions } from 'react-native'
import { useDimensions } from '../../hooks/use-dimensions'

export const APP_LAYOUT_BREAKPOINTS = {
  SMALL: 420,
  MEDIUM: 580,
  LARGE: 700,
  XLARGE: 1000,
  XXLARGE: 1200,
}

export interface AppLayoutProviderProps {
  children?: React.ReactNode
}

export interface AppLayoutProviderState {
  appOrientation: 'landscape' | 'portrait'
  deviceOrientation: 'landscape' | 'portrait'
  sizename:
    | '1-small'
    | '2-medium'
    | '3-large'
    | '4-x-large'
    | '5-xx-large'
    | '6-larger'
}

export const AppLayoutContext = React.createContext<AppLayoutProviderState>(
  getLayoutConsumerState(),
)
AppLayoutContext.displayName = 'AppLayoutContext'

export function AppLayoutProvider(props: AppLayoutProviderProps) {
  const dimensions = useDimensions()

  return (
    <AppLayoutContext.Provider value={getLayoutConsumerState(dimensions)}>
      {props.children}
    </AppLayoutContext.Provider>
  )
}

export const AppLayoutConsumer = AppLayoutContext.Consumer
;(AppLayoutConsumer as any).displayName = 'AppLayoutConsumer'

export function getLayoutConsumerState(dimensions?: {
  width: number
  height: number
}): AppLayoutProviderState {
  const { width, height } = dimensions || Dimensions.get('window')

  const sizename: AppLayoutProviderState['sizename'] =
    width <= APP_LAYOUT_BREAKPOINTS.SMALL
      ? '1-small'
      : width <= APP_LAYOUT_BREAKPOINTS.MEDIUM
      ? '2-medium'
      : width <= APP_LAYOUT_BREAKPOINTS.LARGE
      ? '3-large'
      : width <= APP_LAYOUT_BREAKPOINTS.XLARGE
      ? '4-x-large'
      : width <= APP_LAYOUT_BREAKPOINTS.XXLARGE
      ? '5-xx-large'
      : '6-larger'

  const deviceOrientation = width > height ? 'landscape' : 'portrait'
  const appOrientation =
    deviceOrientation === 'landscape' || sizename >= '3-large'
      ? 'landscape'
      : 'portrait'

  return { appOrientation, deviceOrientation, sizename }
}

export function useAppLayout() {
  return useContext(AppLayoutContext)
}
