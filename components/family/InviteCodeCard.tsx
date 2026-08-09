'use client'

import { useState, useTransition } from 'react'
import { regenerateInviteCode } from '@/lib/actions/family'

export default function InviteCodeCard({ code, isAdmin }: { code: string; isAdmin: boolean }) {
  const [currentCode, setCurrentCode] = useState(code)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/register?invite=${currentCode}` : ''

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleRegenerate() {
    startTransition(async () => {
      const result = await regenerateInviteCode()
      if (result.code) setCurrentCode(result.code)
    })
  }

  return (
    <div className="card p-4">
      <p className="mb-2 text-sm font-medium">Lien d'invitation</p>
      <div className="flex gap-2">
        <input readOnly value={inviteUrl} className="input-field flex-1 text-sm" />
        <button onClick={handleCopy} className="btn-primary text-sm">
          {copied ? 'Copié !' : 'Copier'}
        </button>
      </div>
      <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
        Partage ce lien à un membre de ta famille pour qu'il rejoigne automatiquement ton espace.
      </p>
      {isAdmin && (
        <button
          onClick={handleRegenerate}
          disabled={isPending}
          className="mt-2 text-xs text-[var(--color-ink-muted)] hover:underline"
        >
          {isPending ? 'Régénération...' : 'Régénérer le code (invalide l\'ancien lien)'}
        </button>
      )}
    </div>
  )
}