import { Text as NativeText, StyleSheet } from 'react-native'
import { colors } from '../estilos/tema'
import { useApp } from '../js/estado'

export function useLook() {
  const { state } = useApp()
  const settings = state?.settings || {}
  const textSize = settings.textSize || 'normal'
  const scale = textSize === 'muy' ? 1.34 : textSize === 'grande' ? 1.16 : 1
  return {
    scale,
    spacing: settings.spacing ? 1.22 : 1,
    contrast: Boolean(settings.contrast),
    dark: Boolean(settings.dark),
    textSize,
  }
}

export function Text({ style, ...props }) {
  const { scale, spacing, contrast, dark } = useLook()
  const flat = StyleSheet.flatten(style) || {}
  const fontSize = Math.round((flat.fontSize || 16) * scale)
  const lineHeight = Math.round((flat.lineHeight ? flat.lineHeight * scale : fontSize * 1.28) * (spacing > 1 ? 1.12 : 1))
  const extra = { fontSize, lineHeight }
  if (dark) {
    if (!flat.color || flat.color === colors.text) extra.color = '#FFFFFF'
    else if (flat.color === colors.muted || flat.color === colors.disabledText) extra.color = '#D0D0D0'
    else if (flat.color === colors.greenInk) extra.color = '#E7FFF0'
  } else if (contrast && (flat.color === colors.muted || flat.color === colors.disabledText)) {
    extra.color = '#1A1A1A'
  }
  return <NativeText {...props} style={[style, extra]} />
}
