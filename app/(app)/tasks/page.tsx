import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addTask } from '@/lib/actions/tasks'
import TaskRow from '@/components/tasks/tasksrow'

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
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">✅ Taches</h1>

      <form action={addTask} className="mb-6 flex gap-2">
        <input
          name="title"
          placeholder="Titre de la tache"
          required
          className="flex-1 rounded border px-3 py-2"
        />
        <select name="priority" defaultValue="medium" className="rounded border px-3 py-2">
          <option value="low">Basse</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
          <option value="urgent">Urgent</option>
        </select>
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Ajouter
        </button>
      </form>

      <div className="space-y-1">
        {pending.length === 0 && done.length === 0 && (
          <p className="text-gray-400">Aucune tache pour le moment.</p>
        )}
        {pending.map((t) => (
          <TaskRow key={t.id} task={t} />
        ))}
      </div>

      {done.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <p className="mb-2 text-sm text-gray-400">Terminees ({done.length})</p>
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