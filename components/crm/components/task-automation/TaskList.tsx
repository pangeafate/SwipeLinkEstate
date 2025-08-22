import React from 'react'
import type { Task, TaskStatus } from '../../types'
import { TaskCard } from './TaskCard'

interface TaskListProps {
  tasks: Task[]
  onStatusChange: (taskId: string, status: TaskStatus) => void
  emptyMessage?: string
}

export const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  onStatusChange, 
  emptyMessage = "No tasks found" 
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2 text-4xl">📋</div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}