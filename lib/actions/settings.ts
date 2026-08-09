'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { updateProfileSchema } from '@/lib/validation/settings'

export async function updateProfile(formData: FormData): Promise<void> {
  const parsed = updateProfileSchema.safeParse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name') || undefined,
    timezone: formData.get('timezone'),
  })

  if (!parsed.success) {
    console.error('Champs invalides', parsed.error.flatten())
    return
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('Non authentifie')
    return
  }

  const { error } = await supabase
    .from('users')
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name ?? null,
      timezone: parsed.data.timezone,
    })
    .eq('id', user.id)

  if (error) {
    console.error('Erreur mise a jour profil', error)
    return
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
}

export async function changePassword(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!newPassword || newPassword.length < 6) {
    return { error: 'Le mot de passe doit contenir au moins 6 caracteres' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Les mots de passe ne correspondent pas' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    return { error: 'Erreur lors du changement de mot de passe' }
  }

  return { success: true }
}

export async function exportUserData(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Non authentifie')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  const { data: shoppingItems } = await supabase.from('shopping_items').select('*').eq('added_by', user.id)
  const { data: reminders } = await supabase.from('reminders').select('*').eq('user_id', user.id)
  const { data: tasks } = await supabase.from('tasks').select('*').eq('created_by', user.id)
  const { data: events } = await supabase.from('calendar_events').select('*').eq('created_by', user.id)

  const exportData = {
    exported_at: new Date().toISOString(),
    profile,
    shopping_items: shoppingItems ?? [],
    reminders: reminders ?? [],
    tasks: tasks ?? [],
    calendar_events: events ?? [],
  }

  return JSON.stringify(exportData, null, 2)
}

export async function deleteAccount(): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }
  

  const { error: deleteProfileError } = await supabase.from('users').delete().eq('id', user.id)

  if (deleteProfileError) {
    return { error: 'Erreur lors de la suppression du profil' }
  }

  await supabase.auth.signOut()

  return { success: true }
}
export async function resetFamilyData(): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifie' }
  }

  const { data: profile } = await supabase.from('users').select('family_id, role').eq('id', user.id).single()

  if (!profile) {
    return { error: 'Profil introuvable' }
  }

  if (profile.role !== 'admin') {
    return { error: 'Seul un administrateur peut reinitialiser les donnees' }
  }

  const familyId = profile.family_id

  // Ordre volontaire : tables dependantes avant tables referencees,
  // meme si ON DELETE CASCADE existe deja sur family_id sur la plupart -
  // explicite plutot qu'implicite pour cette action destructive.
  const tables = [
    'action_logs',
    'memory_entries',
    'tasks',
    'calendar_events',
    'reminders',
    'shopping_items',
  ]

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq('family_id', familyId)
    if (error) {
      return { error: `Erreur lors de la suppression de ${table}` }
    }
  }

  return { success: true }
}