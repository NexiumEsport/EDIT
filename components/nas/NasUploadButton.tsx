'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NasUploadButton({ folderPath }: { folderPath: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPending(true)
    setError(null)

    const form = new FormData()
    form.append('folderPath', folderPath)
    form.append('file', file)

    try {
      const res = await fetch('/api/nas/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Echec upload')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setPending(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Envoi...' : '+ Ajouter'}
      </button>
      <input ref={inputRef} type="file" className="hidden" onChange={handleChange} />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}