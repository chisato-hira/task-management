import type { Task, TaskPriority, TaskStatus } from '../types/Task'

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks')
  if (!response.ok) {
    throw new Error('タスクの取得に失敗しました')
  }
  return response.json()
}

export interface CreateTaskRequest {
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority | null
  dueDate: string | null
}

export async function createTask(request: CreateTaskRequest): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) {
    throw new Error('タスクの作成に失敗しました')
  }
  return response.json()
}

export interface UpdateTaskRequest {
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority | null
  dueDate: string | null
}

export async function updateTask(id: number, request: UpdateTaskRequest): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) {
    throw new Error('タスクの更新に失敗しました')
  }
  return response.json()
}

export interface ReorderTaskRequest {
  id: number
  status: TaskStatus
  position: number
}

export async function reorderTasks(requests: ReorderTaskRequest[]): Promise<void> {
  const response = await fetch('/api/tasks/reorder', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requests),
  })
  if (!response.ok) {
    throw new Error('並び替えに失敗しました')
  }
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error('タスクの削除に失敗しました')
  }
}

export async function deleteDoneTasks(): Promise<void> {
  const response = await fetch('/api/tasks/status/DONE', { method: 'DELETE' })
  if (!response.ok) {
    throw new Error('完了タスクの一括削除に失敗しました')
  }
}

