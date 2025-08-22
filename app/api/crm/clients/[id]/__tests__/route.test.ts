/**
 * Client Management API Endpoint Tests
 * Following TDD principles and workplan requirements
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { GET, PATCH } from '../route'
import { setupTest } from '@/test/utils/testSetup.js'
import { SupabaseMockFactory } from '@/test/mocks/supabase.js'

// Mock dependencies
jest.mock('@/components/crm/services/client/ClientService', () => ({
  ClientService: {
    getClientById: jest.fn(),
    updateClient: jest.fn(),
    getClientEngagementHistory: jest.fn(),
    calculateClientTemperature: jest.fn()
  }
}))

jest.mock('@/lib/supabase/client')

describe('Client Management API Endpoints', () => {
  const { mockSupabase } = setupTest({
    suppressConsoleErrors: true,
    mockSupabase: true
  })

  const mockClient = {
    id: 'client-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    source: 'link',
    status: 'active',
    temperature: 'warm',
    engagementScore: 65,
    totalDeals: 2,
    activeDeals: 1,
    closedDealsValue: 250000,
    averageDealValue: 125000,
    lastActivityAt: '2023-01-15T10:30:00Z',
    preferences: {
      propertyTypes: ['apartment', 'condo'],
      priceRange: { min: 200000, max: 500000 },
      preferredAreas: ['downtown', 'midtown'],
      communicationPreference: 'email'
    },
    demographics: {
      ageRange: '30-40',
      income: 'high',
      family: 'couple',
      firstTimeBuyer: false
    },
    behaviorInsights: {
      averageSessionDuration: 420,
      likeToViewRatio: 0.35,
      mostActiveTimeOfDay: '19:00-21:00',
      devicePreference: 'mobile',
      engagementTrend: 'stable'
    },
    createdAt: '2022-12-01T00:00:00Z',
    updatedAt: '2023-01-15T10:30:00Z'
  }

  describe('GET /api/crm/clients/[id]', () => {
    it('should return client by ID successfully', async () => {
      const { ClientService } = require('@/components/crm/services/client/ClientService')
      ClientService.getClientById.mockResolvedValueOnce(mockClient)

      const request = new NextRequest('http://localhost/api/crm/clients/client-123')
      const response = await GET(request, { params: { id: 'client-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockClient)
      expect(ClientService.getClientById).toHaveBeenCalledWith('client-123')
    })

    it('should include client engagement history when requested', async () => {
      const { ClientService } = require('@/components/crm/services/client/ClientService')
      const engagementHistory = [
        {
          date: '2023-01-15',
          score: 65,
          activity: 'property_viewed',
          dealId: 'deal-123'
        },
        {
          date: '2023-01-14',
          score: 60,
          activity: 'link_accessed',
          dealId: 'deal-123'
        }
      ]

      ClientService.getClientById.mockResolvedValueOnce(mockClient)
      ClientService.getClientEngagementHistory.mockResolvedValueOnce(engagementHistory)

      const url = new URL('http://localhost/api/crm/clients/client-123')
      url.searchParams.set('includeEngagementHistory', 'true')
      
      const request = new NextRequest(url.toString())
      const response = await GET(request, { params: { id: 'client-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.client).toEqual(mockClient)
      expect(responseData.data.engagementHistory).toEqual(engagementHistory)
      expect(ClientService.getClientEngagementHistory).toHaveBeenCalledWith('client-123')
    })

    it('should return 404 when client not found', async () => {
      const { ClientService } = require('@/components/crm/services/client/ClientService')
      ClientService.getClientById.mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/crm/clients/nonexistent')
      const response = await GET(request, { params: { id: 'nonexistent' } })
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Client not found')
    })

    it('should return 400 when client ID is missing', async () => {
      const request = new NextRequest('http://localhost/api/crm/clients/')
      const response = await GET(request, { params: { id: '' } })
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Client ID is required')
    })

    it('should handle service errors gracefully', async () => {
      const { ClientService } = require('@/components/crm/services/client/ClientService')
      ClientService.getClientById.mockRejectedValueOnce(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost/api/crm/clients/client-123')
      const response = await GET(request, { params: { id: 'client-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Failed to fetch client')
      expect(responseData.message).toBe('Database connection failed')
    })
  })

  describe('PATCH /api/crm/clients/[id]', () => {
    beforeEach(() => {
      const { ClientService } = require('@/components/crm/services/client/ClientService')
      ClientService.updateClient.mockClear()
      ClientService.calculateClientTemperature.mockClear()
    })

    it('should update client basic information successfully', async () => {
      const { ClientService } = require('@/components/crm/services/client/ClientService')
      const updateData = {
        name: 'John Updated Doe',
        email: 'john.updated@example.com',
        phone: '+1987654321'
      }
      
      const updatedClient = { ...mockClient, ...updateData }
      ClientService.updateClient.mockResolvedValueOnce(updatedClient)

      const request = new NextRequest('http://localhost/api/crm/clients/client-123', {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      })

      const response = await PATCH(request, { params: { id: 'client-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.name).toBe('John Updated Doe')
      expect(responseData.data.email).toBe('john.updated@example.com')
      expect(responseData.message).toBe('Client updated successfully')
      expect(ClientService.updateClient).toHaveBeenCalledWith('client-123', updateData)
    })

    it('should update client preferences successfully', async () => {
      const { ClientService } = require('@/components/crm/services/client/ClientService')
      const updateData = {
        preferences: {
          propertyTypes: ['house', 'townhouse'],
          priceRange: { min: 300000, max: 600000 },
          preferredAreas: ['suburbs', 'waterfront'],
          communicationPreference: 'phone'
        }
      }
      
      const updatedClient = { 
        ...mockClient, 
        preferences: { ...mockClient.preferences, ...updateData.preferences }
      }
      ClientService.updateClient.mockResolvedValueOnce(updatedClient)

      const request = new NextRequest('http://localhost/api/crm/clients/client-123', {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      })

      const response = await PATCH(request, { params: { id: 'client-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.preferences.propertyTypes).toEqual(['house', 'townhouse'])
      expect(responseData.data.preferences.priceRange.max).toBe(600000)
    })

    it('should update client status and recalculate temperature', async () => {
      const { ClientService } = require('@/components/crm/services/client/ClientService')
      const updateData = {
        status: 'inactive'
      }
      
      const updatedClient = { ...mockClient, status: 'inactive', temperature: 'cold' }
      ClientService.updateClient.mockResolvedValueOnce(updatedClient)
      ClientService.calculateClientTemperature.mockResolvedValueOnce('cold')

      const request = new NextRequest('http://localhost/api/crm/clients/client-123', {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      })

      const response = await PATCH(request, { params: { id: 'client-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.status).toBe('inactive')
      expect(ClientService.calculateClientTemperature).toHaveBeenCalledWith('client-123')
    })

    it('should return 400 when client ID is missing', async () => {
      const request = new NextRequest('http://localhost/api/crm/clients/', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' })
      })

      const response = await PATCH(request, { params: { id: '' } })
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Client ID is required')
    })

    it('should validate email format', async () => {
      const request = new NextRequest('http://localhost/api/crm/clients/client-123', {
        method: 'PATCH',
        body: JSON.stringify({
          email: 'invalid-email'
        })
      })

      const response = await PATCH(request, { params: { id: 'client-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Invalid email format')
    })

    it('should validate phone number format', async () => {
      const request = new NextRequest('http://localhost/api/crm/clients/client-123', {
        method: 'PATCH',
        body: JSON.stringify({
          phone: '123'
        })
      })

      const response = await PATCH(request, { params: { id: 'client-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Invalid phone number format')
    })

    it('should handle update service errors gracefully', async () => {
      const { ClientService } = require('@/components/crm/services/client/ClientService')
      ClientService.updateClient.mockRejectedValueOnce(new Error('Database update failed'))

      const request = new NextRequest('http://localhost/api/crm/clients/client-123', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Updated Name'
        })
      })

      const response = await PATCH(request, { params: { id: 'client-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Failed to update client')
      expect(responseData.message).toBe('Database update failed')
    })

    it('should handle malformed JSON in request body', async () => {
      const request = new NextRequest('http://localhost/api/crm/clients/client-123', {
        method: 'PATCH',
        body: 'invalid-json{'
      })

      const response = await PATCH(request, { params: { id: 'client-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Invalid request body')
    })

    it('should handle empty update payload', async () => {
      const { ClientService } = require('@/components/crm/services/client/ClientService')
      ClientService.updateClient.mockResolvedValueOnce(mockClient)

      const request = new NextRequest('http://localhost/api/crm/clients/client-123', {
        method: 'PATCH',
        body: JSON.stringify({})
      })

      const response = await PATCH(request, { params: { id: 'client-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockClient)
    })
  })

  // Edge cases and integration tests
  describe('Edge Cases and Validation Tests', () => {
    it('should handle client not found during update', async () => {
      const { ClientService } = require('@/components/crm/services/client/ClientService')
      ClientService.updateClient.mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/crm/clients/nonexistent', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Updated Name'
        })
      })

      const response = await PATCH(request, { params: { id: 'nonexistent' } })
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Client not found')
    })

    it('should validate preferences data structure', async () => {
      const request = new NextRequest('http://localhost/api/crm/clients/client-123', {
        method: 'PATCH',
        body: JSON.stringify({
          preferences: {
            priceRange: { min: 'invalid', max: 500000 }
          }
        })
      })

      const response = await PATCH(request, { params: { id: 'client-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Invalid preferences data structure')
    })

    it('should handle concurrent update scenarios', async () => {
      const { ClientService } = require('@/components/crm/services/client/ClientService')
      ClientService.updateClient.mockRejectedValueOnce(new Error('Row was updated by another user'))

      const request = new NextRequest('http://localhost/api/crm/clients/client-123', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Concurrent Update'
        })
      })

      const response = await PATCH(request, { params: { id: 'client-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(409)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Concurrent update detected')
      expect(responseData.message).toBe('Row was updated by another user')
    })

    it('should validate client status transitions', async () => {
      const request = new NextRequest('http://localhost/api/crm/clients/client-123', {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'invalid-status'
        })
      })

      const response = await PATCH(request, { params: { id: 'client-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Invalid client status')
    })

    it('should handle large preference objects within limits', async () => {
      const { ClientService } = require('@/components/crm/services/client/ClientService')
      const largePreferences = {
        preferences: {
          propertyTypes: new Array(50).fill('apartment'),
          preferredAreas: new Array(100).fill('downtown'),
          additionalRequirements: 'A'.repeat(1000)
        }
      }
      
      const updatedClient = { ...mockClient, preferences: largePreferences.preferences }
      ClientService.updateClient.mockResolvedValueOnce(updatedClient)

      const request = new NextRequest('http://localhost/api/crm/clients/client-123', {
        method: 'PATCH',
        body: JSON.stringify(largePreferences)
      })

      const response = await PATCH(request, { params: { id: 'client-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
    })
  })
})