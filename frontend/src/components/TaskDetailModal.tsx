import { useEffect, useState } from 'react'
import type { Task, TaskStatus, TaskPriority } from '../types/Task'
import { updateTask, deleteTask } from '../api/taskApi'

interface TaskDetailModalProps {
  task: Task
  onClose: () => void
  onUpdated: () => void
  onDeleted: () => void
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

export default function TaskDetailModal({ task, onClose, onUpdated, onDeleted }: TaskDetailModalProps) {
  const [values, setValues] = useState<FormValues>({
    status:   task.status,
    priority: task.priority ?? '',
    dueDate:  task.dueDate ?? '',
  })
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    try {
      await deleteTask(task.id)
      onDeleted()
    } catch {
      setError('削除に失敗しました。バックエンドが起動しているか確認してください。')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const isProcessing = saving || deleting

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
              disabled={isProcessing}
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
              disabled={isProcessing}
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
              disabled={isProcessing}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 mt-3">{error}</p>
        )}

        {confirmDelete ? (
          <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 mb-3">本当に削除しますか？この操作は元に戻せません。</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={isProcessing}
                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                やめる
              </button>
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="px-3 py-1.5 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-40"
              >
                {deleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center mt-5">
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={isProcessing}
              className="px-3 py-1.5 text-sm text-red-500 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-40"
            >
              削除
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="px-4 py-2 text-sm text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-40"
              >
                {saving ? '保存中...' : '保存する'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
