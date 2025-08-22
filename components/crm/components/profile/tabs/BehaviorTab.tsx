import React from 'react'
import type { ClientProfile } from '../../../types'

interface BehaviorTabProps {
  profile: ClientProfile
}

export const BehaviorTab: React.FC<BehaviorTabProps> = ({ profile }) => (
  <div className="space-y-6">
    {/* Activity Patterns */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Patterns</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Most Active Time</div>
          <div className="font-medium">{profile.mostActiveHour || 'Not enough data'}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Preferred Device</div>
          <div className="font-medium">{profile.preferredDevice || 'Unknown'}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Session Duration</div>
          <div className="font-medium">{profile.avgSessionDuration || 'Unknown'}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Interaction Style</div>
          <div className="font-medium">{profile.interactionStyle || 'Browsing'}</div>
        </div>
      </div>
    </div>

    {/* Engagement History */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement History</h3>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{profile.totalViews || 0}</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{profile.totalLikes || 0}</div>
            <div className="text-sm text-gray-600">Total Likes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{profile.totalShares || 0}</div>
            <div className="text-sm text-gray-600">Total Shares</div>
          </div>
        </div>
      </div>
    </div>

    {/* Recent Activity */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {profile.recentActivities?.length ? (
          profile.recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-white border rounded-lg">
              <span className="text-blue-600 mt-1">•</span>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No recent activity recorded</p>
        )}
      </div>
    </div>
  </div>
)