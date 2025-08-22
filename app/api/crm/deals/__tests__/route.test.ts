/**
 * CRM Deals API Endpoint Tests
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock the dependencies
jest.mock('@/components/crm/deal.service', () => ({
  DealService: {
    getDeals: jest.fn(),
    createDealFromLink: jest.fn()
  }
}))

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn()
      }))
    }))
  }
}))

describe('CRM Deals API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/crm/deals', () => {
    it('should return deals with default pagination', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      
      const mockDeals = [
        {
          id: 'deal-1',
          dealName: 'Test Deal',
          dealStatus: 'active',
          engagementScore: 75
        }
      ]
      
      DealService.getDeals.mockResolvedValueOnce({
        data: mockDeals,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1
        }
      })
      
      const request = new NextRequest('http://localhost/api/crm/deals')
      const response = await GET(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockDeals)
      expect(DealService.getDeals).toHaveBeenCalledWith({}, 1, 20)
    })

    it('should handle query parameters for filtering', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      
      DealService.getDeals.mockResolvedValueOnce({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      })
      
      const url = new URL('http://localhost/api/crm/deals')
      url.searchParams.set('status', 'active,qualified')
      url.searchParams.set('search', 'test')
      url.searchParams.set('page', '2')
      url.searchParams.set('limit', '10')
      
      const request = new NextRequest(url.toString())
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      expect(DealService.getDeals).toHaveBeenCalledWith({
        status: ['active', 'qualified'],
        search: 'test'
      }, 2, 10)
    })

    it('should handle errors gracefully and return mock data', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      
      DealService.getDeals.mockRejectedValueOnce(new Error('Database error'))
      
      const request = new NextRequest('http://localhost/api/crm/deals')
      const response = await GET(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(200) // Should still return success with mock data
      expect(responseData.success).toBe(true)
      expect(Array.isArray(responseData.data)).toBe(true)
    })
  })

  describe('POST /api/crm/deals', () => {
    it('should create deal from link successfully', async () => {
      const { supabase } = require('@/lib/supabase/client')
      const { DealService } = require('@/components/crm/deal.service')
      
      const mockLink = {
        id: 'link-1',
        name: 'Test Collection',
        property_ids: ['prop-1', 'prop-2'],
        created_at: '2023-01-01T00:00:00Z'
      }
      
      const mockProperties = [
        { id: 'prop-1', price: 100000 },
        { id: 'prop-2', price: 150000 }
      ]
      
      const mockDeal = {
        id: 'link-1',
        dealName: 'Test Collection',
        dealValue: 7500,
        dealStatus: 'active'
      }
      
      // Mock supabase calls
      supabase.from.mockImplementation((table) => {
        if (table === 'links') {
          return {
            select: () => ({
              eq: () => ({
                single: jest.fn().mockResolvedValueOnce({
                  data: mockLink,
                  error: null
                })
              })
            }),
            update: () => ({
              eq: jest.fn().mockResolvedValueOnce({
                data: mockLink,
                error: null
              })
            })
          }
        } else if (table === 'properties') {
          return {
            select: () => ({
              in: jest.fn().mockResolvedValueOnce({
                data: mockProperties,
                error: null
              })
            })
          }
        }
      })
      
      DealService.createDealFromLink.mockResolvedValueOnce(mockDeal)
      
      const request = new NextRequest('http://localhost/api/crm/deals', {
        method: 'POST',
        body: JSON.stringify({
          linkId: 'link-1',
          agentId: 'agent-1',
          clientInfo: {
            name: 'John Doe',
            email: 'john@example.com'
          }
        })
      })
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockDeal)
      expect(DealService.createDealFromLink).toHaveBeenCalledWith(
        mockLink,
        mockProperties,
        { name: 'John Doe', email: 'john@example.com' }
      )
    })

    it('should return 400 for missing linkId', async () => {
      const request = new NextRequest('http://localhost/api/crm/deals', {
        method: 'POST',
        body: JSON.stringify({
          agentId: 'agent-1'
        })
      })
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Link ID is required')
    })

    it('should return 404 for non-existent link', async () => {
      const { supabase } = require('@/lib/supabase/client')
      
      supabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: jest.fn().mockResolvedValueOnce({
              data: null,
              error: { message: 'Not found' }
            })
          })
        })
      }))
      
      const request = new NextRequest('http://localhost/api/crm/deals', {
        method: 'POST',
        body: JSON.stringify({
          linkId: 'nonexistent-link'
        })
      })
      
      const response = await POST(request)
      const responseData = await response.json()
      
      expect(response.status).toBe(404)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Link not found')
    })
  })
})