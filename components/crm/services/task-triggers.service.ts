import type { Task, Deal, DealStage } from '../types'

/**
 * TaskTriggersService - Trigger-Based Task Generation
 * 
 * Handles task generation for specific triggers and events.
 * Contains all the trigger-specific business logic.
 */
export class TaskTriggersService {

  /**
   * Generate tasks based on specific triggers
   */
  static generateTriggerBasedTasks(dealId: string, trigger: string, baseDate: Date): Task[] {
    const tasks: Task[] = []
    
    switch (trigger) {
      case 'link_created':
        tasks.push(this.createStandardTask({
          dealId,
          title: 'Follow up on shared property link',
          description: 'Check if client has accessed the property collection',
          type: 'follow_up',
          priority: 'medium',
          dueDate: this.addDays(baseDate, 1).toISOString()
        }))
        break
        
      case 'link_accessed':
        tasks.push(this.createStandardTask({
          dealId,
          title: 'Client viewed properties - Follow up',
          description: 'Reach out to discuss property preferences and questions',
          type: 'follow_up',
          priority: 'high',
          dueDate: this.addHours(baseDate, 2).toISOString()
        }))
        break
        
      case 'high_engagement':
        tasks.push(this.createStandardTask({
          dealId,
          title: 'HOT LEAD - Call immediately',
          description: 'Client showed high engagement. Priority contact required.',
          type: 'call',
          priority: 'urgent',
          dueDate: this.addHours(baseDate, 1).toISOString()
        }))
        break
        
      case 'property_liked':
        tasks.push(this.createStandardTask({
          dealId,
          title: 'Client liked properties - Schedule showing',
          description: 'Client has shown interest. Offer property viewing.',
          type: 'schedule_showing',
          priority: 'high',
          dueDate: this.addHours(baseDate, 4).toISOString()
        }))
        break
        
      case 'inactivity_3_days':
        tasks.push(this.createStandardTask({
          dealId,
          title: 'Re-engagement needed',
          description: 'No activity in 3 days. Send follow-up message.',
          type: 'follow_up',
          priority: 'medium',
          dueDate: baseDate.toISOString()
        }))
        break
        
      case 'inactivity_1_week':
        tasks.push(this.createStandardTask({
          dealId,
          title: 'Nurture lead with new properties',
          description: 'Share new properties matching client preferences',
          type: 'nurture',
          priority: 'low',
          dueDate: baseDate.toISOString()
        }))
        break

      case 'showing_scheduled':
        tasks.push(this.createStandardTask({
          dealId,
          title: 'Prepare for property showing',
          description: 'Review property details and prepare showing materials',
          type: 'preparation',
          priority: 'high',
          dueDate: this.addHours(baseDate, 2).toISOString()
        }))
        break

      case 'showing_completed':
        tasks.push(this.createStandardTask({
          dealId,
          title: 'Post-showing follow-up',
          description: 'Get feedback and next steps from client after showing',
          type: 'follow_up',
          priority: 'high',
          dueDate: this.addHours(baseDate, 4).toISOString()
        }))
        break

      case 'offer_interest':
        tasks.push(this.createStandardTask({
          dealId,
          title: 'Prepare offer documentation',
          description: 'Client expressed offer interest. Prepare paperwork.',
          type: 'documentation',
          priority: 'urgent',
          dueDate: this.addHours(baseDate, 1).toISOString()
        }))
        break

      case 'financing_needed':
        tasks.push(this.createStandardTask({
          dealId,
          title: 'Connect with lender',
          description: 'Help client with mortgage pre-approval process',
          type: 'financing',
          priority: 'high',
          dueDate: this.addDays(baseDate, 1).toISOString()
        }))
        break
    }
    
    return tasks
  }

  /**
   * Generate tasks based on deal stage progression
   */
  static generateStageBasedTasks(deal: Deal, baseDate: Date): Task[] {
    const tasks: Task[] = []
    
    switch (deal.dealStage) {
      case 'created':
        tasks.push(this.createStandardTask({
          dealId: deal.id,
          title: 'Prepare property collection',
          description: 'Review and optimize property selection for client',
          type: 'preparation',
          priority: 'medium',
          dueDate: this.addHours(baseDate, 1).toISOString()
        }))
        break
        
      case 'shared':
        tasks.push(this.createStandardTask({
          dealId: deal.id,
          title: 'Monitor link activity',
          description: 'Track client engagement with property collection',
          type: 'monitoring',
          priority: 'low',
          dueDate: this.addDays(baseDate, 1).toISOString()
        }))
        break
        
      case 'accessed':
        tasks.push(this.createStandardTask({
          dealId: deal.id,
          title: 'Analyze browsing behavior',
          description: 'Review which properties caught client interest',
          type: 'analysis',
          priority: 'medium',
          dueDate: this.addHours(baseDate, 6).toISOString()
        }))
        break
        
      case 'engaged':
        tasks.push(this.createStandardTask({
          dealId: deal.id,
          title: 'Schedule consultation call',
          description: 'Set up call to discuss property preferences in detail',
          type: 'consultation',
          priority: 'high',
          dueDate: this.addDays(baseDate, 1).toISOString()
        }))
        break
        
      case 'qualified':
        tasks.push(this.createStandardTask({
          dealId: deal.id,
          title: 'Prepare property showings',
          description: 'Coordinate viewing schedules for interested properties',
          type: 'schedule_showing',
          priority: 'high',
          dueDate: this.addDays(baseDate, 2).toISOString()
        }))
        break
        
      case 'advanced':
        tasks.push(this.createStandardTask({
          dealId: deal.id,
          title: 'Prepare offer documentation',
          description: 'Get ready for potential offer submission',
          type: 'documentation',
          priority: 'high',
          dueDate: this.addDays(baseDate, 1).toISOString()
        }))
        break
    }
    
    return tasks
  }

  /**
   * Generate tasks based on client engagement level
   */
  static generateEngagementBasedTasks(deal: Deal, baseDate: Date): Task[] {
    const tasks: Task[] = []
    const score = deal.engagementScore || 0
    
    if (score >= 80) { // Hot leads
      tasks.push(this.createStandardTask({
        dealId: deal.id,
        title: `🔥 HOT LEAD (${score}/100) - Priority contact`,
        description: 'Client is highly engaged. Immediate follow-up required.',
        type: 'urgent_follow_up',
        priority: 'urgent',
        dueDate: this.addMinutes(baseDate, 30).toISOString()
      }))
    } else if (score >= 50) { // Warm leads
      tasks.push(this.createStandardTask({
        dealId: deal.id,
        title: `🟡 Warm lead (${score}/100) - Follow up today`,
        description: 'Client showing moderate interest. Follow up within 24 hours.',
        type: 'follow_up',
        priority: 'high',
        dueDate: this.addDays(baseDate, 1).toISOString()
      }))
    } else if (score > 0) { // Cold but active leads
      tasks.push(this.createStandardTask({
        dealId: deal.id,
        title: `❄️ Cold lead (${score}/100) - Nurture`,
        description: 'Client showed minimal engagement. Add to nurture sequence.',
        type: 'nurture',
        priority: 'low',
        dueDate: this.addDays(baseDate, 3).toISOString()
      }))
    }
    
    return tasks
  }

  /**
   * Helper method to create standard task structure
   */
  static createStandardTask(taskData: {
    dealId: string
    title: string
    description: string
    type: string
    priority: string
    dueDate: string
  }): Task {
    return {
      id: this.generateTaskId(),
      dealId: taskData.dealId,
      agentId: 'agent-123',
      title: taskData.title,
      description: taskData.description,
      type: taskData.type,
      priority: taskData.priority as any,
      status: 'pending',
      isAutomated: true,
      triggerType: 'automated',
      dueDate: taskData.dueDate,
      reminderDate: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
      clientId: null,
      propertyIds: [],
      notes: null
    }
  }

  /**
   * Date utility methods
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  static addHours(date: Date, hours: number): Date {
    const result = new Date(date)
    result.setHours(result.getHours() + hours)
    return result
  }

  static addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date)
    result.setMinutes(result.getMinutes() + minutes)
    return result
  }

  static generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}