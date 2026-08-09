'use client'

import { useTransition } from 'react'
import { deleteCalendarEvent } from '@/lib/actions/calendar'

type Event = {
  id: string
  title: string
  start_at: string
  category: string | null
}

export default function EventRow({ event }: { event: Event }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(() => {
      deleteCalendarEvent(event.id)
    })
  }

  const date = new Date(event.start_at).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className={`flex items-center gap-3 rounded border px-3 py-2 ${isPending ? 'opacity-50' : ''}`}>
      <div className="flex-1">
        <p>{event.title}</p>
        <p className="text-xs text-gray-500">
          {date}
          {event.category && <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-blue-600">{event.category}</span>}
        </p>
      </div>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-sm text-red-500 hover:underline"
      >
        Supprimer
      </button>
    </div>
  )
}