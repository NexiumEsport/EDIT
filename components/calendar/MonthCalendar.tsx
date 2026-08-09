import Link from 'next/link'

type AssignedUser = {
  id: string
  first_name: string
  color: string | null
} | null

type Event = {
  id: string
  title: string
  start_at: string
  category: string | null
  assigned_user?: AssignedUser
}

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    return d
  })
}

const DAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

function colorForEvent(index: number) {
  const palette = ['#FDE68A', '#FBCFE8', '#BFDBFE', '#BBF7D0', '#FED7AA', '#DDD6FE']
  return palette[index % palette.length]
}

export default function MonthCalendar({
  events,
  year,
  month,
  selectedDate,
}: {
  events: Event[]
  year: number
  month: number
  selectedDate: string
}) {
  const days = getMonthGrid(year, month)
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  const eventsByDay = new Map<string, Event[]>()
  for (const event of events) {
    const key = event.start_at.slice(0, 10)
    if (!eventsByDay.has(key)) eventsByDay.set(key, [])
    eventsByDay.get(key)!.push(event)
  }

  const prevMonth = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 }
  const nextMonth = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 }

  const monthLabel = new Date(year, month, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })

  const selectedDayEvents = (eventsByDay.get(selectedDate) ?? []).sort((a, b) =>
    a.start_at.localeCompare(b.start_at)
  )

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/calendar?view=month&date=${prevMonth.y}-${String(prevMonth.m + 1).padStart(2, '0')}-01`}
            className="rounded-full px-2 py-1 text-gray-500 hover:bg-gray-100"
          >
            ‹
          </Link>
          <span className="font-semibold capitalize">{monthLabel}</span>
          <Link
            href={`/calendar?view=month&date=${nextMonth.y}-${String(nextMonth.m + 1).padStart(2, '0')}-01`}
            className="rounded-full px-2 py-1 text-gray-500 hover:bg-gray-100"
          >
            ›
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-1">
          {DAY_LABELS.map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date) => {
            const dateStr = date.toISOString().slice(0, 10)
            const isCurrentMonth = date.getMonth() === month
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDate
            const dayEvents = eventsByDay.get(dateStr) ?? []

            return (
              <Link
                key={dateStr}
                href={`/calendar?view=month&date=${dateStr}`}
                className={`min-h-[70px] rounded-lg border p-1 text-left align-top ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-300'
                } ${isSelected ? 'border-[#4A5AE8] border-2' : isToday ? 'border-orange-300 border-2' : 'border-gray-100'}`}
              >
                <span className={`text-xs font-medium ${isToday ? 'text-[#4A5AE8]' : ''}`}>
                  {date.getDate()}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 2).map((event, i) => (
                    <div
                      key={event.id}
                      className="truncate rounded px-1 py-0.5 text-[10px]"
                      style={{ background: colorForEvent(i) }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-gray-400">+{dayEvents.length - 2}</div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-3 font-semibold">
          {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </h2>
        {selectedDayEvents.length === 0 && (
          <p className="text-sm text-gray-400">Aucun événement ce jour-là.</p>
        )}
        <div className="space-y-2">
          {selectedDayEvents.map((event, i) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-lg p-3"
              style={{ background: colorForEvent(i) }}
            >
              <div>
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-gray-600">
                  {new Date(event.start_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {event.assigned_user && (
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: event.assigned_user.color ?? '#6B7094' }}
                  title={event.assigned_user.first_name}
                >
                  {event.assigned_user.first_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}