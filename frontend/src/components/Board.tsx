import { useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { Task, ColumnDef, TaskStatus } from '../types/Task'
import { fetchTasks, reorderTasks } from '../api/taskApi'
import Column from './Column'
import TaskCard from './TaskCard'
import CreateTaskModal from './CreateTaskModal'
import TaskDetailModal from './TaskDetailModal'

const COLUMNS: ColumnDef[] = [
  { status: 'TODO',        label: '未着手', headerColor: 'bg-indigo-500',  bgColor: 'bg-indigo-50'  },
  { status: 'IN_PROGRESS', label: '進行中', headerColor: 'bg-amber-500',   bgColor: 'bg-amber-50'   },
  { status: 'DONE',        label: '完了',   headerColor: 'bg-emerald-500', bgColor: 'bg-emerald-50' },
]

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingToStatus, setAddingToStatus] = useState<TaskStatus | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }))

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

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id as number
    const overId = over.id

    const activeTask = tasks.find(t => t.id === activeId)
    if (!activeTask) return

    // ドロップ先のステータスを特定（カラムIDかタスクIDかを判定）
    const overTask = tasks.find(t => t.id === overId)
    const targetStatus: TaskStatus = overTask
      ? overTask.status
      : (overId as TaskStatus)

    let updatedTasks = [...tasks]

    if (activeTask.status === targetStatus) {
      // 同一カラム内の並び替え
      const columnTasks = updatedTasks.filter(t => t.status === targetStatus)
      const oldIndex = columnTasks.findIndex(t => t.id === activeId)
      const newIndex = overTask ? columnTasks.findIndex(t => t.id === overId) : columnTasks.length - 1

      if (oldIndex === newIndex) return

      const reordered = arrayMove(columnTasks, oldIndex, newIndex)
      updatedTasks = updatedTasks
        .filter(t => t.status !== targetStatus)
        .concat(reordered.map((t, i) => ({ ...t, position: i })))
    } else {
      // カラム間の移動
      const targetColumnTasks = updatedTasks
        .filter(t => t.status === targetStatus && t.id !== activeId)
      const insertIndex = overTask
        ? targetColumnTasks.findIndex(t => t.id === overId)
        : targetColumnTasks.length

      const newTask = { ...activeTask, status: targetStatus }
      targetColumnTasks.splice(insertIndex === -1 ? targetColumnTasks.length : insertIndex, 0, newTask)

      updatedTasks = updatedTasks
        .filter(t => t.id !== activeId && t.status !== targetStatus)
        .concat(
          updatedTasks.filter(t => t.status === activeTask.status && t.id !== activeId)
            .map((t, i) => ({ ...t, position: i }))
        )
        .concat(targetColumnTasks.map((t, i) => ({ ...t, position: i })))
    }

    setTasks(updatedTasks)

    // APIに送信
    const payload = updatedTasks.map(t => ({ id: t.id, status: t.status, position: t.position }))
    try {
      await reorderTasks(payload)
    } catch {
      load() // 失敗時は再取得してロールバック
    }
  }

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
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4">
        {COLUMNS.map(col => (
          <Column
            key={col.status}
            columnDef={col}
            tasks={tasks.filter(t => t.status === col.status).sort((a, b) => a.position - b.position)}
            onTaskClick={setSelectedTask}
            onAddClick={() => setAddingToStatus(col.status)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <TaskCard task={activeTask} onClick={() => {}} />
        )}
      </DragOverlay>

      {addingToStatus && (
        <CreateTaskModal
          defaultStatus={addingToStatus}
          onClose={() => setAddingToStatus(null)}
          onCreated={() => { setAddingToStatus(null); load() }}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => { setSelectedTask(null); load() }}
        />
      )}
    </DndContext>
  )
}
