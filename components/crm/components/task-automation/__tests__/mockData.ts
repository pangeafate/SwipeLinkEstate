import type { Task } from '../../../types'

export const mockTask: Task = {
  id: 'task-1',
  title: 'Call client about property showing',
  description: 'Follow up on property showing scheduled for next week',
  type: 'call',
  priority: 'high',
  status: 'pending',
  isAutomated: true,
  agentId: 'agent-123',
  dealId: 'deal-123',
  dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Due in 2 days
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  notes: 'Client showed high interest in downtown properties',
  assignedBy: 'system'
}

export const mockOverdueTask: Task = {
  id: 'task-2',
  title: 'Send follow-up email',
  description: 'Send property brochures to interested client',
  type: 'email',
  priority: 'medium',
  status: 'pending',
  isAutomated: false,
  agentId: 'agent-123',
  dealId: 'deal-456',
  dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Overdue by 2 days
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  notes: null,
  assignedBy: 'agent'
}

export const mockCompletedTask: Task = {
  id: 'task-3',
  title: 'Schedule property showing',
  description: 'Coordinate showing for beachfront property',
  type: 'showing',
  priority: 'low',
  status: 'completed',
  isAutomated: true,
  agentId: 'agent-123',
  dealId: 'deal-789',
  dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  notes: 'Showing scheduled for Saturday 2pm',
  assignedBy: 'system'
}

export const mockTasks: Task[] = [mockTask, mockOverdueTask, mockCompletedTask]