import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addTask } from '@/lib/actions/tasks'
import TaskMemberColumn from '@/components/tasks/TaskMemberColumn'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: members } = await supabase
    .from('users')
    .select('id, first_name, color')
    .eq('family_id', profile.family_id)

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .order('status', { ascending: true })
    .order('priority', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <h1 className="text-xl font-semibold sm:text-2xl">✅ Tâches</h1>

      <form action={addTask} className="card flex flex-col gap-2 p-4 sm:flex-row sm:flex-wrap">
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
        <select name="assigned_to" defaultValue="" className="input-field sm:w-40">
          <option value="">Non assigné</option>
          {members?.map((m) => (
            <option key={m.id} value={m.id}>{m.first_name}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary">
          Ajouter
        </button>
      </form>

      <div className="flex flex-col gap-6 sm:flex-row sm:gap-4 sm:overflow-x-auto sm:pb-4">
        {members?.map((member) => (
          <TaskMemberColumn
            key={member.id}
            member={member}
            tasks={(tasks ?? []).filter((t) => t.assigned_to === member.id)}
          />
        ))}
      </div>
    </div>
  )
}