import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskCard } from '../TaskCard'
import { mockTask, mockOverdueTask, mockCompletedTask } from './mockData'

describe('TaskCard Component', () => {
  const mockOnStatusChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render task card with basic information', () => {
    render(<TaskCard task={mockTask} onStatusChange={mockOnStatusChange} />)

    expect(screen.getByText('Call client about property showing')).toBeInTheDocument()
    expect(screen.getByText('Follow up on property showing scheduled for next week')).toBeInTheDocument()
    expect(screen.getByText('HIGH')).toBeInTheDocument()
    expect(screen.getByText('📞')).toBeInTheDocument()
  })

  it('should display automated task badge', () => {
    render(<TaskCard task={mockTask} onStatusChange={mockOnStatusChange} />)

    expect(screen.getByText('AUTO')).toBeInTheDocument()
  })

  it('should not display automated badge for manual tasks', () => {
    render(<TaskCard task={mockOverdueTask} onStatusChange={mockOnStatusChange} />)

    expect(screen.queryByText('AUTO')).not.toBeInTheDocument()
  })

  it('should display correct priority colors', () => {
    const { container } = render(<TaskCard task={mockTask} onStatusChange={mockOnStatusChange} />)
    
    const priorityBadge = screen.getByText('HIGH')
    expect(priorityBadge).toHaveClass('bg-red-100', 'text-red-800', 'border-red-200')
  })

  it('should display task type correctly', () => {
    render(<TaskCard task={mockTask} onStatusChange={mockOnStatusChange} />)

    expect(screen.getByText('Type:')).toBeInTheDocument()
    expect(screen.getByText('call')).toBeInTheDocument()
  })

  it('should format due date correctly', () => {
    render(<TaskCard task={mockTask} onStatusChange={mockOnStatusChange} />)

    expect(screen.getByText(/Due in \d+ days/)).toBeInTheDocument()
  })

  it('should display overdue tasks correctly', () => {
    render(<TaskCard task={mockOverdueTask} onStatusChange={mockOnStatusChange} />)

    expect(screen.getByText(/Overdue by \d+ days/)).toBeInTheDocument()
    
    const overdueText = screen.getByText(/Overdue by \d+ days/)
    const overdueContainer = overdueText.closest('div')
    expect(overdueContainer).toHaveClass('text-red-600', 'font-medium')
  })

  it('should display created date', () => {
    render(<TaskCard task={mockTask} onStatusChange={mockOnStatusChange} />)

    expect(screen.getByText('Created:')).toBeInTheDocument()
    expect(screen.getByText(new Date(mockTask.createdAt).toLocaleDateString())).toBeInTheDocument()
  })

  it('should display task notes when available', () => {
    render(<TaskCard task={mockTask} onStatusChange={mockOnStatusChange} />)

    expect(screen.getByText('Notes:')).toBeInTheDocument()
    expect(screen.getByText('Client showed high interest in downtown properties')).toBeInTheDocument()
  })

  it('should not display notes section when no notes', () => {
    render(<TaskCard task={mockOverdueTask} onStatusChange={mockOnStatusChange} />)

    expect(screen.queryByText('Notes:')).not.toBeInTheDocument()
  })

  it('should display action buttons for pending tasks', () => {
    render(<TaskCard task={mockTask} onStatusChange={mockOnStatusChange} />)

    expect(screen.getByText('✓ Complete')).toBeInTheDocument()
    expect(screen.getByText('✕ Dismiss')).toBeInTheDocument()
  })

  it('should not display action buttons for completed tasks', () => {
    render(<TaskCard task={mockCompletedTask} onStatusChange={mockOnStatusChange} />)

    expect(screen.queryByText('✓ Complete')).not.toBeInTheDocument()
    expect(screen.queryByText('✕ Dismiss')).not.toBeInTheDocument()
  })

  it('should display completion info for completed tasks', () => {
    render(<TaskCard task={mockCompletedTask} onStatusChange={mockOnStatusChange} />)

    expect(screen.getByText(/✓ Completed/)).toBeInTheDocument()
  })

  it('should call onStatusChange when complete button is clicked', () => {
    render(<TaskCard task={mockTask} onStatusChange={mockOnStatusChange} />)

    const completeButton = screen.getByText('✓ Complete')
    fireEvent.click(completeButton)

    expect(mockOnStatusChange).toHaveBeenCalledWith('task-1', 'completed')
  })

  it('should call onStatusChange when dismiss button is clicked', () => {
    render(<TaskCard task={mockTask} onStatusChange={mockOnStatusChange} />)

    const dismissButton = screen.getByText('✕ Dismiss')
    fireEvent.click(dismissButton)

    expect(mockOnStatusChange).toHaveBeenCalledWith('task-1', 'dismissed')
  })

  it('should apply overdue border styling', () => {
    const { container } = render(<TaskCard task={mockOverdueTask} onStatusChange={mockOnStatusChange} />)

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('border-l-red-500')
  })

  it('should apply completed task opacity', () => {
    const { container } = render(<TaskCard task={mockCompletedTask} onStatusChange={mockOnStatusChange} />)

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('opacity-75')
  })

  it('should strike through completed task title', () => {
    render(<TaskCard task={mockCompletedTask} onStatusChange={mockOnStatusChange} />)

    const title = screen.getByText('Schedule property showing')
    expect(title).toHaveClass('line-through')
  })

  it('should display correct type icons', () => {
    render(<TaskCard task={mockOverdueTask} onStatusChange={mockOnStatusChange} />)

    expect(screen.getByText('📧')).toBeInTheDocument() // Email icon
  })

  it('should format task type with hyphens replaced by spaces', () => {
    const followUpTask = {
      ...mockTask,
      type: 'follow-up'
    }

    render(<TaskCard task={followUpTask} onStatusChange={mockOnStatusChange} />)

    expect(screen.getByText('follow up')).toBeInTheDocument()
  })

  it('should display priority badge with correct styling', () => {
    render(<TaskCard task={mockOverdueTask} onStatusChange={mockOnStatusChange} />)

    const priorityBadge = screen.getByText('MEDIUM')
    expect(priorityBadge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'border-yellow-200')
  })

  it('should handle tasks without due date', () => {
    const taskWithoutDueDate = {
      ...mockTask,
      dueDate: null
    }

    render(<TaskCard task={taskWithoutDueDate} onStatusChange={mockOnStatusChange} />)

    expect(screen.queryByText('⏰')).not.toBeInTheDocument()
  })
})