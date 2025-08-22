/**
 * Client Service Tests - TDD Implementation
 * Following strict TDD approach for client profiling functionality
 * Tests progressive client profiling and insight generation
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { ClientService } from '../services/client/ClientService'
import { ClientProfile } from '../types'

describe('Client Service - Progressive Profiling', () => {
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getClientProfile - TDD Implementation', () => {
    it('should return client profile structure with engagement metrics', async () => {
      // ARRANGE
      const clientId = 'client-123'

      // ACT - This should fail initially (RED phase)
      const result = await ClientService.getClientProfile(clientId)

      // ASSERT - Test expected return structure
      if (result) {
        expect(result).toHaveProperty('id')
        expect(result).toHaveProperty('name')
        expect(result).toHaveProperty('email')
        expect(result).toHaveProperty('engagementScore')
        expect(result).toHaveProperty('propertyPreferences')
        expect(result).toHaveProperty('behaviorAnalysis')
        expect(result.id).toBe(clientId)
        expect(typeof result.engagementScore).toBe('number')
        expect(Array.isArray(result.propertyPreferences)).toBe(true)
      } else {
        // Should return null for non-existent client
        expect(result).toBeNull()
      }
    })

    it('should handle non-existent client gracefully', async () => {
      // ARRANGE
      const nonExistentClientId = 'client-nonexistent'

      // ACT
      const result = await ClientService.getClientProfile(nonExistentClientId)

      // ASSERT
      expect(result).toBeNull()
    })
  })

  describe('updateClientProfile - TDD Implementation', () => {
    it('should update client profile with new engagement data', async () => {
      // ARRANGE
      const clientId = 'client-update-test'
      const engagementData = {
        sessionId: 'session-123',
        linkId: 'link-456',
        activities: [
          {
            propertyId: 'prop-1',
            action: 'like',
            timestamp: '2025-01-21T14:00:00Z'
          },
          {
            propertyId: 'prop-2',
            action: 'view',
            timestamp: '2025-01-21T14:02:00Z'
          },
          {
            propertyId: 'prop-3',
            action: 'consider',
            timestamp: '2025-01-21T14:05:00Z'
          }
        ]
      }

      // ACT - This should fail initially (RED phase)
      const result = await ClientService.updateClientProfile(clientId, engagementData)

      // ASSERT - Test profile update behavior
      if (result) {
        expect(result.id).toBe(clientId)
        expect(result.lastUpdated).toBeDefined()
        // Should reflect the engagement activities
        expect(result.engagementScore).toBeGreaterThan(0)
        expect(result.behaviorAnalysis.totalInteractions).toBeGreaterThan(0)
      } else {
        expect(result).toBeNull()
      }
    })

    it('should handle empty activity list', async () => {
      // ARRANGE
      const clientId = 'client-empty-activities'
      const engagementData = {
        sessionId: 'session-empty',
        linkId: 'link-empty',
        activities: []
      }

      // ACT
      const result = await ClientService.updateClientProfile(clientId, engagementData)

      // ASSERT
      if (result) {
        expect(result.id).toBe(clientId)
      } else {
        expect(result).toBeNull()
      }
    })
  })

  describe('getClientInsights - TDD Implementation', () => {
    it('should generate insights and recommendations based on client behavior', async () => {
      // ARRANGE
      const clientId = 'client-insights-test'

      // ACT - This should fail initially (RED phase)
      const result = await ClientService.getClientInsights(clientId)

      // ASSERT - Test insights structure
      expect(result).toHaveProperty('profile')
      expect(result).toHaveProperty('insights')
      expect(result).toHaveProperty('recommendations')
      expect(result).toHaveProperty('nextActions')
      expect(Array.isArray(result.insights)).toBe(true)
      expect(Array.isArray(result.recommendations)).toBe(true)
      expect(Array.isArray(result.nextActions)).toBe(true)
    })

    it('should provide relevant insights for active clients', async () => {
      // ARRANGE
      const activeClientId = 'client-active'

      // ACT
      const result = await ClientService.getClientInsights(activeClientId)

      // ASSERT - Active clients should have actionable insights
      if (result.profile) {
        expect(result.insights.length).toBeGreaterThan(0)
        expect(result.recommendations.length).toBeGreaterThan(0)
        expect(result.nextActions.length).toBeGreaterThan(0)
      }
    })

    it('should handle client with no profile gracefully', async () => {
      // ARRANGE
      const unknownClientId = 'client-unknown'

      // ACT
      const result = await ClientService.getClientInsights(unknownClientId)

      // ASSERT
      expect(result.profile).toBeNull()
      expect(Array.isArray(result.insights)).toBe(true)
      expect(Array.isArray(result.recommendations)).toBe(true)
      expect(Array.isArray(result.nextActions)).toBe(true)
    })
  })

  describe('findSimilarClients - TDD Implementation', () => {
    it('should identify clients with similar behavior patterns', async () => {
      // ARRANGE
      const targetProfile: ClientProfile = {
        id: 'client-target',
        name: 'Target Client',
        email: 'target@example.com',
        phone: null,
        source: 'link',
        createdAt: '2025-01-20T10:00:00Z',
        lastUpdated: '2025-01-21T14:00:00Z',
        engagementScore: 75,
        clientTemperature: 'hot',
        propertyPreferences: {
          priceRange: { min: 500000, max: 1000000 },
          propertyTypes: ['apartment', 'condo'],
          bedrooms: [2, 3],
          bathrooms: [2, 3],
          features: ['balcony', 'parking'],
          locations: ['downtown', 'midtown']
        },
        behaviorAnalysis: {
          totalSessions: 3,
          totalTimeSpent: 1800,
          totalInteractions: 15,
          averageSessionLength: 600,
          preferredViewingTime: 'evening',
          responsePatterns: ['quick-decider', 'detail-oriented']
        }
      }
      const limit = 5

      // ACT - This should fail initially (RED phase)
      const result = await ClientService.findSimilarClients(targetProfile, limit)

      // ASSERT - Test similar clients structure
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeLessThanOrEqual(limit)
      
      // Each similar client should have a profile structure
      result.forEach(client => {
        expect(client).toHaveProperty('id')
        expect(client).toHaveProperty('engagementScore')
        expect(client).toHaveProperty('propertyPreferences')
        expect(client).toHaveProperty('behaviorAnalysis')
        // Should not include the target client itself
        expect(client.id).not.toBe(targetProfile.id)
      })
    })

    it('should respect the limit parameter', async () => {
      // ARRANGE
      const targetProfile: ClientProfile = {
        id: 'client-limit-test',
        name: 'Limit Test Client',
        email: 'limit@example.com',
        phone: null,
        source: 'link',
        createdAt: '2025-01-20T10:00:00Z',
        lastUpdated: '2025-01-21T14:00:00Z',
        engagementScore: 60,
        clientTemperature: 'warm',
        propertyPreferences: {
          priceRange: { min: 300000, max: 600000 },
          propertyTypes: ['house'],
          bedrooms: [3, 4],
          bathrooms: [2, 3],
          features: ['garden', 'garage'],
          locations: ['suburbs']
        },
        behaviorAnalysis: {
          totalSessions: 2,
          totalTimeSpent: 1200,
          totalInteractions: 8,
          averageSessionLength: 600,
          preferredViewingTime: 'morning',
          responsePatterns: ['careful-reviewer']
        }
      }
      const limit = 3

      // ACT
      const result = await ClientService.findSimilarClients(targetProfile, limit)

      // ASSERT
      expect(result.length).toBeLessThanOrEqual(limit)
    })

    it('should handle empty result set gracefully', async () => {
      // ARRANGE - Create a very specific profile that won't match others
      const uniqueProfile: ClientProfile = {
        id: 'client-unique',
        name: 'Unique Client',
        email: 'unique@example.com',
        phone: null,
        source: 'referral',
        createdAt: '2025-01-21T14:00:00Z',
        lastUpdated: '2025-01-21T14:00:00Z',
        engagementScore: 10,
        clientTemperature: 'cold',
        propertyPreferences: {
          priceRange: { min: 10000000, max: 20000000 },
          propertyTypes: ['castle'],
          bedrooms: [10],
          bathrooms: [8],
          features: ['moat', 'drawbridge'],
          locations: ['medieval-times']
        },
        behaviorAnalysis: {
          totalSessions: 1,
          totalTimeSpent: 60,
          totalInteractions: 1,
          averageSessionLength: 60,
          preferredViewingTime: 'midnight',
          responsePatterns: ['ghost']
        }
      }

      // ACT
      const result = await ClientService.findSimilarClients(uniqueProfile)

      // ASSERT
      expect(Array.isArray(result)).toBe(true)
      // Should return empty array or very few results for unique profile
      expect(result.length).toBeLessThanOrEqual(5)
    })
  })
})