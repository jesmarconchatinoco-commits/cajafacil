// Balance de la caja.
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
export function Balance() {
  const styles = useScreenStyles()
  const { state, push, pop } = useApp()
  const [period, setPeriod] = useState('hoy')
  const summary = periodSummary(state, period)
  const current = periods.find((item) => item.id === period)
  return (
    <Frame onBack={() => pop()} helpTopic="balance">
      <Title>Balance</Title>
      <View style={{ gap: 10, marginBottom: 16 }}>
        <View style={styles.periodRow}>
          {periods.slice(0, 2).map((item) => (
            <Tab key={item.id} label={item.label} active={period === item.id} onPress={() => setPeriod(item.id)} />
          ))}
        </View>
        <View style={styles.periodRow}>
          {periods.slice(2).map((item) => (
            <Tab key={item.id} label={item.label} active={period === item.id} onPress={() => setPeriod(item.id)} />
          ))}
        </View>
      </View>
      <View style={styles.cajaCard}>
        <Text style={styles.cajaLabel}>{current.title}</Text>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={styles.cajaMoney}>{formatMoney(summary.total)}</Text>
        <Text style={styles.cajaSub}>Efectivo, Yape, Plin y fiados anotados</Text>
      </View>
      <View style={{ gap: 10 }}>
        <View style={[styles.methodLine, { backgroundColor: colors.blueSoft }]}>
          <Text style={[styles.methodLineText, { color: colors.blue }]}>Efectivo</Text>
          <Text style={[styles.methodLineText, { color: colors.blue }]}>{formatMoney(summary.efectivo)}</Text>
        </View>
        <View style={[styles.methodLine, { backgroundColor: colors.purpleSoft }]}>
          <Text style={[styles.methodLineText, { color: colors.purple }]}>Yape</Text>
          <Text style={[styles.methodLineText, { color: colors.purple }]}>{formatMoney(summary.yape)}</Text>
        </View>
        <View style={[styles.methodLine, { backgroundColor: colors.tealSoft }]}>
          <Text style={[styles.methodLineText, { color: colors.teal }]}>Plin</Text>
          <Text style={[styles.methodLineText, { color: colors.teal }]}>{formatMoney(summary.plin)}</Text>
        </View>
        {summary.fiado > 0 ? (
          <View style={[styles.methodLine, { backgroundColor: colors.amberSoft }]}>
            <Text style={[styles.methodLineText, { color: colors.brown }]}>Fiado anotado</Text>
            <Text style={[styles.methodLineText, { color: colors.brown }]}>{formatMoney(summary.fiado)}</Text>
          </View>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ver fiados"
        onPress={() => push('fiados')}
        style={({ pressed }) => [styles.debtCard, pressed && { opacity: 0.85 }]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.debtLabel}>Te deben en fiados</Text>
          <Text style={styles.debtHint}>Toca para ver a quién</Text>
        </View>
        <Text style={styles.debtMoney}>{formatMoney(summary.debt)}</Text>
      </Pressable>
    </Frame>
  )
}
