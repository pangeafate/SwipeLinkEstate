'use client'

import React, { useState, useEffect } from 'react'
import type { ClientProfile as ClientProfileType } from '../types'
import { ClientService } from '../client.service'
import { ClientAvatar } from './profile/ClientAvatar'
import { ClientTemperatureBadge } from './profile/ClientTemperatureBadge'
import { ClientProfileSkeleton } from './profile/ClientProfileSkeleton'
import { OverviewTab } from './profile/tabs/OverviewTab'
import { PreferencesTab } from './profile/tabs/PreferencesTab'
import { BehaviorTab } from './profile/tabs/BehaviorTab'
import { InsightsTab } from './profile/tabs/InsightsTab'

interface ClientProfileProps {
  clientId: string
  onClose?: () => void
}

const ClientProfile: React.FC<ClientProfileProps> = ({ clientId, onClose }) => {
  const [profile, setProfile] = useState<ClientProfileType | null>(null)
  const [insights, setInsights] = useState<{
    insights: string[]
    recommendations: string[]
    nextActions: string[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'preferences' | 'behavior' | 'insights'>('overview')

  useEffect(() => {
    loadClientData()
  }, [clientId])

  const loadClientData = async () => {
    try {
      setLoading(true)
      setError(null)

      const clientInsights = await ClientService.getClientInsights(clientId)
      setProfile(clientInsights.profile)
      setInsights({
        insights: clientInsights.insights,
        recommendations: clientInsights.recommendations,
        nextActions: clientInsights.nextActions
      })

    } catch (err) {
      console.error('Error loading client profile:', err)
      setError('Failed to load client profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <ClientProfileSkeleton onClose={onClose} />
  }

  if (error || !profile) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Client Profile</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="text-center py-8">
          <p className="text-red-600">{error || 'Client profile not found'}</p>
          <button
            onClick={loadClientData}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <ClientAvatar profile={profile} />
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {profile.name || 'Anonymous Client'}
            </h2>
            <div className="flex items-center space-x-3 mt-1">
              <ClientTemperatureBadge temperature={profile.temperature} />
              <span className="text-sm text-gray-600">
                Score: {profile.engagementScore}/100
              </span>
            </div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { key: 'overview', label: 'Overview', icon: '👤' },
            { key: 'preferences', label: 'Preferences', icon: '❤️' },
            { key: 'behavior', label: 'Behavior', icon: '📊' },
            { key: 'insights', label: 'AI Insights', icon: '🧠' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`
                flex items-center space-x-2 py-4 border-b-2 font-medium text-sm
                ${activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && <OverviewTab profile={profile} />}
        {activeTab === 'preferences' && <PreferencesTab profile={profile} />}
        {activeTab === 'behavior' && <BehaviorTab profile={profile} />}
        {activeTab === 'insights' && insights && <InsightsTab insightsData={insights} />}
      </div>
    </div>
  )
}

export default ClientProfile