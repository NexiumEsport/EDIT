import Link from 'next/link'

const DAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

function getWeekDates(centerDateStr: string) {
  const center = new Date(`${centerDateStr}T00:00:00`)
  const dayOfWeek = center.getDay()
  const monday = new Date(center)
  monday.setDate(center.getDate() - dayOfWeek)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export default function DaySelector({ selectedDate }: { selectedDate: string }) {
  const week = getWeekDates(selectedDate)

  return (
    <div className="flex justify-between gap-1 sm:gap-2">
      {week.map((date) => {
        const dateStr = date.toISOString().slice(0, 10)
        const isSelected = dateStr === selectedDate
        return (
          <Link
            key={dateStr}
            href={`/calendar?date=${dateStr}`}
            className={`flex flex-1 flex-col items-center rounded-lg py-2 transition ${
              isSelected ? 'bg-[#4A5AE8] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <span className="text-xs">{DAY_LABELS[date.getDay()]}</span>
            <span className="text-sm font-semibold">{date.getDate()}</span>
          </Link>
        )
      })}
    </div>
  )
}