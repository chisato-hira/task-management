import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import type { Task, ColumnDef } from '../types/Task'
import type { SortMode } from './Board'
import TaskCard from './TaskCard'

interface ColumnProps {
  columnDef: ColumnDef
  tasks: Task[]
  sortMode: SortMode
  onToggleSort: (mode: SortMode) => void
  onTaskClick: (task: Task) => void
  onAddClick: () => void
  onBulkDeleteClick?: () => void
}

export default function Column({ columnDef, tasks, sortMode, onToggleSort, onTaskClick, onAddClick, onBulkDeleteClick }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: columnDef.status })

  return (
    <div className={`flex-1 ${columnDef.bgColor} rounded-xl p-3 min-w-0 flex flex-col`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-3 h-3 rounded-full ${columnDef.headerColor}`} />
        <h2 className="font-semibold text-gray-700 text-sm">{columnDef.label}</h2>
        <span className="ml-auto bg-white/70 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
        {columnDef.status === 'DONE' && tasks.length > 0 && (
          <button
            onClick={onBulkDeleteClick}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            全削除
          </button>
        )}
      </div>
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => onToggleSort('priority')}
          className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
            sortMode === 'priority'
              ? 'bg-indigo-600 text-white'
              : 'bg-white/70 text-gray-500 hover:bg-white'
          }`}
        >
          優先度順
        </button>
        <button
          onClick={() => onToggleSort('dueDate')}
          className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
            sortMode === 'dueDate'
              ? 'bg-indigo-600 text-white'
              : 'bg-white/70 text-gray-500 hover:bg-white'
          }`}
        >
          期限順
        </button>
      </div>
      {columnDef.status === 'TODO' && (
        <button
          onClick={onAddClick}
          className="mb-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-pink-500 bg-white border border-pink-300 rounded-lg hover:bg-pink-50 transition-colors"
        >
          <span className="text-base leading-none">+</span> タスクを追加
        </button>
      )}
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-col gap-2 flex-1 bg-white/50 rounded-lg p-2 min-h-[60px]">
          {tasks.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">タスクがありません</p>
          ) : (
            tasks.map(task => <TaskCard key={task.id} task={task} onClick={onTaskClick} />)
          )}
        </div>
      </SortableContext>
    </div>
  )
}
