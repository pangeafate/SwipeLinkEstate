/**
 * TaskHelperService - Task Utility Functions
 * 
 * Provides helper functions for date calculations and other utilities.
 * Part of the modular task management system.
 */
export class TaskHelperService {
  /**
   * Add days to a date
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  /**
   * Add hours to a date
   */
  static addHours(date: Date, hours: number): Date {
    const result = new Date(date)
    result.setHours(result.getHours() + hours)
    return result
  }

  /**
   * Add minutes to a date
   */
  static addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date)
    result.setMinutes(result.getMinutes() + minutes)
    return result
  }

  /**
   * Calculate days between two dates
   */
  static daysBetween(startDate: Date, endDate: Date): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000
    return Math.floor((endDate.getTime() - startDate.getTime()) / millisecondsPerDay)
  }

  /**
   * Format date for display
   */
  static formatDueDate(date: string | null): string {
    if (!date) return 'No due date'
    
    const dueDate = new Date(date)
    const now = new Date()
    const daysDiff = this.daysBetween(now, dueDate)
    
    if (daysDiff < 0) {
      return `Overdue by ${Math.abs(daysDiff)} days`
    } else if (daysDiff === 0) {
      return 'Due today'
    } else if (daysDiff === 1) {
      return 'Due tomorrow'
    } else if (daysDiff <= 7) {
      return `Due in ${daysDiff} days`
    } else {
      return dueDate.toLocaleDateString()
    }
  }

  /**
   * Check if a task is overdue
   */
  static isOverdue(dueDate: string | null): boolean {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  /**
   * Check if a task is due soon (within 24 hours)
   */
  static isDueSoon(dueDate: string | null): boolean {
    if (!dueDate) return false
    const hoursUntilDue = (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60)
    return hoursUntilDue > 0 && hoursUntilDue <= 24
  }
}