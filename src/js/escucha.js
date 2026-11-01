export function canListen() {
  if (typeof window === 'undefined') return false
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function startListening({ onLive, onPhrase, onEnd, onError }) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const heard = new Recognition()
  let committed = 0
  let stopped = false
  heard.lang = 'es-PE'
  heard.continuous = true
  heard.interimResults = true
  heard.maxAlternatives = 1
  heard.onresult = (event) => {
    let live = ''
    let fresh = ''
    for (let index = 0; index < event.results.length; index += 1) {
      const piece = event.results[index][0].transcript
      live += `${piece} `
      if (event.results[index].isFinal && index >= committed) {
        fresh += `${piece} `
        committed = index + 1
      }
    }
    if (onLive) onLive(live.trim())
    if (fresh.trim()) onPhrase(fresh.trim())
  }
  heard.onerror = (event) => {
    if (event.error === 'no-speech' || event.error === 'aborted') return
    onError(event.error || 'error')
  }
  heard.onend = () => {
    if (stopped) {
      onEnd()
      return
    }
    try {
      heard.start()
    } catch {
      onEnd()
    }
  }
  heard.start()
  return () => {
    stopped = true
    heard.onend = null
    heard.onerror = null
    try {
      heard.stop()
    } catch {
      /* ya estaba detenido */
    }
  }
}
