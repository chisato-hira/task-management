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
import { fetchTasks, reorderTasks, deleteDoneTasks, TaskApiError } from '../api/taskApi'
import Column from './Column'
import CreateTaskModal from './CreateTaskModal'
import TaskDetailModal from './TaskDetailModal'

export type SortMode = 'none' | 'priority' | 'dueDate'

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const

const COLUMNS: ColumnDef[] = [
  { status: 'TODO',        label: '未着手', headerColor: 'bg-indigo-400', bgColor: 'bg-indigo-50'  },
  { status: 'IN_PROGRESS', label: '進行中', headerColor: 'bg-blue-400',   bgColor: 'bg-blue-50'    },
  { status: 'DONE',        label: '完了',   headerColor: 'bg-zinc-400',   bgColor: 'bg-zinc-100'   },
]

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingToStatus, setAddingToStatus] = useState<TaskStatus | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [columnSortModes, setColumnSortModes] = useState<Record<TaskStatus, SortMode>>({
    TODO: 'none',
    IN_PROGRESS: 'none',
    DONE: 'none',
  })
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const originalTasksRef = useRef<Task[]>([])

  const sortTasks = (columnTasks: Task[], sortMode: SortMode): Task[] => {
    if (sortMode === 'priority') {
      return [...columnTasks].sort((a, b) => {
        const pa = a.priority != null ? PRIORITY_ORDER[a.priority] : 3
        const pb = b.priority != null ? PRIORITY_ORDER[b.priority] : 3
        if (pa !== pb) return pa - pb
        return a.position - b.position
      })
    }
    if (sortMode === 'dueDate') {
      return [...columnTasks].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return a.position - b.position
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
    }
    return [...columnTasks].sort((a, b) => a.position - b.position)
  }

  const toggleColumnSort = (status: TaskStatus, mode: SortMode) => {
    setColumnSortModes(prev => ({ ...prev, [status]: prev[status] === mode ? 'none' : mode }))
  }

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }))

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTasks()
      setTasks(data)
    } catch (err) {
      setError(err instanceof TaskApiError ? err.message : 'タスクの取得に失敗しました。バックエンドが起動しているか確認してください。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
      .then(data => setTasks(data))
      .catch((err: unknown) => setError(err instanceof TaskApiError ? err.message : 'タスクの取得に失敗しました。バックエンドが起動しているか確認してください。'))
      .finally(() => setLoading(false))
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
      const colSortMode = columnSortModes[targetStatus]
      // 期限順ソート中は異なる期限間の並び替えをブロック
      if (colSortMode === 'dueDate' && overTask && originalTask.dueDate !== overTask.dueDate) {
        setTasks(originalTasksRef.current)
        return
      }
      // 優先度順ソート中は異なる優先度間の並び替えをブロック
      if (colSortMode === 'priority' && overTask && originalTask.priority !== overTask.priority) {
        setTasks(originalTasksRef.current)
        return
      }

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
    } catch (err) {
      setTasks(originalTasksRef.current)
      setActionError(err instanceof TaskApiError ? err.message : '並び替えの保存に失敗しました。バックエンドが起動しているか確認してください。')
    }
  }

  const handleBulkDelete = async () => {
    setBulkDeleting(true)
    setBulkDeleteError(null)
    try {
      await deleteDoneTasks()
      setShowBulkDeleteConfirm(false)
      load()
    } catch (err) {
      setBulkDeleteError(err instanceof TaskApiError ? err.message : '削除に失敗しました。バックエンドが起動しているか確認してください。')
    } finally {
      setBulkDeleting(false)
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
      {actionError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="shrink-0 text-red-400 hover:text-red-600"
          >
            閉じる
          </button>
        </div>
      )}
      <div className="flex gap-4">
        {COLUMNS.map(col => (
          <Column
            key={col.status}
            columnDef={col}
            tasks={sortTasks(tasks.filter(t => t.status === col.status), columnSortModes[col.status])}
            sortMode={columnSortModes[col.status]}
            onToggleSort={(mode) => toggleColumnSort(col.status, mode)}
            onTaskClick={setSelectedTask}
            onAddClick={() => setAddingToStatus(col.status)}
            onBulkDeleteClick={() => setShowBulkDeleteConfirm(true)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="bg-white rounded-lg p-3 shadow-lg border border-gray-300 opacity-90 cursor-grabbing">
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
          onDeleted={() => { setSelectedTask(null); load() }}
        />
      )}

      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
            <p className="text-base font-bold text-gray-800 mb-3">
              完了済みの <span className="text-red-500">{tasks.filter(t => t.status === 'DONE').length} 件</span>をすべて削除しますか？
            </p>
            <p className="text-xs text-red-500 mb-5">この操作は取り消せません。</p>
            {bulkDeleteError && (
              <p className="text-sm text-red-500 mb-3">{bulkDeleteError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowBulkDeleteConfirm(false); setBulkDeleteError(null) }}
                disabled={bulkDeleting}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                キャンセル
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-40"
              >
                {bulkDeleting ? '削除中...' : 'すべて削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  )
}
