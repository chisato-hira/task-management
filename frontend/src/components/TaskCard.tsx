import type { Task } from '../types/Task'

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
}

const priorityConfig = {
  HIGH:   { label: '高', className: 'bg-red-100 text-red-700' },
  MEDIUM: { label: '中', className: 'bg-yellow-100 text-yellow-700' },
  LOW:    { label: '低', className: 'bg-blue-100 text-blue-700' },
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-')
  return `${parseInt(parts[1])}/${parseInt(parts[2])}`
}

function getDueDateStatus(dueDate: string): 'overdue' | 'soon' | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  if (due < today) return 'overdue'

  const threeDaysLater = new Date(today)
  threeDaysLater.setDate(today.getDate() + 3)
  if (due <= threeDaysLater) return 'soon'

  return null
}

const dueDateConfig = {
  overdue: { badge: '期限切れ', className: 'bg-red-100 text-red-700' },
  soon:    { badge: 'まもなく期限', className: 'bg-yellow-100 text-yellow-700' },
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const dueDateStatus = task.dueDate ? getDueDateStatus(task.dueDate) : null

  return (
    <div
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-shadow"
      onClick={() => onClick(task)}
    >
      <p className="text-sm font-medium text-gray-800">{task.title}</p>
      <div className="flex items-center gap-2 mt-2">
        {task.priority && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityConfig[task.priority].className}`}>
            {priorityConfig[task.priority].label}
          </span>
        )}
        {task.dueDate && (
          dueDateStatus ? (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dueDateConfig[dueDateStatus].className}`}>
              {dueDateConfig[dueDateStatus].badge}　{formatDate(task.dueDate)}
            </span>
          ) : (
            <span className="text-xs text-gray-400">{formatDate(task.dueDate)}</span>
          )
        )}
      </div>
    </div>
  )
}
