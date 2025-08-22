'use client'

import Link from 'next/link'
import { AgentNavigation } from '@/components/shared/AgentNavigation'
import { useState } from 'react'
import { useDashboardAnalytics, useRealTimeAnalytics } from '@/lib/query/useAnalyticsQuery'
import { ErrorBoundary } from '@/lib/errors/ErrorBoundary'
import MetricsCard from '@/components/analytics/MetricsCard'
import AnalyticsChart from '@/components/analytics/AnalyticsChart'
import ActivityFeed from '@/components/analytics/ActivityFeed'

export default function AnalyticsPage() {
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds
  const [isRealTime, setIsRealTime] = useState(false)

  // Always call both hooks, but only use one based on isRealTime flag
  const realTimeQuery = useRealTimeAnalytics(undefined, { 
    refetchInterval: isRealTime ? 5000 : undefined 
  })
  const dashboardQuery = useDashboardAnalytics({ 
    refetchInterval: !isRealTime ? refreshInterval : undefined 
  })

  // Use the appropriate query based on isRealTime flag
  const { 
    data: analyticsData, 
    isLoading, 
    error,
    refetch
  } = isRealTime ? realTimeQuery : dashboardQuery
  
  // Type the analytics data
  const data = analyticsData as any

  const handleRefreshIntervalChange = (interval: number) => {
    setRefreshInterval(interval)
    if (interval <= 5000) {
      setIsRealTime(true)
    } else {
      setIsRealTime(false)
    }
  }

  const getPropertyPerformanceData = () => {
    if (!analyticsData || typeof analyticsData !== 'object' || !('topProperties' in analyticsData)) return []
    const data = analyticsData as any
    if (!data.topProperties) return []
    return data.topProperties.slice(0, 5).map((item: any) => ({
      label: item.property.address.substring(0, 20) + '...',
      value: item.stats.views,
      color: item.stats.likeRate > 0.5 ? 'bg-green-500' : item.stats.likeRate > 0.3 ? 'bg-yellow-500' : 'bg-red-500'
    }))
  }

  const getLinkPerformanceData = () => {
    if (!analyticsData || typeof analyticsData !== 'object' || !('linkPerformance' in analyticsData)) return []
    const data = analyticsData as any
    if (!data.linkPerformance) return []
    return data.linkPerformance.slice(0, 5).map((item: any) => ({
      label: item.link.name || item.link.code,
      value: item.stats.views,
      color: 'bg-blue-500'
    }))
  }

  const getEngagementData = () => {
    if (!analyticsData || typeof analyticsData !== 'object' || !('overview' in analyticsData)) return []
    const data = analyticsData as any
    if (!data.overview) return []
    const { overview } = data
    return [
      { label: 'Views', value: overview.totalViews, color: 'bg-blue-500' },
      { label: 'Sessions', value: overview.totalSessions, color: 'bg-green-500' },
      { label: 'Properties', value: overview.totalProperties, color: 'bg-purple-500' },
      { label: 'Links', value: overview.totalLinks, color: 'bg-yellow-500' }
    ]
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-gray-900">
                  SwipeLink Estate
                </Link>
                <span className="ml-4 text-sm text-gray-500">Analytics Dashboard</span>
              </div>
              <AgentNavigation />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Controls */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Track property engagement and client interactions
                {isRealTime && <span className="text-green-600 ml-2">🔄 Real-time</span>}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="refresh-interval" className="text-sm text-gray-600">
                  Refresh:
                </label>
                <select
                  id="refresh-interval"
                  value={refreshInterval}
                  onChange={(e) => handleRefreshIntervalChange(Number(e.target.value))}
                  className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={5000}>5s (Real-time)</option>
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                  <option value={60000}>1m</option>
                  <option value={300000}>5m</option>
                </select>
              </div>
              
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {isLoading ? 'Refreshing...' : 'Refresh Now'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="text-red-400">⚠️</div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Failed to load analytics data
                  </h3>
                  <p className="mt-2 text-sm text-red-700">
                    {error instanceof Error ? error.message : 'Unknown error occurred'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricsCard
              title="Total Views"
              value={data?.overview?.totalViews || 0}
              subtitle="All-time property views"
              icon="👁️"
              isLoading={isLoading}
            />
            <MetricsCard
              title="Active Sessions"
              value={data?.overview?.totalSessions || 0}
              subtitle={`${Math.round(data?.overview?.avgSessionDuration || 0)}s avg duration`}
              icon="⏱️"
              isLoading={isLoading}
            />
            <MetricsCard
              title="Properties"
              value={data?.overview?.totalProperties || 0}
              subtitle={`${data?.overview?.activeProperties || 0} active`}
              icon="🏠"
              isLoading={isLoading}
            />
            <MetricsCard
              title="Shared Links"
              value={data?.overview?.totalLinks || 0}
              subtitle="Total link shares"
              icon="🔗"
              isLoading={isLoading}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <AnalyticsChart
              title="Top Properties by Views"
              data={getPropertyPerformanceData()}
              type="bar"
            />
            <AnalyticsChart
              title="Link Performance"
              data={getLinkPerformanceData()}
              type="bar"
            />
          </div>

          {/* Engagement Overview & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <AnalyticsChart
              title="Engagement Overview"
              data={getEngagementData()}
              type="pie"
            />
            
            <ActivityFeed
              activities={data?.recentActivity || []}
              title="Recent Activity"
              maxItems={8}
            />
          </div>

          {/* Performance Tables */}
          {data?.topProperties && data.topProperties.length > 0 && (
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Top Performing Properties</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Likes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Like Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.topProperties.slice(0, 10).map((item: any, index: number) => (
                      <tr key={item.property.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.property.address}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.property.price ? `$${item.property.price.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.stats.views}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.stats.likes}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-gray-900">
                              {(item.stats.likeRate * 100).toFixed(1)}%
                            </div>
                            <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${item.stats.likeRate * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!analyticsData && !isLoading && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">No Analytics Data</h2>
              <p className="text-gray-600 mb-4">
                Start getting views and interactions to see analytics data here.
              </p>
              <Link 
                href="/dashboard" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Your First Link
              </Link>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  )
}