import React from 'react'
import type { ActivityWithContext } from '@/lib/analytics/analytics.service'

export interface ActivityFeedProps {
  activities: ActivityWithContext[]
  title?: string
  maxItems?: number
  className?: string
}

const actionIcons = {
  view: '👁️',
  like: '👍',
  dislike: '👎',
  swipe: '👆',
  click: '🖱️',
  share: '📤',
  default: '📊'
}

const actionColors = {
  view: 'bg-blue-100 text-blue-800',
  like: 'bg-green-100 text-green-800',
  dislike: 'bg-red-100 text-red-800',
  swipe: 'bg-purple-100 text-purple-800',
  click: 'bg-yellow-100 text-yellow-800',
  share: 'bg-indigo-100 text-indigo-800',
  default: 'bg-gray-100 text-gray-800'
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  return date.toLocaleDateString()
}

function getActionDescription(activity: ActivityWithContext): string {
  const action = activity.action.toLowerCase()
  const propertyAddress = activity.property?.address || 'Unknown Property'
  const linkName = activity.link?.name || activity.link?.code || 'Direct'

  switch (action) {
    case 'view':
      return `Viewed ${propertyAddress}`
    case 'like':
      return `Liked ${propertyAddress}`
    case 'dislike':
      return `Passed on ${propertyAddress}`
    case 'swipe':
      return `Swiped on ${propertyAddress}`
    case 'click':
      return `Clicked ${propertyAddress}`
    case 'share':
      return `Shared ${propertyAddress}`
    default:
      return `${action} on ${propertyAddress}`
  }
}

export function ActivityFeed({ 
  activities, 
  title = 'Recent Activity', 
  maxItems = 10, 
  className = '' 
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems)

  if (activities.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-gray-500">No recent activity</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {activities.length > maxItems && (
          <span className="text-sm text-gray-500">
            Showing {maxItems} of {activities.length}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {displayedActivities.map((activity) => {
          const icon = actionIcons[activity.action as keyof typeof actionIcons] || actionIcons.default
          const colorClass = actionColors[activity.action as keyof typeof actionColors] || actionColors.default
          const description = getActionDescription(activity)

          return (
            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${colorClass}`}>
                {icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {description}
                    </p>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      {activity.link && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          via {activity.link.name || activity.link.code}
                        </span>
                      )}
                      
                      {activity.property?.price && (
                        <span className="text-xs text-gray-500">
                          ${activity.property.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                          View details
                        </summary>
                        <pre className="mt-1 text-xs text-gray-500 bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 ml-2">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {activities.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all {activities.length} activities →
          </button>
        </div>
      )}
    </div>
  )
}

export default ActivityFeed