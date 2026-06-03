import { useEffect, useState } from 'react'
import type { Task, ColumnDef } from '../types/Task'
import { fetchTasks } from '../api/taskApi'
import Column from './Column'
import CreateTaskModal from './CreateTaskModal'
import TaskDetailModal from './TaskDetailModal'

const COLUMNS: ColumnDef[] = [
  { status: 'TODO',        label: '未着手', headerColor: 'bg-indigo-500' },
  { status: 'IN_PROGRESS', label: '進行中', headerColor: 'bg-amber-500'  },
  { status: 'DONE',        label: '完了',   headerColor: 'bg-emerald-500' },
]

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

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
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600"
        >
          <span className="text-lg leading-none">+</span> タスクを追加
        </button>
      </div>

      <div className="flex gap-4">
        {COLUMNS.map(col => (
          <Column
            key={col.status}
            columnDef={col}
            tasks={tasks.filter(t => t.status === col.status)}
            onTaskClick={setSelectedTask}
          />
        ))}
      </div>

      {isModalOpen && (
        <CreateTaskModal
          onClose={() => setIsModalOpen(false)}
          onCreated={() => { setIsModalOpen(false); load() }}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => { setSelectedTask(null); load() }}
          onDeleted={() => { setSelectedTask(null); load() }}
        />
      )}
    </>
  )
}
