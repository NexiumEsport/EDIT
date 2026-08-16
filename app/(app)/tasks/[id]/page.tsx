import { createClient } from '@/lib/supabase/server'
import { addNotebookItem } from '@/lib/actions/tasks'
import NotebookItemRow from '@/components/tasks/NotebookItemRow'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: notebook } = await supabase
    .from('notebooks')
    .select('id, title')
    .eq('id', id)
    .single()

  if (!notebook) notFound()

  const { data: items } = await supabase
    .from('notebook_items')
    .select('id, content, is_done, created_at')
    .eq('notebook_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <Link href="/tasks" className="text-sm text-indigo-600">← Retour</Link>
      <h1 className="text-xl font-semibold sm:text-2xl">{notebook.title}</h1>

      <form action={addNotebookItem} className="card flex gap-2 p-4">
        <input type="hidden" name="notebookId" value={notebook.id} />
        <input
          name="content"
          placeholder="Ajouter un élément"
          required
          className="flex-1 rounded-md border px-3 py-2"
        />
        <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white">
          Ajouter
        </button>
      </form>

      <div className="space-y-1">
        {items?.map((item) => (
          <NotebookItemRow key={item.id} item={item} notebookId={notebook.id} />
        ))}
        {items?.length === 0 && (
          <p className="text-sm text-gray-400">Aucun élément pour l'instant.</p>
        )}
      </div>
    </div>
  )
}