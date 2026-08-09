import TaskRow from '@/components/tasks/tasksrow'

type Task = {
  id: string
  title: string
  priority: string
  status: string
  due_date: string | null
}

type Member = {
  id: string
  first_name: string
  color: string | null
}

export default function TaskMemberColumn({
  member,
  tasks,
}: {
  member: Member
  tasks: Task[]
}) {
  const pending = tasks.filter((t) => t.status !== 'done')
  const done = tasks.filter((t) => t.status === 'done')

  return (
    <div className="w-64 flex-shrink-0">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: member.color ?? '#6B7094' }}
        >
          {member.first_name.charAt(0).toUpperCase()}
        </span>
        <span className="font-semibold">{member.first_name}</span>
      </div>

      <div className="space-y-1">
        {pending.length === 0 && done.length === 0 && (
          <p className="text-xs text-gray-400">Aucune tâche</p>
        )}
        {pending.map((t) => (
          <TaskRow key={t.id} task={t} />
        ))}
      </div>

      {done.length > 0 && (
        <div className="mt-3 border-t pt-2">
          <p className="mb-1 text-xs text-gray-400">Terminées ({done.length})</p>
          <div className="space-y-1">
            {done.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}