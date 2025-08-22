import React from 'react'
import type { ClientProfile } from '../../../types'
import { InfoCard } from '../InfoCard'
import { MetricCard } from '../MetricCard'

interface OverviewTabProps {
  profile: ClientProfile
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ profile }) => (
  <div className="space-y-6">
    {/* Contact Information */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard label="Email" value={profile.email || 'Not provided'} icon="📧" />
        <InfoCard label="Phone" value={profile.phone || 'Not provided'} icon="📱" />
        <InfoCard label="Location" value={profile.location || 'Unknown'} icon="📍" />
        <InfoCard label="Source" value={profile.source || 'Direct'} icon="🔗" />
      </div>
    </div>

    {/* Key Metrics */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Engagement Score"
          value={`${profile.engagementScore}/100`}
          color="blue"
        />
        <MetricCard
          label="Active Deals"
          value={profile.activeDeals.toString()}
          color="blue"
        />
        <MetricCard
          label="Like Rate"
          value={`${Math.round(profile.likeRate * 100)}%`}
          color="green"
        />
      </div>
    </div>

    {/* Timeline */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-600">First Seen:</span>
            <span className="ml-2 font-medium">{new Date(profile.firstSeen).toLocaleDateString()}</span>
          </div>
          {profile.lastSeen && (
            <div>
              <span className="text-sm text-gray-600">Last Activity:</span>
              <span className="ml-2 font-medium">{new Date(profile.lastSeen).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Tags */}
    {profile.tags.length > 0 && (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {profile.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
)