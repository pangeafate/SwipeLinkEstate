import React from 'react'

/**
 * TasksList - Upcoming tasks display
 * Part of the modular CRMAnalytics component system.
 */

export interface TasksListProps {
  tasks: any[]
}

export const TasksList: React.FC<TasksListProps> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No upcoming tasks</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <div key={task.id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              task.priority === 'urgent' ? 'bg-red-500' : 
              task.priority === 'high' ? 'bg-orange-500' : 
              task.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
            }`}></div>
            <div>
              <p className="font-medium text-gray-900">{task.title}</p>
              <p className="text-sm text-gray-500">{task.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
            </p>
            <p className="text-xs text-gray-500">{task.type}</p>
          </div>
        </div>
      ))}
    </div>
  )
}