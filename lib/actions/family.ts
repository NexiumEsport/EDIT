'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

async function getAdminSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifie')

  const { data: profile } = await supabase
    .from('users')
    .select('family_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Profil introuvable')

  return { supabase, userId: user.id, familyId: profile.family_id, role: profile.role }
}

export async function regenerateInviteCode(): Promise<{ error?: string; code?: string }> {
  const { supabase, familyId, role } = await getAdminSession()

  if (role !== 'admin') {
    return { error: 'Seul un admin peut regenerer le code' }
  }

  const newCode = Math.random().toString(36).slice(2, 10)

  const { error } = await supabase
    .from('families')
    .update({ invite_code: newCode })
    .eq('id', familyId)

  if (error) return { error: 'Erreur lors de la regeneration' }

  revalidatePath('/family')
  return { code: newCode }
}

const roleSchema = z.enum(['admin', 'adult', 'child'])

export async function updateMemberRole(memberId: string, newRole: string): Promise<{ error?: string }> {
  const { supabase, userId, familyId, role } = await getAdminSession()

  if (role !== 'admin') {
    return { error: 'Seul un admin peut modifier les roles' }
  }

  const parsedRole = roleSchema.safeParse(newRole)
  if (!parsedRole.success) {
    return { error: 'Role invalide' }
  }

  if (memberId === userId) {
    return { error: 'Tu ne peux pas modifier ton propre role' }
  }

  const { error } = await supabase
    .from('users')
    .update({ role: parsedRole.data })
    .eq('id', memberId)
    .eq('family_id', familyId)

  if (error) return { error: 'Erreur lors de la mise a jour' }

  revalidatePath('/family')
  return {}
}

export async function removeMember(memberId: string): Promise<{ error?: string }> {
  const { supabase, userId, familyId, role } = await getAdminSession()

  if (role !== 'admin') {
    return { error: 'Seul un admin peut retirer un membre' }
  }

  if (memberId === userId) {
    return { error: 'Tu ne peux pas te retirer toi-meme' }
  }

  // Empeche de retirer le dernier admin de la famille
  const { data: target } = await supabase.from('users').select('role').eq('id', memberId).single()
  if (target?.role === 'admin') {
    const { count } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('family_id', familyId)
      .eq('role', 'admin')

    if ((count ?? 0) <= 1) {
      return { error: 'Impossible de retirer le dernier admin' }
    }
  }

  const { error } = await supabase.from('users').delete().eq('id', memberId).eq('family_id', familyId)

  if (error) return { error: 'Erreur lors de la suppression' }

  revalidatePath('/family')
  return {}
}