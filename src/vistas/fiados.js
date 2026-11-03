// Fiados y cobros.
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
import { colors, helpText, methods, periods, voiceText } from '../estilos/tema'
import { useScreenStyles } from '../estilos/pantallas'
import { Text, useLook } from './texto'
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
import { createSpeechLedger, sumCents, typedCents } from '../js/montos.mjs'
import { usePhone } from '../js/telefono'
import { speakAloud, stopAloud } from '../js/voz'
import {
  Avatar,
  Button,
  ErrorText,
  Field,
  Keypad,
  Logo,
  MicMark,
  MethodOption,
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

function writeDigit(current, digit) {
  if (current.includes('.')) {
    const frac = current.split('.')[1]
    if (frac.length >= 2) return current
    return `${current}${digit}`
  }
  if (current === '0') return String(digit)
  if (current.length >= 6) return current
  return `${current}${digit}`
}

function centsToTyped(cents) {
  const whole = Math.floor(cents / 100)
  const frac = cents % 100
  if (!frac) return String(whole)
  if (frac % 10 === 0) return `${whole}.${frac / 10}`
  return `${whole}.${String(frac).padStart(2, '0')}`
}

function SaleKeypad({ typed, lines, onTyped, onLines, maxCents, borderColor }) {
  const styles = useScreenStyles()
  const [hearing, setHearing] = useState(false)
  const [hearNote, setHearNote] = useState('')
  const hearingRef = useRef(false)
  const saidRef = useRef('')
  const stopRef = useRef(null)
  const linesRef = useRef(lines)
  const typedRef = useRef(typed)
  const heardBase = useRef([])
  const ledger = useRef(null)
  if (!hearingRef.current) {
    linesRef.current = lines
    typedRef.current = typed
  }
  const entry = typedCents(typed)
  const committed = sumCents(lines)
  const room = maxCents == null ? null : maxCents - committed
  const canAdd = entry > 0 && (room == null || entry <= room)

  useEffect(() => {
    return () => {
      if (stopRef.current) stopRef.current()
      stopAloud()
    }
  }, [])

  function commitAmount(cents = typedCents(typedRef.current)) {
    if (cents <= 0) return false
    const used = sumCents(linesRef.current)
    if (maxCents != null && used + cents > maxCents) return false
    onLines([...linesRef.current, cents])
    linesRef.current = [...linesRef.current, cents]
    typedRef.current = ''
    onTyped('')
    return true
  }

  function commit() {
    if (hearingRef.current) {
      finishHear()
      return
    }
    commitAmount()
  }

  function finishHear() {
    if (!hearingRef.current) return
    hearingRef.current = false
    const stop = stopRef.current
    stopRef.current = null
    if (stop) stop()
    setHearing(false)
    const pending = typedCents(typedRef.current)
    saidRef.current = ''
    if (pending > 0 && !commitAmount(pending)) {
      typedRef.current = ''
      onTyped('')
      setHearNote('Ese monto pasa lo que te deben.')
    }
  }

  function toggleHear() {
    if (hearingRef.current) {
      finishHear()
      return
    }
    if (!canListen()) {
      const message = 'Aquí no puedo escuchar. Usa la calculadora para escribir el monto.'
      setHearNote(message)
      speakAloud(message)
      return
    }
    if (typedCents(typedRef.current) > 0) commitAmount()
    heardBase.current = linesRef.current.slice()
    ledger.current = createSpeechLedger(heardBase.current)
    saidRef.current = ''
    setHearNote('')
    hearingRef.current = true
    setHearing(true)
    stopAloud()
    function showSpoken(view, restarted) {
      const accepted = []
      let used = sumCents(view.base)
      for (const cents of view.amounts.slice(0, -1)) {
        if (maxCents != null && used + cents > maxCents) break
        accepted.push(cents)
        used += cents
      }
      const nextLines = [...view.base, ...accepted]
      linesRef.current = nextLines
      onLines(nextLines)
      const last = view.amounts.length ? view.amounts[view.amounts.length - 1] : 0
      if (!last || (maxCents != null && used + last > maxCents)) {
        typedRef.current = ''
        onTyped('')
        if (last) setHearNote('Ese monto pasa lo que te deben.')
        else if (restarted) setHearNote('Quité el último monto.')
        return
      }
      typedRef.current = centsToTyped(last)
      onTyped(typedRef.current)
      setHearNote(restarted ? 'Quité el último monto.' : '')
    }
    stopRef.current = startListening({
      onLive: (text, generation) => {
        if (!hearingRef.current || !ledger.current) return
        saidRef.current = text
        const step = ledger.current.push(text, generation)
        showSpoken(ledger.current.view(), step.restart)
        if (step.restart && stopRef.current) stopRef.current.restart()
      },
      onBreak: () => {
        if (!hearingRef.current || !ledger.current) return
        showSpoken(ledger.current.breakSession(), false)
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

  return (
    <>
      <AmountBox
        cents={committed + (canAdd || room == null ? entry : 0)}
        label={typed ? `S/${typed}` : ''}
        borderColor={hearing ? colors.red : borderColor}
      />
      {room != null && entry > room ? (
        <Text style={styles.hearNote}>Ese monto pasa lo que te deben.</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={hearing ? 'Dejar de escuchar' : 'Hablar el monto'}
        onPress={toggleHear}
        style={({ pressed }) => [
          styles.hearBtn,
          {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: hearing ? colors.red : colors.green,
            marginBottom: 8,
            minHeight: 52,
          },
          pressed && { opacity: 0.86 },
        ]}
      >
        <MicMark size={24} color={hearing ? colors.red : colors.green} />
        <Text style={[styles.hearText, { color: hearing ? colors.red : colors.green }]}>
          {hearing ? 'Te escucho' : 'Hablar'}
        </Text>
      </Pressable>
      {hearNote && !hearing ? <Text style={styles.hearNote}>{hearNote}</Text> : null}
      <View style={styles.keyArea}>
        <Keypad
          onDigit={(digit) => {
            if (hearingRef.current) finishHear()
            onTyped(writeDigit(typedRef.current, digit))
          }}
          onDot={() => {
            if (hearingRef.current) finishHear()
            const current = typedRef.current
            onTyped(current.includes('.') ? current : `${current || '0'}.`)
          }}
          onDelete={() => {
            if (hearingRef.current) finishHear()
            if (typedRef.current) onTyped(typedRef.current.slice(0, -1))
            else if (linesRef.current.length) onLines(linesRef.current.slice(0, -1))
          }}
          onAdd={commit}
          onEquals={commit}
          addEnabled={canAdd || hearing}
        />
      </View>
      {lines.length ? (
        <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
          <Text style={{ color: colors.text, fontWeight: '800' }}>Tu registro:</Text>
          {lines.map((cents, index) => (
            <Text key={`${cents}-${index}`} style={{ color: colors.text, fontWeight: '700' }}>
              {index > 0 ? ' + ' : ''}{formatMoney(cents)}
            </Text>
          ))}
        </View>
      ) : null}
    </>
  )
}

export function Fiados() {
  const styles = useScreenStyles()
  const { state, push, pop, setDraft } = useApp()
  const people = debtors(state)
  const debt = totalDebt(state)
  return (
    <Frame
      onBack={() => pop()}
      helpTopic="fiados"
      footer={
        <Button
          label="Anotar fiado"
          variant="brown"
          onPress={() => {
            setDraft((current) => ({ ...current, fiadoName: '', cobroCents: 0 }))
            push('fiadoName')
          }}
        />
      }
    >
      <Title>Fiados</Title>
      <View style={styles.debtCard}>
        <View>
          <Text style={styles.debtLabel}>Te deben</Text>
          <Text style={styles.debtMoney}>{formatMoney(debt)}</Text>
        </View>
      </View>
      {people.length === 0 ? (
        <Text style={styles.empty}>Nadie te debe por ahora. Cuando fíes algo, queda anotado aquí.</Text>
      ) : (
        <View style={{ gap: 10 }}>
          {people.map((person) => (
            <Pressable
              key={person.id}
              accessibilityRole="button"
              accessibilityLabel={`${person.name} te debe ${formatMoney(person.debt)}`}
              onPress={() => push('person', { personId: person.id })}
              style={({ pressed }) => [styles.personRow, pressed && { opacity: 0.82 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.personName}>{person.name}</Text>
                <Text style={styles.personMeta}>
                  {person.lastAt ? `Último · ${formatWhen(person.lastAt)}` : 'Sin movimientos'}
                </Text>
              </View>
              <Text style={[styles.personMoney, { color: colors.brown }]}>{formatMoney(person.debt)} ›</Text>
            </Pressable>
          ))}
        </View>
      )}
    </Frame>
  )
}

export function FiadoName() {
  const { draft, setDraft, pop, push } = useApp()
  const ready = draft.fiadoName.trim().length >= 2
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Frame
        onBack={() => pop()}
        helpTopic="fiados"
        footer={
          <Button
            label="Siguiente"
            variant="brown"
            disabled={!ready}
            onPress={() => push('fiadoAmount')}
          />
        }
      >
        <Step>Paso 1 de 2</Step>
        <Title>¿A quién se lo fías?</Title>
        <Sub>Escribe el nombre de la persona.</Sub>
        <Field
          label="Nombre"
          value={draft.fiadoName}
          placeholder="Luis"
          autoCapitalize="words"
          onChangeText={(fiadoName) => setDraft((current) => ({ ...current, fiadoName }))}
        />
      </Frame>
    </KeyboardAvoidingView>
  )
}

export function FiadoAmount() {
  const styles = useScreenStyles()
  const { state, route, draft, setDraft, pop, patch } = useApp()
  const { pad, short } = usePhone()
  const fixedName = route.params?.name
  const name = fixedName || draft.fiadoName
  const [typed, setTyped] = useState('')
  const [lines, setLines] = useState([])
  const cents = sumCents(lines) + typedCents(typed)

  function save() {
    const result = addFiado(state, { name, cents })
    if (!result.ok) return
    patch(() => result.state)
    setDraft((current) => ({ ...current, fiadoName: '', cobroCents: 0 }))
    if (fixedName) pop()
    else pop(2)
  }

  return (
    <View style={styles.screen}>
      <TopBar onBack={() => pop()} helpTopic="fiados" />
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
        <Step>Paso 2 de 2</Step>
        <Title>¿Cuánto se fía?</Title>
        <Text style={styles.personName}>{name}</Text>
        <SaleKeypad
          typed={typed}
          lines={lines}
          onTyped={setTyped}
          onLines={setLines}
          borderColor={colors.brown}
        />
        {short ? null : (
          <View style={{ marginTop: 16 }}>
            <Button label="Anotar fiado" variant="brown" disabled={cents <= 0} onPress={save} />
          </View>
        )}
      </ScrollView>
      {short ? (
        <View style={[styles.footer, { paddingHorizontal: pad }]}>
          <Button label="Anotar fiado" variant="brown" disabled={cents <= 0} onPress={save} />
        </View>
      ) : null}
    </View>
  )
}

export function Person() {
  const styles = useScreenStyles()
  const { state, route, push, pop, setDraft } = useApp()
  const person = getPerson(state, route.params?.personId)
  if (!person) {
    return (
      <Frame onBack={() => pop()} helpTopic="person">
        <Title>Fiado</Title>
        <Text style={styles.empty}>No encontramos a esta persona.</Text>
      </Frame>
    )
  }
  return (
    <Frame
      onBack={() => pop()}
      helpTopic="person"
      footer={
        <View style={{ gap: 10 }}>
          <Button
            label="Anotar fiado"
            variant="brown"
            onPress={() => {
              setDraft((current) => ({ ...current, cobroCents: 0, fiadoName: person.name }))
              push('fiadoAmount', { name: person.name, personId: person.id })
            }}
          />
          <Button
            label="Cobrar"
            disabled={person.debt <= 0}
            onPress={() => {
              setDraft((current) => ({ ...current, cobroCents: 0, cobroMethod: 'efectivo' }))
              push('cobroAmount', { personId: person.id })
            }}
          />
        </View>
      }
    >
      <Title>{person.name}</Title>
      <View style={styles.debtCard}>
        <View>
          <Text style={styles.debtLabel}>Te debe</Text>
          <Text style={styles.debtMoney}>{formatMoney(Math.max(0, person.debt))}</Text>
        </View>
      </View>
      <Text style={styles.label}>Movimientos</Text>
      {person.movements.length === 0 ? (
        <Text style={styles.empty}>Todavía no hay movimientos.</Text>
      ) : (
        <View style={{ gap: 10 }}>
          {person.movements.map((movement) => (
            <View key={movement.id} style={styles.personRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.personName}>{formatWhen(movement.at)}</Text>
                <Text style={styles.personMeta}>
                  {movement.kind === 'fiado' ? 'Fiado' : `Cobro · ${methods[movement.method].label}`}
                </Text>
              </View>
              <Text style={[styles.personMoney, { color: movement.kind === 'fiado' ? colors.brown : colors.green }]}>
                {movement.kind === 'fiado' ? '+' : '−'} {formatMoney(movement.cents)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Frame>
  )
}

export function CobroAmount() {
  const styles = useScreenStyles()
  const { state, route, draft, setDraft, pop, push } = useApp()
  const { pad, short } = usePhone()
  const person = getPerson(state, route.params?.personId)
  const debt = Math.max(0, person?.debt || 0)
  const [typed, setTyped] = useState('')
  const [lines, setLines] = useState([])
  const cents = sumCents(lines) + typedCents(typed)

  function goNext() {
    if (cents <= 0 || cents > debt) return
    setDraft((current) => ({ ...current, cobroCents: cents }))
    push('cobroPay', { personId: person.id })
  }

  if (!person) {
    return (
      <Frame onBack={() => pop()} helpTopic="person">
        <Title>Cobro</Title>
      </Frame>
    )
  }

  return (
    <View style={styles.screen}>
      <TopBar onBack={() => pop()} helpTopic="person" />
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
        <Title>¿Cuánto paga {person.name}?</Title>
        <SaleKeypad
          typed={typed}
          lines={lines}
          onTyped={setTyped}
          onLines={setLines}
          maxCents={debt}
          borderColor={colors.green}
        />
        <View style={styles.limitRow}>
          <Text style={[styles.personMeta, { flex: 1 }]}>Te debe {formatMoney(debt)}</Text>
          <Pressable onPress={() => { setLines(debt > 0 ? [debt] : []); setTyped(''); setDraft((current) => ({ ...current, cobroCents: debt })) }}>
            <Text style={styles.link}>Cobrar todo</Text>
          </Pressable>
        </View>
        {short ? null : (
          <View style={{ marginTop: 16 }}>
            <Button label="Siguiente" disabled={cents <= 0 || cents > debt} onPress={goNext} />
          </View>
        )}
      </ScrollView>
      {short ? (
        <View style={[styles.footer, { paddingHorizontal: pad }]}>
          <Button label="Siguiente" disabled={cents <= 0 || cents > debt} onPress={goNext} />
        </View>
      ) : null}
    </View>
  )
}

export function CobroPay() {
  const styles = useScreenStyles()
  const { state, route, draft, setDraft, pop, patch } = useApp()
  const person = getPerson(state, route.params?.personId)
  const cents = draft.cobroCents
  const remain = Math.max(0, (person?.debt || 0) - cents)

  function save() {
    const result = cobrar(state, {
      personId: person.id,
      cents,
      method: draft.cobroMethod,
    })
    if (!result.ok) return
    patch(() => result.state)
    setDraft((current) => ({ ...current, cobroCents: 0, cobroMethod: 'efectivo' }))
    pop(2)
  }

  if (!person) {
    return (
      <Frame onBack={() => pop()} helpTopic="person">
        <Title>Cobro</Title>
      </Frame>
    )
  }

  return (
    <Frame
      onBack={() => pop()}
      helpTopic="person"
      footer={
        <Button
          label="Guardar cobro"
          variant={draft.cobroMethod === 'yape' ? 'purple' : draft.cobroMethod === 'plin' ? 'teal' : 'blue'}
          onPress={save}
        />
      }
    >
      <Step>Paso 2 de 2</Step>
      <View style={[styles.totalCard, { backgroundColor: methods[draft.cobroMethod].soft }]}>
        <Text style={styles.totalLabel}>{person.name} paga</Text>
        <Text style={[styles.totalMoney, { color: methods[draft.cobroMethod].color }]}>{formatMoney(cents)}</Text>
      </View>
      <Text style={styles.label}>¿Cómo te paga?</Text>
      <View style={{ gap: 10 }}>
        {['efectivo', 'yape', 'plin'].map((id) => (
          <MethodOption
            key={id}
            method={methods[id]}
            selected={draft.cobroMethod === id}
            leading={id === 'yape' ? <YapeMark size={28} /> : id === 'plin' ? <PlinMark size={28} /> : null}
            onPress={() => setDraft((current) => ({ ...current, cobroMethod: id }))}
          />
        ))}
      </View>
      {draft.cobroMethod === 'yape' || draft.cobroMethod === 'plin' ? (
        <YapePanel brand={draft.cobroMethod} cents={cents} phone={payPhone(sessionUser(state), draft.cobroMethod)} showNote={false} />
      ) : null}
      <View style={[styles.debtCard, { marginTop: 16 }]}>
        <Text style={styles.debtLabel}>Quedará debiendo</Text>
        <Text style={styles.debtMoney}>{formatMoney(remain)}</Text>
      </View>
    </Frame>
  )
}
