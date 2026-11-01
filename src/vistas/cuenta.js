// Cuenta: inicio de sesión, registro, perfil y ayuda.
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
  updateAccount,
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
  Otp,
  Step,
  Sub,
  Title,
  TopBar,
} from './interfaz'

import { AmountBox, DetailRow, Frame, Tab, cartItems, productText } from './marco'
export function Splash() {
  const styles = useScreenStyles()
  const { push } = useApp()
  return (
    <Frame
      mode="splash"
      helpTopic="splash"
      footer={
        <View style={{ gap: 10 }}>
          <Button label="Crear mi cuenta" onPress={() => push('register')} />
          <Button label="Iniciar sesión" variant="outline" onPress={() => push('login')} />
        </View>
      }
    >
      <View style={styles.hero}>
        <Logo size={96} />
        <Text style={styles.heroName}>CajaFácil</Text>
        <Text style={styles.heroText}>Anota las ventas de tu bodega sin enredos.</Text>
      </View>
    </Frame>
  )
}

export function Register() {
  const { draft, setDraft, pop, push } = useApp()
  const [error, setError] = useState('')
  const phone = draft.phone.replace(/\D/g, '')
  const ready = draft.name.trim().length >= 2 && phone.length === 9

  function next() {
    if (!ready) {
      setError('Escribe tu nombre y un celular de 9 dígitos.')
      return
    }
    setError('')
    push('code')
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Frame
        onBack={() => pop()}
        helpTopic="register"
        footer={<Button label="Continuar" disabled={!ready} onPress={next} />}
      >
        <Step>Paso 1 de 4</Step>
        <Title>Cuéntanos de ti</Title>
        <Sub>Con estos datos te reconocemos cuando vuelvas a entrar.</Sub>
        <ErrorText>{error}</ErrorText>
        <Field
          label="Tu nombre"
          value={draft.name}
          placeholder="Flor Quispe"
          autoCapitalize="words"
          onChangeText={(name) => setDraft((current) => ({ ...current, name }))}
        />
        <Field
          label="Celular"
          value={formatPhone(draft.phone)}
          placeholder="999 888 777"
          keyboardType="number-pad"
          onChangeText={(value) =>
            setDraft((current) => ({ ...current, phone: value.replace(/\D/g, '').slice(0, 9) }))
          }
        />
      </Frame>
    </KeyboardAvoidingView>
  )
}

export function Code() {
  const { draft, setDraft, pop, push } = useApp()
  const { height } = useWindowDimensions()

  function add(digit) {
    setDraft((current) =>
      current.code.length >= 6 ? current : { ...current, code: current.code + String(digit) }
    )
  }

  return (
    <Frame
      onBack={() => pop()}
      helpTopic="code"
      footer={<Button label="Confirmar" disabled={draft.code.length < 6} onPress={() => push('pin')} />}
    >
      <Step>Paso 2 de 4</Step>
      <Title>Escribe tu código</Title>
      <Sub>Te enviamos un código de 6 dígitos a tu celular.</Sub>
      <Otp value={draft.code} />
      <Note>Si no te llega el mensaje, usa el código de demostración {DEMO_CODE}.</Note>
      <Button
        label="Usar código de demostración"
        variant="outline"
        onPress={() => setDraft((current) => ({ ...current, code: DEMO_CODE }))}
      />
      <View style={{ height: 18 }} />
      <Keypad
        keyHeight={height < 760 ? 48 : 56}
        onDigit={add}
        onDelete={() => setDraft((current) => ({ ...current, code: current.code.slice(0, -1) }))}
      />
    </Frame>
  )
}

export function Pin() {
  const { draft, setDraft, pop, push } = useApp()
  const { height } = useWindowDimensions()

  function add(digit) {
    setDraft((current) =>
      current.pin.length >= 6 ? current : { ...current, pin: current.pin + String(digit) }
    )
  }

  return (
    <Frame
      onBack={() => pop()}
      helpTopic="pin"
      footer={<Button label="Confirmar" disabled={draft.pin.length < 6} onPress={() => push('avatar')} />}
    >
      <Step>Paso 3 de 4</Step>
      <Title>Crea tu clave</Title>
      <Sub>Elige 6 números. Los vas a usar para entrar.</Sub>
      <Otp value={draft.pin} secret />
      <Keypad
        keyHeight={height < 760 ? 48 : 56}
        onDigit={add}
        onDelete={() => setDraft((current) => ({ ...current, pin: current.pin.slice(0, -1) }))}
      />
    </Frame>
  )
}

export function AvatarPick() {
  const styles = useScreenStyles()
  const { state, draft, setDraft, pop, patch, go } = useApp()
  const [error, setError] = useState('')

  function start() {
    const result = register(state, {
      name: draft.name,
      phone: draft.phone,
      pin: draft.pin,
      avatar: draft.avatar,
      usePhoto: draft.usePhoto,
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    patch(() => result.state)
    setDraft((current) => ({
      ...current,
      name: '',
      phone: '',
      code: '',
      pin: '',
      avatar: 'woman',
      usePhoto: true,
    }))
    go([{ name: 'home' }])
  }

  return (
    <Frame
      onBack={() => pop()}
      helpTopic="avatar"
      footer={<Button label="Empezar" onPress={start} />}
    >
      <Step>Paso 4 de 4</Step>
      <Title>Elige tu imagen</Title>
      <ErrorText>{error}</ErrorText>
      <View style={styles.avatarRow}>
        {[
          { id: 'woman', label: 'Mujer' },
          { id: 'man', label: 'Hombre' },
        ].map((option) => {
          const selected = draft.avatar === option.id
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              onPress={() => setDraft((current) => ({ ...current, avatar: option.id }))}
              style={[styles.avatarCard, selected && styles.avatarSelected]}
            >
              {selected ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>✓</Text>
                </View>
              ) : null}
              <Avatar kind={option.id} size={72} />
              <Text style={styles.avatarLabel}>{option.label}</Text>
            </Pressable>
          )
        })}
      </View>
      <View style={styles.toggleCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.toggleTitle}>Usar esta imagen</Text>
          <Text style={styles.toggleSub}>Se verá junto a tu saludo.</Text>
        </View>
        <Switch
          value={draft.usePhoto}
          onValueChange={(usePhoto) => setDraft((current) => ({ ...current, usePhoto }))}
          trackColor={{ true: colors.green, false: colors.line }}
          thumbColor={colors.white}
        />
      </View>
    </Frame>
  )
}

export function Login() {
  const styles = useScreenStyles()
  const { state, draft, setDraft, pop, patch, go } = useApp()
  const [error, setError] = useState('')

  function enter(phone, pin) {
    const result = login(state, { phone, pin })
    if (!result.ok) {
      setError(result.error)
      return
    }
    patch(() => result.state)
    setDraft((current) => ({ ...current, phone: '', pin: '' }))
    go([{ name: 'home' }])
  }

  const phone = draft.phone.replace(/\D/g, '')
  const ready = phone.length === 9 && draft.pin.length === 6

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Frame
        onBack={() => pop()}
        helpTopic="login"
        footer={
          <View style={{ gap: 10 }}>
            <Button label="Iniciar sesión" disabled={!ready} onPress={() => enter(draft.phone, draft.pin)} />
            <Button
              label="Usar cuenta de demostración"
              variant="outline"
              onPress={() => enter(DEMO_PHONE, DEMO_PIN)}
            />
          </View>
        }
      >
        <View style={styles.loginBrand}>
          <Logo size={42} />
          <Text style={styles.heroName}>CajaFácil</Text>
        </View>
        <Title>Iniciar sesión</Title>
        <Sub>Usa el celular y la clave de 6 números.</Sub>
        <ErrorText>{error}</ErrorText>
        <Field
          label="Celular"
          value={formatPhone(draft.phone)}
          placeholder="999 888 777"
          keyboardType="number-pad"
          onChangeText={(value) =>
            setDraft((current) => ({ ...current, phone: value.replace(/\D/g, '').slice(0, 9) }))
          }
        />
        <Field
          label="Clave"
          value={draft.pin}
          placeholder="123456"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          onChangeText={(value) =>
            setDraft((current) => ({ ...current, pin: value.replace(/\D/g, '').slice(0, 6) }))
          }
          hint="Cuenta de demostración: 999 888 777 · clave 123456"
        />
      </Frame>
    </KeyboardAvoidingView>
  )
}

export function Settings() {
  const styles = useScreenStyles()
  const { state, pop, patch } = useApp()
  const user = sessionUser(state)
  const [avatar, setAvatar] = useState(user?.avatar || 'woman')
  const [usePhoto, setUsePhoto] = useState(user?.usePhoto !== false)
  const [currentPin, setCurrentPin] = useState('')
  const [nextPin, setNextPin] = useState('')
  const [repeatPin, setRepeatPin] = useState('')
  const [yapePhone, setYapePhone] = useState(user?.yapePhone || user?.phone || '')
  const [plinPhone, setPlinPhone] = useState(user?.plinPhone || user?.phone || '')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function digits(value) {
    return value.replace(/\D/g, '').slice(0, 9)
  }

  function pinDigits(value) {
    return value.replace(/\D/g, '').slice(0, 6)
  }

  function save() {
    const result = updateAccount(state, {
      avatar,
      usePhoto,
      yapePhone,
      plinPhone,
      currentPin,
      nextPin,
      repeatPin,
    })
    if (!result.ok) {
      setSaved(false)
      setError(result.error)
      return
    }
    patch(() => result.state)
    setCurrentPin('')
    setNextPin('')
    setRepeatPin('')
    setError('')
    setSaved(true)
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Frame
        onBack={() => pop()}
        helpTopic="settings"
        footer={<Button label="Guardar" onPress={save} />}
      >
        <Title>Configurar</Title>
        <Sub>Cambia tu icono, tu clave y los celulares de los códigos.</Sub>
        <ErrorText>{error}</ErrorText>
        {saved ? (
          <View style={styles.readyBanner}>
            <Text style={styles.readyText}>✓  Los cambios quedaron guardados.</Text>
          </View>
        ) : null}
        <Text style={styles.toggleTitle}>Tu icono</Text>
        <View style={styles.avatarRow}>
          {[
            { id: 'woman', label: 'Mujer' },
            { id: 'man', label: 'Hombre' },
          ].map((option) => {
            const selected = avatar === option.id
            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected }}
                onPress={() => { setAvatar(option.id); setSaved(false) }}
                style={[styles.avatarCard, selected && styles.avatarSelected]}
              >
                <Avatar kind={option.id} size={72} />
                <Text style={styles.avatarLabel}>{option.label}</Text>
              </Pressable>
            )
          })}
        </View>
        <View style={styles.toggleCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Usar esta imagen</Text>
            <Text style={styles.toggleSub}>Si la apagas, se ve la inicial de tu nombre.</Text>
          </View>
          <Switch
            value={usePhoto}
            onValueChange={(value) => { setUsePhoto(value); setSaved(false) }}
            trackColor={{ true: colors.green, false: colors.line }}
            thumbColor={colors.white}
          />
        </View>
        <Text style={styles.toggleTitle}>Tu clave</Text>
        <Sub>Déjala vacía si no quieres cambiarla.</Sub>
        <Field
          label="Clave actual"
          value={currentPin}
          placeholder="6 números"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          onChangeText={(value) => { setCurrentPin(pinDigits(value)); setSaved(false) }}
        />
        <Field
          label="Clave nueva"
          value={nextPin}
          placeholder="6 números"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          onChangeText={(value) => { setNextPin(pinDigits(value)); setSaved(false) }}
        />
        <Field
          label="Repite la clave nueva"
          value={repeatPin}
          placeholder="6 números"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          onChangeText={(value) => { setRepeatPin(pinDigits(value)); setSaved(false) }}
        />
        <Text style={styles.toggleTitle}>Celulares de los códigos</Text>
        <Sub>Cada número sale solo en su código.</Sub>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <YapeMark size={28} />
          <Text style={styles.toggleTitle}>Yape</Text>
        </View>
        <Field
          label="Celular de Yape"
          value={formatPhone(yapePhone)}
          placeholder="999 888 777"
          keyboardType="number-pad"
          onChangeText={(value) => { setYapePhone(digits(value)); setSaved(false) }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <PlinMark size={28} />
          <Text style={styles.toggleTitle}>Plin</Text>
        </View>
        <Field
          label="Celular de Plin"
          value={formatPhone(plinPhone)}
          placeholder="999 888 777"
          keyboardType="number-pad"
          onChangeText={(value) => { setPlinPhone(digits(value)); setSaved(false) }}
        />
      </Frame>
    </KeyboardAvoidingView>
  )
}

export function Account() {
  const styles = useScreenStyles()
  const { state, pop, push, patch, go, setDraft } = useApp()
  const [askOut, setAskOut] = useState(false)
  const user = sessionUser(state)

  function signOut() {
    patch((current) => logout(current))
    setDraft((current) => ({ ...current, phone: '', pin: '', code: '', sale: { cents: 0, method: null, products: [], lines: [], note: '', clientName: '' } }))
    go([{ name: 'splash' }])
  }

  return (
    <Frame
      onBack={() => pop()}
      helpTopic="account"
      footer={<Button label="Cerrar sesión" variant="red" onPress={() => setAskOut(true)} />}
    >
      <Title>Mi cuenta</Title>
      <View style={styles.personRow}>
        <Avatar kind={user?.avatar} name={user?.name} usePhoto={user?.usePhoto} size={52} />
        <View>
          <Text style={styles.personName}>{user?.name}</Text>
          <Text style={styles.personMeta}>{formatPhone(user?.phone)}</Text>
        </View>
      </View>
      <View style={styles.readyBanner}>
        <Text style={styles.readyText}>✓  Tu cuenta está lista para anotar ventas.</Text>
      </View>
      <Button label="Configurar" onPress={() => push('settings')} />
      <View style={{ height: 14 }} />
      <View style={styles.toggleCard}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={styles.toggleTitle}>Avisar si sales sin guardar</Text>
          <Text style={styles.toggleSub}>Pregunta antes de dejar una venta a medias.</Text>
        </View>
        <Switch
          value={state.settings.confirmLeave}
          onValueChange={(value) => patch((current) => setSetting(current, 'confirmLeave', value))}
          trackColor={{ true: colors.green, false: colors.line }}
          thumbColor={colors.white}
        />
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

export function Help() {
  const styles = useScreenStyles()
  const { route, pop } = useApp()
  const topic = route.params?.topic || 'home'
  return (
    <Frame
      onBack={() => pop()}
      voice={helpText[topic] ? voiceText[topic] : voiceText.home}
      footer={<Button label="Entendido" variant="navy" onPress={() => pop()} />}
    >
      <Title>¿Cómo te ayudo?</Title>
      <View style={styles.helpCard}>
        <Text style={styles.helpLabel}>Ayuda</Text>
        <Text style={styles.helpBody}>{helpText[topic] || helpText.home}</Text>
      </View>
      <Text style={styles.empty}>Cuando termines de leer, toca Entendido para volver a la pantalla.</Text>
    </Frame>
  )
}
