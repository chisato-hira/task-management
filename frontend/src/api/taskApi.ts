import type { Task, TaskPriority, TaskStatus } from '../types/Task'

export class TaskApiError extends Error {}

async function extractErrorMessage(response: Response): Promise<string | null> {
  let body: unknown
  try {
    body = await response.json()
  } catch {
    return null
  }
  if (typeof body !== 'object' || body === null) return null

  const data = body as Record<string, unknown>

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const messages = data.errors
      .map(error => {
        if (typeof error === 'string') return error
        if (error && typeof error === 'object') {
          const fieldError = error as Record<string, unknown>
          if (typeof fieldError.defaultMessage === 'string') return fieldError.defaultMessage
          if (typeof fieldError.message === 'string') return fieldError.message
        }
        return null
      })
      .filter((message): message is string => !!message)
    if (messages.length > 0) return messages.join(' / ')
  }

  if (typeof data.detail === 'string' && data.detail) return data.detail

  return null
}

async function throwApiError(response: Response, fallback: string): Promise<never> {
  const detail = await extractErrorMessage(response)
  throw new TaskApiError(detail ?? fallback)
}

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks')
  if (!response.ok) {
    return throwApiError(response, 'タスクの取得に失敗しました')
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
    return throwApiError(response, 'タスクの作成に失敗しました')
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
    return throwApiError(response, 'タスクの更新に失敗しました')
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
    await throwApiError(response, '並び替えに失敗しました')
  }
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    await throwApiError(response, 'タスクの削除に失敗しました')
  }
}

export async function deleteDoneTasks(): Promise<void> {
  const response = await fetch('/api/tasks/status/DONE', { method: 'DELETE' })
  if (!response.ok) {
    await throwApiError(response, '完了タスクの一括削除に失敗しました')
  }
}
