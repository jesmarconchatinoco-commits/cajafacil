// Fiados y cobros.
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
  payPhone,
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
  const cents = draft.cobroCents

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
        <AmountBox cents={cents} borderColor={colors.brown} />
        <View style={styles.keyArea}>
          <Keypad
            showDot
            onDigit={(digit) => setDraft((current) => ({ ...current, cobroCents: pushDigit(current.cobroCents, digit) }))}
            onDelete={() => setDraft((current) => ({ ...current, cobroCents: backspaceMoney(current.cobroCents) }))}
          />
        </View>
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
  const cents = draft.cobroCents

  function add(digit) {
    const next = pushDigit(cents, digit)
    if (next > debt) return
    setDraft((current) => ({ ...current, cobroCents: next }))
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
        <AmountBox cents={cents} borderColor={colors.green} />
        <View style={styles.limitRow}>
          <Text style={[styles.personMeta, { flex: 1 }]}>Te debe {formatMoney(debt)}</Text>
          <Pressable onPress={() => setDraft((current) => ({ ...current, cobroCents: debt }))}>
            <Text style={styles.link}>Cobrar todo</Text>
          </Pressable>
        </View>
        <View style={styles.keyArea}>
          <Keypad
            onDigit={add}
            onDelete={() => setDraft((current) => ({ ...current, cobroCents: backspaceMoney(current.cobroCents) }))}
          />
        </View>
        {short ? null : (
          <View style={{ marginTop: 16 }}>
            <Button label="Siguiente" disabled={cents <= 0} onPress={() => push('cobroPay', { personId: person.id })} />
          </View>
        )}
      </ScrollView>
      {short ? (
        <View style={[styles.footer, { paddingHorizontal: pad }]}>
          <Button label="Siguiente" disabled={cents <= 0} onPress={() => push('cobroPay', { personId: person.id })} />
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
