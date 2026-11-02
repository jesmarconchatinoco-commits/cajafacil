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

const AVATAR_LOOKS = {
  woman: { hair: '#6B3E2E', style: 'long', shirt: '#188145', bg: '#E3F6EA', skin: '#F3C7A1' },
  rosa: { hair: '#C47A4A', style: 'bob', shirt: '#C45C7A', bg: '#FDE8EF', skin: '#F8D7B5' },
  abuela: { hair: '#E6E6E6', style: 'bun', shirt: '#B15509', bg: '#FFF3D6', skin: '#E8C4A4' },
  man: { hair: '#3E2C22', style: 'short', shirt: '#1E4CD5', bg: '#E7EEFF', skin: '#E0B08A' },
  abuelo: { hair: '#D5D5D5', style: 'short', shirt: '#8A4E08', bg: '#FFF3D6', skin: '#D7A87A', glasses: true },
  carlos: { hair: '#1A1A1A', style: 'short', shirt: '#0F4D28', bg: '#E3F6EA', skin: '#8D5524', beard: true },
}

export const avatarGroups = [
  {
    title: 'Mujeres',
    options: [
      { id: 'woman', label: 'Mujer' },
      { id: 'rosa', label: 'Mujer' },
      { id: 'abuela', label: 'Mujer' },
    ],
  },
  {
    title: 'Hombres',
    options: [
      { id: 'man', label: 'Hombre' },
      { id: 'abuelo', label: 'Hombre' },
      { id: 'carlos', label: 'Hombre' },
    ],
  },
]

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

  const look = AVATAR_LOOKS[kind] || AVATAR_LOOKS.woman
  const wide = look.style === 'bob' || look.style === 'long'
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: look.bg,
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {look.style === 'bun' ? (
        <View
          style={{
            position: 'absolute',
            top: size * 0.06,
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: size,
            backgroundColor: look.hair,
          }}
        />
      ) : null}
      <View
        style={{
          position: 'absolute',
          top: size * (look.style === 'bun' ? 0.16 : 0.1),
          width: size * (wide ? 0.62 : 0.48),
          height: size * (look.style === 'long' ? 0.46 : 0.32),
          borderRadius: size,
          backgroundColor: look.hair,
        }}
      />
      {look.style === 'long' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.12, top: size * 0.28, width: size * 0.12, height: size * 0.42, borderRadius: size, backgroundColor: look.hair }} />
          <View style={{ position: 'absolute', right: size * 0.12, top: size * 0.28, width: size * 0.12, height: size * 0.42, borderRadius: size, backgroundColor: look.hair }} />
        </>
      ) : null}
      <View
        style={{
          width: size * 0.34,
          height: size * 0.34,
          borderRadius: size,
          backgroundColor: look.skin,
          marginTop: size * 0.22,
        }}
      />
      {look.glasses ? (
        <View style={{ position: 'absolute', top: size * 0.32, flexDirection: 'row', gap: size * 0.02 }}>
          <View style={{ width: size * 0.16, height: size * 0.12, borderRadius: size, borderWidth: 1.5, borderColor: '#1B1B1B' }} />
          <View style={{ width: size * 0.16, height: size * 0.12, borderRadius: size, borderWidth: 1.5, borderColor: '#1B1B1B' }} />
        </View>
      ) : null}
      {look.beard ? (
        <View
          style={{
            position: 'absolute',
            top: size * 0.46,
            width: size * 0.18,
            height: size * 0.1,
            borderBottomLeftRadius: size,
            borderBottomRightRadius: size,
            backgroundColor: look.hair,
          }}
        />
      ) : null}
      <View
        style={{
          width: size * 0.72,
          height: size * 0.42,
          borderTopLeftRadius: size,
          borderTopRightRadius: size,
          backgroundColor: look.shirt,
          marginTop: size * 0.02,
        }}
      />
    </View>
  )
}

function AvatarChoice({ option, selected, onPress }) {
  const styles = useScreenStyles()
  const motion = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!selected) {
      motion.setValue(0)
      return undefined
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(motion, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(motion, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [motion, selected])

  const scale = motion.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] })
  const lift = motion.interpolate({ inputRange: [0, 1], outputRange: [0, -4] })

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={option.label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.avatarCard,
        selected && styles.avatarSelected,
        pressed && { opacity: 0.86 },
      ]}
    >
      {selected ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓</Text>
        </View>
      ) : null}
      <Animated.View style={{ transform: [{ translateY: lift }, { scale }] }}>
        <Avatar kind={option.id} size={64} />
      </Animated.View>
    </Pressable>
  )
}

export function AvatarPicker({ value, onChange }) {
  const styles = useScreenStyles()
  return (
    <View style={{ gap: 14 }}>
      {avatarGroups.map((group) => (
        <View key={group.title} style={{ gap: 8 }}>
          <Text style={styles.toggleTitle}>{group.title}</Text>
          <View style={styles.avatarRow}>
            {group.options.map((option) => (
              <AvatarChoice
                key={option.id}
                option={option}
                selected={value === option.id}
                onPress={() => onChange(option.id)}
              />
            ))}
          </View>
        </View>
      ))}
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
  const figure = '#FFFFFF'
  return (
    <View style={{ width: 30, height: 30, alignItems: 'center' }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: figure }} />
      <View style={{ width: 22, height: 4, borderRadius: 2, backgroundColor: figure, marginTop: 2, alignItems: 'center' }}>
        <View style={{ position: 'absolute', top: 0, width: 4, height: 11, borderRadius: 2, backgroundColor: figure }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 16, marginTop: 7 }}>
        <View style={{ width: 4, height: 9, borderRadius: 2, backgroundColor: figure, transform: [{ rotate: '32deg' }] }} />
        <View style={{ width: 4, height: 9, borderRadius: 2, backgroundColor: figure, transform: [{ rotate: '-32deg' }] }} />
      </View>
    </View>
  )
}

function NavButton({ mark, label, onPress, hint, iconOnly = false }) {
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
        iconOnly && {
          width: 52,
          height: 52,
          minHeight: 52,
          paddingVertical: 0,
          borderRadius: 26,
          backgroundColor: colors.green,
          borderColor: colors.green,
        },
        contrast && { borderColor: '#111111', borderWidth: 2 },
        pressed && styles.pressed,
      ]}
    >
      {mark}
      {iconOnly ? null : <Text numberOfLines={2} style={styles.navLabel}>{label}</Text>}
    </Pressable>
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

function EarMark({ color }) {
  return (
    <View style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 16,
          height: 22,
          borderWidth: 3,
          borderColor: color,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 7,
            height: 10,
            borderWidth: 2,
            borderRightWidth: 0,
            borderColor: color,
            borderTopLeftRadius: 6,
            borderBottomLeftRadius: 6,
          }}
        />
      </View>
    </View>
  )
}

function VoiceButton({ text }) {
  const styles = useUiStyles()
  const [speaking, setSpeaking] = useState(false)
  const alive = useRef(true)
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      stopAloud()
    }
  }, [text])

  useEffect(() => {
    if (speaking) {
      pulse.setValue(1)
      return undefined
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [pulse, speaking])

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
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={speaking ? 'Detener la ayuda hablada' : 'Escuchar la ayuda de esta pantalla'}
        onPress={toggle}
        style={({ pressed }) => [
          styles.voiceBtn,
          speaking && styles.voiceBtnOn,
          pressed && styles.pressed,
        ]}
      >
        <EarMark color="#FFFFFF" />
        <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>
          {speaking ? 'Alto' : 'Escuchar'}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

export function TopBar({ mode = 'back', onBack, helpTopic, voice }) {
  const styles = useUiStyles()
  const { push } = useApp()
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
        {onBack ? (
          <NavButton mark={<BackIcon />} label="Volver" hint="Volver a la pantalla anterior" onPress={onBack} />
        ) : <View />}
        <View style={styles.navRow}>
          {atStart ? (
            <NavButton mark={<AccessIcon />} label="Accesibilidad" hint="Abrir accesibilidad" onPress={() => push('a11y')} iconOnly />
          ) : null}
          {helpTopic ? (
            <NavButton mark={<HelpIcon />} label="Ayuda" hint="Abrir ayuda de esta pantalla" onPress={() => push('help', { topic: helpTopic })} />
          ) : null}
          {spoken ? <VoiceButton text={spoken} /> : null}
        </View>
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

export function Keypad({ onDigit, onDelete, onAdd, onEquals, onDot, addEnabled = true, showDot = false, keyHeight = 58 }) {
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
        <View style={{ height, zIndex: 2, overflow: 'hidden' }}>
          <Key label="⌫" height={height} grow={0} danger onPress={onDelete} />
        </View>
        <View style={{ flex: 1, minHeight: height, zIndex: 1, overflow: 'hidden' }}>
          <Key label="+" fill accent pulse={addEnabled} onPress={addEnabled ? onAdd : undefined} />
        </View>
        <View style={{ height, zIndex: 2, overflow: 'hidden' }}>
          <Key label="=" height={height} grow={0} result onPress={onEquals} />
        </View>
      </View>
    </View>
  )
}

function EraseMark() {
  return (
    <View style={{ width: 26, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 12,
          height: 12,
          borderLeftWidth: 3,
          borderBottomWidth: 3,
          borderColor: colors.red,
          transform: [{ rotate: '45deg' }],
          marginLeft: 4,
        }}
      />
    </View>
  )
}

function Key({ label, onPress, height, grow = 1, fill = false, danger = false, muted = false, accent = false, result = false, pulse = false }) {
  const styles = useUiStyles()
  const { dark } = useLook()
  const glow = useRef(new Animated.Value(1)).current
  const name = label === '⌫' ? 'Borrar el último número' : label === '+' ? 'Sumar este monto' : label === '=' ? 'Igual, dejar el total' : label === '.' ? 'Punto decimal' : label
  const background = result ? colors.green : accent ? colors.blue : danger ? colors.redSoft : dark ? '#161616' : colors.white
  const edge = result ? '#0F4D28' : accent ? '#163AA8' : danger ? '#E3B0AD' : dark ? '#2A2A2A' : '#D5D0C4'
  const symbol = label === '+' || label === '.' || label === '='

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
          flexBasis: fill ? 0 : grow === 0 ? undefined : 0,
          height: fill ? undefined : height,
          width: fill || grow === 0 ? '100%' : undefined,
          minHeight: height,
          backgroundColor: background,
          borderBottomColor: edge,
          borderBottomWidth: pressed ? 1 : 4,
          transform: [{ translateY: pressed ? 3 : 0 }],
        },
        muted && { opacity: 0.45 },
      ]}
    >
      {label === '⌫' ? <EraseMark /> : accent ? (
        <Animated.Text style={{ color: '#FFFFFF', fontSize: 40, fontWeight: '800', opacity: glow, lineHeight: 46 }}>+</Animated.Text>
      ) : (
        <Text style={[styles.keyText, symbol && { fontSize: 34, lineHeight: 40 }, danger && { color: colors.red }, result && { color: '#FFFFFF', fontSize: 40, lineHeight: 46 }]}>{label}</Text>
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
