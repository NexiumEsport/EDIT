import { createClient } from '@/lib/supabase/server'
import { addShoppingItemSchema } from '@/lib/validation/shopping'
import { createReminderSchema, deleteReminderSchema } from '@/lib/validation/reminders'
import { createCalendarEventSchema, deleteCalendarEventSchema } from '@/lib/validation/calendar'
import { createTaskSchema, completeTaskSchema, deleteTaskSchema } from '@/lib/validation/tasks'
import { rememberFactSchema } from '@/lib/validation/memory'
export async function executeTool(toolName: string, toolInput: unknown) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Utilisateur non authentifie' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { error: 'Profil introuvable' }
  }

  const familyId = profile.family_id

  async function logAction(status: string, payload: unknown) {
    const { error } = await supabase.from('action_logs').insert({
      family_id: familyId,
      user_id: user!.id,
      action_type: toolName.startsWith('delete') ? 'delete' : toolName.startsWith('list') ? 'read' : 'create',
      tool_name: toolName,
      payload,
      status,
    })
    if (error) {
      console.error('Echec du log action_logs:', error)
    }
  }

  if (toolName === 'add_shopping_item') {
    const parsed = addShoppingItemSchema.safeParse(toolInput)
    if (!parsed.success) {
      await logAction('error', toolInput)
      return { error: 'Parametres invalides' }
    }

    const { data, error } = await supabase
      .from('shopping_items')
      .insert({
        family_id: familyId,
        added_by: user.id,
        name: parsed.data.name,
        quantity: parsed.data.quantity ?? null,
      })
      .select()
      .single()

    await logAction(error ? 'error' : 'success', parsed.data)
    if (error) return { error: "Erreur lors de l'ajout" }
    return { success: true, item: data }
  }

  if (toolName === 'create_reminder') {
    const parsed = createReminderSchema.safeParse(toolInput)
    if (!parsed.success) {
      await logAction('error', toolInput)
      return { error: 'Parametres invalides' }
    }

    if (new Date(parsed.data.remind_at) < new Date()) {
      await logAction('denied', parsed.data)
      return { error: 'La date du rappel est dans le passe.' }
    }

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        family_id: familyId,
        user_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        remind_at: parsed.data.remind_at,
      })
      .select()
      .single()

    await logAction(error ? 'error' : 'success', parsed.data)
    if (error) return { error: 'Erreur lors de la creation du rappel' }
    return { success: true, reminder: data }
  }

  if (toolName === 'create_calendar_event') {
    const parsed = createCalendarEventSchema.safeParse(toolInput)
    if (!parsed.success) {
      await logAction('error', toolInput)
      return { error: 'Parametres invalides' }
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        family_id: familyId,
        created_by: user.id,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        start_at: parsed.data.start_at,
        end_at: parsed.data.end_at ?? null,
        category: parsed.data.category ?? null,
      })
      .select()
      .single()

    await logAction(error ? 'error' : 'success', parsed.data)
    if (error) return { error: "Erreur lors de la creation de l'evenement" }
    return { success: true, event: data }
  }

  if (toolName === 'delete_reminder') {
    const parsed = deleteReminderSchema.safeParse(toolInput)
    if (!parsed.success) {
      await logAction('error', toolInput)
      return { error: 'ID invalide' }
    }

    const { error } = await supabase.from('reminders').delete().eq('id', parsed.data.id)

    await logAction(error ? 'error' : 'success', parsed.data)
    if (error) return { error: 'Erreur lors de la suppression' }
    return { success: true }
  }

  if (toolName === 'delete_calendar_event') {
    const parsed = deleteCalendarEventSchema.safeParse(toolInput)
    if (!parsed.success) {
      await logAction('error', toolInput)
      return { error: 'ID invalide' }
    }

    const { error } = await supabase.from('calendar_events').delete().eq('id', parsed.data.id)

    await logAction(error ? 'error' : 'success', parsed.data)
    if (error) return { error: 'Erreur lors de la suppression' }
    return { success: true }
  }

  if (toolName === 'list_reminders') {
    const { data } = await supabase
      .from('reminders')
      .select('id, title, remind_at, status')
      .eq('status', 'pending')
      .order('remind_at', { ascending: true })

    await logAction('success', {})
    return { reminders: data ?? [] }
  }

  if (toolName === 'list_calendar_events') {
    const { data } = await supabase
      .from('calendar_events')
      .select('id, title, start_at, category')
      .order('start_at', { ascending: true })
      .limit(20)

    await logAction('success', {})
    return { events: data ?? [] }
  }

  if (toolName === 'create_task') {
    const parsed = createTaskSchema.safeParse(toolInput)
    if (!parsed.success) {
      await logAction('error', toolInput)
      return { error: 'Parametres invalides' }
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        family_id: familyId,
        created_by: user.id,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        priority: parsed.data.priority ?? 'medium',
        due_date: parsed.data.due_date ?? null,
        category: parsed.data.category ?? null,
      })
      .select()
      .single()

    await logAction(error ? 'error' : 'success', parsed.data)
    if (error) return { error: 'Erreur lors de la creation de la tache' }
    return { success: true, task: data }
  }

  if (toolName === 'complete_task') {
    const parsed = completeTaskSchema.safeParse(toolInput)
    if (!parsed.success) {
      await logAction('error', toolInput)
      return { error: 'ID invalide' }
    }

    const { error } = await supabase
      .from('tasks')
      .update({ status: 'done' })
      .eq('id', parsed.data.id)

    await logAction(error ? 'error' : 'success', parsed.data)
    if (error) return { error: 'Erreur lors de la mise a jour' }
    return { success: true }
  }

  if (toolName === 'delete_task') {
    const parsed = deleteTaskSchema.safeParse(toolInput)
    if (!parsed.success) {
      await logAction('error', toolInput)
      return { error: 'ID invalide' }
    }

    const { error } = await supabase.from('tasks').delete().eq('id', parsed.data.id)

    await logAction(error ? 'error' : 'success', parsed.data)
    if (error) return { error: 'Erreur lors de la suppression' }
    return { success: true }
  }

  if (toolName === 'list_tasks') {
    const { data } = await supabase
      .from('tasks')
      .select('id, title, priority, due_date, status')
      .neq('status', 'done')
      .order('priority', { ascending: false })

    await logAction('success', {})
    return { tasks: data ?? [] }
  }
if (toolName === 'remember_fact') {
    const parsed = rememberFactSchema.safeParse(toolInput)
    if (!parsed.success) {
      await logAction('error', toolInput)
      return { error: 'Parametres invalides' }
    }

    const { data, error } = await supabase
      .from('memory_entries')
      .insert({
        family_id: familyId,
        user_id: user.id,
        key: parsed.data.key,
        value: parsed.data.value,
        category: parsed.data.category ?? null,
      })
      .select()
      .single()

    await logAction(error ? 'error' : 'success', parsed.data)
    if (error) return { error: 'Erreur lors de la memorisation' }
    return { success: true, memory: data }
  }
  return { error: 'Outil inconnu' }
}