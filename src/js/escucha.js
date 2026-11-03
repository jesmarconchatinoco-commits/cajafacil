export function canListen() {
  if (typeof window === 'undefined') return false
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function startListening({ onLive, onPhrase, onEnd, onError, onBreak }) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const heard = new Recognition()
  let committed = 0
  let generation = 0
  let stopped = false
  heard.lang = 'es-PE'
  heard.continuous = true
  heard.interimResults = true
  heard.maxAlternatives = 1
  function boot() {
    committed = 0
    generation += 1
    try {
      heard.start()
    } catch {
      onEnd()
    }
  }
  heard.onresult = (event) => {
    let live = ''
    let fresh = ''
    const ticket = generation
    for (let index = 0; index < event.results.length; index += 1) {
      const piece = event.results[index][0].transcript
      live += `${piece} `
      if (event.results[index].isFinal && index >= committed) {
        fresh += `${piece} `
        committed = index + 1
      }
    }
    if (onLive) onLive(live.trim(), ticket)
    if (fresh.trim() && onPhrase) onPhrase(fresh.trim())
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
    if (onBreak) onBreak(generation)
    boot()
  }
  boot()
  const stop = () => {
    stopped = true
    heard.onend = null
    heard.onerror = null
    try {
      heard.stop()
    } catch {
      /* ya estaba detenido */
    }
  }
  stop.restart = () => {
    try {
      heard.abort()
    } catch {
      try {
        heard.stop()
      } catch {
        /* ya estaba detenido */
      }
    }
  }
  return stop
}
