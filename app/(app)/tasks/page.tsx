import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addTask } from '@/lib/actions/tasks'
import TaskRow from '@/components/tasks/TaskRow'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .order('status', { ascending: true })
    .order('priority', { ascending: false })

  const pending = tasks?.filter((t) => t.status !== 'done') ?? []
  const done = tasks?.filter((t) => t.status === 'done') ?? []

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <h1 className="text-xl font-semibold sm:text-2xl">✅ Tâches</h1>

      <form action={addTask} className="card flex flex-col gap-2 p-4 sm:flex-row">
        <input
          name="title"
          placeholder="Titre de la tâche"
          required
          className="input-field flex-1"
        />
        <select name="priority" defaultValue="medium" className="input-field">
          <option value="low">Basse</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
          <option value="urgent">Urgent</option>
        </select>
        <button type="submit" className="btn-primary">
          Ajouter
        </button>
      </form>

      <div className="space-y-1">
        {pending.length === 0 && done.length === 0 && (
          <p className="text-sm text-[var(--color-ink-muted)]">Aucune tâche pour le moment.</p>
        )}
        {pending.map((t) => (
          <TaskRow key={t.id} task={t} />
        ))}
      </div>

      {done.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="mb-2 text-sm text-[var(--color-ink-muted)]">Terminées ({done.length})</p>
          <div className="space-y-1">
            {done.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}