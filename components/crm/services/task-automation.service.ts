import { supabase } from '@/lib/supabase/client'
import { TaskTriggersService } from './task-triggers.service'
import type { 
  Task, 
  TaskAutomationRule, 
  Deal,
  DealStage,
  DealStatus,
  ClientTemperature,
  TaskPriority
} from '../types'

/**
 * TaskAutomationService - Automated Task Generation Engine
 * 
 * Handles complex automation logic for generating tasks based on
 * deal progression, client engagement, and business rules.
 */
export class TaskAutomationService {

  /**
   * Main entry point for generating automated tasks
   */
  static async generateTasks(dealId: string, trigger: string, deal?: Deal): Promise<Task[]> {
    const tasks: Task[] = []
    const now = new Date()
    
    // If deal not provided, return basic tasks based on trigger
    if (!deal) {
      return TaskTriggersService.generateTriggerBasedTasks(dealId, trigger, now)
    }
    
    // Get applicable automation rules for this deal
    const rules = await this.getApplicableAutomationRules(deal)
    
    for (const rule of rules) {
      if (this.evaluateRuleConditions(rule, deal)) {
        const task = this.createTaskFromRule(rule, deal, now)
        tasks.push(task)
      }
    }
    
    // Add standard tasks based on deal stage
    const stageTasks = TaskTriggersService.generateStageBasedTasks(deal, now)
    tasks.push(...stageTasks)
    
    // Add engagement-based tasks
    const engagementTasks = TaskTriggersService.generateEngagementBasedTasks(deal, now)
    tasks.push(...engagementTasks)
    
    // Persist generated tasks to database
    if (tasks.length > 0 && deal) {
      await this.persistTasks(tasks)
    }
    
    return tasks
  }

  /**
   * Persist tasks to the database
   */
  static async persistTasks(tasks: Task[]): Promise<void> {
    try {
      const taskRecords = tasks.map(task => ({
        deal_id: task.dealId,
        client_id: task.clientId,
        agent_id: task.agentId,
        type: task.type,
        priority: task.priority,
        title: task.title,
        description: task.description,
        status: task.status,
        due_date: task.dueDate,
        is_automated: task.isAutomated,
        automation_trigger: JSON.stringify({
          triggerType: task.triggerType,
          generatedAt: new Date().toISOString()
        })
      }))
      
      const { error } = await supabase
        .from('tasks')
        .insert(taskRecords)
      
      if (error) {
        console.error('Error persisting automated tasks:', error)
      } else {
        console.log(`Successfully created ${taskRecords.length} automated tasks`)
      }
    } catch (error) {
      console.error('Error in persistTasks:', error)
    }
  }


  /**
   * Get automation rules applicable to a deal
   */
  static async getApplicableAutomationRules(deal: Deal): Promise<TaskAutomationRule[]> {
    // For now, return default rules. In production, this would fetch from database
    return this.getDefaultAutomationRules()
  }

  /**
   * Evaluate if rule conditions are met
   */
  static evaluateRuleConditions(rule: TaskAutomationRule, deal: Deal): boolean {
    // Check deal stage condition
    if (rule.conditions.dealStage && !rule.conditions.dealStage.includes(deal.dealStage)) {
      return false
    }
    
    // Check deal status condition
    if (rule.conditions.dealStatus && !rule.conditions.dealStatus.includes(deal.dealStatus)) {
      return false
    }
    
    // Check engagement score condition
    if (rule.conditions.engagementScore) {
      const score = deal.engagementScore || 0
      if (score < rule.conditions.engagementScore.min || score > rule.conditions.engagementScore.max) {
        return false
      }
    }
    
    // Check days since last activity
    if (rule.conditions.daysSinceActivity && deal.lastActivityAt) {
      const daysSince = this.daysBetween(new Date(deal.lastActivityAt), new Date())
      if (daysSince < rule.conditions.daysSinceActivity.min || 
          daysSince > rule.conditions.daysSinceActivity.max) {
        return false
      }
    }
    
    return true
  }

  /**
   * Create task from automation rule
   */
  static createTaskFromRule(rule: TaskAutomationRule, deal: Deal, baseDate: Date): Task {
    const dueDate = rule.action.delayHours ? 
      this.addHours(baseDate, rule.action.delayHours) : 
      baseDate
    
    return this.createStandardTask({
      dealId: deal.id,
      title: rule.action.taskTitle,
      description: rule.action.taskDescription,
      type: rule.action.taskType,
      priority: rule.action.taskPriority,
      dueDate: dueDate.toISOString(),
      clientId: deal.clientId || undefined,
      agentId: deal.agentId
    })
  }

  /**
   * Default automation rules
   */
  static getDefaultAutomationRules(): TaskAutomationRule[] {
    return [
      {
        id: 'hot-lead-immediate',
        name: 'Hot Lead Immediate Contact',
        description: 'Automatically create urgent task for high engagement scores',
        conditions: {
          engagementScore: { min: 80, max: 100 }
        },
        action: {
          taskType: 'urgent_call',
          taskTitle: '🔥 Hot Lead - Call Now',
          taskDescription: 'High engagement score requires immediate contact',
          taskPriority: 'urgent',
          delayHours: 0
        },
        isActive: true,
        agentIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'qualified-followup',
        name: 'Qualified Lead Follow-up',
        description: 'Follow up with qualified leads after some activity',
        conditions: {
          dealStage: ['qualified'],
          daysSinceActivity: { min: 1, max: 3 }
        },
        action: {
          taskType: 'follow_up',
          taskTitle: 'Qualified lead check-in',
          taskDescription: 'Follow up with qualified lead who has been inactive',
          taskPriority: 'high',
          delayHours: 2
        },
        isActive: true,
        agentIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'warm-lead-followup',
        name: 'Warm Lead Follow-up',
        description: 'Schedule follow-up for moderately engaged clients',
        conditions: {
          engagementScore: { min: 50, max: 79 }
        },
        action: {
          taskType: 'follow_up',
          taskTitle: '🌡️ Warm Lead - Follow up within 48 hours',
          taskDescription: 'Moderate engagement detected, schedule follow-up call',
          taskPriority: 'high',
          delayHours: 24
        },
        isActive: true,
        agentIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'cold-lead-nurture',
        name: 'Cold Lead Nurture',
        description: 'Add low-engagement clients to nurture campaign',
        conditions: {
          engagementScore: { min: 1, max: 49 }
        },
        action: {
          taskType: 'email',
          taskTitle: '❄️ Cold Lead - Add to nurture campaign',
          taskDescription: 'Low engagement score, consider nurture sequence',
          taskPriority: 'low',
          delayHours: 168 // 7 days
        },
        isActive: true,
        agentIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }

  /**
   * Create standardized task from automation rule or trigger
   */
  static createStandardTask(taskData: {
    dealId: string
    title: string
    description: string
    type: string
    priority: string
    dueDate: string
    clientId?: string
    agentId?: string
  }): Task {
    return {
      id: this.generateTaskId(),
      dealId: taskData.dealId,
      agentId: taskData.agentId || 'current-agent',
      title: taskData.title,
      description: taskData.description,
      type: taskData.type,
      priority: taskData.priority as TaskPriority,
      status: 'pending',
      isAutomated: true,
      triggerType: 'automated',
      dueDate: taskData.dueDate,
      reminderDate: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
      clientId: taskData.clientId || null,
      propertyIds: [],
      notes: null
    }
  }

  /**
   * Date utility methods
   */
  private static addHours(date: Date, hours: number): Date {
    const result = new Date(date)
    result.setHours(result.getHours() + hours)
    return result
  }

  private static daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay))
  }

  private static generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}