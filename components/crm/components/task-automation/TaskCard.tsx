import React from 'react'
import type { Task, TaskPriority, TaskStatus } from '../../types'

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
  const getPriorityColor = (priority: TaskPriority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[priority]
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      call: '📞',
      email: '📧',
      showing: '🏠',
      'follow-up': '🔄',
      nurture: '🌱',
      preparation: '📋',
      general: '📝'
    }
    return icons[type as keyof typeof icons] || '📝'
  }

  const isOverdue = () => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'pending'
  }

  const formatDueDate = () => {
    if (!task.dueDate) return null
    
    const due = new Date(task.dueDate)
    const now = new Date()
    const diffMs = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    if (diffDays > 0) return `Due in ${diffDays} days`
    return `Overdue by ${Math.abs(diffDays)} days`
  }

  return (
    <div className={`
      bg-white rounded-lg shadow-sm border-l-4 p-4
      ${isOverdue() ? 'border-l-red-500' : 
        task.priority === 'high' ? 'border-l-red-400' :
        task.priority === 'medium' ? 'border-l-yellow-400' :
        'border-l-gray-400'
      }
      ${task.status === 'completed' ? 'opacity-75' : ''}
    `}>
      
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Task Header */}
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-xl">{getTypeIcon(task.type)}</span>
            <h3 className={`font-semibold text-gray-900 ${task.status === 'completed' ? 'line-through' : ''}`}>
              {task.title}
            </h3>
            {task.isAutomated && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                AUTO
              </span>
            )}
          </div>

          {/* Task Description */}
          <p className="text-gray-600 mb-3 text-sm">{task.description}</p>

          {/* Task Metadata */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <span>Type:</span>
              <span className="font-medium capitalize">{task.type.replace('-', ' ')}</span>
            </div>
            
            {task.dueDate && (
              <div className={`flex items-center space-x-1 ${isOverdue() ? 'text-red-600 font-medium' : ''}`}>
                <span>⏰</span>
                <span>{formatDueDate()}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              <span>Created:</span>
              <span>{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Task Notes */}
          {task.notes && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
              <strong>Notes:</strong> {task.notes}
            </div>
          )}
        </div>

        {/* Task Actions */}
        <div className="flex items-center space-x-2 ml-4">
          {/* Priority Badge */}
          <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            {task.priority.toUpperCase()}
          </span>

          {/* Status Actions */}
          {task.status === 'pending' && (
            <div className="flex space-x-1">
              <button
                onClick={() => onStatusChange(task.id, 'completed')}
                className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                title="Mark as completed"
              >
                ✓ Complete
              </button>
              <button
                onClick={() => onStatusChange(task.id, 'dismissed')}
                className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                title="Dismiss task"
              >
                ✕ Dismiss
              </button>
            </div>
          )}
          
          {task.status === 'completed' && task.completedAt && (
            <div className="text-xs text-green-600">
              ✓ Completed {new Date(task.completedAt).toLocaleDateString()}
            </div>
          )}
          
          {task.status === 'dismissed' && (
            <div className="text-xs text-gray-500">
              ✕ Dismissed
            </div>
          )}
        </div>
      </div>
    </div>
  )
}