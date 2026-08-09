'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { resetFamilyData } from '@/lib/actions/settings'

const CONFIRM_WORD = 'SUPPRIMER'

export default function ResetDatabaseButton() {
  const [confirming, setConfirming] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleReset() {
    setError(null)
    startTransition(async () => {
      const result = await resetFamilyData()
      if (result.error) {
        setError(result.error)
      } else {
        setConfirming(false)
        setInput('')
        router.refresh()
      }
    })
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="text-sm text-[var(--color-danger)] hover:underline">
        Réinitialiser toutes les données de la famille
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-[var(--color-danger)] bg-red-50 p-4">
      <p className="mb-2 text-sm text-[var(--color-danger)]">
        Cette action supprime <strong>définitivement</strong> toutes les courses, tâches, rappels, événements et mémoires de toute la famille. Les comptes et profils sont conservés.
      </p>
      <p className="mb-2 text-sm text-[var(--color-danger)]">
        Tape <strong>{CONFIRM_WORD}</strong> pour confirmer :
      </p>
      {error && <p className="mb-2 text-sm text-[var(--color-danger)]">{error}</p>}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input-field flex-1"
          placeholder={CONFIRM_WORD}
        />
        <button
          onClick={handleReset}
          disabled={input !== CONFIRM_WORD || isPending}
          className="rounded-lg bg-[var(--color-danger)] px-4 py-2 text-sm text-white disabled:opacity-40"
        >
          {isPending ? 'Suppression...' : 'Confirmer'}
        </button>
        <button
          onClick={() => { setConfirming(false); setInput(''); setError(null) }}
          disabled={isPending}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}