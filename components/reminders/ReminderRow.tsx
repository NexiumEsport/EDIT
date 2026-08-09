'use client'

import { useTransition } from 'react'
import { completeReminder, deleteReminder } from '@/lib/actions/reminders'

type Creator = {
  id: string
  first_name: string
  color: string | null
} | null

type Reminder = {
  id: string
  title: string
  remind_at: string
  status: string
  creator?: Creator
}

export default function ReminderRow({ reminder }: { reminder: Reminder }) {
  const [isPending, startTransition] = useTransition()

  function handleComplete() {
    startTransition(() => {
      completeReminder(reminder.id)
    })
  }

  function handleDelete() {
    startTransition(() => {
      deleteReminder(reminder.id)
    })
  }

  const date = new Date(reminder.remind_at).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className={`card flex items-center gap-3 p-3 ${isPending ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={reminder.status === 'done'}
        onChange={handleComplete}
        disabled={isPending || reminder.status === 'done'}
        className="h-4 w-4 accent-[var(--color-primary)]"
      />
      <div className="flex-1">
        <p className={reminder.status === 'done' ? 'text-[var(--color-ink-muted)] line-through' : ''}>
          {reminder.title}
        </p>
        <p className="text-xs text-[var(--color-ink-muted)]">{date}</p>
      </div>
      {reminder.creator && (
        <span
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: reminder.creator.color ?? '#6B7094' }}
          title={reminder.creator.first_name}
        >
          {reminder.creator.first_name.charAt(0).toUpperCase()}
        </span>
      )}
      <button onClick={handleDelete} disabled={isPending} className="btn-danger text-sm">
        Supprimer
      </button>
    </div>
  )
}