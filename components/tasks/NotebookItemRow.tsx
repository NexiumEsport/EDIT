'use client'

import { useTransition } from 'react'
import { toggleNotebookItem, deleteNotebookItem } from '@/lib/actions/tasks'

type Item = {
  id: string
  content: string
  is_done: boolean
}

export default function NotebookItemRow({
  item,
  notebookId,
}: {
  item: Item
  notebookId: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(() => {
      toggleNotebookItem(item.id, notebookId, item.is_done)
    })
  }

  function handleDelete() {
    startTransition(() => {
      deleteNotebookItem(item.id, notebookId)
    })
  }

  return (
    <div className={`card flex items-center gap-3 p-3 ${isPending ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={item.is_done}
        onChange={handleToggle}
        disabled={isPending}
        className="h-4 w-4 accent-[var(--color-primary)]"
      />
      <span className={`flex-1 ${item.is_done ? 'text-gray-400 line-through' : ''}`}>
        {item.content}
      </span>
      <button onClick={handleDelete} disabled={isPending} className="text-xs text-red-500">
        Supprimer
      </button>
    </div>
  )
}