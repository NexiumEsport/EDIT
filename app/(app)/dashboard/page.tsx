import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('first_name, family_id, families(name)')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const familyName = (profile.families as unknown as { name: string })?.name ?? 'Ma famille'

  const [
    { count: shoppingCount },
    { count: tasksCount },
    { count: remindersCount },
    { data: nextEvent },
    { count: membersCount },
    { count: memoriesCount },
  ] = await Promise.all([
    supabase.from('shopping_items').select('id', { count: 'exact', head: true }).eq('is_checked', false),
    supabase.from('tasks').select('id', { count: 'exact', head: true }).neq('status', 'done'),
    supabase.from('reminders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('calendar_events').select('title, start_at').gte('start_at', new Date().toISOString()).order('start_at', { ascending: true }).limit(1).maybeSingle(),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('family_id', profile.family_id),
    supabase.from('memory_entries').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ])

  const widgets = [
    {
      href: '/shopping',
      icon: '🛒',
      title: 'Courses',
      value: shoppingCount ?? 0,
      label: (shoppingCount ?? 0) <= 1 ? 'article à acheter' : 'articles à acheter',
      color: '#4A5AE8',
    },
    {
      href: '/tasks',
      icon: '✅',
      title: 'Tâches',
      value: tasksCount ?? 0,
      label: (tasksCount ?? 0) <= 1 ? 'tâche en cours' : 'tâches en cours',
      color: '#2FAE79',
    },
    {
      href: '/reminders',
      icon: '🔔',
      title: 'Rappels',
      value: remindersCount ?? 0,
      label: (remindersCount ?? 0) <= 1 ? 'rappel actif' : 'rappels actifs',
      color: '#FF8F66',
    },
    {
      href: '/calendar',
      icon: '📅',
      title: 'Calendrier',
      value: null,
      label: nextEvent
        ? `${nextEvent.title} · ${new Date(nextEvent.start_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
        : 'Aucun événement à venir',
      color: '#4A5AE8',
    },
    {
      href: '/family',
      icon: '👨‍👩‍👧',
      title: 'Famille',
      value: membersCount ?? 0,
      label: (membersCount ?? 0) <= 1 ? 'membre' : 'membres',
      color: '#FF8F66',
    },
    {
      href: '/memory',
      icon: '🧠',
      title: 'Mémoire',
      value: memoriesCount ?? 0,
      label: (memoriesCount ?? 0) <= 1 ? 'info retenue' : 'infos retenues',
      color: '#2FAE79',
    },
    {
      href: '/assistant',
      icon: '🤖',
      title: 'Assistant',
      value: null,
      label: 'Parler à EDIT',
      color: '#4A5AE8',
      big: true,
    },
    {
      href: '/settings',
      icon: '⚙️',
      title: 'Paramètres',
      value: null,
      label: 'Profil et sécurité',
      color: '#6B7094',
    },
  ]

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Bonjour {profile.first_name} 👋</h1>
        <p className="text-sm text-[var(--color-ink-muted)]">{familyName}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {widgets.map((w) => (
          <Link
            key={w.href}
            href={w.href}
            className={`card group flex flex-col justify-between p-4 transition-transform hover:-translate-y-0.5 hover:shadow-md ${w.big ? 'col-span-2 sm:col-span-1' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{w.icon}</span>
              {w.value !== null && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                  style={{ background: w.color }}
                >
                  {w.value}
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="font-medium">{w.title}</p>
              <p className="text-xs text-[var(--color-ink-muted)]">{w.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}