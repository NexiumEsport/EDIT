'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NasDeleteButton({ filePath }: { filePath: string }) {
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Supprimer ce fichier definitivement ?')) return

    setPending(true)

    try {
      const res = await fetch('/api/nas/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Echec suppression')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue')
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-red-500 disabled:opacity-50"
      aria-label="Supprimer"
    >
      {pending ? '...' : '🗑️'}
    </button>
  )
}