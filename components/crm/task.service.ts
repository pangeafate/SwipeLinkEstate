import { TaskCrudService } from './services/task-crud.service'
import { TaskQueryService } from './services/task-query.service'
import type { 
  Task, 
  TaskStatus, 
  TaskFilters,
  PaginatedResponse,
  Deal
} from './types'

/**
 * TaskService - Main Task Management Interface
 * 
 * Provides a unified API for task management operations.
 * Delegates to specialized services for modularity and maintainability.
 * 
 * This service follows the single responsibility principle and
 * maintains file size under 200 lines as per development guidelines.
 */
export class TaskService {
  /**
   * Generate automated tasks based on deal status and engagement
   */
  static async generateAutomatedTasks(dealId: string, trigger: string, deal?: Deal): Promise<Task[]> {
    return TaskCrudService.generateAutomatedTasks(dealId, trigger, deal)
  }

  /**
   * Create a new manual task
   */
  static async createTask(taskData: Partial<Task>): Promise<Task> {
    return TaskCrudService.createTask(taskData)
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(
    taskId: string, 
    status: TaskStatus, 
    notes?: string
  ): Promise<Task | null> {
    return TaskCrudService.updateTaskStatus(taskId, status, notes)
  }

  /**
   * Get paginated tasks with filters
   */
  static async getTasks(
    filters: TaskFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Task>> {
    return TaskQueryService.getTasks(filters, page, limit)
  }

  /**
   * Get upcoming tasks for an agent
   */
  static async getUpcomingTasks(agentId: string, days: number = 7): Promise<Task[]> {
    return TaskQueryService.getUpcomingTasks(agentId, days)
  }

  /**
   * Get overdue tasks for an agent
   */
  static async getOverdueTasks(agentId: string): Promise<Task[]> {
    return TaskQueryService.getOverdueTasks(agentId)
  }

  /**
   * Get high priority tasks for an agent
   */
  static async getHighPriorityTasks(agentId: string): Promise<Task[]> {
    return TaskQueryService.getHighPriorityTasks(agentId)
  }

  /**
   * Get tasks by client
   */
  static async getTasksByClient(clientId: string): Promise<Task[]> {
    return TaskQueryService.getTasksByClient(clientId)
  }

  /**
   * Get tasks by property
   */
  static async getTasksByProperty(propertyId: string): Promise<Task[]> {
    return TaskQueryService.getTasksByProperty(propertyId)
  }

  /**
   * Get task by ID
   */
  static async getTaskById(taskId: string): Promise<Task | null> {
    return TaskCrudService.getTaskById(taskId)
  }
}