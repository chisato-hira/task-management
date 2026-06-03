export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export interface Task {
  id: number
  title: string
  description: string | null
  priority: TaskPriority | null
  dueDate: string | null
  status: TaskStatus
  position: number
  createdAt: string
  updatedAt: string
}

export interface ColumnDef {
  status: TaskStatus
  label: string
  headerColor: string
  bgColor: string
}
