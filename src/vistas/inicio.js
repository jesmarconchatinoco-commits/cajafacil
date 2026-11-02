// Pantalla principal.
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
export function Home() {
  const styles = useScreenStyles()
  const { state, push, clearSale, patch, go, setDraft } = useApp()
  const [askOut, setAskOut] = useState(false)
  const { wide } = usePhone()
  const user = sessionUser(state)
  const summary = periodSummary(state, 'hoy')

  function signOut() {
    patch((current) => logout(current))
    setDraft((current) => ({ ...current, phone: '', pin: '', code: '', sale: { cents: 0, method: null, products: [], lines: [], note: '', clientName: '' } }))
    go([{ name: 'splash' }])
  }

  return (
    <Frame mode="home" helpTopic="home">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir mi cuenta"
        onPress={() => push('account')}
        style={({ pressed }) => [styles.hello, pressed && { opacity: 0.8 }]}
      >
        <Avatar kind={user?.avatar} name={user?.name} usePhoto={user?.usePhoto} size={48} />
        <View style={{ flex: 1 }}>
          <Text style={styles.helloName} numberOfLines={1}>{`Hola, ${user?.name}`}</Text>
          <Text style={styles.helloSub}>Tu bodega</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
      <View style={styles.cajaCard}>
        <Text style={styles.cajaLabel}>Caja de hoy</Text>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={styles.cajaMoney}>{formatMoney(summary.total)}</Text>
        <Text style={styles.cajaSub}>
          {summary.count === 1 ? '1 venta registrada' : `${summary.count} ventas registradas`}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {[
          { label: 'Nueva venta', variant: 'green', onPress: () => { clearSale(); push('saleAmount') } },
          { label: 'Ventas de hoy', variant: 'outline', onPress: () => push('sales') },
          { label: 'Balance', variant: 'outline', onPress: () => push('balance') },
          { label: 'Fiados', variant: 'brown', onPress: () => push('fiados') },
          { label: 'Cerrar sesión', variant: 'red', onPress: () => setAskOut(true) },
        ].map((item) => (
          <View key={item.label} style={{ width: wide ? '48%' : '100%', flexGrow: wide ? 1 : 0 }}>
            <Button label={item.label} variant={item.variant} onPress={item.onPress} />
          </View>
        ))}
      </View>
      {askOut ? (
        <ModalCard
          title="¿Cerrar sesión?"
          body="Vas a salir de tu caja. Las ventas se quedan guardadas en este celular."
        >
          <Button label="Seguir aquí" onPress={() => setAskOut(false)} />
          <Button label="Sí, cerrar sesión" variant="red" onPress={signOut} />
        </ModalCard>
      ) : null}
    </Frame>
  )
}
