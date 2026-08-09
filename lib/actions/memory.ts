'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const addMemorySchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().min(1).max(500),
})

async function getSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifie')

  const { data: profile } = await supabase.from('users').select('family_id').eq('id', user.id).single()
  if (!profile) throw new Error('Profil introuvable')

  return { supabase, userId: user.id, familyId: profile.family_id }
}

export async function addMemory(formData: FormData): Promise<void> {
  const parsed = addMemorySchema.safeParse({
    key: formData.get('key'),
    value: formData.get('value'),
  })

  if (!parsed.success) {
    console.error('Champs invalides')
    return
  }

  const { supabase, userId, familyId } = await getSession()

  const { error } = await supabase.from('memory_entries').insert({
    family_id: familyId,
    user_id: userId,
    key: parsed.data.key,
    value: parsed.data.value,
  })

  if (error) {
    console.error('Erreur creation memoire', error)
    return
  }

  revalidatePath('/memory')
}

export async function toggleMemory(id: string, isActive: boolean) {
  const { supabase } = await getSession()

  const { error } = await supabase.from('memory_entries').update({ is_active: isActive }).eq('id', id)

  if (error) return { error: 'Erreur lors de la mise a jour' }

  revalidatePath('/memory')
  return { success: true }
}

export async function deleteMemory(id: string) {
  const { supabase } = await getSession()

  const { error } = await supabase.from('memory_entries').delete().eq('id', id)

  if (error) return { error: 'Erreur lors de la suppression' }

  revalidatePath('/memory')
  return { success: true }
}