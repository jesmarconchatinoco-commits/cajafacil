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
export function Accessibility() {
  const styles = useScreenStyles()
  const { state, pop, patch } = useApp()
  const { textSize } = useLook()
  const sizes = [
    { id: 'normal', label: 'Letra normal' },
    { id: 'grande', label: 'Letra grande' },
    { id: 'muy', label: 'Letra muy grande' },
  ]

  function choose(key, value) {
    patch((current) => setSetting(current, key, value))
  }

  return (
    <Frame onBack={() => pop()} helpTopic="a11y">
      <Title>Accesibilidad</Title>
      <Sub>Ajusta la letra, el contraste y el fondo. En cada pantalla, el botón de Audio explica para qué sirve.</Sub>
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
      <View style={styles.toggleCard}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={styles.toggleTitle}>Contraste alto</Text>
          <Text style={styles.toggleSub}>Fondo blanco y textos más oscuros.</Text>
        </View>
        <Switch
          value={Boolean(state.settings.contrast)}
          onValueChange={(value) =>
            patch((current) => {
              let next = setSetting(current, 'contrast', value)
              if (value) next = setSetting(next, 'dark', false)
              return next
            })
          }
          trackColor={{ true: colors.green, false: colors.line }}
          thumbColor={colors.white}
        />
      </View>
      <View style={styles.toggleCard}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={styles.toggleTitle}>Fondo negro</Text>
          <Text style={styles.toggleSub}>Cambia el fondo de blanco a negro.</Text>
        </View>
        <Switch
          value={Boolean(state.settings.dark)}
          onValueChange={(value) =>
            patch((current) => {
              let next = setSetting(current, 'dark', value)
              if (value) next = setSetting(next, 'contrast', false)
              return next
            })
          }
          trackColor={{ true: colors.green, false: colors.line }}
          thumbColor={colors.white}
        />
      </View>
      <View style={styles.toggleCard}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={styles.toggleTitle}>Más espacio</Text>
          <Text style={styles.toggleSub}>Separa las líneas para leer sin apuro.</Text>
        </View>
        <Switch
          value={Boolean(state.settings.spacing)}
          onValueChange={(value) => choose('spacing', value)}
          trackColor={{ true: colors.green, false: colors.line }}
          thumbColor={colors.white}
        />
      </View>
      <View style={{ marginTop: 16 }}>
        <Button
          label="Restablecer"
          variant="outline"
          onPress={() =>
            patch((current) => {
              let next = setSetting(current, 'textSize', 'normal')
              next = setSetting(next, 'contrast', false)
              next = setSetting(next, 'dark', false)
              next = setSetting(next, 'spacing', false)
              return next
            })
          }
        />
      </View>
      <Text style={[styles.empty, { marginTop: 16 }]}>
        Las ventas, los fiados y estos ajustes se guardan en este celular. No se envían a internet.
      </Text>
    </Frame>
  )
}
