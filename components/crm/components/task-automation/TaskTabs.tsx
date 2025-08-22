import React from 'react'

interface TaskCounts {
  pending: number
  completed: number
  overdue: number
}

interface TaskTabsProps {
  selectedTab: 'pending' | 'completed' | 'overdue'
  onTabChange: (tab: 'pending' | 'completed' | 'overdue') => void
  taskCounts: TaskCounts
}

export const TaskTabs: React.FC<TaskTabsProps> = ({ 
  selectedTab, 
  onTabChange, 
  taskCounts 
}) => {
  const tabs = [
    { key: 'pending' as const, label: 'Pending', count: taskCounts.pending },
    { key: 'overdue' as const, label: 'Overdue', count: taskCounts.overdue },
    { key: 'completed' as const, label: 'Completed', count: taskCounts.completed }
  ]

  return (
    <div className="flex space-x-1 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2
            ${selectedTab === tab.key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          <span>{tab.label}</span>
          <span className={`
            px-2 py-1 rounded-full text-xs
            ${selectedTab === tab.key
              ? 'bg-white text-blue-600'
              : 'bg-gray-200 text-gray-600'
            }
          `}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  )
}