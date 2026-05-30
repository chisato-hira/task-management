import { useState } from 'react'
import type { TaskPriority } from '../types/Task'

interface CreateTaskModalProps {
  onClose: () => void
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

export default function CreateTaskModal({ onClose }: CreateTaskModalProps) {
  const [values, setValues] = useState<FormValues>({
    title: '',
    description: '',
    priority: '',
    dueDate: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: バックエンド連携時にここでAPIを呼び出す
    onClose()
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

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-40"
              disabled={values.title.trim() === ''}
            >
              作成する
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
