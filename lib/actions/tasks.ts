'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { sendPushToFamily } from '@/lib/push/send'

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

const createNotebookSchema = z.object({
  title: z.string().min(1).max(100),
})

export async function createNotebook(formData: FormData): Promise<void> {
  const parsed = createNotebookSchema.safeParse({
    title: formData.get('title'),
  })

  if (!parsed.success) {
    console.error('Champs invalides', parsed.error.flatten())
    return
  }

  const { supabase, userId, familyId } = await getSession()

  const { error } = await supabase.from('notebooks').insert({
    family_id: familyId,
    created_by: userId,
    title: parsed.data.title,
  })

  if (error) {
    console.error('Erreur creation bloc note', error)
    return
  }

  revalidatePath('/tasks')
}

export async function deleteNotebook(id: string) {
  const { supabase } = await getSession()

  const { error } = await supabase.from('notebooks').delete().eq('id', id)

  if (error) return { error: 'Erreur lors de la suppression' }

  revalidatePath('/tasks')
  return { success: true }
}

const addItemSchema = z.object({
  notebookId: z.string().uuid(),
  content: z.string().min(1).max(300),
})

export async function addNotebookItem(formData: FormData): Promise<void> {
  const parsed = addItemSchema.safeParse({
    notebookId: formData.get('notebookId'),
    content: formData.get('content'),
  })

  if (!parsed.success) {
    console.error('Champs invalides', parsed.error.flatten())
    return
  }

  const { supabase, userId, familyId } = await getSession()

  const { error } = await supabase.from('notebook_items').insert({
    notebook_id: parsed.data.notebookId,
    family_id: familyId,
    created_by: userId,
    content: parsed.data.content,
  })

  if (error) {
    console.error('Erreur ajout element', error)
    return
  }

  await sendPushToFamily(familyId, {
    title: 'Nouvel élément ajouté',
    body: parsed.data.content,
    url: `/tasks/${parsed.data.notebookId}`,
  })

  revalidatePath(`/tasks/${parsed.data.notebookId}`)
}

export async function toggleNotebookItem(id: string, notebookId: string, isDone: boolean) {
  const { supabase } = await getSession()

  const { error } = await supabase
    .from('notebook_items')
    .update({ is_done: !isDone })
    .eq('id', id)

  if (error) return { error: 'Erreur lors de la mise a jour' }

  revalidatePath(`/tasks/${notebookId}`)
  return { success: true }
}

export async function deleteNotebookItem(id: string, notebookId: string) {
  const { supabase } = await getSession()

  const { error } = await supabase.from('notebook_items').delete().eq('id', id)

  if (error) return { error: 'Erreur lors de la suppression' }

  revalidatePath(`/tasks/${notebookId}`)
  return { success: true }
}