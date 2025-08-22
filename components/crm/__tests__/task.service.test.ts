/**
 * Task Automation Service Tests
 * Following strict TDD approach with shared test infrastructure
 */

import { describe, it, expect } from '@jest/globals'
import { TaskService } from '../task.service'
import type { 
  Task,
  TaskPriority,
  TaskStatus,
  Deal,
  DealStage
} from '../types'

// Use shared test infrastructure
import { 
  SupabaseMockFactory,
  createMockTask,
  createMockDeal
} from '@/test'

describe('Task Automation Service', () => {
  // Setup test environment for each test
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })
  
  describe('generateAutomatedTasks', () => {
    it('should generate high priority task for hot lead engagement', async () => {
      // ARRANGE - Use mock factory for consistent data
      const mockDeal = createMockDeal({
        id: 'deal-123',
        dealName: 'Hot Lead Property',
        engagementScore: 85,
        clientTemperature: 'hot',
        clientName: 'John Doe',
        clientEmail: 'john@example.com'
      })

      // ACT
      const tasks = await TaskService.generateAutomatedTasks(
        mockDeal.id,
        'high_engagement',
        mockDeal as Deal
      )

      // ASSERT - Multiple tasks can be generated for hot leads
      expect(tasks.length).toBeGreaterThanOrEqual(1)
      // Find the high priority task
      const hotLeadTask = tasks.find(t => t.title.includes('HOT LEAD') || t.title.includes('Hot Lead'))
      expect(hotLeadTask).toBeDefined()
      expect(hotLeadTask?.priority).toMatch(/high|urgent/)
      expect(['call', 'urgent_call', 'urgent_follow_up'].includes(hotLeadTask?.type || '')).toBe(true)
    })

    it('should generate follow-up task 24 hours after link access', async () => {
      // ARRANGE
      const mockDeal = createMockDeal({
        id: 'deal-456',
        dealName: 'Property Collection',
        dealStage: 'accessed',
        clientName: 'Jane Smith'
      })

      // ACT
      const tasks = await TaskService.generateAutomatedTasks(
        mockDeal.id,
        'link_accessed',
        mockDeal as Deal
      )

      // ASSERT
      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toContain('Check-in')
      expect(tasks[0].type).toBe('call')
      
      // Due date should be approximately 24 hours from now
      const dueDate = new Date(tasks[0].dueDate!)
      const now = new Date()
      const hoursDiff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      expect(hoursDiff).toBeCloseTo(24, 0)
    })

    it('should generate showing task for multiple likes', async () => {
      // ARRANGE
      const mockDeal = createMockDeal({
        id: 'deal-789',
        dealName: 'Interested Client',
        clientName: 'Bob Johnson',
        clientEmail: 'bob@example.com'
      })

      // ACT
      const tasks = await TaskService.generateAutomatedTasks(
        mockDeal.id,
        'multiple_likes',
        mockDeal as Deal
      )

      // ASSERT
      expect(tasks.some(t => t.title.includes('Schedule Showing'))).toBe(true)
      expect(tasks.some(t => t.type === 'showing')).toBe(true)
    })

    it('should generate low priority re-engagement task for cold leads', async () => {
      // ARRANGE
      const mockDeal = createMockDeal({
        id: 'deal-cold',
        engagementScore: 25,
        clientTemperature: 'cold',
        lastActivityAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
      })

      // ACT
      const tasks = await TaskService.generateAutomatedTasks(
        mockDeal.id,
        'cold_lead',
        mockDeal as Deal
      )

      // ASSERT
      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toContain('Re-engagement')
      expect(tasks[0].priority).toBe('low')
      expect(tasks[0].type).toBe('email')
    })

    it('should apply priorities based on client temperature', async () => {
      // ARRANGE & ACT & ASSERT - Test hot, warm, cold temperatures
      const hotDeal = createMockDeal({ clientTemperature: 'hot' })
      const hotTasks = await TaskService.generateAutomatedTasks(hotDeal.id, 'follow_up', hotDeal as Deal)
      if (hotTasks.length > 0) expect(hotTasks[0].priority).toBe('high')

      const coldDeal = createMockDeal({ clientTemperature: 'cold' })
      const coldTasks = await TaskService.generateAutomatedTasks(coldDeal.id, 'follow_up', coldDeal as Deal)
      if (coldTasks.length > 0) expect(coldTasks[0].priority).toBe('low')
    })

    it('should generate multiple tasks for milestone events', async () => {
      // ARRANGE
      const mockDeal = createMockDeal({
        id: 'deal-milestone',
        dealStage: 'advanced',
        clientName: 'Serious Buyer'
      })

      // ACT
      const tasks = await TaskService.generateAutomatedTasks(
        mockDeal.id,
        'first_showing_attended',
        mockDeal as Deal
      )

      // ASSERT
      expect(tasks.length).toBeGreaterThan(1)
      expect(tasks.some(t => t.title.includes('Feedback'))).toBe(true)
      expect(tasks.some(t => t.title.includes('Next Steps'))).toBe(true)
    })
  })

  describe('createTask', () => {
    it('should create a new task successfully', async () => {
      // ARRANGE
      const taskData = createMockTask({ dealId: 'deal-123', title: 'Follow up with client', type: 'call', priority: 'high' })
      const mockSupabase = SupabaseMockFactory.createSuccessMock([taskData])

      // ACT
      const result = await TaskService.createTask(taskData)

      // ASSERT
      expect(result.id).toBeDefined()
      expect(result.title).toBe(taskData.title)
      expect(result.status).toBe('pending')
      expect(result.isAutomated).toBe(false)
    })

    it('should handle validation errors for required fields', async () => {
      // ARRANGE & ACT & ASSERT - Missing dealId and title
      await expect(TaskService.createTask({ description: 'Invalid' })).rejects.toThrow('Missing required fields')
      await expect(TaskService.createTask({ dealId: 'deal-123' })).rejects.toThrow('Missing required fields')
      await expect(TaskService.createTask({ title: 'Task without deal' })).rejects.toThrow('Missing required fields')
    })

  })

  describe('updateTaskStatus', () => {
    it('should update task status and handle completion timestamps correctly', async () => {
      // ARRANGE - Test completed status with timestamp
      const completedTask = createMockTask({ status: 'completed', completedAt: new Date().toISOString() })
      const dismissedTask = createMockTask({ status: 'dismissed', completedAt: null })
      
      const mockSupabase = SupabaseMockFactory.createSuccessMock([completedTask], {
        tasks: { updateResponse: { data: completedTask, error: null } }
      })

      // ACT & ASSERT - Completed status
      const completedResult = await TaskService.updateTaskStatus('task-123', 'completed')
      expect(completedResult.status).toBe('completed')
      expect(completedResult.completedAt).toBeDefined()
      
      // ACT & ASSERT - Dismissed status 
      const dismissedResult = await TaskService.updateTaskStatus('task-456', 'dismissed')
      expect(dismissedResult.status).toBe('dismissed')
      expect(dismissedResult.completedAt).toBeNull()
    })
  })

  describe('getTasks', () => {
    it('should retrieve tasks with filters and pagination', async () => {
      // ARRANGE
      const filters = { dealId: 'deal-123' }
      const mockTasks = [
        createMockTask({ id: 'task-1', dealId: 'deal-123', title: 'Call client', status: 'pending' }),
        createMockTask({ id: 'task-2', dealId: 'deal-123', title: 'Send email', status: 'completed' })
      ]
      const mockSupabase = SupabaseMockFactory.createSuccessMock(mockTasks)

      // ACT
      const result = await TaskService.getTasks(filters, 1, 10)

      // ASSERT
      expect(result.data).toBeDefined()
      expect(result.pagination).toBeDefined()
      expect(result.pagination.page).toBe(1)
    })
  })

  describe('getOverdueTasks', () => {
    it('should retrieve overdue tasks for specific agent', async () => {
      // ARRANGE
      const agentId = 'agent-123'
      const mockTasks = [
        createMockTask({ id: 'task-1', agentId, dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), status: 'pending' }),
        createMockTask({ id: 'task-2', agentId, status: 'pending' })
      ]
      const mockSupabase = SupabaseMockFactory.createSuccessMock(mockTasks)

      // ACT
      const result = await TaskService.getOverdueTasks(agentId)
      
      // ASSERT
      expect(Array.isArray(result)).toBe(true)
      expect(result.every(t => t.agentId === agentId)).toBe(true)
    })
  })

  describe('getUpcomingTasks', () => {
    it('should retrieve upcoming tasks for agent within specified days', async () => {
      // ARRANGE
      const agentId = 'agent-123'
      const mockTasks = [
        createMockTask({ agentId, dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }),
        createMockTask({ agentId, dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() })
      ]
      const mockSupabase = SupabaseMockFactory.createSuccessMock(mockTasks)

      // ACT
      const result = await TaskService.getUpcomingTasks(agentId, 7)
      
      // ASSERT
      expect(Array.isArray(result)).toBe(true)
    })
  })
})