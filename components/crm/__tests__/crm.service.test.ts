/**
 * CRM Service Tests - Core Orchestration
 * Following strict TDD approach with shared test infrastructure
 * Tests the main CRM orchestration service functionality
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { CRMService } from '../services/crm.service'
import { 
  Deal,
  DealStatus,
  DealStage,
  ClientTemperature,
  CRMDashboard,
  PipelineMetrics
} from '../types'

describe('CRM Service - Core Orchestration', () => {
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('processEngagementEvent', () => {
    it('should process client engagement and return result structure', async () => {
      // ARRANGE - Create mock engagement event
      const dealId = 'deal-123'
      const engagementData = {
        action: 'property_like',
        metadata: { propertyId: 'prop-1' },
        clientId: 'client-1'
      }

      // ACT
      const result = await CRMService.processEngagementEvent(dealId, engagementData)

      // ASSERT - Check return structure (minimal GREEN phase implementation)
      expect(result).toHaveProperty('deal')
      expect(result).toHaveProperty('scoreUpdated')
      expect(result).toHaveProperty('newTasks')
      expect(result).toHaveProperty('stageChanged')
      expect(typeof result.scoreUpdated).toBe('boolean')
      expect(typeof result.newTasks).toBe('number')
      expect(typeof result.stageChanged).toBe('boolean')
    })
  })

  describe('getHotLeads', () => {
    it('should return array of hot leads', async () => {
      // ARRANGE
      const agentId = 'agent-123'

      // ACT
      const result = await CRMService.getHotLeads(agentId)

      // ASSERT - Check return structure (minimal GREEN phase implementation)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should work without agent filter', async () => {
      // ACT
      const result = await CRMService.getHotLeads()

      // ASSERT
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getPipelineHealthReport', () => {
    it('should return health report structure', async () => {
      // ARRANGE
      const agentId = 'agent-123'

      // ACT
      const result = await CRMService.getPipelineHealthReport(agentId)

      // ASSERT - Check return structure (minimal GREEN phase implementation)
      expect(result).toHaveProperty('health')
      expect(result).toHaveProperty('metrics')
      expect(result).toHaveProperty('recommendations')
      expect(['excellent', 'good', 'needs-attention', 'critical']).toContain(result.health)
      expect(Array.isArray(result.recommendations)).toBe(true)
      expect(typeof result.metrics).toBe('object')
    })
  })

  describe('getPerformanceInsights', () => {
    it('should return performance insights structure', async () => {
      // ARRANGE
      const agentId = 'agent-123'

      // ACT
      const result = await CRMService.getPerformanceInsights(agentId)

      // ASSERT - Check return structure (minimal GREEN phase implementation)
      expect(result).toHaveProperty('kpis')
      expect(result).toHaveProperty('trends')
      expect(result).toHaveProperty('insights')
      expect(result).toHaveProperty('recommendations')
      expect(Array.isArray(result.insights)).toBe(true)
      expect(Array.isArray(result.recommendations)).toBe(true)
    })
  })

  describe('scheduleAutomatedFollowUps', () => {
    it('should return follow-up scheduling results structure', async () => {
      // ARRANGE
      const agentId = 'agent-123'

      // ACT
      const result = await CRMService.scheduleAutomatedFollowUps(agentId)

      // ASSERT - Check return structure (minimal GREEN phase implementation)
      expect(result).toHaveProperty('scheduled')
      expect(result).toHaveProperty('skipped')
      expect(result).toHaveProperty('errors')
      expect(typeof result.scheduled).toBe('number')
      expect(typeof result.skipped).toBe('number')
      expect(typeof result.errors).toBe('number')
    })
  })
})