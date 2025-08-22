import { getTasksByPriority, getTaskCounts } from '../task-automation.utils'
import { mockTask, mockOverdueTask, mockCompletedTask } from './mockData'
import type { Task } from '../../../types'

describe('Task Automation Utils', () => {
  describe('getTasksByPriority', () => {
    const highPriorityTask: Task = { ...mockTask, priority: 'high' }
    const mediumPriorityTask: Task = { ...mockTask, id: 'task-2', priority: 'medium' }
    const lowPriorityTask: Task = { ...mockTask, id: 'task-3', priority: 'low' }

    it('should sort tasks by priority (high, medium, low)', () => {
      const unsortedTasks = [lowPriorityTask, highPriorityTask, mediumPriorityTask]
      const sortedTasks = getTasksByPriority(unsortedTasks)

      expect(sortedTasks[0].priority).toBe('high')
      expect(sortedTasks[1].priority).toBe('medium')
      expect(sortedTasks[2].priority).toBe('low')
    })

    it('should handle tasks with same priority', () => {
      const task1: Task = { ...mockTask, id: 'task-1', priority: 'high' }
      const task2: Task = { ...mockTask, id: 'task-2', priority: 'high' }
      const tasks = [task1, task2]

      const sortedTasks = getTasksByPriority(tasks)

      expect(sortedTasks).toHaveLength(2)
      expect(sortedTasks[0].priority).toBe('high')
      expect(sortedTasks[1].priority).toBe('high')
    })

    it('should handle empty array', () => {
      const sortedTasks = getTasksByPriority([])
      expect(sortedTasks).toEqual([])
    })

    it('should handle single task', () => {
      const sortedTasks = getTasksByPriority([highPriorityTask])
      expect(sortedTasks).toHaveLength(1)
      expect(sortedTasks[0]).toEqual(highPriorityTask)
    })

    it('should not mutate original array', () => {
      const originalTasks = [lowPriorityTask, highPriorityTask, mediumPriorityTask]
      const originalOrder = [...originalTasks]
      
      getTasksByPriority(originalTasks)
      
      expect(originalTasks).toEqual(originalOrder)
    })
  })

  describe('getTaskCounts', () => {
    const pendingTask: Task = { ...mockTask, status: 'pending' }
    const completedTask: Task = { ...mockCompletedTask, status: 'completed' }
    const overdueTask: Task = {
      ...mockOverdueTask,
      status: 'pending',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
    }
    const futureTask: Task = {
      ...mockTask,
      id: 'task-4',
      status: 'pending',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    }

    it('should count pending tasks correctly', () => {
      const tasks = [pendingTask, completedTask, overdueTask]
      const counts = getTaskCounts(tasks)

      expect(counts.pending).toBe(2) // pendingTask and overdueTask
    })

    it('should count completed tasks correctly', () => {
      const tasks = [pendingTask, completedTask, overdueTask]
      const counts = getTaskCounts(tasks)

      expect(counts.completed).toBe(1)
    })

    it('should count overdue tasks correctly', () => {
      const tasks = [pendingTask, completedTask, overdueTask, futureTask]
      const counts = getTaskCounts(tasks)

      expect(counts.overdue).toBe(1) // Only overdueTask
    })

    it('should handle tasks without due dates', () => {
      const taskWithoutDueDate: Task = { ...mockTask, dueDate: null }
      const tasks = [taskWithoutDueDate, overdueTask]
      const counts = getTaskCounts(tasks)

      expect(counts.overdue).toBe(1) // Only overdueTask
    })

    it('should not count completed tasks as overdue', () => {
      const completedOverdueTask: Task = {
        ...mockTask,
        id: 'completed-overdue',
        status: 'completed',
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
      const tasks = [completedOverdueTask]
      const counts = getTaskCounts(tasks)

      expect(counts.overdue).toBe(0)
      expect(counts.completed).toBe(1)
    })

    it('should handle empty array', () => {
      const counts = getTaskCounts([])

      expect(counts.pending).toBe(0)
      expect(counts.completed).toBe(0)
      expect(counts.overdue).toBe(0)
    })

    it('should handle mixed task statuses and types', () => {
      const dismissedTask: Task = { ...mockTask, id: 'dismissed', status: 'dismissed' }
      const tasks = [pendingTask, completedTask, overdueTask, dismissedTask]
      const counts = getTaskCounts(tasks)

      expect(counts.pending).toBe(2) // pendingTask and overdueTask
      expect(counts.completed).toBe(1) // completedTask
      expect(counts.overdue).toBe(1) // overdueTask
    })

    it('should correctly identify overdue based on current date', () => {
      const todayTask: Task = {
        ...mockTask,
        id: 'today',
        status: 'pending',
        dueDate: new Date().toISOString() // Today
      }
      const tasks = [todayTask]
      const counts = getTaskCounts(tasks)

      // Today's task should not be overdue (depends on exact time)
      expect(counts.overdue).toBe(0)
      expect(counts.pending).toBe(1)
    })
  })
})