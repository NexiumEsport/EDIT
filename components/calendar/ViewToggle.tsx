import Link from 'next/link'

export default function ViewToggle({
  currentView,
  selectedDate,
}: {
  currentView: 'day' | 'month'
  selectedDate: string
}) {
  return (
    <div className="flex rounded-lg border overflow-hidden text-sm">
      <Link
        href={`/calendar?view=day&date=${selectedDate}`}
        className={`px-3 py-1.5 ${currentView === 'day' ? 'bg-[#4A5AE8] text-white' : 'bg-white text-gray-600'}`}
      >
        Jour
      </Link>
      <Link
        href={`/calendar?view=month&date=${selectedDate}`}
        className={`px-3 py-1.5 ${currentView === 'month' ? 'bg-[#4A5AE8] text-white' : 'bg-white text-gray-600'}`}
      >
        Mois
      </Link>
    </div>
  )
}