'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NasRenameButton({ path, currentName }: { path: string; currentName: string }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(currentName)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleRename() {
    if (!name.trim() || name === currentName) {
      setEditing(false)
      return
    }
    setPending(true)

    try {
      const res = await fetch('/api/nas/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, newName: name.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Echec renommage')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setPending(false)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleRename}
        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
        autoFocus
        disabled={pending}
        className="flex-1 rounded border px-1 py-0.5 text-sm"
        onClick={(e) => e.stopPropagation()}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        setEditing(true)
      }}
      className="text-xs text-gray-400"
      title="Renommer"
    >
      ✏️
    </button>
  )
}