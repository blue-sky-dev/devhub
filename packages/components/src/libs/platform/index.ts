import { Platform as _Platform, PlatformIOSStatic } from 'react-native'

import isCatalyst from '../is-catalyst'

import {
  PlataformSelectSpecificsEnhanced,
  PlatformName,
  PlatformRealOS,
  PlatformSelectOptions,
} from './index.shared'

const isMacOS = !!(
  isCatalyst ||
  (_Platform as any).constants?.systemName?.toLowerCase().startsWith('mac')
)

export const Platform = {
  ..._Platform,
  isDesktop: isMacOS,
  isElectron: false,
  isMacOS,
  isPad: !!(_Platform as PlatformIOSStatic).isPad,
  isStandalone: true,
  OS: _Platform.OS as PlatformName,
  realOS: (isMacOS ? 'macos' : _Platform.OS) as PlatformRealOS,
  selectUsingRealOS<T>(
    specifics: PlataformSelectSpecificsEnhanced<T>,
    _options?: PlatformSelectOptions,
  ) {
    return Platform.realOS in specifics
      ? specifics[Platform.realOS]
      : _Platform.select(specifics)
  },
  supportsTouch: true,
}
