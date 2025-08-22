import type { Task } from '../../types'

export const getTasksByPriority = (tasks: Task[]) => {
  const priorityOrder = { high: 3, medium: 2, low: 1 }
  return [...tasks].sort((a, b) => 
    priorityOrder[b.priority] - priorityOrder[a.priority]
  )
}

export const getTaskCounts = (tasks: Task[]) => {
  return {
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => 
      t.status === 'pending' && 
      t.dueDate && 
      new Date(t.dueDate) < new Date()
    ).length
  }
}