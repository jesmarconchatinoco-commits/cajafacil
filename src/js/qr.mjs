// Código QR en bytes, nivel M, versiones 1 a 3. Sin librerías nativas.

const EXP = new Uint8Array(512)
const LOG = new Uint8Array(256)
{
  let value = 1
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = value
    LOG[value] = i
    value <<= 1
    if (value & 0x100) value ^= 0x11d
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255]
}

function mul(a, b) {
  if (a === 0 || b === 0) return 0
  return EXP[LOG[a] + LOG[b]]
}

const VERSIONS = {
  1: { data: 16, ecc: 10, align: [] },
  2: { data: 28, ecc: 16, align: [6, 18] },
  3: { data: 44, ecc: 26, align: [6, 22] },
}

function rsRemainder(data, eccLen) {
  let gen = [1]
  for (let i = 0; i < eccLen; i += 1) gen = polyMul(gen, [1, EXP[i]])
  const out = new Uint8Array(eccLen)
  for (const byte of data) {
    const factor = byte ^ out[0]
    out.copyWithin(0, 1)
    out[eccLen - 1] = 0
    if (factor === 0) continue
    for (let i = 0; i < eccLen; i += 1) out[i] ^= mul(gen[i + 1], factor)
  }
  return out
}

function polyMul(a, b) {
  const out = new Array(a.length + b.length - 1).fill(0)
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) out[i + j] ^= mul(a[i], b[j])
  }
  return out
}

function bitsToBytes(bits) {
  const bytes = []
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0
    for (let b = 0; b < 8; b += 1) byte = (byte << 1) | (bits[i + b] || 0)
    bytes.push(byte)
  }
  return bytes
}

function encodeData(text, capacity) {
  const raw = Array.from(new TextEncoder().encode(text))
  const bits = [0, 1, 0, 0]
  for (let i = 7; i >= 0; i -= 1) bits.push((raw.length >>> i) & 1)
  for (const byte of raw) {
    for (let i = 7; i >= 0; i -= 1) bits.push((byte >>> i) & 1)
  }
  const limit = capacity * 8
  for (let i = 0; i < 4 && bits.length < limit; i += 1) bits.push(0)
  while (bits.length % 8) bits.push(0)
  const pads = [0xec, 0x11]
  let pad = 0
  while (bits.length < limit) {
    const byte = pads[pad % 2]
    pad += 1
    for (let i = 7; i >= 0; i -= 1) bits.push((byte >>> i) & 1)
  }
  return bitsToBytes(bits.slice(0, limit))
}

function pickVersion(text) {
  const length = new TextEncoder().encode(text).length
  for (const version of [1, 2, 3]) {
    if (length <= VERSIONS[version].data - 2) return version
  }
  return 3
}

function formatBits(mask) {
  const data = mask
  let rem = data << 10
  for (let i = 14; i >= 10; i -= 1) {
    if ((rem >>> i) & 1) rem ^= 0x537 << (i - 10)
  }
  return ((data << 10) | (rem & 0x3ff)) ^ 0x5412
}

function masked(mask, row, col) {
  switch (mask) {
    case 0:
      return (row + col) % 2 === 0
    case 1:
      return row % 2 === 0
    case 2:
      return col % 3 === 0
    case 3:
      return (row + col) % 3 === 0
    case 4:
      return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0
    case 5:
      return ((row * col) % 2) + ((row * col) % 3) === 0
    case 6:
      return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0
    default:
      return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0
  }
}

function blank(size) {
  return Array.from({ length: size }, () => Array(size).fill(false))
}

function build(text, version, mask) {
  const spec = VERSIONS[version]
  const size = 21 + (version - 1) * 4
  const dark = blank(size)
  const reserved = blank(size)

  function set(row, col, on) {
    dark[row][col] = on
    reserved[row][col] = true
  }

  function finder(top, left) {
    for (let row = -1; row <= 7; row += 1) {
      for (let col = -1; col <= 7; col += 1) {
        const y = top + row
        const x = left + col
        if (y < 0 || x < 0 || y >= size || x >= size) continue
        const inside = row >= 0 && row <= 6 && col >= 0 && col <= 6
        const edge = row === 0 || row === 6 || col === 0 || col === 6
        const core = row >= 2 && row <= 4 && col >= 2 && col <= 4
        set(y, x, inside && (edge || core))
      }
    }
  }
  finder(0, 0)
  finder(0, size - 7)
  finder(size - 7, 0)

  for (const row of spec.align) {
    for (const col of spec.align) {
      if (reserved[row][col]) continue
      for (let y = -2; y <= 2; y += 1) {
        for (let x = -2; x <= 2; x += 1) {
          set(row + y, col + x, Math.max(Math.abs(y), Math.abs(x)) !== 1)
        }
      }
    }
  }

  for (let i = 0; i < size; i += 1) {
    if (!reserved[6][i]) set(6, i, i % 2 === 0)
    if (!reserved[i][6]) set(i, 6, i % 2 === 0)
  }

  set(4 * version + 9, 8, true)

  for (let i = 0; i < 9; i += 1) {
    reserved[8][i] = true
    reserved[i][8] = true
  }
  for (let i = 0; i < 8; i += 1) {
    reserved[8][size - 1 - i] = true
    reserved[size - 1 - i][8] = true
  }

  const data = encodeData(text, spec.data)
  const ecc = rsRemainder(data, spec.ecc)
  const bytes = [...data, ...ecc]
  let index = 0
  let bit = 7
  let upward = true
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col -= 1
    for (let step = 0; step < size; step += 1) {
      const row = upward ? size - 1 - step : step
      for (let shift = 0; shift < 2; shift += 1) {
        const x = col - shift
        if (reserved[row][x]) continue
        let on = false
        if (index < bytes.length) on = ((bytes[index] >>> bit) & 1) === 1
        if (masked(mask, row, x)) on = !on
        dark[row][x] = on
        bit -= 1
        if (bit < 0) {
          index += 1
          bit = 7
        }
      }
    }
    upward = !upward
  }

  const bits = formatBits(mask)
  const bitAt = (i) => ((bits >>> i) & 1) === 1
  for (let i = 0; i < 15; i += 1) {
    const on = bitAt(i)
    if (i < 6) dark[i][8] = on
    else if (i < 8) dark[i + 1][8] = on
    else dark[size - 15 + i][8] = on
    if (i < 8) dark[8][size - i - 1] = on
    else if (i < 9) dark[8][15 - i] = on
    else dark[8][14 - i] = on
  }
  dark[size - 8][8] = true

  return dark
}

function penalty(matrix) {
  const size = matrix.length
  let score = 0
  const line = (read) => {
    let run = 1
    let color = read(0)
    for (let i = 1; i < size; i += 1) {
      const next = read(i)
      if (next === color) {
        run += 1
        if (run === 5) score += 3
        else if (run > 5) score += 1
      } else {
        color = next
        run = 1
      }
    }
  }
  for (let row = 0; row < size; row += 1) line((col) => matrix[row][col])
  for (let col = 0; col < size; col += 1) line((row) => matrix[row][col])
  for (let row = 0; row < size - 1; row += 1) {
    for (let col = 0; col < size - 1; col += 1) {
      const color = matrix[row][col]
      if (color === matrix[row][col + 1] && color === matrix[row + 1][col] && color === matrix[row + 1][col + 1]) {
        score += 3
      }
    }
  }
  const finder = [true, false, true, true, true, false, true]
  const looks = (read) => {
    for (let i = 0; i <= size - 7; i += 1) {
      let same = true
      for (let k = 0; k < 7; k += 1) if (read(i + k) !== finder[k]) same = false
      if (!same) continue
      const before = i >= 4 && [0, 1, 2, 3].every((k) => read(i - 1 - k) === false)
      const after = i + 10 < size && [0, 1, 2, 3].every((k) => read(i + 7 + k) === false)
      if (before || after) score += 40
    }
  }
  for (let row = 0; row < size; row += 1) looks((col) => matrix[row][col])
  for (let col = 0; col < size; col += 1) looks((row) => matrix[row][col])
  let darkCount = 0
  for (const row of matrix) for (const cell of row) if (cell) darkCount += 1
  score += Math.floor(Math.abs(darkCount * 100 / (size * size) - 50) / 5) * 10
  return score
}

export function qrMatrix(text, maskChoice) {
  const value = String(text || ' ')
  const version = pickVersion(value)
  if (maskChoice != null) return build(value, version, maskChoice)
  let best = null
  let bestScore = Infinity
  for (let mask = 0; mask < 8; mask += 1) {
    const matrix = build(value, version, mask)
    const score = penalty(matrix)
    if (score < bestScore) {
      best = matrix
      bestScore = score
    }
  }
  return best
}
