import { supabase } from '@/lib/supabase/client'
import { TaskAutomationService } from './task-automation.service'
import type { Task, TaskStatus, Deal } from '../types'

/**
 * TaskCrudService - Core Task CRUD Operations
 * 
 * Handles Create, Read, Update, Delete operations for tasks.
 * Part of the modular task management system.
 */
export class TaskCrudService {
  /**
   * Generate automated tasks based on deal status and engagement
   */
  static async generateAutomatedTasks(dealId: string, trigger: string, deal?: Deal): Promise<Task[]> {
    return TaskAutomationService.generateTasks(dealId, trigger, deal)
  }

  /**
   * Create a new manual task
   */
  static async createTask(taskData: Partial<Task>): Promise<Task> {
    // Validate required fields
    if (!taskData.dealId || !taskData.title) {
      throw new Error('Missing required fields: dealId and title')
    }
    
    const task: Task = {
      id: this.generateTaskId(),
      dealId: taskData.dealId,
      agentId: taskData.agentId || 'agent-123',
      title: taskData.title,
      description: taskData.description || '',
      type: taskData.type || 'general',
      priority: taskData.priority || 'medium',
      status: taskData.status || 'pending',
      isAutomated: taskData.isAutomated || false,
      triggerType: taskData.triggerType || 'manual',
      dueDate: taskData.dueDate || null,
      reminderDate: taskData.reminderDate || null,
      createdAt: new Date().toISOString(),
      completedAt: null,
      clientId: taskData.clientId || null,
      propertyIds: taskData.propertyIds || [],
      notes: taskData.notes || null
    }
    
    await this.persistTask(task)
    return task
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(
    taskId: string, 
    status: TaskStatus, 
    notes?: string
  ): Promise<Task | null> {
    const task = await this.getTaskById(taskId)
    if (!task) return null
    
    const updatedTask: Task = {
      ...task,
      status,
      completedAt: status === 'completed' ? new Date().toISOString() : null,
      notes: notes || task.notes
    }
    
    await this.persistTask(updatedTask)
    return updatedTask
  }

  /**
   * Get task by ID
   */
  static async getTaskById(taskId: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', taskId)
      .eq('action', 'task_created')
      .single()
    
    if (error) return null
    return this.activityToTask(data)
  }

  /**
   * Persist task to database
   */
  static async persistTask(task: Task): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .upsert({
        id: task.id,
        link_id: task.dealId,
        action: 'task_created',
        metadata: task
      })
    
    if (error) throw error
  }

  /**
   * Convert activity record to Task
   */
  static activityToTask(activity: any): Task {
    return {
      id: activity.metadata.id,
      dealId: activity.metadata.dealId,
      agentId: activity.metadata.agentId,
      title: activity.metadata.title,
      description: activity.metadata.description,
      type: activity.metadata.type,
      priority: activity.metadata.priority,
      status: activity.metadata.status,
      isAutomated: activity.metadata.isAutomated,
      triggerType: activity.metadata.triggerType,
      dueDate: activity.metadata.dueDate,
      reminderDate: activity.metadata.reminderDate,
      createdAt: activity.metadata.createdAt,
      completedAt: activity.metadata.completedAt,
      clientId: activity.metadata.clientId,
      propertyIds: activity.metadata.propertyIds || [],
      notes: activity.metadata.notes
    }
  }

  /**
   * Generate unique task ID
   */
  private static generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}