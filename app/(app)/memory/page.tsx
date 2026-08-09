import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addMemory } from '@/lib/actions/memory'
import MemoryRow from '@/components/memory/MemoryRow'

export default async function MemoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: memories } = await supabase
    .from('memory_entries')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">🧠 Mémoire</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Informations que l'assistant retient pour personnaliser ses réponses. Tu gardes le contrôle total : consulte, modifie ou supprime à tout moment.
        </p>
      </div>

      <form action={addMemory} className="card space-y-2 p-4">
        <input name="key" placeholder="Ex: allergie du fils" required className="input-field w-full" />
        <textarea name="value" placeholder="Détail de l'information" required rows={2} className="input-field w-full" />
        <button type="submit" className="btn-primary">
          Ajouter
        </button>
      </form>

      <div className="space-y-2">
        {(!memories || memories.length === 0) && (
          <p className="text-sm text-[var(--color-ink-muted)]">Aucune information mémorisée pour le moment.</p>
        )}
        {memories?.map((m) => (
          <MemoryRow key={m.id} memory={m} />
        ))}
      </div>
    </div>
  )
}