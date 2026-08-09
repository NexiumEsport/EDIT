import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addReminder } from '@/lib/actions/reminders'
import ReminderRow from '@/components/reminders/ReminderRow'

export default async function RemindersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: reminders } = await supabase
    .from('reminders')
    .select('*')
    .order('status', { ascending: true })
    .order('remind_at', { ascending: true })

  const pending = reminders?.filter((r) => r.status === 'pending') ?? []
  const done = reminders?.filter((r) => r.status === 'done') ?? []

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <h1 className="text-xl font-semibold sm:text-2xl">🔔 Rappels</h1>

      <form action={addReminder} className="card flex flex-col gap-2 p-4 sm:flex-row">
        <input
          name="title"
          placeholder="Titre du rappel"
          required
          className="input-field flex-1"
        />
        <input
          type="datetime-local"
          name="remind_at"
          required
          className="input-field"
        />
        <button type="submit" className="btn-primary">
          Ajouter
        </button>
      </form>

      <div className="space-y-1">
        {pending.length === 0 && done.length === 0 && (
          <p className="text-sm text-[var(--color-ink-muted)]">Aucun rappel pour le moment.</p>
        )}
        {pending.map((r) => (
          <ReminderRow key={r.id} reminder={r} />
        ))}
      </div>

      {done.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="mb-2 text-sm text-[var(--color-ink-muted)]">Terminés ({done.length})</p>
          <div className="space-y-1">
            {done.map((r) => (
              <ReminderRow key={r.id} reminder={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}