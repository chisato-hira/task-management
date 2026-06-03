import { useEffect, useState } from 'react'
import type { Task, TaskStatus, TaskPriority } from '../types/Task'
import { updateTask } from '../api/taskApi'

interface TaskDetailModalProps {
  task: Task
  onClose: () => void
  onUpdated: () => void
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO',        label: '未着手' },
  { value: 'IN_PROGRESS', label: '進行中' },
  { value: 'DONE',        label: '完了'   },
]

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'HIGH',   label: '高' },
  { value: 'MEDIUM', label: '中' },
  { value: 'LOW',    label: '低' },
]

interface FormValues {
  status: TaskStatus
  priority: TaskPriority | ''
  dueDate: string
}

export default function TaskDetailModal({ task, onClose, onUpdated }: TaskDetailModalProps) {
  const [values, setValues] = useState<FormValues>({
    status:   task.status,
    priority: task.priority ?? '',
    dueDate:  task.dueDate ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateTask(task.id, {
        status:   values.status,
        priority: values.priority || null,
        dueDate:  values.dueDate  || null,
      })
      onUpdated()
    } catch {
      setError('保存に失敗しました。バックエンドが起動しているか確認してください。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-800 mb-1">{task.title}</h2>

        {task.description && (
          <p className="text-sm text-gray-500 mb-5">{task.description}</p>
        )}

        <div className="flex flex-col gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
            <select
              value={values.status}
              onChange={e => setValues({ ...values, status: e.target.value as TaskStatus })}
              disabled={saving}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white disabled:opacity-50"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
            <select
              value={values.priority}
              onChange={e => setValues({ ...values, priority: e.target.value as TaskPriority | '' })}
              disabled={saving}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white disabled:opacity-50"
            >
              <option value="">未設定</option>
              {PRIORITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">期日</label>
            <input
              type="date"
              value={values.dueDate}
              onChange={e => setValues({ ...values, dueDate: e.target.value })}
              disabled={saving}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 mt-3">{error}</p>
        )}

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-40"
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  )
}
