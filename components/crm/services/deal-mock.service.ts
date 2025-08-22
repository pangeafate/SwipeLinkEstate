/**
 * Deal Mock Data Service
 * Provides mock deals for development and testing
 * Extracted from main DealService to maintain file size limits
 */

import type { Deal } from '../types'

export class DealMockService {
  /**
   * Generate mock deals for development
   */
  static generateMockDeals(): Deal[] {
    const now = new Date()
    
    return [
      {
        id: 'deal-1',
        linkId: 'link-1',
        agentId: 'current-agent',
        dealName: 'Luxury Downtown Collection - 5 properties',
        dealStatus: 'qualified',
        dealStage: 'engaged',
        dealValue: 45000,
        clientId: 'client-1',
        clientName: 'Sarah Johnson',
        clientEmail: 'sarah.j@example.com',
        clientPhone: '+1 (555) 123-4567',
        clientTemperature: 'hot',
        propertyIds: ['prop-1', 'prop-2', 'prop-3', 'prop-4', 'prop-5'],
        propertyCount: 5,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        lastActivityAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        engagementScore: 85,
        sessionCount: 3,
        totalTimeSpent: 1800,
        nextFollowUp: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Very interested in downtown properties. Prefers modern architecture.',
        tags: ['luxury', 'downtown', 'urgent']
      },
      {
        id: 'deal-2',
        linkId: 'link-2',
        agentId: 'current-agent',
        dealName: 'Family Homes Collection - 8 properties',
        dealStatus: 'active',
        dealStage: 'accessed',
        dealValue: 25000,
        clientId: 'client-2',
        clientName: 'Mike Chen',
        clientEmail: 'mike.chen@example.com',
        clientPhone: '+1 (555) 234-5678',
        clientTemperature: 'warm',
        propertyIds: ['prop-6', 'prop-7', 'prop-8'],
        propertyCount: 8,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        lastActivityAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        engagementScore: 60,
        sessionCount: 2,
        totalTimeSpent: 900,
        nextFollowUp: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Looking for family-friendly neighborhoods with good schools.',
        tags: ['family', 'schools']
      },
      {
        id: 'deal-3',
        linkId: 'link-3',
        agentId: 'current-agent',
        dealName: 'Investment Properties - 3 properties',
        dealStatus: 'active',
        dealStage: 'created',
        dealValue: 35000,
        clientId: null,
        clientName: null,
        clientEmail: null,
        clientPhone: null,
        clientTemperature: 'cold',
        propertyIds: ['prop-14', 'prop-15', 'prop-16'],
        propertyCount: 3,
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        lastActivityAt: null,
        engagementScore: 0,
        sessionCount: 0,
        totalTimeSpent: 0,
        nextFollowUp: null,
        notes: null,
        tags: ['investment']
      }
    ]
  }
}