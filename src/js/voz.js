import * as Speech from 'expo-speech'

export function speakAloud(text, { onStart, onEnd } = {}) {
  Speech.speak(text, {
    language: 'es-PE',
    rate: 0.9,
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
