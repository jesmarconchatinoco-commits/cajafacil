// Tamaño de letra, contraste y espacio.
import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  useWindowDimensions,
  View,
} from 'react-native'
import { colors, helpText, methods, periods, voiceText } from '../estilos/tema'
import { useScreenStyles } from '../estilos/pantallas'
import { Text, useLook } from './texto'
import {
  addFiado,
  addProduct,
  addSale,
  backspaceMoney,
  cartTotal,
  catalogOf,
  cobrar,
  debtors,
  formatClock,
  formatMoney,
  formatPhone,
  formatQty,
  formatWhen,
  getPerson,
  getSale,
  login,
  logout,
  periodSummary,
  pushDigit,
  register,
  removeProduct,
  salesOf,
  sessionUser,
  setSetting,
  totalDebt,
  voidSale,
  DEMO_CODE,
  DEMO_PHONE,
  DEMO_PIN,
} from '../js/logica.mjs'
import { useApp } from '../js/estado'
import { usePhone } from '../js/telefono'
import {
  Avatar,
  Button,
  ErrorText,
  Field,
  Keypad,
  Logo,
  MethodOption,
  ModalCard,
  MoneyBig,
  Note,
  Otp,
  Step,
  Sub,
  Title,
  TopBar,
} from './interfaz'

import { AmountBox, DetailRow, Frame, Tab, cartItems, productText } from './marco'
function SettingRow({ title, sub, value, onPress }) {
  const styles = useScreenStyles()
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={styles.toggleCard}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSub}>{sub}</Text>
      </View>
      <View pointerEvents="none">
        <Switch
          value={value}
          trackColor={{ true: colors.green, false: colors.line }}
          thumbColor={colors.white}
        />
      </View>
    </Pressable>
  )
}

export function Accessibility() {
  const styles = useScreenStyles()
  const { state, pop, patch } = useApp()
  const { textSize } = useLook()
  const [askReset, setAskReset] = useState(false)
  const sizes = [
    { id: 'normal', label: 'Letra normal' },
    { id: 'grande', label: 'Letra grande' },
    { id: 'muy', label: 'Letra muy grande' },
  ]

  function choose(key, value) {
    patch((current) => setSetting(current, key, value))
  }

  function reset() {
    patch((current) => {
      let next = setSetting(current, 'textSize', 'normal')
      next = setSetting(next, 'contrast', false)
      next = setSetting(next, 'dark', false)
      next = setSetting(next, 'spacing', false)
      next = setSetting(next, 'slowVoice', false)
      return next
    })
    setAskReset(false)
  }

  return (
    <View style={{ flex: 1 }}>
      <Frame onBack={() => pop()} helpTopic="a11y">
        <Title>Accesibilidad</Title>
        <Sub>Ajusta la letra, el contraste y el fondo. En cada pantalla, Escuchar explica para qué sirve.</Sub>
        <Text style={styles.label}>Tamaño de texto</Text>
        <View style={{ gap: 10, marginBottom: 16 }}>
          {sizes.map((item) => {
            const selected = textSize === item.id
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => choose('textSize', item.id)}
                style={[styles.choice, selected && styles.choiceOn]}
              >
                <Text style={styles.choiceText}>{selected ? '✓  ' : ''}{item.label}</Text>
              </Pressable>
            )
          })}
        </View>
        <SettingRow
          title="Contraste alto"
          sub="Fondo blanco y textos más oscuros."
          value={Boolean(state.settings.contrast)}
          onPress={() =>
            patch((current) => {
              const value = !current.settings.contrast
              let next = setSetting(current, 'contrast', value)
              if (value) next = setSetting(next, 'dark', false)
              return next
            })
          }
        />
        <SettingRow
          title="Fondo negro"
          sub="Cambia el fondo de blanco a negro."
          value={Boolean(state.settings.dark)}
          onPress={() =>
            patch((current) => {
              const value = !current.settings.dark
              let next = setSetting(current, 'dark', value)
              if (value) next = setSetting(next, 'contrast', false)
              return next
            })
          }
        />
        <Text style={[styles.empty, { marginTop: 8, marginBottom: 4 }]}>
          Puedes usar uno. Si activas el otro, el primero se apaga.
        </Text>
        <SettingRow
          title="Más espacio"
          sub="Separa las líneas para leer sin apuro."
          value={Boolean(state.settings.spacing)}
          onPress={() => choose('spacing', !state.settings.spacing)}
        />
        <SettingRow
          title="Hablar más despacio"
          sub="Escuchar lee más despacio en todas las pantallas."
          value={Boolean(state.settings.slowVoice)}
          onPress={() => choose('slowVoice', !state.settings.slowVoice)}
        />
        <View style={{ marginTop: 16 }}>
          <Button label="Restablecer" variant="outline" onPress={() => setAskReset(true)} />
        </View>
        <Text style={[styles.empty, { marginTop: 16 }]}>
          Las ventas, los fiados y estos ajustes se guardan en este celular. No se envían a internet.
        </Text>
        <View style={{ height: 36 }} />
      </Frame>
      {askReset ? (
        <ModalCard
          title="¿Volver a la letra normal?"
          body="Se apagan el contraste, el fondo negro, el espacio extra y la voz lenta."
        >
          <Button label="No" onPress={() => setAskReset(false)} />
          <Button label="Sí, restablecer" variant="outline" onPress={reset} />
        </ModalCard>
      ) : null}
    </View>
  )
}
