const ONES = {
  cero: 0,
  un: 1,
  uno: 1,
  una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
}

const UNDER_THIRTY = {
  diez: 10,
  once: 11,
  doce: 12,
  trece: 13,
  catorce: 14,
  quince: 15,
  dieciseis: 16,
  diecisiete: 17,
  dieciocho: 18,
  diecinueve: 19,
  veinte: 20,
  veintiuno: 21,
  veintidos: 22,
  veintitres: 23,
  veinticuatro: 24,
  veinticinco: 25,
  veintiseis: 26,
  veintisiete: 27,
  veintiocho: 28,
  veintinueve: 29,
}

const TENS = {
  treinta: 30,
  cuarenta: 40,
  cincuenta: 50,
  sesenta: 60,
  setenta: 70,
  ochenta: 80,
  noventa: 90,
}

export function typedCents(text) {
  const raw = String(text || '')
  if (!raw || raw === '.') return 0
  const body = raw.endsWith('.') ? raw.slice(0, -1) : raw
  if (!body) return 0
  const [whole, frac = ''] = body.split('.')
  const soles = Number(whole || 0)
  if (!raw.includes('.')) return soles * 100
  return soles * 100 + Number((`${frac}00`).slice(0, 2))
}

export function sumCents(list) {
  return (list || []).reduce((total, cents) => total + (Number(cents) || 0), 0)
}

export function spokenMoney(cents) {
  const soles = Math.floor(Math.abs(cents) / 100)
  const dec = Math.abs(cents) % 100
  const name = soles === 1 ? 'sol' : 'soles'
  if (dec === 0) return `${soles} ${name}`
  return `${soles} ${name} con ${dec}`
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(un sol|sol|solo)\s+y\s+medio\b/g, ' 1.50 ')
    .replace(/\bmedio\s+sol(es)?\b/g, ' 0.50 ')
    .replace(/\by\s+medio\b/g, ' con 50 ')
    .replace(/\bmedio\b/g, ' 0.50 ')
    .replace(/s\/\s*/g, ' ')
    .replace(/\b(soles|sol|centimos|centimo|centavos|centavo)\b/g, ' ')
    .replace(/(\d),(\d{1,2})\b/g, '$1.$2')
    .split(/[^a-z0-9.]+/)
    .filter(Boolean)
}

function wordNumber(token) {
  if (ONES[token] != null) return ONES[token]
  if (UNDER_THIRTY[token] != null) return UNDER_THIRTY[token]
  if (TENS[token] != null) return TENS[token]
  if (token === 'cien' || token === 'ciento') return 100
  if (token === 'mil') return 1000
  if (/^\d+$/.test(token)) return Number(token)
  return null
}

function decimalCents(whole, fraction) {
  if (fraction < 10) return whole * 100 + fraction * 10
  return whole * 100 + fraction
}

function digitCents(token) {
  const value = Number(token)
  if (token.length <= 2) return value * 100
  if (value % 100 === 0 && value <= 900) return value * 100
  return value
}

function readMoney(tokens, index) {
  const token = tokens[index]
  if (/^\d+\.\d{1,2}$/.test(token)) {
    const [whole, fraction] = token.split('.')
    const frac = fraction.length === 1 ? Number(fraction) * 10 : Number(fraction)
    return { cents: Number(whole) * 100 + frac, next: index + 1 }
  }
  if (/^\d+$/.test(token) && token.length >= 3) {
    return { cents: digitCents(token), next: index + 1 }
  }
  const base = wordNumber(token)
  if (base == null) return null
  let soles = base
  let cursor = index + 1
  if (TENS[token] && tokens[cursor] === 'y' && ONES[tokens[cursor + 1]] != null) {
    soles += ONES[tokens[cursor + 1]]
    cursor += 2
  }
  if ((token === 'cien' || token === 'ciento') && wordNumber(tokens[cursor]) != null && wordNumber(tokens[cursor]) < 100) {
    soles += wordNumber(tokens[cursor])
    cursor += 1
  }
  if (tokens[cursor] === 'con' || tokens[cursor] === 'punto' || tokens[cursor] === 'coma') {
    const fraction = wordNumber(tokens[cursor + 1])
    if (fraction != null && fraction < 100) {
      return { cents: decimalCents(soles, fraction), next: cursor + 2 }
    }
  }
  const tail = wordNumber(tokens[cursor])
  if (soles > 0 && soles < 100 && tail != null && tail >= 10 && tail < 100) {
    return { cents: soles * 100 + tail, next: cursor + 1 }
  }
  return { cents: soles * 100, next: cursor }
}

const SKIP_DIGIT_WORDS = new Set([
  'de',
  'del',
  'el',
  'la',
  'los',
  'las',
  'numero',
  'operacion',
  'validacion',
  'es',
  'dice',
  'son',
  'con',
  'mas',
  'y',
])

export function spokenDigits(text) {
  const tokens = String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
  let digits = ''
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (SKIP_DIGIT_WORDS.has(token)) continue
    if (token === 'doble' || token === 'triple') {
      const next = tokens[index + 1]
      const digit = ONES[next] != null ? String(ONES[next]) : /^\d$/.test(next) ? next : ''
      if (digit) {
        digits += digit.repeat(token === 'doble' ? 2 : 3)
        index += 1
      }
      continue
    }
    if (/^\d+$/.test(token)) {
      digits += token
      continue
    }
    if (ONES[token] != null) {
      digits += String(ONES[token])
      continue
    }
    if (UNDER_THIRTY[token] != null) {
      digits += String(UNDER_THIRTY[token])
      continue
    }
    if (TENS[token] != null) {
      let value = TENS[token]
      if (tokens[index + 1] === 'y' && ONES[tokens[index + 2]] != null) {
        value += ONES[tokens[index + 2]]
        index += 2
      }
      digits += String(value)
    }
  }
  return digits
}

export function parseSpokenAmounts(text) {
  const tokens = tokenize(text)
  const amounts = []
  let index = 0
  while (index < tokens.length) {
    if (tokens[index] === 'y' || tokens[index] === 'mas' || tokens[index] === 'luego') {
      index += 1
      continue
    }
    const read = readMoney(tokens, index)
    if (!read) {
      index += 1
      continue
    }
    if (read.cents > 0 && read.cents <= 99999999) amounts.push(read.cents)
    index = Math.max(read.next, index + 1)
  }
  return amounts
}
