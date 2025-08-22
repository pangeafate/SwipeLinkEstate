/**
 * Individual Deal API Endpoint Tests
 * Following TDD principles and workplan requirements
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { GET, PATCH, DELETE } from '../route'
import { setupTest } from '@/test/utils/testSetup.js'
import { SupabaseMockFactory } from '@/test/mocks/supabase.js'

// Mock dependencies
jest.mock('@/components/crm/deal.service', () => ({
  DealService: {
    getDealById: jest.fn(),
    progressDealStage: jest.fn(),
    updateDealStatus: jest.fn()
  }
}))

jest.mock('@/lib/supabase/client')

describe('Individual Deal API Endpoints', () => {
  const { mockSupabase } = setupTest({
    suppressConsoleErrors: true,
    mockSupabase: true
  })

  const mockDeal = {
    id: 'deal-123',
    linkId: 'link-123',
    linkCode: 'ABC123',
    agentId: 'agent-456',
    dealName: 'Downtown Condos Collection',
    dealNumber: 'DEAL-001',
    dealStatus: 'active',
    dealStage: 'created',
    dealValue: 7500,
    clientId: 'client-789',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    clientPhone: '+1234567890',
    clientSource: 'link',
    clientTemperature: 'warm',
    propertyIds: ['prop-1', 'prop-2'],
    propertyCount: 2,
    averagePropertyValue: 250000,
    engagementScore: 65,
    sessionCount: 3,
    totalTimeSpent: 1800,
    lastEngagementAt: '2023-01-15T10:30:00Z',
    estimatedClosingValue: 500000,
    commissionRate: 2.5,
    estimatedCommission: 12500,
    expectedCloseDate: '2023-03-15T00:00:00Z',
    actualCloseDate: null,
    daysSinceCreated: 30,
    daysSinceLastActivity: 2,
    nextFollowUpDate: '2023-01-20T00:00:00Z',
    nextFollowUpType: 'call',
    pendingTasksCount: 2,
    completedTasksCount: 5,
    priority: 'high',
    notes: 'High potential client, showed strong interest',
    tags: ['first-time-buyer', 'downtown-preferred'],
    isArchived: false,
    stageHistory: [],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-15T10:30:00Z'
  }

  describe('GET /api/crm/deals/[id]', () => {
    it('should return deal by ID successfully', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      DealService.getDealById.mockResolvedValueOnce(mockDeal)

      const request = new NextRequest('http://localhost/api/crm/deals/deal-123')
      const response = await GET(request, { params: { id: 'deal-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockDeal)
      expect(DealService.getDealById).toHaveBeenCalledWith('deal-123')
    })

    it('should return 404 when deal not found', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      DealService.getDealById.mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/crm/deals/nonexistent')
      const response = await GET(request, { params: { id: 'nonexistent' } })
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Deal not found')
      expect(DealService.getDealById).toHaveBeenCalledWith('nonexistent')
    })

    it('should return 400 when deal ID is missing', async () => {
      const request = new NextRequest('http://localhost/api/crm/deals/')
      const response = await GET(request, { params: { id: '' } })
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Deal ID is required')
    })

    it('should handle service errors gracefully', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      DealService.getDealById.mockRejectedValueOnce(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost/api/crm/deals/deal-123')
      const response = await GET(request, { params: { id: 'deal-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Failed to fetch deal')
      expect(responseData.message).toBe('Database connection failed')
    })
  })

  describe('PATCH /api/crm/deals/[id]', () => {
    beforeEach(() => {
      const { supabase } = require('@/lib/supabase/client')
      supabase.from = SupabaseMockFactory.createSuccessMock([mockDeal]).from
    })

    it('should update deal stage successfully', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      const updatedDeal = { ...mockDeal, dealStage: 'qualified' }
      DealService.progressDealStage.mockResolvedValueOnce(updatedDeal)

      const request = new NextRequest('http://localhost/api/crm/deals/deal-123', {
        method: 'PATCH',
        body: JSON.stringify({
          dealStage: 'qualified'
        })
      })

      const response = await PATCH(request, { params: { id: 'deal-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.dealStage).toBe('qualified')
      expect(responseData.message).toBe('Deal updated successfully')
      expect(DealService.progressDealStage).toHaveBeenCalledWith('deal-123', 'qualified')
    })

    it('should update deal status successfully', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      const updatedDeal = { ...mockDeal, dealStatus: 'nurturing' }
      DealService.updateDealStatus.mockResolvedValueOnce(updatedDeal)

      const request = new NextRequest('http://localhost/api/crm/deals/deal-123', {
        method: 'PATCH',
        body: JSON.stringify({
          dealStatus: 'nurturing'
        })
      })

      const response = await PATCH(request, { params: { id: 'deal-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.dealStatus).toBe('nurturing')
      expect(DealService.updateDealStatus).toHaveBeenCalledWith('deal-123', 'nurturing')
    })

    it('should update deal notes and tags successfully', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      const updatedDeal = { 
        ...mockDeal, 
        notes: 'Updated notes',
        tags: ['updated-tag', 'priority-client']
      }
      DealService.getDealById.mockResolvedValueOnce(updatedDeal)

      const request = new NextRequest('http://localhost/api/crm/deals/deal-123', {
        method: 'PATCH',
        body: JSON.stringify({
          notes: 'Updated notes',
          tags: ['updated-tag', 'priority-client']
        })
      })

      const response = await PATCH(request, { params: { id: 'deal-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.notes).toBe('Updated notes')
      expect(responseData.data.tags).toEqual(['updated-tag', 'priority-client'])
    })

    it('should update client information successfully', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      const { supabase } = require('@/lib/supabase/client')
      
      const updatedDeal = {
        ...mockDeal,
        clientName: 'Jane Doe',
        clientEmail: 'jane@example.com',
        clientPhone: '+1987654321'
      }
      DealService.getDealById.mockResolvedValueOnce(updatedDeal)

      // Mock client search and creation
      supabase.from.mockImplementation((table) => {
        if (table === 'clients') {
          return {
            select: () => ({
              or: jest.fn().mockResolvedValueOnce({
                data: [], // No existing client
                error: null
              })
            }),
            insert: () => ({
              select: () => ({
                single: jest.fn().mockResolvedValueOnce({
                  data: { id: 'new-client-id', name: 'Jane Doe' },
                  error: null
                })
              })
            })
          }
        }
        return SupabaseMockFactory.createSuccessMock([mockDeal]).from(table)
      })

      const request = new NextRequest('http://localhost/api/crm/deals/deal-123', {
        method: 'PATCH',
        body: JSON.stringify({
          clientName: 'Jane Doe',
          clientEmail: 'jane@example.com',
          clientPhone: '+1987654321'
        })
      })

      const response = await PATCH(request, { params: { id: 'deal-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
    })

    it('should return 400 for invalid deal stage', async () => {
      const request = new NextRequest('http://localhost/api/crm/deals/deal-123', {
        method: 'PATCH',
        body: JSON.stringify({
          dealStage: 'invalid-stage'
        })
      })

      const response = await PATCH(request, { params: { id: 'deal-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Invalid deal stage')
    })

    it('should return 400 for invalid deal status', async () => {
      const request = new NextRequest('http://localhost/api/crm/deals/deal-123', {
        method: 'PATCH',
        body: JSON.stringify({
          dealStatus: 'invalid-status'
        })
      })

      const response = await PATCH(request, { params: { id: 'deal-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Invalid deal status')
    })

    it('should return 400 when deal ID is missing', async () => {
      const request = new NextRequest('http://localhost/api/crm/deals/', {
        method: 'PATCH',
        body: JSON.stringify({ dealStage: 'qualified' })
      })

      const response = await PATCH(request, { params: { id: '' } })
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Deal ID is required')
    })

    it('should handle update errors gracefully', async () => {
      const { supabase } = require('@/lib/supabase/client')
      supabase.from.mockImplementation(() => ({
        update: () => ({
          eq: () => ({
            select: () => ({
              single: jest.fn().mockRejectedValueOnce(new Error('Update failed'))
            })
          })
        })
      }))

      const request = new NextRequest('http://localhost/api/crm/deals/deal-123', {
        method: 'PATCH',
        body: JSON.stringify({
          notes: 'Test update'
        })
      })

      const response = await PATCH(request, { params: { id: 'deal-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Failed to update deal')
    })
  })

  describe('DELETE /api/crm/deals/[id]', () => {
    beforeEach(() => {
      const { supabase } = require('@/lib/supabase/client')
      supabase.from = SupabaseMockFactory.createSuccessMock([mockDeal]).from
    })

    it('should soft delete deal successfully', async () => {
      const request = new NextRequest('http://localhost/api/crm/deals/deal-123', {
        method: 'DELETE'
      })

      const response = await DELETE(request, { params: { id: 'deal-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.message).toBe('Deal deleted successfully')

      // Verify it was a soft delete (status changed to closed-lost)
      const { supabase } = require('@/lib/supabase/client')
      expect(supabase.from).toHaveBeenCalledWith('links')
    })

    it('should return 400 when deal ID is missing', async () => {
      const request = new NextRequest('http://localhost/api/crm/deals/', {
        method: 'DELETE'
      })

      const response = await DELETE(request, { params: { id: '' } })
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Deal ID is required')
    })

    it('should handle delete errors gracefully', async () => {
      const { supabase } = require('@/lib/supabase/client')
      supabase.from.mockImplementation(() => ({
        update: () => ({
          eq: () => ({
            select: () => ({
              single: jest.fn().mockRejectedValueOnce(new Error('Delete failed'))
            })
          })
        })
      }))

      const request = new NextRequest('http://localhost/api/crm/deals/deal-123', {
        method: 'DELETE'
      })

      const response = await DELETE(request, { params: { id: 'deal-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Failed to delete deal')
      expect(responseData.message).toBe('Delete failed')
    })

    it('should handle database update errors', async () => {
      const { supabase } = require('@/lib/supabase/client')
      supabase.from.mockImplementation(() => ({
        update: () => ({
          eq: () => ({
            select: () => ({
              single: jest.fn().mockResolvedValueOnce({
                data: null,
                error: { message: 'Deal not found' }
              })
            })
          })
        })
      }))

      const request = new NextRequest('http://localhost/api/crm/deals/nonexistent', {
        method: 'DELETE'
      })

      const response = await DELETE(request, { params: { id: 'nonexistent' } })
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Failed to delete deal')
    })
  })

  // Edge case and integration tests
  describe('Edge Cases and Integration Tests', () => {
    it('should handle malformed JSON in PATCH request', async () => {
      const request = new NextRequest('http://localhost/api/crm/deals/deal-123', {
        method: 'PATCH',
        body: 'invalid-json{'
      })

      const response = await PATCH(request, { params: { id: 'deal-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Failed to update deal')
    })

    it('should handle concurrent update conflicts', async () => {
      const { supabase } = require('@/lib/supabase/client')
      supabase.from.mockImplementation(() => ({
        update: () => ({
          eq: () => ({
            select: () => ({
              single: jest.fn().mockRejectedValueOnce(new Error('Row was updated by another user'))
            })
          })
        })
      }))

      const request = new NextRequest('http://localhost/api/crm/deals/deal-123', {
        method: 'PATCH',
        body: JSON.stringify({
          dealStage: 'qualified'
        })
      })

      const response = await PATCH(request, { params: { id: 'deal-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Failed to update deal')
      expect(responseData.message).toBe('Row was updated by another user')
    })

    it('should handle empty update payload', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      DealService.getDealById.mockResolvedValueOnce(mockDeal)

      const request = new NextRequest('http://localhost/api/crm/deals/deal-123', {
        method: 'PATCH',
        body: JSON.stringify({})
      })

      const response = await PATCH(request, { params: { id: 'deal-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockDeal)
      expect(DealService.getDealById).toHaveBeenCalledWith('deal-123')
    })
  })
})