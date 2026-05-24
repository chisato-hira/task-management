import { useEffect, useState } from 'react'
import type { Task, ColumnDef } from '../types/Task'
import { fetchTasks } from '../api/taskApi'
import Column from './Column'

const COLUMNS: ColumnDef[] = [
  { status: 'TODO',        label: '未着手', headerColor: 'bg-indigo-500' },
  { status: 'IN_PROGRESS', label: '進行中', headerColor: 'bg-amber-500'  },
  { status: 'DONE',        label: '完了',   headerColor: 'bg-emerald-500' },
]

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTasks()
      setTasks(data)
    } catch {
      setError('タスクの取得に失敗しました。バックエンドが起動しているか確認してください。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return <p className="text-center text-gray-400 mt-16">読み込み中...</p>
  }

  if (error) {
    return (
      <div className="text-center mt-16">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={load}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600"
        >
          再試行
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      {COLUMNS.map(col => (
        <Column
          key={col.status}
          columnDef={col}
          tasks={tasks.filter(t => t.status === col.status)}
        />
      ))}
    </div>
  )
}
