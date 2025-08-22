import { supabase } from '@/lib/supabase/client'
import { TaskCrudService } from './task-crud.service'
import { TaskHelperService } from './task-helper.service'
import type { Task, TaskFilters, PaginatedResponse } from '../types'

/**
 * TaskQueryService - Task Query and Retrieval Operations
 * 
 * Handles complex task queries, filtering, and pagination.
 * Part of the modular task management system.
 */
export class TaskQueryService {
  /**
   * Get paginated tasks with filters
   */
  static async getTasks(
    filters: TaskFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Task>> {
    
    let query = supabase
      .from('activities')
      .select('*')
      .eq('action', 'task_created')
    
    // Apply filters
    if (filters.status?.length) {
      query = query.in('metadata->>status', filters.status)
    }
    
    if (filters.priority?.length) {
      query = query.in('metadata->>priority', filters.priority)
    }
    
    if (filters.agentId) {
      query = query.eq('metadata->>agentId', filters.agentId)
    }
    
    if (filters.dealId) {
      query = query.eq('link_id', filters.dealId)
    }
    
    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end)
    }
    
    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    const tasks = (data || []).map(TaskCrudService.activityToTask)
    
    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  }

  /**
   * Get upcoming tasks for an agent
   */
  static async getUpcomingTasks(agentId: string, days: number = 7): Promise<Task[]> {
    const endDate = TaskHelperService.addDays(new Date(), days)
    
    const tasks = await this.getTasks({
      agentId,
      status: ['pending', 'in_progress'],
      dateRange: {
        start: new Date().toISOString(),
        end: endDate.toISOString()
      }
    }, 1, 100)
    
    return tasks.data
  }

  /**
   * Get overdue tasks for an agent
   */
  static async getOverdueTasks(agentId: string): Promise<Task[]> {
    const tasks = await this.getTasks({
      agentId,
      status: ['pending', 'in_progress']
    }, 1, 100)
    
    const now = new Date()
    return tasks.data.filter(task => 
      task.dueDate && new Date(task.dueDate) < now
    )
  }

  /**
   * Get high priority tasks for an agent
   */
  static async getHighPriorityTasks(agentId: string): Promise<Task[]> {
    const tasks = await this.getTasks({
      agentId,
      priority: ['high', 'urgent'],
      status: ['pending', 'in_progress']
    }, 1, 50)
    
    return tasks.data
  }

  /**
   * Get tasks by client
   */
  static async getTasksByClient(clientId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('action', 'task_created')
      .eq('metadata->>clientId', clientId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return (data || []).map(TaskCrudService.activityToTask)
  }

  /**
   * Get tasks by property
   */
  static async getTasksByProperty(propertyId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('action', 'task_created')
      .contains('metadata->>propertyIds', [propertyId])
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return (data || []).map(TaskCrudService.activityToTask)
  }
}