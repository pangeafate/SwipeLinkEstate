'use client'

import React from 'react'
import { DealCard, DealCardList, DealCardGrid } from '@/components/crm/components/DealCard'
import type { Deal } from '@/components/crm/types'

const mockDeals: Deal[] = [
  {
    id: 'deal-1',
    linkId: 'link-123',
    agentId: 'agent-456',
    dealName: 'Downtown Condo Deal',
    dealStatus: 'active',
    dealStage: 'qualified',
    dealValue: 150000,
    clientId: 'client-789',
    clientName: 'John Doe',
    clientEmail: 'john.doe@example.com',
    clientPhone: '+1-555-0123',
    clientTemperature: 'hot',
    propertyIds: ['prop-1', 'prop-2', 'prop-3'],
    propertyCount: 3,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    lastActivityAt: '2024-01-20T15:30:00Z',
    engagementScore: 85,
    sessionCount: 12,
    totalTimeSpent: 3600,
    nextFollowUp: '2024-01-25T09:00:00Z',
    notes: 'Highly engaged client, ready to close soon',
    tags: ['VIP', 'Hot Lead', 'Luxury', 'Referral']
  },
  {
    id: 'deal-2',
    linkId: 'link-456',
    agentId: 'agent-456',
    dealName: 'Suburban House Deal',
    dealStatus: 'nurturing',
    dealStage: 'engaged',
    dealValue: 75000,
    clientId: 'client-012',
    clientName: 'Jane Smith',
    clientEmail: 'jane.smith@example.com',
    clientPhone: '+1-555-0456',
    clientTemperature: 'warm',
    propertyIds: ['prop-4'],
    propertyCount: 1,
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
    lastActivityAt: '2024-01-18T11:20:00Z',
    engagementScore: 67,
    sessionCount: 8,
    totalTimeSpent: 2400,
    nextFollowUp: '2024-02-01T10:00:00Z',
    notes: 'Interested client, good potential',
    tags: ['First Time Buyer', 'Warm Lead']
  },
  {
    id: 'deal-3',
    linkId: 'link-789',
    agentId: 'agent-456',
    dealName: 'Beachfront Property',
    dealStatus: 'closed-won',
    dealStage: 'closed',
    dealValue: 250000,
    clientId: 'client-345',
    clientName: 'Mike Johnson',
    clientEmail: 'mike.johnson@example.com',
    clientPhone: '+1-555-0789',
    clientTemperature: 'hot',
    propertyIds: ['prop-5', 'prop-6'],
    propertyCount: 2,
    createdAt: '2024-01-12T09:30:00Z',
    updatedAt: '2024-01-19T16:45:00Z',
    lastActivityAt: '2024-01-19T16:45:00Z',
    engagementScore: 95,
    sessionCount: 15,
    totalTimeSpent: 4500,
    nextFollowUp: null,
    notes: 'Deal closed successfully!',
    tags: ['Closed Deal', 'Success Story']
  }
]

export default function TestRefactoredComponents() {
  const handleDealClick = (deal: Deal) => {
    console.log('Deal clicked:', deal.dealName)
  }

  const handleQuickAction = (deal: Deal, action: string) => {
    console.log(`${action} action for:`, deal.dealName)
  }

  const handleCardQuickAction = (action: string) => {
    console.log(`Card action:`, action)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Refactored CRM Components Demo
        </h1>
        
        <div className="space-y-12">
          {/* Single Deal Card */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Single Deal Card
            </h2>
            <div className="max-w-md">
              <DealCard 
                deal={mockDeals[0]}
                onClick={() => handleDealClick(mockDeals[0])}
                onQuickAction={handleCardQuickAction}
              />
            </div>
          </section>

          {/* Compact Deal Card */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Compact Deal Card
            </h2>
            <div className="max-w-md">
              <DealCard 
                deal={mockDeals[1]}
                compact
                onClick={() => handleDealClick(mockDeals[1])}
                onQuickAction={handleCardQuickAction}
              />
            </div>
          </section>

          {/* Deal Card List */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Deal Card List
            </h2>
            <div className="max-w-2xl">
              <DealCardList
                deals={mockDeals}
                onDealClick={handleDealClick}
                onQuickAction={handleQuickAction}
              />
            </div>
          </section>

          {/* Deal Card Grid */}
          <section>
            <h2 className="text-2xl font-semibent text-gray-800 mb-4">
              Deal Card Grid (3 columns)
            </h2>
            <DealCardGrid
              deals={mockDeals}
              columns={3}
              onDealClick={handleDealClick}
              onQuickAction={handleQuickAction}
            />
          </section>

          {/* Loading States */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Loading States
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">List Loading</h3>
                <div className="max-w-2xl">
                  <DealCardList deals={[]} loading />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Grid Loading</h3>
                <DealCardGrid deals={[]} loading columns={3} />
              </div>
            </div>
          </section>

          {/* Empty States */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Empty States
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Empty List</h3>
                <div className="max-w-2xl">
                  <DealCardList 
                    deals={[]} 
                    emptyMessage="No active deals found"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Empty Grid</h3>
                <DealCardGrid deals={[]} columns={3} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}