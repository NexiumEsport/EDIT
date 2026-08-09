'use client'

import { useTransition } from 'react'
import { completeTask, deleteTask } from '@/lib/actions/tasks'

type Task = {
  id: string
  title: string
  priority: string
  status: string
  due_date: string | null
}

const PRIORITY_LABELS: Record<string, string> = {
  urgent: '🔴 Urgent',
  high: '🟠 Haute',
  medium: '🟡 Moyenne',
  low: '🟢 Basse',
}

export default function TaskRow({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition()

  function handleComplete() {
    startTransition(() => {
      completeTask(task.id)
    })
  }

  function handleDelete() {
    startTransition(() => {
      deleteTask(task.id)
    })
  }

  return (
    <div className={`card flex items-center gap-3 p-3 ${isPending ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={task.status === 'done'}
        onChange={handleComplete}
        disabled={isPending || task.status === 'done'}
        className="h-4 w-4 accent-[var(--color-primary)]"
      />
      <div className="flex-1">
        <p className={task.status === 'done' ? 'text-[var(--color-ink-muted)] line-through' : ''}>
          {task.title}
        </p>
        <p className="text-xs text-[var(--color-ink-muted)]">
          {PRIORITY_LABELS[task.priority] ?? task.priority}
          {task.due_date && ` · Échéance : ${task.due_date}`}
        </p>
      </div>
      <button onClick={handleDelete} disabled={isPending} className="btn-danger text-sm">
        Supprimer
      </button>
    </div>
  )
}