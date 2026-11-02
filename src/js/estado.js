import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createInitialState, ensureCatalog } from './logica.mjs'
import { setSpeechRate } from './voz'

const KEY = 'cajafacil-state-v1'

const StoreContext = createContext(null)

export function emptySale() {
  return { cents: 0, method: null, products: [], lines: [], note: '', clientName: '' }
}

function emptyDraft() {
  return {
    name: '',
    phone: '',
    code: '',
    pin: '',
    avatar: 'woman',
    usePhoto: true,
    sale: emptySale(),
    fiadoName: '',
    cobroCents: 0,
    cobroMethod: 'efectivo',
  }
}

function canRestore(value) {
  return Boolean(value && Array.isArray(value.users) && value.books && value.settings)
}

function normalize(value) {
  return ensureCatalog({
    ...value,
    settings: {
      confirmLeave: true,
      textSize: 'normal',
      contrast: false,
      spacing: false,
      dark: false,
      slowVoice: false,
      ...value.settings,
    },
  })
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(() => normalize(createInitialState()))
  const [draft, setDraft] = useState(emptyDraft)
  const [stack, setStack] = useState([{ name: 'splash' }])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!active) return
        if (raw) {
          try {
            const parsed = JSON.parse(raw)
            if (canRestore(parsed)) {
              const next = normalize(parsed)
              setState(next)
              const stillThere = next.users.some((user) => user.id === next.sessionUserId)
              if (next.sessionUserId && stillThere) setStack([{ name: 'home' }])
            }
          } catch {
            // Si el guardado está dañado, se usa la cuenta de demostración.
          }
        }
        setReady(true)
      })
      .catch(() => {
        if (active) setReady(true)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setSpeechRate(Boolean(state.settings.slowVoice))
  }, [state.settings.slowVoice])

  useEffect(() => {
    if (!ready) return
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {})
  }, [state, ready])

  const push = useCallback((name, params) => {
    setStack((current) => [...current, { name, params }])
  }, [])

  const pop = useCallback((count = 1) => {
    setStack((current) => current.slice(0, Math.max(1, current.length - count)))
  }, [])

  const go = useCallback((next) => {
    setStack(next)
  }, [])

  const patch = useCallback((updater) => {
    setState((current) => updater(current))
  }, [])

  const clearSale = useCallback(() => {
    setDraft((current) => ({ ...current, sale: emptySale() }))
  }, [])

  const goHome = useCallback(() => {
    setDraft((current) => ({ ...current, sale: emptySale(), cobroCents: 0, fiadoName: '' }))
    setState((current) => {
      setStack([{ name: current.sessionUserId ? 'home' : 'splash' }])
      return current
    })
  }, [])

  const route = stack[stack.length - 1]

  return (
    <StoreContext.Provider
      value={{ state, draft, setDraft, route, ready, push, pop, go, goHome, patch, clearSale }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useApp() {
  return useContext(StoreContext)
}
