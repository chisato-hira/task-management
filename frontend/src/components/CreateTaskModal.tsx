import { useState } from 'react'
import type { TaskPriority } from '../types/Task'
import { createTask } from '../api/taskApi'

interface CreateTaskModalProps {
  onClose: () => void
  onCreated: () => void
}

interface FormValues {
  title: string
  description: string
  priority: TaskPriority | ''
  dueDate: string
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'HIGH',   label: '高' },
  { value: 'MEDIUM', label: '中' },
  { value: 'LOW',    label: '低' },
]

export default function CreateTaskModal({ onClose, onCreated }: CreateTaskModalProps) {
  const [values, setValues] = useState<FormValues>({
    title: '',
    description: '',
    priority: '',
    dueDate: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await createTask({
        title: values.title,
        description: values.description || null,
        priority: values.priority || null,
        dueDate: values.dueDate || null,
      })
      onCreated()
    } catch {
      setError('タスクの作成に失敗しました。バックエンドが起動しているか確認してください。')
    } finally {
      setSubmitting(false)
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
        <h2 className="text-lg font-bold text-gray-800 mb-5">新規タスク作成</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={values.title}
              onChange={e => setValues({ ...values, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="タスクのタイトルを入力"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              value={values.description}
              onChange={e => setValues({ ...values, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              rows={3}
              placeholder="タスクの詳細を入力（任意）"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                優先度
              </label>
              <select
                value={values.priority}
                onChange={e => setValues({ ...values, priority: e.target.value as TaskPriority | '' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="">未設定</option>
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                期日
              </label>
              <input
                type="date"
                value={values.dueDate}
                onChange={e => setValues({ ...values, dueDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-40"
              disabled={values.title.trim() === '' || submitting}
            >
              {submitting ? '作成中...' : '作成する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
