// DashboardStats.tsx - Dashboard statistics overview component
import React from 'react'

interface DashboardStatsProps {
  analytics: any
  properties: any[]
  links: any[]
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ analytics, properties, links }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm font-medium text-gray-500 mb-1">Total Properties</div>
        <div className="text-2xl font-bold text-gray-900">
          {analytics?.overview?.totalProperties || properties.length}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {analytics?.overview?.activeProperties || properties?.filter(p => p.status === 'active')?.length || 0} active
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm font-medium text-gray-500 mb-1">Active Links</div>
        <div className="text-2xl font-bold text-gray-900">
          {analytics?.overview?.totalLinks || links.length || 0}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm font-medium text-gray-500 mb-1">Total Views</div>
        <div className="text-2xl font-bold text-gray-900">
          {analytics?.overview?.totalViews || 0}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm font-medium text-gray-500 mb-1">Total Sessions</div>
        <div className="text-2xl font-bold text-gray-900">
          {analytics?.overview?.totalSessions || 0}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {Math.round(analytics?.overview?.avgSessionDuration || 0)}s avg
        </div>
      </div>
    </div>
  )
}