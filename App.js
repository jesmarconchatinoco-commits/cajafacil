import { StatusBar } from 'expo-status-bar'
import { useWindowDimensions, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context'
import { shell } from './src/estilos/aplicacion'
import { colors } from './src/estilos/tema'
import { StoreProvider, useApp } from './src/js/estado'
import { deskFrame } from './src/js/telefono'
import { screens } from './src/vistas'
import { Dock, Logo } from './src/vistas/interfaz'
import { Text, useLook } from './src/vistas/texto'

function Router() {
  const { route, ready, state } = useApp()
  const { dark } = useLook()
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: dark ? '#000000' : colors.bg }}>
        <Logo size={72} />
        <Text style={{ marginTop: 12, fontWeight: '800', color: colors.greenInk, fontSize: 22 }}>CajaFácil</Text>
      </View>
    )
  }
  const Screen = screens[route.name] || screens.splash
  const guest = ['splash', 'register', 'code', 'pin', 'avatar', 'login'].includes(route.name)
  const showDock = Boolean(state.sessionUserId) && !guest
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Screen />
      </View>
      {showDock ? <Dock /> : null}
    </View>
  )
}

function Shell() {
  const { width, height } = useWindowDimensions()
  const { dark } = useLook()
  const frame = deskFrame(width, height)
  return (
    <View style={[shell.root, dark && { backgroundColor: '#000000' }, frame && { justifyContent: 'center' }]}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={[
          shell.phone,
          { backgroundColor: dark ? '#000000' : colors.bg },
          frame
            ? {
                width: frame.width,
                height: frame.height,
                minHeight: frame.height,
                maxHeight: frame.height,
                borderRadius: 28,
                borderWidth: 1,
                borderColor: dark ? '#2A2A2A' : '#D5D0C4',
                shadowColor: '#1B1B1B',
                shadowOpacity: 0.16,
                shadowRadius: 28,
                shadowOffset: { width: 0, height: 14 },
              }
            : { ...shell.phoneFill, borderRadius: 0 },
        ]}
      >
        <Router />
      </SafeAreaView>
    </View>
  )
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </SafeAreaProvider>
  )
}
