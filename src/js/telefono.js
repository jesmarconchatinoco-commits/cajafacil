import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function deskFrame(width, height) {
  if (width < 720) return null
  return {
    width: Math.min(420, Math.max(320, width - 48)),
    height: Math.min(844, Math.max(320, height - 48)),
  }
}

export function usePhone() {
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const frame = deskFrame(width, height)
  const contentWidth = frame ? frame.width : width
  const contentHeight = frame ? frame.height : height
  const narrow = contentWidth < 390
  const wide = contentWidth >= 560
  const short = contentHeight < 700
  const pad = narrow ? 12 : 18
  const keyHeight = contentHeight < 640 ? 44 : contentHeight < 760 ? 50 : 56
  const stackPay = contentWidth < 520
  return { width: contentWidth, height: contentHeight, narrow, wide, short, pad, keyHeight, stackPay, insets, framed: Boolean(frame) }
}
