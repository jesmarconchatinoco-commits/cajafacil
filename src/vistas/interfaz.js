// Botones, teclado y barra. La vista usa estos componentes; los estilos están en estilos/componentes.js.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, Pressable, Text as Glyph, TextInput, View } from 'react-native'
import { colors, voiceText } from '../estilos/tema'
import { useUiStyles } from '../estilos/componentes'
import { useScreenStyles } from '../estilos/pantallas'
import { canListen, startListening } from '../js/escucha'
import { formatMoney, formatPhone } from '../js/logica.mjs'
import { spokenDigits } from '../js/montos.mjs'
import { qrMatrix } from '../js/qr.mjs'
import { speakAloud, stopAloud } from '../js/voz'
import { useApp } from '../js/estado'
import { Text, useLook } from './texto'
import { usePhone } from '../js/telefono'

export function Logo({ size = 72 }) {
  const receipt = size * 0.46
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        backgroundColor: colors.green,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: receipt,
          height: receipt * 0.86,
          backgroundColor: colors.white,
          borderRadius: 6,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            width: size * 0.2,
            height: size * 0.2,
            borderRadius: size,
            backgroundColor: colors.coin,
            marginBottom: -size * 0.06,
          }}
        />
      </View>
    </View>
  )
}

export function Avatar({ kind = 'woman', name = '', usePhoto = true, size = 48 }) {
  if (!usePhoto) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.greenSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: colors.greenInk, fontWeight: '800', fontSize: size * 0.38 }}>
          {(name || '?').trim().slice(0, 1).toUpperCase()}
        </Text>
      </View>
    )
  }

  const shirt = kind === 'man' ? colors.blue : colors.green
  const hair = kind === 'man' ? '#3E2C22' : '#6B3E2E'
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: kind === 'man' ? colors.blueSoft : colors.greenSoft,
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: size * 0.12,
          width: size * 0.46,
          height: size * 0.34,
          borderRadius: size,
          backgroundColor: hair,
        }}
      />
      <View
        style={{
          width: size * 0.34,
          height: size * 0.34,
          borderRadius: size,
          backgroundColor: '#F3C7A1',
          marginTop: size * 0.2,
        }}
      />
      <View
        style={{
          width: size * 0.72,
          height: size * 0.42,
          borderTopLeftRadius: size,
          borderTopRightRadius: size,
          backgroundColor: shirt,
          marginTop: size * 0.04,
        }}
      />
    </View>
  )
}

function useIconInk() {
  const { dark } = useLook()
  return dark ? '#FFFFFF' : '#1B1B1B'
}

function BackIcon() {
  const color = useIconInk()
  return (
    <View style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 12,
          height: 12,
          marginLeft: 4,
          borderLeftWidth: 3,
          borderBottomWidth: 3,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  )
}

function HomeIcon() {
  const color = useIconInk()
  const { dark } = useLook()
  const door = dark ? '#161616' : colors.white
  return (
    <View style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 11,
          borderRightWidth: 11,
          borderBottomWidth: 9,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
        }}
      />
      <View style={{ width: 16, height: 11, backgroundColor: color, alignItems: 'center', justifyContent: 'flex-end' }}>
        <View style={{ width: 6, height: 7, backgroundColor: door }} />
      </View>
    </View>
  )
}

function HelpIcon() {
  const color = useIconInk()
  return (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2.5,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Glyph style={{ color, fontSize: 15, fontWeight: '800', lineHeight: 17 }}>?</Glyph>
    </View>
  )
}

function AccessIcon() {
  const color = useIconInk()
  return (
    <View style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginBottom: 2 }} />
      <View
        style={{
          width: 16,
          height: 8,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          backgroundColor: color,
        }}
      />
    </View>
  )
}

function NavButton({ mark, label, onPress, hint, wide = false }) {
  const styles = useUiStyles()
  const { contrast } = useLook()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={hint || label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.navBtn,
        wide && { width: 92 },
        contrast && { borderColor: '#111111', borderWidth: 2 },
        pressed && styles.pressed,
      ]}
    >
      {mark}
      <Text numberOfLines={2} style={styles.navLabel}>{label}</Text>
    </Pressable>
  )
}

function SoundMark({ active }) {
  const wave = useRef(new Animated.Value(0)).current

  useEffect(() => {
    wave.setValue(0)
    const loop = Animated.loop(
      Animated.timing(wave, {
        toValue: 1,
        duration: active ? 680 : 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )
    loop.start()
    return () => loop.stop()
  }, [active, wave])

  const arcs = [10, 16, 22]

  return (
    <View style={{ width: 44, height: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 5,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: '#3A2498',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#FFFFFF' }} />
        </View>
      </View>
      <View style={{ width: 18, height: 26, marginLeft: 3, flexDirection: 'row', alignItems: 'center' }}>
        {arcs.map((size, index) => {
          const start = 0.05 + index * 0.22
          const mid = start + 0.18
          const end = start + 0.42
          const opacity = wave.interpolate({
            inputRange: [0, start, mid, end, 1],
            outputRange: [0.4, 0.4, 1, 0.4, 0.4],
          })
          const scale = wave.interpolate({
            inputRange: [0, start, mid, end, 1],
            outputRange: [0.84, 0.84, 1.16, 0.9, 0.84],
          })
          return (
            <Animated.View
              key={size}
              style={{
                width: Math.round(size * 0.4),
                height: size,
                marginLeft: index === 0 ? 0 : 1,
                borderWidth: 2.5,
                borderColor: '#FFFFFF',
                borderLeftWidth: 0,
                borderTopRightRadius: size,
                borderBottomRightRadius: size,
                opacity,
                transform: [{ scale }],
              }}
            />
          )
        })}
      </View>
    </View>
  )
}

export function MicMark({ size = 28, color = '#FFFFFF' }) {
  const head = size * 0.38
  const stroke = Math.max(2, Math.round(size * 0.08))
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View
        style={{
          position: 'absolute',
          top: size * 0.06,
          width: head,
          height: head * 1.25,
          borderRadius: head,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.28,
          width: head * 1.7,
          height: head,
          borderBottomLeftRadius: head,
          borderBottomRightRadius: head,
          borderWidth: stroke,
          borderTopWidth: 0,
          borderColor: color,
        }}
      />
      <View style={{ width: stroke, height: size * 0.16, backgroundColor: color }} />
      <View style={{ width: size * 0.46, height: stroke, borderRadius: stroke, backgroundColor: color, marginBottom: 1 }} />
    </View>
  )
}

function VoiceButton({ text }) {
  const styles = useUiStyles()
  const [speaking, setSpeaking] = useState(false)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      stopAloud()
    }
  }, [text])

  function finish() {
    if (alive.current) setSpeaking(false)
  }

  function toggle() {
    if (speaking) {
      setSpeaking(false)
      stopAloud()
      return
    }
    setSpeaking(true)
    speakAloud(text, { onStart: () => alive.current && setSpeaking(true), onEnd: finish })
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={speaking ? 'Detener el audio' : 'Audio. Escuchar de qué trata esta pantalla'}
      onPress={toggle}
      style={({ pressed }) => [
        styles.voiceBtn,
        speaking && styles.voiceBtnOn,
        pressed && styles.pressed,
      ]}
    >
      <SoundMark active={speaking} />
    </Pressable>
  )
}

export function TopBar({ mode = 'back', onBack, onHome, helpTopic, voice }) {
  const styles = useUiStyles()
  const { push, goHome } = useApp()
  const atStart = mode === 'home' || mode === 'splash'
  const spoken = voice || (helpTopic ? voiceText[helpTopic] : '')
  return (
    <View style={styles.topBar}>
      {mode === 'home' ? (
        <View style={styles.brandRow}>
          <Logo size={32} />
          <Text style={styles.brand}>CajaFácil</Text>
        </View>
      ) : null}
      <View style={styles.navLine}>
        <View style={styles.navRow}>
          {onBack ? (
            <NavButton mark={<BackIcon />} label="Volver" hint="Volver a la pantalla anterior" onPress={onBack} />
          ) : null}
          {!atStart ? (
            <NavButton mark={<HomeIcon />} label="Inicio" hint="Ir al inicio" onPress={onHome || goHome} />
          ) : null}
          {atStart ? (
            <NavButton mark={<AccessIcon />} label="Accesibilidad" hint="Abrir accesibilidad" onPress={() => push('a11y')} wide />
          ) : null}
          {helpTopic ? (
            <NavButton mark={<HelpIcon />} label="Ayuda" hint="Abrir ayuda de esta pantalla" onPress={() => push('help', { topic: helpTopic })} />
          ) : null}
        </View>
        {spoken ? <VoiceButton text={spoken} /> : null}
      </View>
    </View>
  )
}

function DockPlus({ color }) {
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 16, height: 3, borderRadius: 2, backgroundColor: color }} />
      <View style={{ position: 'absolute', width: 3, height: 16, borderRadius: 2, backgroundColor: color }} />
    </View>
  )
}

function DockBars({ color }) {
  return (
    <View style={{ width: 22, height: 22, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 3 }}>
      <View style={{ width: 5, height: 8, borderRadius: 1, backgroundColor: color }} />
      <View style={{ width: 5, height: 14, borderRadius: 1, backgroundColor: color }} />
      <View style={{ width: 5, height: 20, borderRadius: 1, backgroundColor: color }} />
    </View>
  )
}

function DockList({ color }) {
  return (
    <View style={{ width: 18, height: 22, borderWidth: 2.5, borderColor: color, borderRadius: 3, justifyContent: 'center', gap: 3, paddingHorizontal: 3 }}>
      <View style={{ height: 2, backgroundColor: color }} />
      <View style={{ height: 2, backgroundColor: color }} />
      <View style={{ height: 2, width: '70%', backgroundColor: color }} />
    </View>
  )
}

function DockUser({ color }) {
  return (
    <View style={{ width: 24, height: 22, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginBottom: 2 }} />
      <View style={{ width: 16, height: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: color }} />
    </View>
  )
}

function DockHouse({ color }) {
  return (
    <View style={{ width: 24, height: 22, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 10,
          borderRightWidth: 10,
          borderBottomWidth: 8,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
        }}
      />
      <View style={{ width: 14, height: 9, backgroundColor: color, marginTop: -1 }} />
    </View>
  )
}

export function Dock() {
  const styles = useUiStyles()
  const { dark } = useLook()
  const { route, state, draft, go, goHome, clearSale } = useApp()
  const [ask, setAsk] = useState(null)
  const name = route?.name
  const tabs = [
    { id: 'home', label: 'Inicio' },
    { id: 'saleAmount', label: 'Venta' },
    { id: 'balance', label: 'Balance' },
    { id: 'fiados', label: 'Fiados' },
    { id: 'account', label: 'Cuenta' },
  ]

  function selected(id) {
    if (id === 'home') return name === 'home'
    if (id === 'saleAmount') return ['saleAmount', 'salePay', 'saleSaved', 'sales', 'saleDetail'].includes(name)
    if (id === 'balance') return name === 'balance'
    if (id === 'fiados') return ['fiados', 'fiadoName', 'fiadoAmount', 'person', 'cobroAmount', 'cobroPay'].includes(name)
    return ['account', 'settings'].includes(name)
  }

  function goTab(id) {
    if (id === 'home') {
      goHome()
      return
    }
    if (id === 'saleAmount') clearSale()
    go([{ name: 'home' }, { name: id }])
  }

  function open(id) {
    if (name === id) return
    const sale = draft.sale || {}
    const dirty = sale.cents > 0 || (sale.lines || []).length > 0 || Boolean(sale.clientName)
    const leavingSale = ['saleAmount', 'salePay'].includes(name)
    if (leavingSale && state.settings.confirmLeave && dirty) {
      setAsk(id)
      return
    }
    goTab(id)
  }

  return (
    <>
      <View style={styles.dock}>
        {tabs.map((tab) => {
          const on = selected(tab.id)
          const color = on ? colors.green : dark ? '#FFFFFF' : '#1B1B1B'
          const mark = {
            home: <DockHouse color={color} />,
            saleAmount: <DockPlus color={color} />,
            balance: <DockBars color={color} />,
            fiados: <DockList color={color} />,
            account: <DockUser color={color} />,
          }[tab.id]
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: on }}
              onPress={() => open(tab.id)}
              style={({ pressed }) => [
                styles.dockItem,
                on && { backgroundColor: dark ? '#123524' : colors.greenSoft },
                pressed && { opacity: 0.82 },
              ]}
            >
              {mark}
              <Text style={[styles.dockLabel, { color }]}>{tab.label}</Text>
            </Pressable>
          )
        })}
      </View>
      {ask ? (
        <ModalCard title="¿Salir sin guardar?" body="Si sales ahora, esta venta no queda anotada.">
          <Button label="Seguir aquí" onPress={() => setAsk(null)} />
          <Button
            label="Salir"
            variant="red"
            onPress={() => {
              const next = ask
              setAsk(null)
              goTab(next)
            }}
          />
        </ModalCard>
      ) : null}
    </>
  )
}

export function Button({ label, onPress, variant = 'green', disabled = false }) {
  const styles = useUiStyles()
  const { dark } = useLook()
  const palette = {
    green: { bg: colors.green, text: colors.white },
    brown: { bg: colors.brown, text: colors.white },
    blue: { bg: colors.blue, text: colors.white },
    purple: { bg: colors.purple, text: colors.white },
    teal: { bg: colors.teal, text: colors.white },
    red: { bg: colors.red, text: colors.white },
    navy: { bg: colors.navy, text: colors.white },
    outline: { bg: dark ? '#161616' : colors.white, text: dark ? '#FFFFFF' : colors.text, border: dark ? '#3A3A3A' : colors.line },
  }
  const tone = disabled
    ? { bg: colors.disabled, text: colors.disabledText, border: colors.disabled }
    : palette[variant]
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: tone.bg, borderColor: tone.border || tone.bg },
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text numberOfLines={2} style={[styles.buttonText, { color: tone.text, textAlign: 'center' }]}>{label}</Text>
    </Pressable>
  )
}

export function Field({ label, hint, ...props }) {
  const styles = useUiStyles()
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor="#A3A093"
        style={styles.input}
        {...props}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  )
}

export function Step({ children }) {
  const styles = useUiStyles()
  return <Text style={styles.step}>{children}</Text>
}

export function Title({ children }) {
  const styles = useUiStyles()
  return <Text style={styles.title}>{children}</Text>
}

export function Sub({ children }) {
  const styles = useUiStyles()
  return <Text style={styles.sub}>{children}</Text>
}

export function ErrorText({ children }) {
  const styles = useUiStyles()
  if (!children) return null
  return <Text style={styles.error}>{children}</Text>
}

export function Note({ children }) {
  const styles = useUiStyles()
  return (
    <View style={styles.note}>
      <Text style={styles.noteText}>{children}</Text>
    </View>
  )
}

export function MoneyBig({ cents, label, color = colors.text }) {
  const styles = useUiStyles()
  return (
    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.55} style={[styles.money, { color, textAlign: 'center' }]}>
      {label || formatMoney(cents)}
    </Text>
  )
}

export function Keypad({ onDigit, onDelete, onAdd, onDot, addEnabled = true, showDot = false, keyHeight = 58 }) {
  const styles = useUiStyles()
  const { keyHeight: fitted, short } = usePhone()
  const height = Math.min(keyHeight, fitted)
  const gap = short ? 8 : 10
  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ]
  if (!onAdd) {
    return (
      <View style={{ gap }}>
        {rows.map((row) => (
          <View key={row.join('')} style={styles.keyRow}>
            {row.map((key) => (
              <Key key={key} label={key} height={height} onPress={() => onDigit(Number(key))} />
            ))}
          </View>
        ))}
        <View style={styles.keyRow}>
          {showDot ? <Key label="." height={height} muted={!onDot} onPress={onDot} /> : <View style={{ flex: 1 }} />}
          <Key label="0" height={height} onPress={() => onDigit(0)} />
          <Key label="⌫" height={height} danger onPress={onDelete} />
        </View>
      </View>
    )
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'stretch', gap }}>
      <View style={{ flex: 3, gap }}>
        {rows.map((row) => (
          <View key={row.join('')} style={styles.keyRow}>
            {row.map((key) => (
              <Key key={key} label={key} height={height} onPress={() => onDigit(Number(key))} />
            ))}
          </View>
        ))}
        <View style={styles.keyRow}>
          <Key label="." height={height} onPress={onDot} />
          <Key label="0" height={height} grow={2} onPress={() => onDigit(0)} />
        </View>
      </View>
      <View style={{ flex: 1.15, gap }}>
        <Key label="⌫" height={height} grow={0} danger onPress={onDelete} />
        <Key label="+" fill accent pulse={addEnabled} onPress={addEnabled ? onAdd : undefined} />
      </View>
    </View>
  )
}

function Key({ label, onPress, height, grow = 1, fill = false, danger = false, muted = false, accent = false, pulse = false }) {
  const styles = useUiStyles()
  const { dark } = useLook()
  const glow = useRef(new Animated.Value(1)).current
  const name = label === '⌫' ? 'Borrar' : label === '+' ? 'Sumar este monto' : label === '.' ? 'Punto decimal' : label
  const background = accent ? colors.blue : danger ? colors.redSoft : dark ? '#161616' : colors.white
  const edge = accent ? '#163AA8' : danger ? '#E3B0AD' : dark ? '#2A2A2A' : '#D5D0C4'
  const symbol = label === '+' || label === '.'

  useEffect(() => {
    if (!pulse) {
      glow.setValue(1)
      return undefined
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 0.45, duration: 520, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 1, duration: 520, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [glow, pulse])

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      disabled={muted}
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        {
          flexGrow: fill ? 1 : grow,
          flexShrink: !fill && grow === 0 ? 0 : 1,
          flexBasis: !fill && grow === 0 ? undefined : 0,
          height: fill ? undefined : height,
          minHeight: height,
          backgroundColor: background,
          borderBottomColor: edge,
          borderBottomWidth: pressed ? 1 : 4,
          transform: [{ translateY: pressed ? 3 : 0 }],
        },
        muted && { opacity: 0.45 },
      ]}
    >
      {accent ? (
        <Animated.Text style={{ color: '#FFFFFF', fontSize: 40, fontWeight: '800', opacity: glow, lineHeight: 46 }}>+</Animated.Text>
      ) : (
        <Text style={[styles.keyText, symbol && { fontSize: 34, lineHeight: 40 }, danger && { color: colors.red }]}>{label}</Text>
      )}
    </Pressable>
  )
}

export function Otp({ value, secret = false }) {
  const styles = useUiStyles()
  return (
    <View style={styles.otpRow}>
      {Array.from({ length: 6 }, (_, index) => {
        const char = value[index] || ''
        const active = index === value.length
        return (
          <View
            key={index}
            style={[
              styles.otp,
              (char || active) && { borderColor: colors.green },
            ]}
          >
            <Text style={styles.otpText}>{secret ? (char ? '•' : '') : char}</Text>
          </View>
        )
      })}
    </View>
  )
}

export function ModalCard({ title, body, children }) {
  const styles = useUiStyles()
  return (
    <View style={styles.modalRoot}>
      <View style={styles.modalCard}>
        <View style={styles.warnIcon}>
          <Text style={{ color: colors.red, fontSize: 18, fontWeight: '800' }}>!</Text>
        </View>
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalBody}>{body}</Text>
        <View style={{ gap: 10, marginTop: 16 }}>{children}</View>
      </View>
    </View>
  )
}

export function YapeMark({ size = 32 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: '#742284',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: size,
          backgroundColor: '#FFFFFF',
          marginTop: size * 0.16,
        }}
      />
      <View
        style={{
          width: size * 0.62,
          height: size * 0.34,
          borderTopLeftRadius: size,
          borderTopRightRadius: size,
          backgroundColor: '#FFFFFF',
          marginTop: size * 0.05,
        }}
      />
    </View>
  )
}

export function PlinMark({ size = 32 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: '#00B894',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
      }}
    >
      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: Math.max(9, Math.round(size * 0.28)) }}>
        plin
      </Text>
    </View>
  )
}

export function QrCode({ value, cell = 6 }) {
  const matrix = useMemo(() => qrMatrix(value), [value])
  const dim = matrix.length * cell
  return (
    <View style={{ width: dim, height: dim, backgroundColor: '#FFFFFF', flexDirection: 'row', flexWrap: 'wrap' }}>
      {matrix.flat().map((on, index) => (
        <View key={index} style={{ width: cell, height: cell, backgroundColor: on ? '#1B1B1B' : '#FFFFFF' }} />
      ))}
    </View>
  )
}

export function YapePanel({ brand = 'yape', cents, phone, note = '', onNote, showNote = true }) {
  const styles = useScreenStyles()
  const ui = useUiStyles()
  const [hearing, setHearing] = useState(false)
  const [hearNote, setHearNote] = useState('')
  const stopHear = useRef(null)
  const hearingRef = useRef(false)
  const shown = formatPhone(phone)
  const money = formatMoney(cents)
  const plin = brand === 'plin'
  const name = plin ? 'Plin' : 'Yape'
  const color = plin ? colors.teal : colors.purple
  const payload = `CajaFacil ${name} ${shown} ${money}`

  function stopNote() {
    hearingRef.current = false
    setHearing(false)
    if (!stopHear.current) return
    const stop = stopHear.current
    stopHear.current = null
    stop()
  }

  useEffect(() => {
    return () => {
      hearingRef.current = false
      setHearing(false)
      if (!stopHear.current) return
      const stop = stopHear.current
      stopHear.current = null
      stop()
    }
  }, [brand])

  function toggleNote() {
    if (hearingRef.current) {
      stopNote()
      return
    }
    if (!canListen()) {
      const message = 'Aquí no puedo escuchar. Escribe el número.'
      setHearNote(message)
      speakAloud(message)
      return
    }
    setHearNote('')
    hearingRef.current = true
    setHearing(true)
    stopAloud()
    stopHear.current = startListening({
      onLive: (text) => {
        const digits = spokenDigits(text)
        if (digits && onNote) onNote(digits)
      },
      onPhrase: () => {},
      onError: (code) => {
        stopNote()
        const message = code === 'not-allowed'
          ? 'Permite el micrófono para decir el número.'
          : 'No pude escuchar. Toca Decir otra vez.'
        setHearNote(message)
        speakAloud(message)
      },
      onEnd: () => stopNote(),
    })
  }

  return (
    <View style={[styles.payCard, { borderColor: plin ? '#B7E8DC' : '#D9C7F5' }]}>
      <View style={styles.payBrand}>
        {plin ? <PlinMark size={52} /> : <YapeMark size={52} />}
        <Text style={[styles.payBrandName, { fontSize: 22, color }]}>{name}</Text>
      </View>
      <Text style={styles.payHint}>Código solo de {name}. El cliente abre {name} y lo escanea.</Text>
      <View style={styles.qrBox}>
        <QrCode value={payload} />
      </View>
      <Text style={styles.payLabel}>Monto a pagar</Text>
      <Text style={[styles.payAmount, { color }]}>{money}</Text>
      {shown ? <Text style={styles.payPhone}>Al número {shown}</Text> : null}
      {showNote ? (
        <View style={styles.payField}>
          <Text style={ui.label}>N.° de operación</Text>
          <View style={styles.noteRow}>
            <TextInput
              value={note}
              placeholder="Ejemplo: 123456"
              placeholderTextColor="#A3A093"
              keyboardType="number-pad"
              onChangeText={onNote}
              style={[
                ui.input,
                { flex: 1 },
                hearing && { borderColor: colors.red, borderWidth: 2 },
              ]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={hearing ? 'Dejar de escuchar el número' : 'Decir el número de operación'}
              onPress={toggleNote}
              style={({ pressed }) => [
                styles.noteListen,
                { backgroundColor: hearing ? colors.red : colors.green },
                pressed && { opacity: 0.86 },
              ]}
            >
              <MicMark size={22} />
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>{hearing ? 'Alto' : 'Decir'}</Text>
            </Pressable>
          </View>
          <Text style={ui.hint}>{hearNote || 'Escríbelo o toca Decir y habla el número.'}</Text>
        </View>
      ) : null}
    </View>
  )
}

export function MethodOption({ method, selected, onPress, leading }) {
  const styles = useUiStyles()
  const { narrow } = usePhone()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={method.label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.method,
        narrow && { paddingHorizontal: 10 },
        {
          backgroundColor: selected ? method.color : method.soft,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
        {leading}
        <Text
          numberOfLines={2}
          style={[
            styles.methodText,
            { color: selected ? colors.white : method.color, textAlign: leading ? 'left' : 'center', flex: 1 },
          ]}
        >
          {method.label}
        </Text>
      </View>
      {selected ? <Text style={styles.check}>✓</Text> : <View style={{ width: 18 }} />}
    </Pressable>
  )
}
