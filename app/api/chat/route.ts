import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { tools, TOOLS_REQUIRING_CONFIRMATION } from '@/lib/ai/tools'
import { executeTool } from '@/lib/ai/tool-executor'
import { createClient } from '@/lib/supabase/server'
import { chatMessageSchema } from '@/lib/validation/chat'
import { checkRateLimit } from '@/lib/ai/rate-limit'
import { loadHistory, saveMessage } from '@/lib/ai/conversation-history'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const AFFIRMATIVE_PATTERN = /^(oui|ouais|yes|confirme|confirmé|vas-y|d'accord|ok|okay|je confirme)\b/i

function buildSystemPrompt(timezone: string, memories: { key: string; value: string }[]) {
  const now = new Date().toLocaleString('fr-FR', { timeZone: timezone, dateStyle: 'full', timeStyle: 'short' })

  const memoryBlock = memories.length > 0
    ? `\n\nInformations memorisees sur cette famille :\n${memories.map((m) => `- ${m.key} : ${m.value}`).join('\n')}`
    : ''

  return `Tu es EDIT, l'assistant familial francophone.

Date et heure actuelles : ${now} (fuseau horaire : ${timezone}).${memoryBlock}

Ton et style :
- Réponds en français, de façon claire, concise et professionnelle.
- Sois direct : va à l'essentiel sans formules de politesse superflues ni excès d'émojis (un seul maximum par réponse, uniquement si pertinent).
- Adopte un ton chaleureux mais posé, celui d'un assistant compétent plutôt que d'un chatbot familier.
- Ne termine pas systématiquement par "Autre chose ?" ou des questions de relance artificielles ; ne le fais que si c'est réellement utile au contexte.

Règles fonctionnelles :
- Quand tu extrais un nom d'article, de tâche ou d'événement, reproduis-le EXACTEMENT tel qu'écrit, sans traduire ni interpréter.
- Pour les rappels et événements, calcule la date/heure absolue en ISO 8601 avec fuseau horaire.
- Si une information essentielle manque, demande une clarification avant d'appeler l'outil.
- N'invente jamais de paramètres non fournis par l'utilisateur.
- Utilise l'historique de conversation pour comprendre le contexte.
- N'utilise remember_fact QUE si l'utilisateur demande explicitement de retenir une information.
- Si une demande sort du périmètre de tes outils (météo, actualités, recherche web générale, etc.), dis-le en une phrase simple et naturelle, sans lister de sites ou d'applications tierces. Termine par un bref rappel de ce que tu peux faire, sans le sur-souligner.

RÈGLE CRITIQUE sur les suppressions (delete_reminder, delete_calendar_event, delete_task) :
Ce sont des actions IRRÉVERSIBLES. Ne les appelle JAMAIS directement dans le même tour que la demande initiale.
Procédure obligatoire en deux temps, sur deux messages séparés :
1. Si nécessaire, utilise list_reminders ou list_calendar_events pour identifier l'élément exact.
2. Réponds en TEXTE SIMPLE (pas d'appel d'outil) en décrivant précisément ce qui va être supprimé et demande une confirmation explicite.
3. Ce n'est QUE dans ta réponse au message SUIVANT de l'utilisateur, s'il confirme clairement, que tu appelles l'outil de suppression.
4. Si l'utilisateur hésite ou refuse, n'appelle jamais l'outil.`
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const rateLimit = await checkRateLimit(user.id)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Limite quotidienne de messages atteinte.' }, { status: 429 })
  }

  const body = await req.json()
  const parsedBody = chatMessageSchema.safeParse(body)

  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Message invalide' }, { status: 400 })
  }

  const { message } = parsedBody.data

  const { data: profile } = await supabase
    .from('users')
    .select('timezone, family_id')
    .eq('id', user.id)
    .single()

  const timezone = profile?.timezone ?? 'Europe/Paris'

  const { data: memories } = await supabase
    .from('memory_entries')
    .select('key, value')
    .eq('family_id', profile?.family_id ?? '')
    .eq('is_active', true)
    .limit(30)

  const systemPrompt = buildSystemPrompt(timezone, memories ?? [])

  const history = await loadHistory(user.id)

  const lastAssistantMessage = [...history].reverse().find((m) => m.role === 'assistant')
  const lastAssistantText = typeof lastAssistantMessage?.content === 'string' ? lastAssistantMessage.content : ''
  const wasAskingConfirmation = /confirm/i.test(lastAssistantText)
  const userConfirmsNow = AFFIRMATIVE_PATTERN.test(message.trim())
  const confirmationGranted = wasAskingConfirmation && userConfirmsNow

  const messages: Anthropic.MessageParam[] = [...history, { role: 'user', content: message }]

  await saveMessage(user.id, 'user', message)

  let response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    tools,
    messages,
  })

  while (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    )

    const unsafeCall = toolUseBlocks.find((b) => TOOLS_REQUIRING_CONFIRMATION.includes(b.name))

    if (unsafeCall && !confirmationGranted) {
      const refusalText = "Cette action nécessite une confirmation explicite au préalable. Peux-tu me redire ce que tu veux supprimer ?"
      await saveMessage(user.id, 'assistant', refusalText)
      return NextResponse.json({ reply: refusalText })
    }

    messages.push({ role: 'assistant', content: response.content })

    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const block of toolUseBlocks) {
      const result = await executeTool(block.name, block.input)
      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(result),
      })
    }

    messages.push({ role: 'user', content: toolResults })

    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages,
    })
  }

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  )

  const replyText = textBlock?.text ?? ''
  await saveMessage(user.id, 'assistant', replyText)

  return NextResponse.json({ reply: replyText })
}