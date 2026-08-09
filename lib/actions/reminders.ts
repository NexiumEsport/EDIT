'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { sendPushToFamily } from '@/lib/push/send'

const addReminderSchema = z.object({
  title: z.string().min(1).max(200),
  remind_at: z.string().min(1),
})

async function getSession() {
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

export async function addReminder(formData: FormData): Promise<void> {
  const parsed = addReminderSchema.safeParse({
    title: formData.get('title'),
    remind_at: formData.get('remind_at'),
  })

  if (!parsed.success) {
    console.error('Champs invalides')
    return
  }

  const remindDate = new Date(parsed.data.remind_at)
  if (remindDate < new Date()) {
    console.error('Date dans le passé')
    return
  }

  const { supabase, userId, familyId } = await getSession()

  const { error } = await supabase.from('reminders').insert({
    family_id: familyId,
    user_id: userId,
    title: parsed.data.title,
    remind_at: remindDate.toISOString(),
  })

  if (error) {
    console.error('Erreur création rappel', error)
    return
  }

  await sendPushToFamily(familyId, {
    title: 'Nouveau rappel',
    body: parsed.data.title,
    url: '/reminders',
  })

  revalidatePath('/reminders')
}

export async function completeReminder(id: string) {
  const { supabase } = await getSession()

  const { error } = await supabase
    .from('reminders')
    .update({ status: 'done' })
    .eq('id', id)

  if (error) return { error: 'Erreur lors de la mise à jour' }

  revalidatePath('/reminders')
  return { success: true }
}

export async function deleteReminder(id: string) {
  const { supabase } = await getSession()

  const { error } = await supabase.from('reminders').delete().eq('id', id)

  if (error) return { error: 'Erreur lors de la suppression' }

  revalidatePath('/reminders')
  return { success: true }
}