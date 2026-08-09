'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'

const WAKE_WORD = 'edit'
const RESTART_DELAY = 1500

export default function AssistantPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(true)
  const [micError, setMicError] = useState<string | null>(null)

  const commandRecognitionRef = useRef<any>(null)
  const wakeRecognitionRef = useRef<any>(null)
  const wakeActiveRef = useRef(true)
  const wakeIsRunningRef = useRef(false)
  const commandIsRunningRef = useRef(false)

  const handleSend = useCallback(async (overrideInput?: string) => {
    const messageToSend = overrideInput ?? input
    if (!messageToSend.trim()) return

    setMessages((prev) => [...prev, { role: 'user', content: messageToSend }])
    setInput('')
    setLoading(true)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: messageToSend }),
    })

    const data = await res.json()
    setLoading(false)

    setMessages((prev) => [...prev, { role: 'assistant', content: data.reply ?? data.error }])
  }, [input])

  const restartWakeListeningRef = useRef<() => void>(() => {})

  const restartWakeListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition || commandIsRunningRef.current) return

    try { wakeRecognitionRef.current?.stop() } catch {}
    wakeIsRunningRef.current = false

    const wakeRecognition = new SpeechRecognition()
    wakeRecognition.lang = 'fr-FR'
    wakeRecognition.continuous = true
    wakeRecognition.interimResults = true

    wakeRecognition.onstart = () => {
      wakeIsRunningRef.current = true
      setMicError(null)
    }

    wakeRecognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase()
      if (transcript.includes(WAKE_WORD)) {
        startCommandListening()
      }
    }

    wakeRecognition.onerror = (event: any) => {
      wakeIsRunningRef.current = false
      if (event.error === 'not-allowed') {
        setMicError('Accès au micro refusé. Autorise-le dans les paramètres du navigateur pour utiliser "EDIT".')
        wakeActiveRef.current = false
        return
      }
      if (wakeActiveRef.current && !commandIsRunningRef.current) {
        setTimeout(() => restartWakeListeningRef.current(), RESTART_DELAY)
      }
    }

    wakeRecognition.onend = () => {
      wakeIsRunningRef.current = false
      if (wakeActiveRef.current && !commandIsRunningRef.current) {
        setTimeout(() => restartWakeListeningRef.current(), RESTART_DELAY)
      }
    }

    wakeRecognitionRef.current = wakeRecognition
    try {
      wakeRecognition.start()
    } catch {
      wakeIsRunningRef.current = false
    }
  }, [])

  useEffect(() => {
    restartWakeListeningRef.current = restartWakeListening
  }, [restartWakeListening])

  const startCommandListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition || commandIsRunningRef.current) return

    try { wakeRecognitionRef.current?.stop() } catch {}
    wakeIsRunningRef.current = false

    const recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      commandIsRunningRef.current = true
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
      setTimeout(() => handleSend(transcript), 100)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      commandIsRunningRef.current = false
      setIsListening(false)
      if (wakeActiveRef.current) {
        setTimeout(() => restartWakeListeningRef.current(), RESTART_DELAY)
      }
    }

    commandRecognitionRef.current = recognition
    setIsListening(true)
    try {
      recognition.start()
    } catch {
      commandIsRunningRef.current = false
      setIsListening(false)
    }
  }, [handleSend])

  // Demarrage automatique de l'ecoute du mot-cle des l'arrivee sur la page
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceSupported(false)
      return
    }

    wakeActiveRef.current = true
    restartWakeListening()

    return () => {
      wakeActiveRef.current = false
      try { wakeRecognitionRef.current?.stop() } catch {}
      try { commandRecognitionRef.current?.stop() } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleListening() {
    if (isListening) {
      try { commandRecognitionRef.current?.stop() } catch {}
      setIsListening(false)
    } else {
      startCommandListening()
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-57px)] max-w-2xl flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Assistant EDIT</h1>
        {voiceSupported && !micError && (
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
            🟢 Dis "EDIT" pour me parler
          </span>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`card p-3 ${m.role === 'user' ? 'ml-auto max-w-[80%] bg-[var(--color-bg)] text-right' : 'mr-auto max-w-[80%]'}`}
          >
            {m.role === 'assistant' ? (
              <div className="prose-sm [&_strong]:font-semibold [&_strong]:text-[var(--color-primary)]">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            ) : (
              m.content
            )}
          </div>
        ))}
        {loading && <p className="text-sm text-[var(--color-ink-muted)]">EDIT réfléchit...</p>}
        {isListening && (
          <p className="text-sm font-medium text-[var(--color-primary)]">🎙️ Je t'écoute...</p>
        )}
      </div>

      {micError && (
        <p className="mb-2 text-xs text-[var(--color-danger)]">{micError}</p>
      )}
      {!voiceSupported && (
        <p className="mb-2 text-xs text-[var(--color-ink-muted)]">
          La saisie vocale n'est pas disponible sur ce navigateur. Utilise Chrome ou Edge.
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ajoute du lait à la liste de courses..."
          className="input-field flex-1"
        />
        {voiceSupported && (
          <button
            onClick={toggleListening}
            className={`rounded-full px-3 text-lg transition-colors ${
              isListening
                ? 'bg-[var(--color-danger)] text-white animate-pulse'
                : 'bg-[var(--color-bg)] text-[var(--color-ink-muted)] hover:bg-[var(--color-border)]'
            }`}
            title={isListening ? 'Arrêter' : 'Parler'}
          >
            🎙️
          </button>
        )}
        <button onClick={() => handleSend()} className="btn-primary">
          Envoyer
        </button>
      </div>
    </div>
  )
}