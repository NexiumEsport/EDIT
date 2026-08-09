'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const addItemSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.string().max(50).optional(),
})

async function getFamilyId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Profil introuvable')

  return { supabase, userId: user.id, familyId: profile.family_id }
}

export async function addShoppingItem(formData: FormData): Promise<void> {
  const parsed = addItemSchema.safeParse({
    name: formData.get('name'),
    quantity: formData.get('quantity') || undefined,
  })

  if (!parsed.success) {
    console.error('Nom invalide')
    return
  }

  const { supabase, userId, familyId } = await getFamilyId()

  const { error } = await supabase.from('shopping_items').insert({
    family_id: familyId,
    added_by: userId,
    name: parsed.data.name,
    quantity: parsed.data.quantity ?? null,
  })

  if (error) {
    console.error("Erreur lors de l'ajout", error)
    return
  }

  revalidatePath('/shopping')
}

export async function toggleShoppingItem(id: string, isChecked: boolean) {
  const { supabase } = await getFamilyId()

  const { error } = await supabase
    .from('shopping_items')
    .update({ is_checked: isChecked })
    .eq('id', id)

  if (error) return { error: 'Erreur lors de la mise à jour' }

  revalidatePath('/shopping')
  return { success: true }
}

export async function deleteShoppingItem(id: string) {
  const { supabase } = await getFamilyId()

  const { error } = await supabase.from('shopping_items').delete().eq('id', id)

  if (error) return { error: 'Erreur lors de la suppression' }

  revalidatePath('/shopping')
  return { success: true }
}