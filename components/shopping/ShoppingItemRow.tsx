'use client'

import { useTransition } from 'react'
import { toggleShoppingItem, deleteShoppingItem } from '@/lib/actions/shopping'

type Item = {
  id: string
  name: string
  quantity: string | null
  is_checked: boolean
}

export default function ShoppingItemRow({ item }: { item: Item }) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(() => {
      toggleShoppingItem(item.id, !item.is_checked)
    })
  }

  function handleDelete() {
    startTransition(() => {
      deleteShoppingItem(item.id)
    })
  }

  return (
    <div className={`card flex items-center gap-3 p-3 ${isPending ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={item.is_checked}
        onChange={handleToggle}
        disabled={isPending}
        className="h-4 w-4 accent-[var(--color-primary)]"
      />
      <span className={`flex-1 ${item.is_checked ? 'text-[var(--color-ink-muted)] line-through' : ''}`}>
        {item.name}
        {item.quantity && <span className="ml-2 text-sm text-[var(--color-ink-muted)]">({item.quantity})</span>}
      </span>
      <button onClick={handleDelete} disabled={isPending} className="btn-danger text-sm">
        Supprimer
      </button>
    </div>
  )
}