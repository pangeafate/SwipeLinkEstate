import { useState, useEffect } from 'react'
import type { Task, TaskFilters, TaskStatus, TaskPriority } from '../types'
import { TaskService } from '../task.service'

/**
 * useTasks - React Hook for Task Management
 * 
 * Provides task data with filtering, status updates, and automation.
 */
export const useTasks = (
  initialFilters: TaskFilters = {},
  pageSize: number = 20
) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TaskFilters>(initialFilters)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 0
  })

  const loadTasks = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await TaskService.getTasks(filters, page, pageSize)
      setTasks(response.data)
      setPagination(response.pagination)
      
    } catch (err) {
      console.error('Error loading tasks:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, status: TaskStatus, notes?: string) => {
    try {
      const updatedTask = await TaskService.updateTaskStatus(taskId, status, notes)
      if (updatedTask) {
        setTasks(prev => prev.map(task =>
          task.id === taskId ? updatedTask : task
        ))
        return updatedTask
      }
    } catch (err) {
      console.error('Error updating task status:', err)
      throw err
    }
  }

  const createTask = async (taskData: {
    dealId: string
    agentId: string
    title: string
    description: string
    type: string
    priority: TaskPriority
    dueDate?: string
    notes?: string
  }) => {
    try {
      const newTask = await TaskService.createTask(taskData)
      setTasks(prev => [newTask, ...prev])
      return newTask
    } catch (err) {
      console.error('Error creating task:', err)
      throw err
    }
  }

  const refresh = () => {
    loadTasks(pagination.page)
  }

  const updateFilters = (newFilters: TaskFilters) => {
    setFilters(newFilters)
  }

  useEffect(() => {
    loadTasks(1)
  }, [filters])

  return {
    tasks,
    loading,
    error,
    filters,
    pagination,
    updateTaskStatus,
    createTask,
    updateFilters,
    refresh
  }
}

/**
 * useUpcomingTasks - Hook for Upcoming Tasks
 */
export const useUpcomingTasks = (agentId?: string, days: number = 7) => {
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUpcomingTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const tasks = await TaskService.getUpcomingTasks(agentId || 'current-agent', days)
      setUpcomingTasks(tasks)
      
    } catch (err) {
      console.error('Error loading upcoming tasks:', err)
      setError(err instanceof Error ? err.message : 'Failed to load upcoming tasks')
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (taskId: string) => {
    try {
      const updatedTask = await TaskService.updateTaskStatus(taskId, 'completed')
      if (updatedTask) {
        setUpcomingTasks(prev => prev.filter(task => task.id !== taskId))
      }
      return updatedTask
    } catch (err) {
      console.error('Error completing task:', err)
      throw err
    }
  }

  useEffect(() => {
    loadUpcomingTasks()
  }, [agentId, days])

  return {
    upcomingTasks,
    loading,
    error,
    completeTask,
    refresh: loadUpcomingTasks
  }
}

/**
 * useOverdueTasks - Hook for Overdue Tasks
 */
export const useOverdueTasks = (agentId?: string) => {
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOverdueTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const tasks = await TaskService.getOverdueTasks(agentId || 'current-agent')
      setOverdueTasks(tasks)
      
    } catch (err) {
      console.error('Error loading overdue tasks:', err)
      setError(err instanceof Error ? err.message : 'Failed to load overdue tasks')
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (taskId: string) => {
    try {
      const updatedTask = await TaskService.updateTaskStatus(taskId, 'completed')
      if (updatedTask) {
        setOverdueTasks(prev => prev.filter(task => task.id !== taskId))
      }
      return updatedTask
    } catch (err) {
      console.error('Error completing overdue task:', err)
      throw err
    }
  }

  useEffect(() => {
    loadOverdueTasks()
  }, [agentId])

  return {
    overdueTasks,
    loading,
    error,
    completeTask,
    refresh: loadOverdueTasks
  }
}

/**
 * useTasksByPriority - Hook for Priority-Based Task Management
 */
export const useTasksByPriority = (agentId?: string) => {
  const [tasksByPriority, setTasksByPriority] = useState<{
    high: Task[]
    medium: Task[]
    low: Task[]
  }>({ high: [], medium: [], low: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasksByPriority = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await TaskService.getTasks(
        { 
          status: ['pending'],
          ...(agentId && { dealId: agentId }) // This would need proper agent filtering
        },
        1,
        100
      )
      
      // Group tasks by priority
      const grouped = response.data.reduce((acc, task) => {
        acc[task.priority].push(task)
        return acc
      }, { high: [], medium: [], low: [] } as { high: Task[], medium: Task[], low: Task[] })
      
      // Sort each priority group by due date
      Object.keys(grouped).forEach(priority => {
        grouped[priority as keyof typeof grouped].sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        })
      })
      
      setTasksByPriority(grouped)
      
    } catch (err) {
      console.error('Error loading tasks by priority:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const updatedTask = await TaskService.updateTaskStatus(taskId, status)
      if (updatedTask) {
        // Remove completed/dismissed tasks from the priority lists
        if (status === 'completed' || status === 'dismissed') {
          setTasksByPriority(prev => ({
            high: prev.high.filter(task => task.id !== taskId),
            medium: prev.medium.filter(task => task.id !== taskId),
            low: prev.low.filter(task => task.id !== taskId)
          }))
        }
      }
      return updatedTask
    } catch (err) {
      console.error('Error updating task status:', err)
      throw err
    }
  }

  useEffect(() => {
    loadTasksByPriority()
  }, [agentId])

  return {
    tasksByPriority,
    loading,
    error,
    updateTaskStatus,
    refresh: loadTasksByPriority
  }
}

/**
 * useTaskStats - Hook for Task Statistics
 */
export const useTaskStats = (agentId?: string) => {
  const [stats, setStats] = useState<{
    total: number
    pending: number
    completed: number
    overdue: number
    completionRate: number
    averageCompletionTime: number // in hours
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTaskStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load all tasks for stats calculation
      const allTasks = await TaskService.getTasks({}, 1, 1000)
      const tasks = allTasks.data
      
      const now = new Date()
      const pending = tasks.filter(t => t.status === 'pending').length
      const completed = tasks.filter(t => t.status === 'completed').length
      const overdue = tasks.filter(t => 
        t.status === 'pending' && 
        t.dueDate && 
        new Date(t.dueDate) < now
      ).length
      
      const completionRate = tasks.length > 0 ? (completed / tasks.length) * 100 : 0
      
      // Calculate average completion time
      const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt)
      const averageCompletionTime = completedTasks.length > 0 
        ? completedTasks.reduce((sum, task) => {
            const created = new Date(task.createdAt).getTime()
            const completed = new Date(task.completedAt!).getTime()
            return sum + ((completed - created) / (1000 * 60 * 60)) // Convert to hours
          }, 0) / completedTasks.length
        : 0
      
      setStats({
        total: tasks.length,
        pending,
        completed,
        overdue,
        completionRate: Math.round(completionRate * 10) / 10, // Round to 1 decimal
        averageCompletionTime: Math.round(averageCompletionTime * 10) / 10
      })
      
    } catch (err) {
      console.error('Error loading task stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load task statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTaskStats()
  }, [agentId])

  return {
    stats,
    loading,
    error,
    refresh: loadTaskStats
  }
}