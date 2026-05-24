import type { Task } from '../types/Task'

interface TaskCardProps {
  task: Task
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

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
      <p className="text-sm font-medium text-gray-800">{task.title}</p>
      <div className="flex items-center gap-2 mt-2">
        {task.priority && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityConfig[task.priority].className}`}>
            {priorityConfig[task.priority].label}
          </span>
        )}
        {task.dueDate && (
          <span className="text-xs text-gray-400">{formatDate(task.dueDate)}</span>
        )}
      </div>
    </div>
  )
}
