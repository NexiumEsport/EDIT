'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NasCreateFolderButton({ folderPath }: { folderPath: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleCreate() {
    if (!name.trim()) return
    setPending(true)
    setError(null)

    try {
      const res = await fetch('/api/nas/create-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath, folderName: name.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Echec creation')
      setOpen(false)
      setName('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setPending(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-indigo-600 px-3 py-1.5 text-sm font-medium text-indigo-600"
      >
        + Nouveau dossier
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom du dossier"
        autoFocus
        className="rounded-md border px-2 py-1 text-sm"
      />
      <button
        type="button"
        onClick={handleCreate}
        disabled={pending}
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? '...' : 'Créer'}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false)
          setError(null)
        }}
        className="text-sm text-gray-400"
      >
        Annuler
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}