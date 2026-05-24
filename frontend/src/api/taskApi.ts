import type { Task } from '../types/Task'

export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks')
  if (!response.ok) {
    throw new Error('タスクの取得に失敗しました')
  }
  return response.json()
}
