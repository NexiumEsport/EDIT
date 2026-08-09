import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addShoppingItem } from '@/lib/actions/shopping'
import ShoppingItemRow from '@/components/shopping/ShoppingItemRow'

export default async function ShoppingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: items } = await supabase
    .from('shopping_items')
    .select('*')
    .order('is_checked', { ascending: true })
    .order('created_at', { ascending: false })

  const pending = items?.filter((i) => !i.is_checked) ?? []
  const checked = items?.filter((i) => i.is_checked) ?? []

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">🛒 Liste de courses</h1>

      <form action={addShoppingItem} className="card flex gap-2 p-4">
        <input
          name="name"
          placeholder="Nom de l'article"
          required
          className="input-field flex-1"
        />
        <input
          name="quantity"
          placeholder="Quantité (optionnel)"
          className="input-field w-32"
        />
        <button type="submit" className="btn-primary">
          Ajouter
        </button>
      </form>

      <div className="space-y-1">
        {pending.length === 0 && checked.length === 0 && (
          <p className="text-sm text-[var(--color-ink-muted)]">Aucun article pour le moment.</p>
        )}
        {pending.map((item) => (
          <ShoppingItemRow key={item.id} item={item} />
        ))}
      </div>

      {checked.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="mb-2 text-sm text-[var(--color-ink-muted)]">Déjà pris ({checked.length})</p>
          <div className="space-y-1">
            {checked.map((item) => (
              <ShoppingItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}