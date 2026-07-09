import { useEffect, useState } from 'react'
import type { Task, TaskStatus, TaskPriority } from '../types/Task'
import { updateTask, deleteTask, TaskApiError } from '../api/taskApi'
import { formatDate } from '../utils/date'

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

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO:        '未着手',
  IN_PROGRESS: '進行中',
  DONE:        '完了',
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  HIGH:   '高',
  MEDIUM: '中',
  LOW:    '低',
}

interface FormValues {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority | ''
  dueDate: string
}

export default function TaskDetailModal({ task, onClose, onUpdated, onDeleted }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [values, setValues] = useState<FormValues>({
    title:       task.title,
    description: task.description ?? '',
    status:      task.status,
    priority:    task.priority ?? '',
    dueDate:     task.dueDate ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldsVisible, setFieldsVisible] = useState(true)

  const switchMode = (nextEditing: boolean) => {
    setFieldsVisible(false)
    setTimeout(() => {
      setIsEditing(nextEditing)
      setFieldsVisible(true)
    }, 120)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    try {
      await deleteTask(task.id)
      onDeleted()
    } catch (err) {
      setError(err instanceof TaskApiError ? err.message : '削除に失敗しました。バックエンドが起動しているか確認してください。')
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateTask(task.id, {
        title:       values.title,
        description: values.description || null,
        status:      values.status,
        priority:    values.priority || null,
        dueDate:     values.dueDate  || null,
      })
      onUpdated()
    } catch (err) {
      setError(err instanceof TaskApiError ? err.message : '保存に失敗しました。バックエンドが起動しているか確認してください。')
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
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-5"
        onClick={e => e.stopPropagation()}
      >
        {/* タイトル */}
        <div className="mb-3">
          {isEditing ? (
            <input
              type="text"
              maxLength={255}
              value={values.title}
              onChange={e => setValues({ ...values, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          ) : (
            <h2 className="text-lg font-bold text-gray-800">{task.title}</h2>
          )}
        </div>

        {/* 各項目 */}
        <div className={`flex flex-col gap-3 transition-opacity duration-150 ${fieldsVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* 説明 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">説明</label>
            {isEditing ? (
              <textarea
                value={values.description}
                onChange={e => setValues({ ...values, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                placeholder="説明を入力（任意）"
              />
            ) : (
              <p className="text-sm text-gray-600">
                {task.description || <span className="text-gray-400">未設定</span>}
              </p>
            )}
          </div>

          {/* ステータス */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">ステータス</label>
            {isEditing ? (
              <select
                value={values.status}
                onChange={e => setValues({ ...values, status: e.target.value as TaskStatus })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-700">{STATUS_LABELS[task.status]}</p>
            )}
          </div>

          {/* 優先度 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">優先度</label>
            {isEditing ? (
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
            ) : (
              <p className="text-sm text-gray-700">
                {task.priority ? PRIORITY_LABELS[task.priority] : <span className="text-gray-400">未設定</span>}
              </p>
            )}
          </div>

          {/* 期日 */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">期日</label>
            {isEditing ? (
              <input
                type="date"
                value={values.dueDate}
                onChange={e => setValues({ ...values, dueDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            ) : (
              <p className="text-sm text-gray-700">
                {task.dueDate ? formatDate(task.dueDate) : <span className="text-gray-400">未設定</span>}
              </p>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 mt-3">{error}</p>
        )}

        {/* フッターボタン */}
        <div className="flex items-center mt-4">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={saving || deleting}
            className="flex items-center gap-1 text-sm text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            削除
          </button>

          <div className="ml-auto flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => switchMode(false)}
                  disabled={saving}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || values.title.trim() === ''}
                  className="px-4 py-2 text-sm text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-40"
                >
                  {saving ? '保存中...' : '保存する'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  閉じる
                </button>
                <button
                  onClick={() => switchMode(true)}
                  className="px-4 py-2 text-sm text-white bg-indigo-500 rounded-lg hover:bg-indigo-600"
                >
                  編集する
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
            <p className="text-base font-bold text-gray-800 mb-3">「{task.title}」を削除しますか？</p>
            <p className="text-xs text-red-500 mb-5">この操作は取り消せません。</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-40"
              >
                {deleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
