import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const isDone = task.status === 'DONE'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-lg p-3 shadow-sm border cursor-grab active:cursor-grabbing transition-shadow ${
        isDone
          ? 'bg-zinc-50 border-zinc-200 opacity-60 hover:opacity-80'
          : 'bg-white border-gray-200 hover:shadow-lg hover:shadow-gray-300 hover:-translate-y-0.5'
      }`}
      onClick={() => onClick(task)}
    >
      <p className={`text-sm font-medium ${isDone ? 'text-zinc-400 line-through' : 'text-gray-800'}`}>{task.title}</p>
      <div className="flex items-center gap-2 mt-2">
        {task.priority && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityConfig[task.priority].className}`}>
            {priorityConfig[task.priority].label}
          </span>
        )}
        {task.dueDate && (
          dueDateStatus ? (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dueDateConfig[dueDateStatus].className}`}>
              {dueDateConfig[dueDateStatus].badge}<span className="ml-1">{formatDate(task.dueDate)}</span>
            </span>
          ) : (
            <span className="text-xs text-gray-400">{formatDate(task.dueDate)}</span>
          )
        )}
        {task.description && (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-300 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>
    </div>
  )
}
