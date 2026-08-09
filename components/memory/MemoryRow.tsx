'use client'

import { useTransition } from 'react'
import { toggleMemory, deleteMemory } from '@/lib/actions/memory'

type Memory = {
  id: string
  key: string
  value: string
  category: string | null
  is_active: boolean
}

export default function MemoryRow({ memory }: { memory: Memory }) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(() => {
      toggleMemory(memory.id, !memory.is_active)
    })
  }

  function handleDelete() {
    startTransition(() => {
      deleteMemory(memory.id)
    })
  }

  return (
    <div className={`card flex items-start justify-between gap-3 p-3 ${isPending ? 'opacity-50' : ''} ${!memory.is_active ? 'opacity-60' : ''}`}>
      <div className="flex-1">
        <p className="text-sm font-medium">{memory.key}</p>
        <p className="text-sm text-[var(--color-ink-muted)]">{memory.value}</p>
        {!memory.is_active && (
          <span className="mt-1 inline-block rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-xs text-[var(--color-ink-muted)]">
            Désactivée
          </span>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <button onClick={handleToggle} disabled={isPending} className="text-xs text-[var(--color-primary)] hover:underline">
          {memory.is_active ? 'Désactiver' : 'Activer'}
        </button>
        <button onClick={handleDelete} disabled={isPending} className="btn-danger text-xs">
          Supprimer
        </button>
      </div>
    </div>
  )
}