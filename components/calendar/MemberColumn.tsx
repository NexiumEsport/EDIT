type Event = {
  id: string
  title: string
  start_at: string
  end_at: string | null
  category: string | null
}

type Member = {
  id: string
  first_name: string
  color: string | null
}

export default function MemberColumn({
  member,
  events,
}: {
  member: Member
  events: Event[]
}) {
  return (
    <div className="w-56 flex-shrink-0">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: member.color ?? '#6B7094' }}
        >
          {member.first_name.charAt(0).toUpperCase()}
        </span>
        <span className="font-semibold">{member.first_name}</span>
      </div>

      <div className="space-y-2">
        {events.length === 0 && (
          <p className="text-xs text-gray-400">Aucun événement</p>
        )}
        {events.map((event) => {
          const startTime = new Date(event.start_at).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })
          const endTime = event.end_at
            ? new Date(event.end_at).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : null

          return (
            <div
              key={event.id}
              className="rounded-xl p-3 text-white"
              style={{ background: member.color ?? '#6B7094' }}
            >
              <p className="text-sm font-semibold">{event.title}</p>
              <p className="text-xs opacity-90">
                {startTime}
                {endTime ? ` - ${endTime}` : ''}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}