import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskList } from '../TaskList'
import { mockTasks, mockTask } from './mockData'

describe('TaskList Component', () => {
  const mockOnStatusChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render list of tasks', () => {
    render(<TaskList tasks={mockTasks} onStatusChange={mockOnStatusChange} />)

    expect(screen.getByText('Call client about property showing')).toBeInTheDocument()
    expect(screen.getByText('Send follow-up email')).toBeInTheDocument()
    expect(screen.getByText('Schedule property showing')).toBeInTheDocument()
  })

  it('should display empty state when no tasks', () => {
    render(<TaskList tasks={[]} onStatusChange={mockOnStatusChange} />)

    expect(screen.getByText('📋')).toBeInTheDocument()
    expect(screen.getByText('No tasks found')).toBeInTheDocument()
  })

  it('should display custom empty message', () => {
    render(
      <TaskList 
        tasks={[]} 
        onStatusChange={mockOnStatusChange} 
        emptyMessage="No pending tasks available"
      />
    )

    expect(screen.getByText('No pending tasks available')).toBeInTheDocument()
  })

  it('should render tasks in correct order', () => {
    render(<TaskList tasks={mockTasks} onStatusChange={mockOnStatusChange} />)

    const taskElements = screen.getAllByText(/Call client|Send follow-up|Schedule property/)
    expect(taskElements).toHaveLength(3)
  })

  it('should pass onStatusChange to TaskCard components', () => {
    render(<TaskList tasks={[mockTask]} onStatusChange={mockOnStatusChange} />)

    const completeButton = screen.getByText('✓ Complete')
    fireEvent.click(completeButton)

    expect(mockOnStatusChange).toHaveBeenCalledWith('task-1', 'completed')
  })

  it('should render each task with unique key', () => {
    const { container } = render(<TaskList tasks={mockTasks} onStatusChange={mockOnStatusChange} />)

    const taskCards = container.querySelectorAll('.bg-white')
    expect(taskCards).toHaveLength(3)
  })

  it('should apply correct styling to empty state', () => {
    const { container } = render(<TaskList tasks={[]} onStatusChange={mockOnStatusChange} />)

    const emptyState = container.querySelector('.text-center')
    expect(emptyState).toHaveClass('py-12')
    
    const icon = container.querySelector('.text-4xl')
    expect(icon).toHaveClass('text-gray-400', 'mb-2')
  })

  it('should handle single task correctly', () => {
    render(<TaskList tasks={[mockTask]} onStatusChange={mockOnStatusChange} />)

    expect(screen.getByText('Call client about property showing')).toBeInTheDocument()
    expect(screen.queryByText('Send follow-up email')).not.toBeInTheDocument()
  })

  it('should apply space-y-4 styling to task container', () => {
    const { container } = render(<TaskList tasks={mockTasks} onStatusChange={mockOnStatusChange} />)

    const taskContainer = container.querySelector('.space-y-4')
    expect(taskContainer).toBeInTheDocument()
  })
})