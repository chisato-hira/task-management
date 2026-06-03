import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { Task, ColumnDef, TaskStatus } from '../types/Task'
import { fetchTasks, reorderTasks } from '../api/taskApi'
import Column from './Column'
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
  const originalTasksRef = useRef<Task[]>([])

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
    const task = tasks.find(t => t.id === Number(event.active.id))
    if (task) {
      setActiveTask(task)
      originalTasksRef.current = tasks
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event

    if (!over) {
      setTasks(originalTasksRef.current)
      return
    }

    const activeId = Number(active.id)
    const overIdAsNumber = Number(over.id)
    const overTask = isNaN(overIdAsNumber) ? null : originalTasksRef.current.find(t => t.id === overIdAsNumber)
    const targetStatus: TaskStatus = overTask ? overTask.status : (over.id as TaskStatus)
    const originalTask = originalTasksRef.current.find(t => t.id === activeId)
    if (!originalTask) return

    let finalTasks: Task[]

    if (originalTask.status === targetStatus) {
      // 同一カラム内の並び替え
      const colTasks = originalTasksRef.current.filter(t => t.status === targetStatus)
      const oldIdx = colTasks.findIndex(t => t.id === activeId)
      const newIdx = overTask
        ? colTasks.findIndex(t => t.id === overTask.id)
        : colTasks.length - 1
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) {
        setTasks(originalTasksRef.current)
        return
      }

      const reordered = arrayMove(colTasks, oldIdx, newIdx).map((t, i) => ({ ...t, position: i }))
      finalTasks = [...originalTasksRef.current.filter(t => t.status !== targetStatus), ...reordered]
    } else {
      // カラム間の移動：ターゲットカラムの末尾に追加する
      const sourceTasks = originalTasksRef.current
        .filter(t => t.status === originalTask.status && t.id !== activeId)
        .map((t, i) => ({ ...t, position: i }))

      const destTasks = originalTasksRef.current.filter(t => t.status === targetStatus)
      const movedTask = { ...originalTask, status: targetStatus, position: destTasks.length }

      finalTasks = [
        ...originalTasksRef.current.filter(t => t.status !== originalTask.status && t.status !== targetStatus),
        ...sourceTasks,
        ...destTasks,
        movedTask,
      ]
    }

    setTasks(finalTasks)

    try {
      await reorderTasks(finalTasks.map(t => ({ id: t.id, status: t.status, position: t.position })))
    } catch {
      setTasks(originalTasksRef.current)
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
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
          <div className="bg-white rounded-lg p-3 shadow-lg border border-indigo-300 opacity-90 cursor-grabbing">
            <p className="text-sm font-medium text-gray-800">{activeTask.title}</p>
          </div>
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
