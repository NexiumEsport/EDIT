'use client'

import { useState, useMemo } from 'react'
import EventRow from './EventRow'

type Event = {
  id: string
  title: string
  start_at: string
  category: string | null
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function toLocalDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function MonthCalendar({ events }: { events: Event[] }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<string>(toLocalDateKey(new Date()))

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>()
    for (const event of events) {
      const key = toLocalDateKey(new Date(event.start_at))
      const list = map.get(key) ?? []
      list.push(event)
      map.set(key, list)
    }
    return map
  }, [events])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  const todayKey = toLocalDateKey(new Date())

  function goPrevMonth() {
    setCursor(new Date(year, month - 1, 1))
  }
  function goNextMonth() {
    setCursor(new Date(year, month + 1, 1))
  }

  const selectedEvents = eventsByDate.get(selectedDate) ?? []

  const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number)
  const selectedDateObj = new Date(selYear, selMonth - 1, selDay)

  return (
    <div className="card p-3 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={goPrevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-bg)]"
        >
          ←
        </button>
        <p className="font-[var(--font-display)] text-base font-semibold sm:text-lg">
          {MONTH_NAMES[month]} {year}
        </p>
        <button
          onClick={goNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-bg)]"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[var(--color-ink-muted)]">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />

          const key = toLocalDateKey(date)
          const dayEvents = eventsByDate.get(key) ?? []
          const isToday = key === todayKey
          const isSelected = key === selectedDate

          return (
            <button
              key={key}
              onClick={() => setSelectedDate(key)}
              className={`relative flex h-9 flex-col items-center justify-center rounded-lg text-xs transition-all sm:h-11 sm:rounded-xl sm:text-sm
                ${isSelected
                  ? 'bg-[var(--color-primary)] text-white font-semibold shadow-md'
                  : 'hover:bg-[var(--color-bg)] hover:scale-105'}
                ${isToday && !isSelected ? 'font-bold text-[var(--color-primary)]' : ''}
              `}
            >
              {date.getDate()}
              {dayEvents.length > 0 && (
                <span
                  className="absolute bottom-1 h-1.5 w-1.5 rounded-full sm:bottom-1.5"
                  style={{ background: isSelected ? 'white' : 'var(--color-accent)' }}
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-6 border-t border-[var(--color-border)] pt-4">
        <p className="mb-2 text-sm font-medium text-[var(--color-ink-muted)]">
          {selectedDateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        {selectedEvents.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">Aucun événement ce jour-là.</p>
        ) : (
          <div className="space-y-1">
            {selectedEvents.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}