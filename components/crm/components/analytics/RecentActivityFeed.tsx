import React from 'react'

/**
 * RecentActivityFeed - Recent activity display
 * Part of the modular CRMAnalytics component system.
 */

export interface RecentActivityFeedProps {
  activity: {
    newDeals: any[]
    completedTasks: any[]
    hotLeads: any[]
  }
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activity }) => {
  const allActivities = [
    ...activity.newDeals.map(deal => ({ type: 'deal', item: deal, timestamp: deal.createdAt })),
    ...activity.completedTasks.map(task => ({ type: 'task', item: task, timestamp: task.completedAt })),
    ...activity.hotLeads.map(lead => ({ type: 'lead', item: lead, timestamp: lead.updatedAt }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

  if (allActivities.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No recent activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {allActivities.map((activity, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-lg">
            {activity.type === 'deal' && '📊'}
            {activity.type === 'task' && '✅'}
            {activity.type === 'lead' && '🔥'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {activity.type === 'deal' && `New deal: ${activity.item.dealName || 'Unnamed Deal'}`}
              {activity.type === 'task' && `Completed: ${activity.item.title || 'Task'}`}
              {activity.type === 'lead' && `Hot lead: ${activity.item.clientName || 'Client'}`}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(activity.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}