import assert from 'node:assert/strict'
import test from 'node:test'
import {
  addFiado,
  addSale,
  cobrar,
  createInitialState,
  ensureCatalog,
  formatMoney,
  formatPhone,
  login,
  payPhone,
  periodSummary,
  personDebt,
  register,
  salesOf,
  sessionUser,
  totalDebt,
  updateAccount,
  updateWallet,
  voidSale,
} from './logica.mjs'
import { qrMatrix } from './qr.mjs'
import { parseSpokenAmounts, spokenDigits, sumCents, typedCents } from './montos.mjs'

const now = new Date(2026, 9, 30, 18, 0, 0)

function flor() {
  const created = createInitialState(now)
  return login(created, { phone: '999 888 777', pin: '123456' }).state
}

test('la caja inicial coincide con el prototipo', () => {
  const state = flor()
  const hoy = periodSummary(state, 'hoy', now)
  assert.equal(formatMoney(hoy.total), 'S/55.50')
  assert.equal(formatMoney(hoy.efectivo), 'S/30.00')
  assert.equal(formatMoney(hoy.yape), 'S/15.50')
  assert.equal(formatMoney(hoy.plin), 'S/0.00')
  assert.equal(formatMoney(hoy.fiado), 'S/10.00')
  assert.equal(formatMoney(periodSummary(state, 'semana', now).total), 'S/842.50')
  assert.equal(formatMoney(periodSummary(state, 'quincena', now).total), 'S/1,764.00')
  assert.equal(formatMoney(periodSummary(state, 'mes', now).total), 'S/3,512.00')
  assert.equal(formatMoney(totalDebt(state)), 'S/17.00')
  assert.equal(formatPhone('999888777'), '999 888 777')
})

test('anotar una venta en efectivo entra a la caja', () => {
  let state = flor()
  const saved = addSale(state, { cents: 1000, method: 'efectivo', products: ['Pan'], note: '', clientName: '' })
  assert.equal(saved.ok, true)
  state = saved.state
  assert.equal(formatMoney(periodSummary(state, 'hoy', now).total), 'S/65.50')
  assert.equal(formatMoney(periodSummary(state, 'semana', now).total), 'S/852.50')
})

test('anular un fiado lo saca de la caja y de la deuda', () => {
  let state = flor()
  const voidAt = now.getTime() + 1000
  state = voidSale(state, 's4', voidAt)
  assert.equal(formatMoney(periodSummary(state, 'hoy', now).total), 'S/45.50')
  assert.equal(formatMoney(totalDebt(state)), 'S/7.00')
  assert.equal(state.books.flor.sales.find((sale) => sale.id === 's4').voidAt, voidAt)
})

test('el historial incluye ventas de todas las fechas en orden descendente', () => {
  const state = flor()
  state.books.flor.sales.push({
    id: 's-old',
    at: new Date(2026, 9, 29, 21, 0).getTime(),
    cents: 500,
    method: 'efectivo',
    products: ['Pan'],
    note: '',
    clientName: '',
    kind: 'venta',
    voided: false,
  })

  assert.equal(salesOf(state, { voided: false, now }).length, 4)
  assert.deepEqual(
    salesOf(state, { voided: false, now, all: true }).map((sale) => sale.id),
    ['s4', 's3', 's2', 's1', 's-old'],
  )
})

test('anotar fiado y cobrar actualizan deuda y caja', () => {
  let state = flor()
  const fiado = addFiado(state, { name: 'Ana', cents: 800 })
  assert.equal(fiado.ok, true)
  state = fiado.state
  assert.equal(formatMoney(totalDebt(state)), 'S/25.00')
  const person = state.books.flor.people.find((item) => item.name === 'Ana')
  const paid = cobrar(state, { personId: person.id, cents: 300, method: 'yape' })
  assert.equal(paid.ok, true)
  state = paid.state
  assert.equal(personDebt(state.books.flor.people.find((item) => item.id === person.id)), 500)
  assert.equal(formatMoney(periodSummary(state, 'hoy', now).yape), 'S/18.50')
  const tooMuch = cobrar(state, { personId: person.id, cents: 900, method: 'efectivo' })
  assert.equal(tooMuch.ok, false)
})

test('el pan se vende en porciones y descuenta el stock', () => {
  let state = flor()
  const before = state.books.flor.catalog.find((item) => item.name === 'Pan')
  assert.equal(before.decimal, true)
  const saved = addSale(state, {
    cents: 75,
    method: 'efectivo',
    products: [{ name: 'Pan', qty: 1.5, cents: 50 }],
    note: '',
    clientName: '',
  })
  assert.equal(saved.ok, true)
  state = saved.state
  const after = state.books.flor.catalog.find((item) => item.name === 'Pan')
  assert.equal(after.stock, before.stock - 1.5)
  state = voidSale(state, saved.saleId)
  assert.equal(state.books.flor.catalog.find((item) => item.name === 'Pan').stock, before.stock)
})

test('una cuenta nueva empieza en cero y el celular no se repite', () => {
  const invalidPhone = register(createInitialState(now), {
    name: 'Rosa',
    phone: '887654321',
    pin: '111111',
    avatar: 'woman',
    usePhoto: true,
  })
  assert.equal(invalidPhone.ok, false)

  const fresh = register(createInitialState(now), {
    name: 'Rosa',
    phone: '987654321',
    pin: '111111',
    avatar: 'woman',
    usePhoto: true,
  })
  assert.equal(fresh.ok, true)
  assert.equal(sessionUser(fresh.state).yapeEnabled, false)
  assert.equal(sessionUser(fresh.state).plinEnabled, false)
  assert.equal(periodSummary(fresh.state, 'hoy', now).total, 0)
  const duplicated = register(fresh.state, {
    name: 'Otra',
    phone: '999888777',
    pin: '111111',
    avatar: 'man',
    usePhoto: false,
  })
  assert.equal(duplicated.ok, false)
  const wrong = login(fresh.state, { phone: '987654321', pin: '000000' })
  assert.equal(wrong.ok, false)
})

test('la configuración guarda icono, clave y celulares de Yape y Plin', () => {
  let state = flor()
  assert.equal(payPhone(sessionUser(state), 'yape'), '999888777')
  const saved = updateAccount(state, {
    avatar: 'man',
    usePhoto: false,
    yapePhone: '987654321',
    plinPhone: '912345678',
    currentPin: '123456',
    nextPin: '654321',
    repeatPin: '654321',
  })
  assert.equal(saved.ok, true)
  state = saved.state
  const user = sessionUser(state)
  assert.equal(user.avatar, 'man')
  assert.equal(user.usePhoto, false)
  assert.equal(payPhone(user, 'yape'), '987654321')
  assert.equal(payPhone(user, 'plin'), '912345678')
  assert.equal(login(state, { phone: '999888777', pin: '654321' }).ok, true)
  assert.equal(login(state, { phone: '999888777', pin: '123456' }).ok, false)
  const bad = updateAccount(state, {
    yapePhone: '987654321',
    plinPhone: '912345678',
    currentPin: '000000',
    nextPin: '111111',
    repeatPin: '111111',
  })
  assert.equal(bad.ok, false)
})

test('las billeteras empiezan desactivadas y guardan sus datos por separado', () => {
  const state = flor()
  const user = sessionUser(state)
  assert.equal(user.yapeEnabled, false)
  assert.equal(user.plinEnabled, false)

  const enabled = updateWallet(state, 'yape', {
    enabled: true,
    phone: '987654321',
    qr: 'data:image/png;base64,qr',
  })
  assert.equal(enabled.ok, true)
  assert.equal(sessionUser(enabled.state).yapeEnabled, true)
  assert.equal(sessionUser(enabled.state).yapePhone, '987654321')
  assert.equal(sessionUser(enabled.state).yapeQr, 'data:image/png;base64,qr')
  assert.equal(sessionUser(enabled.state).plinEnabled, false)

  const invalid = updateWallet(state, 'plin', { enabled: true, phone: '887654321', qr: '' })
  assert.equal(invalid.ok, false)
})

test('las cuentas existentes quedan con billeteras desactivadas por defecto', () => {
  const migrated = ensureCatalog({
    users: [{ id: 'old-user', phone: '999888777' }],
    books: {},
  })
  assert.equal(migrated.users[0].yapeEnabled, false)
  assert.equal(migrated.users[0].plinEnabled, false)
})

test('la voz suma los montos dichos', () => {
  assert.deepEqual(parseSpokenAmounts('cinco soles'), [500])
  assert.deepEqual(parseSpokenAmounts('cinco con cincuenta'), [550])
  assert.deepEqual(parseSpokenAmounts('5.50'), [550])
  assert.deepEqual(parseSpokenAmounts('cinco y diez'), [500, 1000])
  assert.deepEqual(parseSpokenAmounts('treinta y cinco'), [3500])
  assert.deepEqual(parseSpokenAmounts('solo y medio más dos soles'), [150, 200])
  assert.deepEqual(parseSpokenAmounts('dos y medio'), [250])
  assert.deepEqual(parseSpokenAmounts('siete punto cinco'), [750])
  assert.deepEqual(parseSpokenAmounts('siete cincuenta'), [750])
  assert.deepEqual(parseSpokenAmounts('7.5'), [750])
  assert.deepEqual(parseSpokenAmounts('754'), [754])
  assert.equal(sumCents([500, 1000]), 1500)
})

test('el punto de la calculadora separa los centavos', () => {
  assert.equal(typedCents('20'), 2000)
  assert.equal(typedCents('20.'), 2000)
  assert.equal(typedCents('20.5'), 2050)
  assert.equal(typedCents('20.55'), 2055)
  assert.equal(typedCents(''), 0)
})

test('la voz escribe el número de operación', () => {
  assert.equal(spokenDigits('siete ocho nueve cinco cuatro ocho cinco dos'), '78954852')
  assert.equal(spokenDigits('78954852'), '78954852')
  assert.equal(spokenDigits('setenta y ocho noventa y cinco'), '7895')
  assert.equal(spokenDigits('el número es cero uno dos'), '012')
  assert.equal(spokenDigits('doble cero cinco'), '005')
})

test('el código QR de Yape se puede leer', () => {
  const matrix = qrMatrix('Hello', 0)
  assert.equal(matrix.length, 21)
  assert.equal(matrix.flat().filter(Boolean).length, 210)
  assert.deepEqual(matrix[0].slice(0, 7), [true, true, true, true, true, true, true])
})
