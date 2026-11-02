const TARGET = { semana: 84250, quincena: 176400, mes: 351200 }

export const DEMO_PHONE = '999888777'
export const DEMO_PIN = '123456'
export const DEMO_CODE = '123456'

function stamp(value) {
  return value instanceof Date ? value.getTime() : value
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function nid(next, prefix) {
  next.seq += 1
  return prefix + next.seq
}

function norm(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function at(now, daysAgo, hours, minutes) {
  const date = new Date(now)
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hours, minutes, 0, 0)
  return date.getTime()
}

function emptyExtras() {
  return {
    semana: { efectivo: 0, yape: 0 },
    quincena: { efectivo: 0, yape: 0 },
    mes: { efectivo: 0, yape: 0 },
  }
}

function emptyBook() {
  return { sales: [], people: [], extras: emptyExtras(), catalog: defaultCatalog() }
}

const PRODUCT_PRESETS = [
  ['Leche', 450, 24, false],
  ['Pan', 50, 40, true],
  ['Huevos', 80, 36, false],
  ['Arroz', 420, 15, false],
  ['Azúcar', 380, 12, false],
  ['Aceite', 1200, 10, false],
  ['Fideos', 280, 18, false],
  ['Avena', 350, 8, false],
  ['Menestras', 450, 10, false],
  ['Atún', 550, 16, false],
  ['Conserva', 390, 14, false],
  ['Galletas', 150, 20, false],
  ['Pan de molde', 850, 6, false],
  ['Queso', 1800, 4, false],
  ['Yogurt', 350, 12, false],
  ['Jamón', 2200, 3, false],
  ['Pollo', 1250, 8, false],
  ['Gaseosa', 350, 24, false],
  ['Agua', 150, 30, false],
  ['Jugo', 250, 18, false],
  ['Café', 950, 7, false],
  ['Chocolate', 200, 15, false],
  ['Sal', 120, 10, false],
  ['Sillao', 450, 8, false],
  ['Mayonesa', 650, 6, false],
  ['Detergente', 850, 9, false],
  ['Jabón', 280, 14, false],
  ['Lejía', 400, 8, false],
  ['Papel higiénico', 220, 20, false],
  ['Shampoo', 1500, 6, false],
]

function presetFor(name) {
  const found = PRODUCT_PRESETS.find((item) => item[0].toLowerCase() === String(name || '').toLowerCase())
  if (!found) return { cents: 100, stock: 1, decimal: false }
  return { cents: found[1], stock: found[2], decimal: found[3] }
}

function completeProduct(item, index) {
  const preset = presetFor(item?.name)
  return {
    id: item?.id || `d${index + 1}`,
    name: item?.name || 'Producto',
    cents: Number.isFinite(Number(item?.cents)) ? Number(item.cents) : preset.cents,
    stock: Number.isFinite(Number(item?.stock)) ? Number(item.stock) : preset.stock,
    decimal: typeof item?.decimal === 'boolean' ? item.decimal : preset.decimal,
  }
}

export function defaultCatalog() {
  return PRODUCT_PRESETS.map((item, index) =>
    completeProduct({ name: item[0], cents: item[1], stock: item[2], decimal: item[3] }, index),
  )
}

export function ensureCatalog(state) {
  const books = {}
  for (const [id, book] of Object.entries(state.books || {})) {
    const source = Array.isArray(book.catalog) ? book.catalog : defaultCatalog()
    books[id] = { ...book, catalog: source.map(completeProduct) }
  }
  return { ...state, books }
}

export function catalogOf(state) {
  return currentBook(state)?.catalog || []
}

export function addProduct(state, input) {
  const name = typeof input === 'string' ? input : input?.name || ''
  const clean = name.trim().replace(/\s+/g, ' ')
  if (clean.length < 2) return { ok: false, error: 'Escribe el nombre del producto.', state }
  const cents = typeof input === 'string' ? 100 : Math.round(Number(input.cents) || 0)
  const stock = typeof input === 'string' ? 1 : Math.round((Number(input.stock) || 0) * 100) / 100
  const decimal = typeof input === 'object' && Boolean(input?.decimal)
  if (cents <= 0) return { ok: false, error: 'Escribe el costo del producto.', state }
  if (stock <= 0) return { ok: false, error: 'Escribe cuánto hay en stock.', state }
  const next = clone(state)
  const book = next.books[next.sessionUserId]
  const exists = (book.catalog || []).some((item) => item.name.toLowerCase() === clean.toLowerCase())
  if (exists) return { ok: false, error: 'Ese producto ya está en tu bodega.', state }
  book.catalog = [...(book.catalog || []), { id: nid(next, 'c'), name: clean, cents, stock, decimal }]
  return { ok: true, state: next }
}

export function removeProduct(state, id) {
  const next = clone(state)
  const book = next.books[next.sessionUserId]
  book.catalog = (book.catalog || []).filter((item) => item.id !== id)
  return next
}

function extrasFrom(todayTotal) {
  const extras = {}
  for (const [key, target] of Object.entries(TARGET)) {
    const rest = target - todayTotal
    const efectivo = Math.round(rest * 0.6)
    extras[key] = { efectivo, yape: rest - efectivo }
  }
  return extras
}

export function createInitialState(now = new Date()) {
  const sales = [
    {
      id: 's1',
      at: at(now, 0, 9, 10),
      cents: 2000,
      method: 'efectivo',
      products: ['Leche'],
      note: '',
      clientName: '',
      kind: 'venta',
      voided: false,
    },
    {
      id: 's2',
      at: at(now, 0, 11, 25),
      cents: 1550,
      method: 'yape',
      products: ['Gaseosa'],
      note: '',
      clientName: '',
      kind: 'venta',
      voided: false,
    },
    {
      id: 's3',
      at: at(now, 0, 14, 40),
      cents: 1000,
      method: 'efectivo',
      products: ['Arroz'],
      note: '',
      clientName: '',
      kind: 'venta',
      voided: false,
    },
    {
      id: 's4',
      at: at(now, 0, 16, 5),
      cents: 1000,
      method: 'fiado',
      products: ['Pan'],
      note: '',
      clientName: 'Luis',
      kind: 'venta',
      voided: false,
    },
  ]
  const todayTotal = sales.reduce((sum, sale) => sum + sale.cents, 0)
  return {
    seq: 20,
    sessionUserId: null,
    settings: { confirmLeave: true, textSize: 'normal', contrast: false, spacing: false, dark: false, slowVoice: false },
    users: [
      {
        id: 'flor',
        name: 'Flor',
        phone: DEMO_PHONE,
        pin: DEMO_PIN,
        avatar: 'woman',
        usePhoto: true,
      },
    ],
    books: {
      flor: {
        sales,
        people: [
          {
            id: 'p1',
            name: 'Luis',
            movements: [
              {
                id: 'm1',
                at: at(now, 5, 18, 20),
                cents: 700,
                kind: 'fiado',
                saleId: null,
              },
              {
                id: 'm2',
                at: at(now, 0, 16, 5),
                cents: 1000,
                kind: 'fiado',
                saleId: 's4',
              },
            ],
          },
        ],
        extras: extrasFrom(todayTotal),
        catalog: defaultCatalog(),
      },
    },
  }
}

export function formatMoney(cents) {
  const value = Math.round(cents)
  const negative = value < 0
  const abs = Math.abs(value)
  const soles = Math.floor(abs / 100)
  const decimals = String(abs % 100).padStart(2, '0')
  const grouped = String(soles).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${negative ? '-' : ''}S/${grouped}.${decimals}`
}

export function formatQty(qty) {
  const value = Math.round((Number(qty) || 0) * 100) / 100
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(2).replace(/\.?0+$/, '')
}

export function cartTotal(products) {
  if (!Array.isArray(products)) return 0
  return products.reduce((sum, raw) => {
    if (!raw || typeof raw === 'string') return sum
    return sum + Math.round((Number(raw.cents) || 0) * (Number(raw.qty) || 0))
  }, 0)
}

export function formatPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '').slice(0, 9)
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(Boolean)
  return parts.join(' ')
}

export function isSameDay(a, b) {
  const left = new Date(stamp(a))
  const right = new Date(stamp(b))
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

export function formatWhen(ms, now = new Date()) {
  const date = new Date(ms)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const time = `${hours}:${minutes}`
  if (isSameDay(ms, now)) return `Hoy · ${time}`
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${date.getDate()} ${months[date.getMonth()]} · ${time}`
}

export function formatClock(ms) {
  const date = new Date(ms)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function pushDigit(cents, digit) {
  const next = cents * 10 + digit
  if (next > 99999999) return cents
  return next
}

export function backspaceMoney(cents) {
  return Math.floor(cents / 10)
}

export function sessionUser(state) {
  return state.users.find((user) => user.id === state.sessionUserId) || null
}

export function currentBook(state) {
  return state.books[state.sessionUserId]
}

export function personDebt(person) {
  return person.movements.reduce((sum, movement) => {
    return sum + (movement.kind === 'fiado' ? movement.cents : -movement.cents)
  }, 0)
}

export function totalDebt(state) {
  const book = currentBook(state)
  if (!book) return 0
  return book.people.reduce((sum, person) => sum + Math.max(0, personDebt(person)), 0)
}

export function debtors(state) {
  const book = currentBook(state)
  return book.people
    .map((person) => {
      const latest = [...person.movements].sort((a, b) => b.at - a.at)[0]
      return {
        id: person.id,
        name: person.name,
        debt: personDebt(person),
        lastAt: latest ? latest.at : null,
      }
    })
    .filter((person) => person.debt > 0)
    .sort((a, b) => b.debt - a.debt)
}

export function getPerson(state, personId) {
  const book = currentBook(state)
  const person = book?.people.find((item) => item.id === personId)
  if (!person) return null
  return {
    ...person,
    debt: personDebt(person),
    movements: [...person.movements].sort((a, b) => b.at - a.at),
  }
}

export function getSale(state, saleId) {
  return currentBook(state)?.sales.find((sale) => sale.id === saleId) || null
}

export function salesOf(state, { voided, now = new Date() }) {
  const book = currentBook(state)
  return book.sales
    .filter((sale) => sale.voided === voided && isSameDay(sale.at, now))
    .sort((a, b) => b.at - a.at)
}

export function periodSummary(state, period, now = new Date()) {
  const book = currentBook(state)
  const todaySales = book.sales.filter((sale) => !sale.voided && isSameDay(sale.at, now))
  const sum = (method) => todaySales.filter((sale) => sale.method === method).reduce((total, sale) => total + sale.cents, 0)
  const summary = {
    efectivo: sum('efectivo'),
    yape: sum('yape'),
    plin: sum('plin'),
    fiado: sum('fiado'),
    count: todaySales.length,
  }
  if (period !== 'hoy') {
    const extra = book.extras[period]
    summary.efectivo += extra.efectivo
    summary.yape += extra.yape
    summary.plin += extra.plin || 0
  }
  summary.total = summary.efectivo + summary.yape + summary.plin + summary.fiado
  summary.debt = totalDebt(state)
  return summary
}

function phoneDigits(phone) {
  return String(phone || '').replace(/\D/g, '')
}

export function login(state, { phone, pin }) {
  const user = state.users.find((item) => item.phone === phoneDigits(phone))
  if (!user || user.pin !== pin) {
    return { ok: false, error: 'Celular o clave incorrectos.', state }
  }
  const next = clone(state)
  next.sessionUserId = user.id
  return { ok: true, state: next }
}

export function register(state, { name, phone, pin, avatar, usePhoto }) {
  const digits = phoneDigits(phone)
  if (state.users.some((user) => user.phone === digits)) {
    return { ok: false, error: 'Ese celular ya tiene una cuenta. Entra con tu clave.', state }
  }
  const next = clone(state)
  const id = nid(next, 'u')
  next.users.push({
    id,
    name: name.trim(),
    phone: digits,
    pin,
    avatar,
    usePhoto,
    yapePhone: digits,
    plinPhone: digits,
  })
  next.books[id] = emptyBook()
  next.sessionUserId = id
  return { ok: true, state: next }
}

export function payPhone(user, brand) {
  if (!user) return ''
  const chosen = brand === 'plin' ? user.plinPhone : user.yapePhone
  return phoneDigits(chosen || user.phone)
}

export function updateAccount(state, input) {
  const next = clone(state)
  const user = next.users.find((item) => item.id === next.sessionUserId)
  if (!user) return { ok: false, error: 'Entra a tu cuenta para configurar.', state }
  const avatars = ['woman', 'rosa', 'abuela', 'man', 'abuelo', 'carlos']
  if (avatars.includes(input.avatar)) user.avatar = input.avatar
  if (typeof input.usePhoto === 'boolean') user.usePhoto = input.usePhoto
  const yape = phoneDigits(input.yapePhone)
  const plin = phoneDigits(input.plinPhone)
  if (yape.length !== 9) return { ok: false, error: 'El celular de Yape necesita 9 números.', state }
  if (plin.length !== 9) return { ok: false, error: 'El celular de Plin necesita 9 números.', state }
  user.yapePhone = yape
  user.plinPhone = plin
  const currentPin = String(input.currentPin || '')
  const nextPin = String(input.nextPin || '')
  const repeatPin = String(input.repeatPin || '')
  if (currentPin || nextPin || repeatPin) {
    if (currentPin !== user.pin) return { ok: false, error: 'La clave actual no coincide.', state }
    if (!/^\d{6}$/.test(nextPin)) return { ok: false, error: 'La clave nueva tiene 6 números.', state }
    if (nextPin !== repeatPin) return { ok: false, error: 'La clave nueva no coincide.', state }
    user.pin = nextPin
  }
  return { ok: true, state: next }
}

export function logout(state) {
  const next = clone(state)
  next.sessionUserId = null
  return next
}

export function setSetting(state, key, value) {
  const next = clone(state)
  next.settings[key] = value
  return next
}

function upsertPerson(book, next, name) {
  const key = norm(name)
  let person = book.people.find((item) => norm(item.name) === key)
  if (!person) {
    person = { id: nid(next, 'p'), name: name.trim(), movements: [] }
    book.people.push(person)
  }
  return person
}

function adjustStock(book, products, direction) {
  for (const raw of products || []) {
    const item = typeof raw === 'string' ? { name: raw, qty: 1 } : raw
    const qty = Number(item?.qty) || 0
    if (!item?.name || !qty) continue
    const product = (book.catalog || []).find((entry) => entry.name.toLowerCase() === item.name.toLowerCase())
    if (!product) continue
    const next = Math.round(((Number(product.stock) || 0) + direction * qty) * 100) / 100
    product.stock = next < 0 ? 0 : next
  }
}

export function addSale(state, input) {
  if (!input.cents || input.cents <= 0) return { ok: false, state }
  if (!input.method) return { ok: false, state }
  if (input.method === 'fiado' && !input.clientName?.trim()) return { ok: false, state }
  const next = clone(state)
  const book = next.books[next.sessionUserId]
  const atTime = Date.now()
  const saleId = nid(next, 's')
  const clientName = input.method === 'fiado' ? input.clientName.trim() : ''
  book.sales.unshift({
    id: saleId,
    at: atTime,
    cents: input.cents,
    method: input.method,
    products: input.products || [],
    note: (input.note || '').trim(),
    clientName,
    kind: 'venta',
    voided: false,
  })
  adjustStock(book, input.products, -1)
  let personId = null
  if (input.method === 'fiado') {
    const person = upsertPerson(book, next, clientName)
    personId = person.id
    person.movements.unshift({
      id: nid(next, 'm'),
      at: atTime,
      cents: input.cents,
      kind: 'fiado',
      saleId,
    })
  }
  return { ok: true, state: next, saleId, personId }
}

export function voidSale(state, saleId) {
  const next = clone(state)
  const book = next.books[next.sessionUserId]
  const sale = book.sales.find((item) => item.id === saleId)
  if (!sale || sale.voided) return next
  sale.voided = true
  adjustStock(book, sale.products, 1)
  for (const person of book.people) {
    person.movements = person.movements.filter((movement) => movement.saleId !== saleId)
  }
  return next
}

export function addFiado(state, { name, cents }) {
  return addSale(state, {
    cents,
    method: 'fiado',
    clientName: name,
    products: [],
    note: '',
  })
}

export function cobrar(state, { personId, cents, method }) {
  if (method !== 'efectivo' && method !== 'yape' && method !== 'plin') return { ok: false, state }
  const next = clone(state)
  const book = next.books[next.sessionUserId]
  const person = book.people.find((item) => item.id === personId)
  if (!person) return { ok: false, state }
  const debt = personDebt(person)
  if (!cents || cents <= 0 || cents > debt) return { ok: false, state }
  const atTime = Date.now()
  const saleId = nid(next, 's')
  book.sales.unshift({
    id: saleId,
    at: atTime,
    cents,
    method,
    products: [],
    note: '',
    clientName: person.name,
    kind: 'cobro',
    voided: false,
  })
  person.movements.unshift({
    id: nid(next, 'm'),
    at: atTime,
    cents,
    kind: 'cobro',
    saleId,
    method,
  })
  return { ok: true, state: next, saleId }
}
