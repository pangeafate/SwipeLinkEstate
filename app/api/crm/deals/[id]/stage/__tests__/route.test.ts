/**
 * CRM Deal Stage Update API Endpoint Tests
 * 
 * Tests for PATCH /api/crm/deals/[id]/stage endpoint
 * Follows TDD methodology - tests define behavior before implementation
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { PATCH } from '../route'

// Mock the dependencies
jest.mock('@/components/crm/deal.service', () => ({
  DealService: {
    getDealById: jest.fn(),
    updateDealStage: jest.fn()
  }
}))

jest.mock('@/components/crm/task.service', () => ({
  TaskService: {
    generateAutomatedTasks: jest.fn()
  }
}))

describe('PATCH /api/crm/deals/[id]/stage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Successful Stage Updates', () => {
    it('should update deal stage from created to shared', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      const { TaskService } = require('@/components/crm/task.service')
      
      const mockDeal = {
        id: 'deal-1',
        dealName: 'Test Deal',
        dealStage: 'created',
        dealStatus: 'active',
        engagementScore: 50
      }
      
      const updatedDeal = {
        ...mockDeal,
        dealStage: 'shared',
        lastStageUpdate: expect.any(String)
      }
      
      DealService.getDealById.mockResolvedValueOnce(mockDeal)
      DealService.updateDealStage.mockResolvedValueOnce(updatedDeal)
      TaskService.generateAutomatedTasks.mockResolvedValueOnce([
        {
          id: 'task-1',
          type: 'follow-up',
          description: 'Follow up on shared link'
        }
      ])
      
      const request = new NextRequest('http://localhost/api/crm/deals/deal-1/stage', {
        method: 'PATCH',
        body: JSON.stringify({
          stage: 'shared',
          notes: 'Link shared with client via email'
        })
      })
      
      const response = await PATCH(request, { params: { id: 'deal-1' } })
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.dealStage).toBe('shared')
      expect(responseData.tasksGenerated).toBe(1)
      expect(DealService.updateDealStage).toHaveBeenCalledWith('deal-1', 'shared')
      expect(TaskService.generateAutomatedTasks).toHaveBeenCalledWith(
        'deal-1',
        'stage-change',
        updatedDeal
      )
    })

    it('should progress deal through multiple stages correctly', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      const { TaskService } = require('@/components/crm/task.service')
      
      const mockDeal = {
        id: 'deal-2',
        dealName: 'Progressive Deal',
        dealStage: 'engaged',
        dealStatus: 'active',
        engagementScore: 85
      }
      
      const updatedDeal = {
        ...mockDeal,
        dealStage: 'qualified',
        engagementScore: 90
      }
      
      DealService.getDealById.mockResolvedValueOnce(mockDeal)
      DealService.updateDealStage.mockResolvedValueOnce(updatedDeal)
      TaskService.generateAutomatedTasks.mockResolvedValueOnce([])
      
      const request = new NextRequest('http://localhost/api/crm/deals/deal-2/stage', {
        method: 'PATCH',
        body: JSON.stringify({
          stage: 'qualified',
          notes: 'Client showed strong interest and provided contact details'
        })
      })
      
      const response = await PATCH(request, { params: { id: 'deal-2' } })
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.dealStage).toBe('qualified')
      expect(responseData.tasksGenerated).toBe(0)
    })
  })

  describe('Validation and Error Handling', () => {
    it('should return 400 for missing stage parameter', async () => {
      const request = new NextRequest('http://localhost/api/crm/deals/deal-1/stage', {
        method: 'PATCH',
        body: JSON.stringify({
          notes: 'Some notes without stage'
        })
      })
      
      const response = await PATCH(request, { params: { id: 'deal-1' } })
      const responseData = await response.json()
      
      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Stage is required')
    })

    it('should return 400 for invalid stage value', async () => {
      const request = new NextRequest('http://localhost/api/crm/deals/deal-1/stage', {
        method: 'PATCH',
        body: JSON.stringify({
          stage: 'invalid-stage',
          notes: 'Attempt to set invalid stage'
        })
      })
      
      const response = await PATCH(request, { params: { id: 'deal-1' } })
      const responseData = await response.json()
      
      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Invalid stage value')
      expect(responseData.validStages).toEqual([
        'created', 'shared', 'accessed', 'engaged', 'qualified', 'advanced', 'closed'
      ])
    })

    it('should return 404 for non-existent deal', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      
      DealService.getDealById.mockResolvedValueOnce(null)
      
      const request = new NextRequest('http://localhost/api/crm/deals/nonexistent/stage', {
        method: 'PATCH',
        body: JSON.stringify({
          stage: 'shared'
        })
      })
      
      const response = await PATCH(request, { params: { id: 'nonexistent' } })
      const responseData = await response.json()
      
      expect(response.status).toBe(404)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Deal not found')
    })

    it('should return 400 for invalid stage transitions', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      
      const mockDeal = {
        id: 'deal-3',
        dealName: 'Closed Deal',
        dealStage: 'closed',
        dealStatus: 'closed-won',
        engagementScore: 100
      }
      
      DealService.getDealById.mockResolvedValueOnce(mockDeal)
      
      const request = new NextRequest('http://localhost/api/crm/deals/deal-3/stage', {
        method: 'PATCH',
        body: JSON.stringify({
          stage: 'created'
        })
      })
      
      const response = await PATCH(request, { params: { id: 'deal-3' } })
      const responseData = await response.json()
      
      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Invalid stage transition')
      expect(responseData.currentStage).toBe('closed')
      expect(responseData.attemptedStage).toBe('created')
    })

    it('should handle service errors gracefully', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      
      DealService.getDealById.mockRejectedValueOnce(new Error('Database connection failed'))
      
      const request = new NextRequest('http://localhost/api/crm/deals/deal-1/stage', {
        method: 'PATCH',
        body: JSON.stringify({
          stage: 'shared'
        })
      })
      
      const response = await PATCH(request, { params: { id: 'deal-1' } })
      const responseData = await response.json()
      
      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Failed to update deal stage')
    })
  })

  describe('Stage Transition Logic', () => {
    it('should validate stage progression is logical', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      
      const mockDeal = {
        id: 'deal-4',
        dealName: 'Early Stage Deal',
        dealStage: 'created',
        dealStatus: 'active'
      }
      
      DealService.getDealById.mockResolvedValueOnce(mockDeal)
      
      // Attempting to jump from created to qualified should be rejected
      const request = new NextRequest('http://localhost/api/crm/deals/deal-4/stage', {
        method: 'PATCH',
        body: JSON.stringify({
          stage: 'qualified'
        })
      })
      
      const response = await PATCH(request, { params: { id: 'deal-4' } })
      const responseData = await response.json()
      
      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Invalid stage transition')
      expect(responseData.message).toContain('sequential progression')
    })

    it('should allow backward stage transitions with explicit confirmation', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      const { TaskService } = require('@/components/crm/task.service')
      
      const mockDeal = {
        id: 'deal-5',
        dealName: 'Regression Deal',
        dealStage: 'qualified',
        dealStatus: 'active'
      }
      
      const updatedDeal = {
        ...mockDeal,
        dealStage: 'engaged'
      }
      
      DealService.getDealById.mockResolvedValueOnce(mockDeal)
      DealService.updateDealStage.mockResolvedValueOnce(updatedDeal)
      TaskService.generateAutomatedTasks.mockResolvedValueOnce([])
      
      const request = new NextRequest('http://localhost/api/crm/deals/deal-5/stage', {
        method: 'PATCH',
        body: JSON.stringify({
          stage: 'engaged',
          confirmBackward: true,
          notes: 'Client needs more engagement before qualification'
        })
      })
      
      const response = await PATCH(request, { params: { id: 'deal-5' } })
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.dealStage).toBe('engaged')
    })
  })

  describe('Integration with Task Automation', () => {
    it('should generate appropriate tasks for each stage transition', async () => {
      const { DealService } = require('@/components/crm/deal.service')
      const { TaskService } = require('@/components/crm/task.service')
      
      const mockDeal = {
        id: 'deal-6',
        dealName: 'Task Generation Deal',
        dealStage: 'accessed',
        dealStatus: 'active'
      }
      
      const updatedDeal = {
        ...mockDeal,
        dealStage: 'engaged'
      }
      
      const generatedTasks = [
        {
          id: 'task-1',
          type: 'follow-up-call',
          description: 'Schedule follow-up call within 24 hours',
          priority: 'high',
          dueDate: expect.any(String)
        },
        {
          id: 'task-2',
          type: 'send-additional-info',
          description: 'Send property details and financing options',
          priority: 'medium'
        }
      ]
      
      DealService.getDealById.mockResolvedValueOnce(mockDeal)
      DealService.updateDealStage.mockResolvedValueOnce(updatedDeal)
      TaskService.generateAutomatedTasks.mockResolvedValueOnce(generatedTasks)
      
      const request = new NextRequest('http://localhost/api/crm/deals/deal-6/stage', {
        method: 'PATCH',
        body: JSON.stringify({
          stage: 'engaged'
        })
      })
      
      const response = await PATCH(request, { params: { id: 'deal-6' } })
      const responseData = await response.json()
      
      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.tasksGenerated).toBe(2)
      expect(responseData.generatedTasks).toEqual(generatedTasks)
      expect(TaskService.generateAutomatedTasks).toHaveBeenCalledWith(
        'deal-6',
        'stage-change',
        updatedDeal
      )
    })
  })
})