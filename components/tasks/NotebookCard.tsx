'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { deleteNotebook } from '@/lib/actions/tasks'

export default function NotebookCard({
  id,
  title,
}: {
  id: string
  title: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(() => {
      deleteNotebook(id)
    })
  }

  return (
    <div className={`card relative p-4 ${isPending ? 'opacity-50' : ''}`}>
      <Link href={`/tasks/${id}`} className="block">
        <span className="font-medium">{title}</span>
      </Link>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="absolute right-2 top-2 text-xs text-red-500"
      >
        ✕
      </button>
    </div>
  )
}