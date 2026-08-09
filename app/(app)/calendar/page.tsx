import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addCalendarEvent } from '@/lib/actions/calendar'
import DaySelector from '@/components/calendar/DaySelector'
import MemberColumn from '@/components/calendar/MemberColumn'
import MonthCalendar from '@/components/calendar/MonthCalendar'
import ViewToggle from '@/components/calendar/ViewToggle'

function getDayRange(dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00`)
  const end = new Date(`${dateStr}T23:59:59`)
  return { start: start.toISOString(), end: end.toISOString() }
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string }>
}) {
  const { date, view } = await searchParams
  const selectedDate = date || new Date().toISOString().slice(0, 10)
  const currentView = view === 'month' ? 'month' : 'day'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('family_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const { data: members } = await supabase
    .from('users')
    .select('id, first_name, color')
    .eq('family_id', profile.family_id)

  const { data: allEvents } = await supabase
    .from('calendar_events')
    .select('*, assigned_user:users!calendar_events_assigned_to_fkey(id, first_name, color)')
    .order('start_at', { ascending: true })

  const { start, end } = getDayRange(selectedDate)
  const dayEvents = (allEvents ?? []).filter(
    (e) => e.start_at >= start && e.start_at <= end
  )

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl">📅 Calendrier</h1>
        <ViewToggle currentView={currentView} selectedDate={selectedDate} />
      </div>

      <form action={addCalendarEvent} className="card flex flex-col gap-2 p-4 sm:flex-row sm:flex-wrap">
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
        <select name="assigned_to" className="input-field sm:w-40" defaultValue="">
          <option value="">Non assigné</option>
          {members?.map((m) => (
            <option key={m.id} value={m.id}>{m.first_name}</option>
          ))}
        </select>
        <input
          name="category"
          placeholder="Catégorie (optionnel)"
          className="input-field sm:w-32"
        />
        <button type="submit" className="btn-primary">
          Ajouter
        </button>
      </form>

      {currentView === 'month' ? (
        <MonthCalendar
          events={allEvents ?? []}
          year={Number(selectedDate.slice(0, 4))}
          month={Number(selectedDate.slice(5, 7)) - 1}
          selectedDate={selectedDate}
        />
      ) : (
        <>
          <DaySelector selectedDate={selectedDate} />

          <div className="flex flex-col gap-6 sm:flex-row sm:gap-4 sm:overflow-x-auto sm:pb-4">
            {members?.map((member) => (
              <MemberColumn
                key={member.id}
                member={member}
                events={dayEvents.filter((e) => e.assigned_to === member.id)}
              />
            ))}
            <MemberColumn
              member={{ id: 'unassigned', first_name: 'Non assigné', color: '#6B7094' }}
              events={dayEvents.filter((e) => !e.assigned_to)}
            />
          </div>
        </>
      )}
    </div>
  )
}