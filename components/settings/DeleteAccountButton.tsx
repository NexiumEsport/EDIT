'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAccount } from '@/lib/actions/settings'

export default function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result = await deleteAccount()
      if (result.error) {
        setError(result.error)
        setConfirming(false)
      } else {
        router.push('/login')
      }
    })
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-sm text-red-600 hover:underline"
      >
        Supprimer mon compte
      </button>
    )
  }

  return (
    <div className="rounded border border-red-200 bg-red-50 p-4">
      <p className="mb-3 text-sm text-red-800">
        Cette action est irréversible. Ton profil et l'accès à l'application seront définitivement supprimés. Confirmes-tu ?
      </p>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {isPending ? 'Suppression...' : 'Oui, supprimer définitivement'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded border px-3 py-1.5 text-sm"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}