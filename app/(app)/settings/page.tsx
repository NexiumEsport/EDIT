import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateProfile } from '@/lib/actions/settings'
import PasswordForm from '@/components/settings/PasswordForm'
import ExportButton from '@/components/settings/ExportButton'
import DeleteAccountButton from '@/components/settings/DeleteAccountButton'
import ResetDatabaseButton from '@/components/settings/ResetDatabaseButton'

const COMMON_TIMEZONES = [
  'Europe/Paris',
  'Europe/London',
  'Europe/Brussels',
  'Europe/Zurich',
  'America/Montreal',
  'America/New_York',
  'Indian/Reunion',
  'Pacific/Noumea',
]

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('first_name, last_name, email, timezone, role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="mx-auto max-w-xl space-y-8 p-6">
      <div>
        <h1 className="mb-6 text-2xl font-bold">⚙️ Paramètres</h1>

        <div className="mb-6 rounded border bg-gray-50 p-4 text-sm text-gray-600">
          <p>Email : {profile.email}</p>
          <p>Rôle : {profile.role}</p>
        </div>

        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Prénom</label>
            <input
              name="first_name"
              defaultValue={profile.first_name}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Nom</label>
            <input
              name="last_name"
              defaultValue={profile.last_name ?? ''}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Fuseau horaire</label>
            <select
              name="timezone"
              defaultValue={profile.timezone}
              className="w-full rounded border px-3 py-2"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Utilisé par l'assistant pour calculer les dates des rappels et événements.
            </p>
          </div>

          <button type="submit" className="rounded bg-black px-4 py-2 text-white">
            Enregistrer
          </button>
        </form>
      </div>

      <div className="border-t pt-6">
        <h2 className="mb-4 text-lg font-semibold">Sécurité</h2>
        <PasswordForm />
      </div>

      <div className="border-t pt-6">
        <h2 className="mb-4 text-lg font-semibold">Mes données</h2>
        <ExportButton />
      </div>

      <div className="border-t pt-6">
        <h2 className="mb-4 text-lg font-semibold text-red-600">Zone dangereuse</h2>
        <div className="space-y-4">
          <ResetDatabaseButton />
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  )
}