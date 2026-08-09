import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addCalendarEvent } from '@/lib/actions/calendar'
import MonthCalendar from '@/components/calendar/MonthCalendar'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: events } = await supabase
    .from('calendar_events')
    .select('*')
    .order('start_at', { ascending: true })

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">📅 Calendrier</h1>

      <form action={addCalendarEvent} className="card flex flex-wrap gap-2 p-4">
        <input
          name="title"
          placeholder="Titre de l'événement"
          required
          className="input-field flex-1"
        />
        <input
          type="datetime-local"
          name="start_at"
          required
          className="input-field"
        />
        <input
          name="category"
          placeholder="Catégorie (optionnel)"
          className="input-field w-32"
        />
        <button type="submit" className="btn-primary">
          Ajouter
        </button>
      </form>

      <MonthCalendar events={events ?? []} />
    </div>
  )
}