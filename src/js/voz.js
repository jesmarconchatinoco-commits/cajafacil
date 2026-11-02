import * as Speech from 'expo-speech'

let rate = 0.9

export function setSpeechRate(slow) {
  rate = slow ? 0.75 : 0.9
}

export function speakAloud(text, { onStart, onEnd } = {}) {
  Speech.speak(text, {
    language: 'es-PE',
    rate,
    pitch: 1,
    volume: 1,
    onStart,
    onDone: onEnd,
    onStopped: onEnd,
    onError: onEnd,
  })
}

export function stopAloud() {
  return Speech.stop()
}
