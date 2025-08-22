'use client'

import React, { useState, useEffect } from 'react'
import type { Task, TaskFilters, TaskStatus } from '../../types'
import { TaskService } from '../../task.service'
import { TaskList } from './TaskList'
import { TaskFilters } from './TaskFilters'
import { TaskTabs } from './TaskTabs'
import { TaskListSkeleton } from './TaskListSkeleton'
import { getTasksByPriority, getTaskCounts } from './task-automation.utils'

interface TaskAutomationProps {
  agentId?: string
}

export const TaskAutomation: React.FC<TaskAutomationProps> = ({ agentId }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TaskFilters>({})
  const [selectedTab, setSelectedTab] = useState<'pending' | 'completed' | 'overdue'>('pending')

  useEffect(() => {
    loadTasks()
  }, [agentId, filters, selectedTab])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)

      const taskFilters: TaskFilters = {
        ...filters,
        status: selectedTab === 'pending' ? ['pending'] : 
               selectedTab === 'completed' ? ['completed'] :
               ['pending'], // For overdue, we'll filter by date
        isOverdue: selectedTab === 'overdue'
      }

      const response = await TaskService.getTasks(taskFilters, 1, 50)
      setTasks(response.data)

    } catch (err) {
      console.error('Error loading tasks:', err)
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      const updatedTask = await TaskService.updateTaskStatus(taskId, status)
      if (updatedTask) {
        setTasks(prev => prev.map(task =>
          task.id === taskId ? updatedTask : task
        ))
      }
    } catch (err) {
      console.error('Error updating task:', err)
    }
  }

  const taskCounts = getTaskCounts(tasks)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600">Automated and manual CRM tasks</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <TaskFilters filters={filters} onFiltersChange={setFilters} />
          <button
            onClick={loadTasks}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <TaskTabs
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        taskCounts={taskCounts}
      />

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Task List */}
      {loading ? (
        <TaskListSkeleton />
      ) : (
        <TaskList
          tasks={getTasksByPriority(tasks)}
          onStatusChange={handleTaskStatusChange}
          emptyMessage={`No ${selectedTab} tasks found`}
        />
      )}
    </div>
  )
}