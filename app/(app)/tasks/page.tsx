import { createClient } from '@/lib/supabase/server'
import { createNotebook } from '@/lib/actions/tasks'
import NotebookCard from '@/components/tasks/NotebookCard'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: notebooks } = await supabase
    .from('notebooks')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <h1 className="text-xl font-semibold sm:text-2xl">📝 Tâches</h1>

      <form action={createNotebook} className="card flex gap-2 p-4">
        <input
          name="title"
          placeholder="Titre bloc"
          required
          className="flex-1 rounded-md border px-3 py-2"
        />
        <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white">
          Ajouter
        </button>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {notebooks?.map((nb) => (
          <NotebookCard key={nb.id} id={nb.id} title={nb.title} />
        ))}
        {notebooks?.length === 0 && (
          <p className="col-span-full text-sm text-gray-400">Aucun bloc pour l'instant.</p>
        )}
      </div>
    </div>
  )
}