'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { sendPushToFamily } from '@/lib/push/send'

const addEventSchema = z.object({
  title: z.string().min(1).max(200),
  start_at: z.string().min(1),
  category: z.string().max(50).optional(),
  assigned_to: z.string().uuid().optional(),
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

export async function addCalendarEvent(formData: FormData): Promise<void> {
  const rawAssignedTo = formData.get('assigned_to')

  const parsed = addEventSchema.safeParse({
    title: formData.get('title'),
    start_at: formData.get('start_at'),
    category: formData.get('category') || undefined,
    assigned_to: rawAssignedTo && rawAssignedTo !== '' ? rawAssignedTo : undefined,
  })

  if (!parsed.success) {
    console.error('Champs invalides', parsed.error.flatten())
    return
  }

  const { supabase, userId, familyId } = await getSession()

  const { error } = await supabase.from('calendar_events').insert({
    family_id: familyId,
    created_by: userId,
    title: parsed.data.title,
    start_at: new Date(parsed.data.start_at).toISOString(),
    category: parsed.data.category ?? null,
    assigned_to: parsed.data.assigned_to ?? null,
  })

  if (error) {
    console.error('Erreur création événement', error)
    return
  }

  await sendPushToFamily(familyId, {
    title: 'Nouvel événement',
    body: parsed.data.title,
    url: '/calendar',
  })

  revalidatePath('/calendar')
}

export async function deleteCalendarEvent(id: string) {
  const { supabase } = await getSession()

  const { error } = await supabase.from('calendar_events').delete().eq('id', id)

  if (error) return { error: 'Erreur lors de la suppression' }

  revalidatePath('/calendar')
  return { success: true }
}