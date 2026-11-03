import { Platform } from 'react-native'
import { colors } from './tema'

export const shell = {
  root: {
    flex: 1,
    backgroundColor: '#E4E0D4',
    alignItems: 'center',
    ...(Platform.OS === 'web'
      ? { width: '100%', height: '100vh', maxHeight: '100dvh', minHeight: 0, overflow: 'hidden' }
      : null),
  },
  phone: {
    width: '100%',
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  phoneFill: {
    flex: 1,
    maxWidth: '100%',
    ...(Platform.OS === 'web' ? { minHeight: 0 } : null),
  },
}
