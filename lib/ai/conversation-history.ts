import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const HISTORY_LIMIT = 20 // derniers messages (user + assistant confondus)

export async function loadHistory(userId: string): Promise<Anthropic.MessageParam[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('conversations')
    .select('role, content')
    .eq('user_id', userId)
    .in('role', ['user', 'assistant'])
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT)

  if (!data) return []

  return data
    .reverse()
    .map((row) => ({
      role: row.role as 'user' | 'assistant',
      content: row.content,
    }))
}

export async function saveMessage(userId: string, role: 'user' | 'assistant', content: string) {
  const supabase = await createClient()
  await supabase.from('conversations').insert({ user_id: userId, role, content })
}