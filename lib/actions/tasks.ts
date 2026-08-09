'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { sendPushToFamily } from '@/lib/push/send'

const addTaskSchema = z.object({
  title: z.string().min(1).max(200),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
})

async function getSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifie')

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Profil introuvable')

  return { supabase, userId: user.id, familyId: profile.family_id }
}

export async function addTask(formData: FormData): Promise<void> {
  const parsed = addTaskSchema.safeParse({
    title: formData.get('title'),
    priority: formData.get('priority'),
  })

  if (!parsed.success) {
    console.error('Champs invalides')
    return
  }

  const { supabase, userId, familyId } = await getSession()

  const { error } = await supabase.from('tasks').insert({
    family_id: familyId,
    created_by: userId,
    title: parsed.data.title,
    priority: parsed.data.priority,
  })

  if (error) {
    console.error('Erreur creation tache', error)
    return
  }

  await sendPushToFamily(familyId, {
    title: 'Nouvelle tâche',
    body: parsed.data.title,
    url: '/tasks',
  })

  revalidatePath('/tasks')
}

export async function completeTask(id: string) {
  const { supabase } = await getSession()

  const { error } = await supabase.from('tasks').update({ status: 'done' }).eq('id', id)

  if (error) return { error: 'Erreur lors de la mise a jour' }

  revalidatePath('/tasks')
  return { success: true }
}

export async function deleteTask(id: string) {
  const { supabase } = await getSession()

  const { error } = await supabase.from('tasks').delete().eq('id', id)

  if (error) return { error: 'Erreur lors de la suppression' }

  revalidatePath('/tasks')
  return { success: true }
}