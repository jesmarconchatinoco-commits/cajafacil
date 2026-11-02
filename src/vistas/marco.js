// Marco común de cada pantalla: barra, lista del carrito y filas.
import { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useScreenStyles } from '../estilos/pantallas'
import { formatQty } from '../js/logica.mjs'
import { useApp } from '../js/estado'
import { usePhone } from '../js/telefono'
import { Button, ModalCard, MoneyBig, TopBar } from './interfaz'
import { Text } from './texto'

export function Frame({ children, footer, helpTopic, voice, onBack, onHome, mode = 'back', dirty = false, scroll = true }) {
  const styles = useScreenStyles()
  const { pad, wide } = usePhone()
  const { goHome, clearSale, state } = useApp()
  const [askHome, setAskHome] = useState(false)
  function home() {
    if (dirty && state.settings.confirmLeave) {
      setAskHome(true)
      return
    }
    goHome()
  }
  return (
    <View style={styles.screen}>
      <TopBar mode={mode} onBack={onBack} onHome={onHome || home} helpTopic={helpTopic} voice={voice} />
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scroll, { paddingHorizontal: pad, paddingBottom: wide ? 28 : 12 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={wide}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, minHeight: 0, paddingHorizontal: pad, paddingTop: 4 }}>{children}</View>
      )}
      {footer ? <View style={[styles.footer, { paddingHorizontal: pad }]}>{footer}</View> : null}
      {askHome ? (
        <ModalCard title="¿Salir sin guardar?" body="Si vas al inicio ahora, esta venta no queda anotada.">
          <Button label="Seguir aquí" onPress={() => setAskHome(false)} />
          <Button
            label="Ir al inicio"
            variant="red"
            onPress={() => {
              clearSale()
              goHome()
            }}
          />
        </ModalCard>
      ) : null}
    </View>
  )
}

export function cartItems(list) {
  if (!Array.isArray(list)) return []
  return list.map((item) => (typeof item === 'string' ? { name: item, qty: 1 } : item))
}

export function productText(list) {
  return cartItems(list)
    .map((item) => {
      const qty = Number(item.qty) || 1
      return qty === 1 ? item.name : `${item.name} × ${formatQty(qty)}`
    })
    .join(', ')
}

export function AmountBox({ cents, label, borderColor }) {
  const styles = useScreenStyles()
  return (
    <View style={[styles.amountBox, { borderColor }]}>
      <MoneyBig cents={cents} label={label} />
    </View>
  )
}

export function DetailRow({ label, value }) {
  const styles = useScreenStyles()
  return (
    <View style={styles.detailRow}>
      <Text style={styles.personMeta}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  )
}

export function Tab({ label, active, onPress, tone }) {
  const styles = useScreenStyles()
  const red = tone === 'red'
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.tab, red && styles.tabIdleRed, active && (red ? styles.tabOnRed : styles.tabOn)]}
    >
      <Text style={[styles.tabText, red && styles.tabTextRed, active && (red ? styles.tabTextOnRed : styles.tabTextOn)]} numberOfLines={2}>{active ? `✓  ${label}` : label}</Text>
    </Pressable>
  )
}
