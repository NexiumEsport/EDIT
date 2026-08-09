import { createClient } from '@/lib/supabase/server'
import { DAILY_MESSAGE_LIMIT } from '@/lib/validation/chat'

export async function checkRateLimit(userId: string): Promise<{ allowed: boolean; count: number }> {
  const supabase = await createClient()
  const since = new Date()
  since.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')
    .gte('created_at', since.toISOString())

  return {
    allowed: (count ?? 0) < DAILY_MESSAGE_LIMIT,
    count: count ?? 0,
  }
}