// Venta: calculadora del monto, pago y ventas del día.
import { useEffect, useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  useWindowDimensions,
  View,
} from 'react-native'
import { colors, helpText, methods, periods, quickAmounts, voiceText } from '../estilos/tema'
import { useScreenStyles } from '../estilos/pantallas'
import { Text } from './texto'
import {
  addFiado,
  addProduct,
  addSale,
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
  payPhone,
  periodSummary,
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
import { canListen, startListening } from '../js/escucha'
import { parseSpokenAmounts, sumCents, typedCents } from '../js/montos.mjs'
import { usePhone } from '../js/telefono'
import { speakAloud, stopAloud } from '../js/voz'
import {
  Avatar,
  Button,
  ErrorText,
  Field,
  Keypad,
  Logo,
  MethodOption,
  MicMark,
  ModalCard,
  MoneyBig,
  Note,
  PlinMark,
  YapeMark,
  YapePanel,
  Otp,
  Step,
  Sub,
  Title,
  TopBar,
} from './interfaz'

import { AmountBox, DetailRow, Frame, Tab, cartItems, productText } from './marco'
export function SaleAmount() {
  const styles = useScreenStyles()
  const { state, draft, setDraft, pop, push, clearSale, goHome } = useApp()
  const { pad, short } = usePhone()
  const [ask, setAsk] = useState(null)
  const [typed, setTyped] = useState('')
  const [flash, setFlash] = useState(false)
  const entry = typedCents(typed)
  const [hearing, setHearing] = useState(false)
  const [said, setSaid] = useState('')
  const [hearNote, setHearNote] = useState('')
  const lines = draft.sale.lines || []
  const total = sumCents(lines) + entry
  const stopHear = useRef(null)
  const flashTimer = useRef(null)
  const linesRef = useRef(lines)
  const saidRef = useRef('')
  const heardBase = useRef([])
  const hearingRef = useRef(false)
  linesRef.current = lines

  useEffect(() => {
    return () => {
      if (stopHear.current) stopHear.current()
      if (flashTimer.current) clearTimeout(flashTimer.current)
      stopAloud()
    }
  }, [])

  function remember(nextLines) {
    const cents = sumCents(nextLines)
    linesRef.current = nextLines
    setDraft((current) => ({
      ...current,
      sale: { ...current.sale, lines: nextLines, cents, products: [] },
    }))
    return cents
  }

  function addAmounts(extra) {
    if (!extra.length) return sumCents(linesRef.current)
    return remember([...linesRef.current, ...extra])
  }

  function finishHear() {
    if (!hearingRef.current) return
    hearingRef.current = false
    const stop = stopHear.current
    stopHear.current = null
    if (stop) stop()
    setHearing(false)
    const found = parseSpokenAmounts(saidRef.current)
    saidRef.current = ''
    setSaid('')
    if (!found.length) return
    remember([...heardBase.current, ...found])
    setTyped('')
  }

  function poke() {
    setFlash(true)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlash(false), 180)
  }

  function typeDigit(digit) {
    setTyped((current) => {
      if (current.includes('.')) {
        const frac = current.split('.')[1]
        if (frac.length >= 2) return current
        return `${current}${digit}`
      }
      if (current === '0') return String(digit)
      if (current.length >= 6) return current
      return `${current}${digit}`
    })
    poke()
  }

  function typeDot() {
    setTyped((current) => (current.includes('.') ? current : `${current || '0'}.`))
    poke()
  }

  function typeBackspace() {
    setTyped((current) => current.slice(0, -1))
    poke()
  }

  function leave(where) {
    finishHear()
    if (state.settings.confirmLeave && (sumCents(linesRef.current) > 0 || entry > 0)) {
      setAsk(where)
      return
    }
    clearSale()
    if (where === 'home') goHome()
    else pop()
  }

  function goPay() {
    finishHear()
    const nextLines = entry > 0 ? [...linesRef.current, entry] : linesRef.current
    const cents = remember(nextLines)
    setTyped('')
    if (cents <= 0) return
    push('salePay')
  }

  function toggleHear() {
    if (hearingRef.current) {
      finishHear()
      return
    }
    if (!canListen()) {
      const message = 'Aquí no puedo escuchar. Escribe el monto y toca el más.'
      setHearNote(message)
      speakAloud(message)
      return
    }
    if (entry > 0) {
      remember([...linesRef.current, entry])
      setTyped('')
    }
    heardBase.current = linesRef.current.slice()
    saidRef.current = ''
    setSaid('')
    setHearNote('')
    hearingRef.current = true
    setHearing(true)
    stopAloud()
    stopHear.current = startListening({
      onLive: (text) => {
        saidRef.current = text
        setSaid(text)
      },
      onPhrase: () => {},
      onError: (code) => {
        finishHear()
        const message = code === 'not-allowed'
          ? 'Permite el micrófono para anotar con la voz.'
          : 'No pude escuchar. Toca Hablar otra vez.'
        setHearNote(message)
        speakAloud(message)
      },
      onEnd: () => finishHear(),
    })
  }

  const liveTotal = sumCents(heardBase.current) + sumCents(parseSpokenAmounts(said))
  const shown = hearing ? liveTotal : total

  const siguiente = <Button label="Siguiente" disabled={shown <= 0} onPress={goPay} />

  return (
    <View style={styles.screen}>
      <TopBar onBack={() => leave('back')} onHome={() => leave('home')} helpTopic="sale" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: short ? 'flex-start' : 'center',
          paddingHorizontal: pad,
          paddingTop: 4,
          paddingBottom: 16,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Step>Paso 1 de 2</Step>
        <Title>¿Cuánto es la venta?</Title>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={hearing ? 'Dejar de escuchar' : 'Hablar el monto de la venta'}
          onPress={toggleHear}
          style={({ pressed }) => [
            styles.hearBtn,
            { backgroundColor: hearing ? colors.red : colors.green },
            pressed && { opacity: 0.86 },
          ]}
        >
          <MicMark size={28} />
          <Text style={styles.hearText}>{hearing ? 'Te escucho' : 'Hablar'}</Text>
        </Pressable>
        {hearNote && !hearing ? <Text style={styles.hearNote}>{hearNote}</Text> : null}
        <AmountBox
          cents={shown}
          label={!hearing && typed ? `S/${typed}` : ''}
          borderColor={hearing ? colors.red : flash ? colors.green : colors.blue}
        />
        <View style={styles.chips}>
          {quickAmounts.map((amount) => (
            <Pressable
              key={amount.cents}
              accessibilityRole="button"
              accessibilityLabel={`Sumar ${amount.label}`}
              onPress={() => addAmounts([amount.cents])}
              style={styles.chip}
            >
              <Text style={styles.chipText}>{amount.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.keyArea}>
          <Keypad
            onAdd={() => { addAmounts([entry]); setTyped(''); poke() }}
            addEnabled={entry > 0}
            onDigit={typeDigit}
            onDot={typeDot}
            onDelete={typeBackspace}
          />
        </View>
        {lines.length ? (
          <View style={[styles.chips, { marginTop: 14, alignItems: 'center' }]}>
            {lines.map((cents, index) => (
              <View key={`${cents}-${index}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {index > 0 ? <Text style={styles.sumPlus}>+</Text> : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar ${formatMoney(cents)}`}
                  onPress={() => remember(lines.filter((_, item) => item !== index))}
                  style={styles.chip}
                >
                  <Text style={styles.chipText}>{formatMoney(cents)}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
        <View style={[styles.cajaCard, { marginTop: 8, marginBottom: 0 }]}>
          <Text style={styles.cajaLabel}>Total de la venta</Text>
          <Text style={styles.cajaMoney}>{formatMoney(total)}</Text>
        </View>
        {short ? null : <View style={{ marginTop: 16 }}>{siguiente}</View>}
      </ScrollView>
      {short ? <View style={[styles.footer, { paddingHorizontal: pad }]}>{siguiente}</View> : null}
      {ask ? (
        <ModalCard title="¿Salir sin guardar?" body="Si sales ahora, esta venta no queda anotada.">
          <Button label="Seguir aquí" onPress={() => setAsk(null)} />
          <Button
            label={ask === 'home' ? 'Ir al inicio' : 'Salir sin guardar'}
            variant="red"
            onPress={() => {
              clearSale()
              if (ask === 'home') goHome()
              else pop()
            }}
          />
        </ModalCard>
      ) : null}
    </View>
  )
}

export function SalePay() {
  const styles = useScreenStyles()
  const { state, draft, setDraft, pop, push, patch, clearSale } = useApp()
  const sale = draft.sale
  const method = sale.method ? methods[sale.method] : null
  const people = state.sessionUserId ? debtors(state) : []
  const canSave = sale.cents > 0 && sale.method && (sale.method !== 'fiado' || sale.clientName.trim())

  function save() {
    const result = addSale(state, { ...sale, products: [] })
    if (!result.ok) return
    patch(() => result.state)
    clearSale()
    push('saleSaved', { saleId: result.saleId })
  }

  const variantByMethod = { efectivo: 'blue', yape: 'purple', plin: 'teal', fiado: 'brown' }
  const marks = { yape: <YapeMark size={28} />, plin: <PlinMark size={28} /> }
  const buttonVariant = variantByMethod[sale.method] || 'green'
  const buttonLabel = sale.method === 'fiado' ? 'Guardar como fiado' : 'Guardar venta'

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Frame
        onBack={() => pop()}
        dirty={sale.cents > 0}
        helpTopic="sale"
        footer={<Button label={buttonLabel} variant={buttonVariant} disabled={!canSave} onPress={save} />}
      >
        <Step>Paso 2 de 2</Step>
        <View style={[styles.totalCard, styles.totalCompact, { backgroundColor: method ? method.soft : colors.blueSoft }]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={[styles.totalMoney, { color: method ? method.color : colors.blue }]}>{formatMoney(sale.cents)}</Text>
        </View>
        <Text style={styles.label}>¿Cómo paga?</Text>
        <View style={{ gap: 10 }}>
          {Object.entries(methods).map(([id, item]) => (
            <MethodOption
              key={id}
              method={item}
              selected={sale.method === id}
              leading={marks[id] || null}
              onPress={() => setDraft((current) => ({ ...current, sale: { ...current.sale, method: id } }))}
            />
          ))}
        </View>
        {sale.method === 'yape' || sale.method === 'plin' ? (
          <YapePanel
            brand={sale.method}
            cents={sale.cents}
            phone={payPhone(sessionUser(state), sale.method)}
            note={sale.note}
            onNote={(note) => setDraft((current) => ({ ...current, sale: { ...current.sale, note } }))}
          />
        ) : null}
        {sale.method === 'fiado' ? (
          <View style={{ marginTop: 14 }}>
            <Field
              label="¿A quién se lo fías?"
              value={sale.clientName}
              placeholder="Luis"
              autoCapitalize="words"
              onChangeText={(clientName) =>
                setDraft((current) => ({ ...current, sale: { ...current.sale, clientName } }))
              }
            />
            {people.length ? (
              <View style={{ gap: 8 }}>
                {people.map((person) => {
                  const selected = sale.clientName.trim().toLowerCase() === person.name.toLowerCase()
                  return (
                    <Pressable
                      key={person.id}
                      onPress={() =>
                        setDraft((current) => ({
                          ...current,
                          sale: { ...current.sale, clientName: person.name },
                        }))
                      }
                      style={[styles.personRow, selected && { borderColor: colors.brown }]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.personName}>{person.name}</Text>
                        <Text style={styles.personMeta}>Te debe {formatMoney(person.debt)}</Text>
                      </View>
                      <Text style={[styles.personMoney, { color: colors.brown }]}>{formatMoney(person.debt)}</Text>
                    </Pressable>
                  )
                })}
              </View>
            ) : null}
          </View>
        ) : null}
      </Frame>
    </KeyboardAvoidingView>
  )
}

export function SaleSaved() {
  const styles = useScreenStyles()
  const { state, route, go, clearSale } = useApp()
  const sale = getSale(state, route.params?.saleId)
  return (
    <Frame
      onBack={() => go([{ name: 'home' }])}
      helpTopic="sale"
      footer={
        <View style={{ gap: 10 }}>
          <Button
            label="Nueva venta"
            onPress={() => {
              clearSale()
              go([{ name: 'home' }, { name: 'saleAmount' }])
            }}
          />
          <Button label="Ir al inicio" variant="outline" onPress={() => go([{ name: 'home' }])} />
        </View>
      }
    >
      <View style={styles.saved}>
        <View style={styles.savedIcon}>
          <Text style={{ color: colors.green, fontSize: 28, fontWeight: '800' }}>✓</Text>
        </View>
        <Text style={styles.savedTitle}>Venta guardada</Text>
        <View style={styles.savedCard}>
          <MoneyBig cents={sale?.cents || 0} />
          <Text style={styles.savedMethod}>{sale ? methods[sale.method].label : ''}</Text>
        </View>
        <Text style={styles.savedSub}>Puedes seguir vendiendo o volver al inicio.</Text>
      </View>
    </Frame>
  )
}

export function Sales() {
  const styles = useScreenStyles()
  const { state, push, pop } = useApp()
  const [tab, setTab] = useState('guardadas')
  const rows = salesOf(state, { voided: tab === 'anuladas' })
  const summary = periodSummary(state, 'hoy')
  return (
    <Frame onBack={() => pop()} helpTopic="sales">
      <Title>Ventas de hoy</Title>
      <View style={styles.tabs}>
        <Tab label="Guardadas" active={tab === 'guardadas'} onPress={() => setTab('guardadas')} />
        <Tab label="Anuladas" active={tab === 'anuladas'} onPress={() => setTab('anuladas')} />
      </View>
      {rows.length === 0 ? (
        <Text style={styles.empty}>
          {tab === 'anuladas'
            ? 'No hay ventas anuladas. Cuando anulas una, aparece aquí y sale de la caja.'
            : 'Todavía no anotas ventas hoy.'}
        </Text>
      ) : (
        <View style={{ gap: 10 }}>
          {rows.map((sale) => (
            <Pressable
              key={sale.id}
              accessibilityRole="button"
              accessibilityLabel={`Venta de ${formatMoney(sale.cents)}`}
              onPress={() => push('saleDetail', { saleId: sale.id })}
              style={({ pressed }) => [styles.personRow, pressed && { opacity: 0.8 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.personMeta}>{formatClock(sale.at)}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'center' }}>
                  <View style={[styles.mini, { backgroundColor: methods[sale.method].soft }]}>
                    <Text style={[styles.miniText, { color: methods[sale.method].color }]}>
                      {methods[sale.method].label}
                    </Text>
                  </View>
                  <Text style={styles.personMeta} numberOfLines={1}>
                    {sale.kind === 'cobro'
                      ? `Cobro de ${sale.clientName}`
                      : productText(sale.products) || sale.clientName}
                  </Text>
                </View>
              </View>
              <Text style={styles.personMoney}>{formatMoney(sale.cents)} ›</Text>
            </Pressable>
          ))}
        </View>
      )}
      {tab === 'guardadas' ? (
        <View style={styles.cajaCard}>
          <Text style={styles.cajaLabel}>Caja de hoy</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={styles.cajaMoney}>{formatMoney(summary.total)}</Text>
        </View>
      ) : null}
    </Frame>
  )
}

export function SaleDetail() {
  const styles = useScreenStyles()
  const { state, route, pop, patch } = useApp()
  const [ask, setAsk] = useState(false)
  const sale = getSale(state, route.params?.saleId)
  if (!sale) {
    return (
      <Frame onBack={() => pop()} helpTopic="sales">
        <Title>Detalle de la venta</Title>
        <Text style={styles.empty}>No encontramos esta venta.</Text>
      </Frame>
    )
  }
  return (
    <View style={{ flex: 1 }}>
      <Frame
        onBack={() => pop()}
        helpTopic="sales"
        footer={
          sale.voided ? null : (
            <Button label="Anular venta" variant="red" onPress={() => setAsk(true)} />
          )
        }
      >
        <Title>Detalle de la venta</Title>
        {sale.voided ? (
          <View style={styles.voidBanner}>
            <Text style={styles.voidText}>Esta venta está anulada</Text>
          </View>
        ) : null}
        <View style={styles.detailCard}>
          <MoneyBig cents={sale.cents} />
          <DetailRow label="Hora" value={formatWhen(sale.at)} />
          <DetailRow label="Cómo pagó" value={methods[sale.method].label} />
          {sale.kind === 'cobro' ? <DetailRow label="Tipo" value={`Cobro de ${sale.clientName}`} /> : null}
          {sale.clientName && sale.kind !== 'cobro' ? <DetailRow label="Fiado a" value={sale.clientName} /> : null}
          {cartItems(sale.products).length ? <DetailRow label="Carrito" value={productText(sale.products)} /> : null}
          {sale.note ? <DetailRow label="Operación" value={sale.note} /> : null}
        </View>
      </Frame>
      {ask ? (
        <ModalCard
          title="¿Anular esta venta?"
          body="Se quita de la caja de hoy. No se puede deshacer."
        >
          <Button label="No anular" onPress={() => setAsk(false)} />
          <Button
            label="Sí, anular"
            variant="red"
            onPress={() => {
              patch((current) => voidSale(current, sale.id))
              pop()
            }}
          />
        </ModalCard>
      ) : null}
    </View>
  )
}
