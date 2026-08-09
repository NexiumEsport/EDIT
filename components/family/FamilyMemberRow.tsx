'use client'

import { useState, useTransition } from 'react'
import { updateMemberRole, removeMember } from '@/lib/actions/family'

type Member = {
  id: string
  first_name: string
  last_name: string | null
  email: string
  role: string
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  adult: 'Adulte',
  child: 'Enfant',
}

export default function FamilyMemberRow({ member, isSelf, isAdmin }: { member: Member; isSelf: boolean; isAdmin: boolean }) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRoleChange(newRole: string) {
    setError(null)
    startTransition(async () => {
      const result = await updateMemberRole(member.id, newRole)
      if (result.error) setError(result.error)
    })
  }

  function handleRemove() {
    setError(null)
    startTransition(async () => {
      const result = await removeMember(member.id)
      if (result.error) setError(result.error)
      setConfirming(false)
    })
  }

  return (
    <div className={`card p-3 ${isPending ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">
            {member.first_name} {member.last_name ?? ''} {isSelf && <span className="text-xs text-[var(--color-ink-muted)]">(toi)</span>}
          </p>
          <p className="text-xs text-[var(--color-ink-muted)]">{member.email}</p>
        </div>

        {isAdmin && !isSelf ? (
          <div className="flex items-center gap-2">
            <select
              defaultValue={member.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={isPending}
              className="input-field text-sm"
            >
              <option value="admin">Administrateur</option>
              <option value="adult">Adulte</option>
              <option value="child">Enfant</option>
            </select>
            {!confirming ? (
              <button onClick={() => setConfirming(true)} className="btn-danger text-sm">
                Retirer
              </button>
            ) : (
              <div className="flex gap-1">
                <button onClick={handleRemove} disabled={isPending} className="btn-danger text-sm">
                  Confirmer
                </button>
                <button onClick={() => setConfirming(false)} className="text-sm text-[var(--color-ink-muted)]">
                  Annuler
                </button>
              </div>
            )}
          </div>
        ) : (
          <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs font-medium text-[var(--color-ink-muted)]">
            {ROLE_LABELS[member.role] ?? member.role}
          </span>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  )
}