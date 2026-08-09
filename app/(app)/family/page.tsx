import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InviteCodeCard from '@/components/family/InviteCodeCard'
import FamilyMemberRow from '@/components/family/FamilyMemberRow'

export default async function FamilyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('family_id, role, families(name, invite_code)')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const family = profile.families as unknown as { name: string; invite_code: string }
  const isAdmin = profile.role === 'admin'

  const { data: members } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, role')
    .eq('family_id', profile.family_id)
    .order('role', { ascending: true })

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">👨‍👩‍👧 {family?.name ?? 'Ma famille'}</h1>

      <InviteCodeCard code={family?.invite_code ?? ''} isAdmin={isAdmin} />

      <div>
        <p className="mb-2 text-sm font-medium text-[var(--color-ink-muted)]">
          Membres ({members?.length ?? 0})
        </p>
        <div className="space-y-2">
          {members?.map((m) => (
            <FamilyMemberRow key={m.id} member={m} isSelf={m.id === user.id} isAdmin={isAdmin} />
          ))}
        </div>
      </div>
    </div>
  )
}