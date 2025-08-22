import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskTabs } from '../TaskTabs'

describe('TaskTabs Component', () => {
  const mockOnTabChange = jest.fn()
  const mockTaskCounts = {
    pending: 5,
    completed: 3,
    overdue: 2
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all tab buttons', () => {
    render(
      <TaskTabs
        selectedTab="pending"
        onTabChange={mockOnTabChange}
        taskCounts={mockTaskCounts}
      />
    )

    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('should display correct task counts', () => {
    render(
      <TaskTabs
        selectedTab="pending"
        onTabChange={mockOnTabChange}
        taskCounts={mockTaskCounts}
      />
    )

    expect(screen.getByText('5')).toBeInTheDocument() // Pending count
    expect(screen.getByText('2')).toBeInTheDocument() // Overdue count
    expect(screen.getByText('3')).toBeInTheDocument() // Completed count
  })

  it('should apply active styling to selected tab', () => {
    render(
      <TaskTabs
        selectedTab="pending"
        onTabChange={mockOnTabChange}
        taskCounts={mockTaskCounts}
      />
    )

    const pendingButton = screen.getByText('Pending').closest('button')
    expect(pendingButton).toHaveClass('bg-blue-600', 'text-white')
  })

  it('should apply inactive styling to non-selected tabs', () => {
    render(
      <TaskTabs
        selectedTab="pending"
        onTabChange={mockOnTabChange}
        taskCounts={mockTaskCounts}
      />
    )

    const overdueButton = screen.getByText('Overdue').closest('button')
    const completedButton = screen.getByText('Completed').closest('button')

    expect(overdueButton).toHaveClass('bg-gray-100', 'text-gray-700')
    expect(completedButton).toHaveClass('bg-gray-100', 'text-gray-700')
  })

  it('should call onTabChange when tab is clicked', () => {
    render(
      <TaskTabs
        selectedTab="pending"
        onTabChange={mockOnTabChange}
        taskCounts={mockTaskCounts}
      />
    )

    const overdueButton = screen.getByText('Overdue').closest('button')
    fireEvent.click(overdueButton!)

    expect(mockOnTabChange).toHaveBeenCalledWith('overdue')
  })

  it('should apply active count badge styling to selected tab', () => {
    render(
      <TaskTabs
        selectedTab="pending"
        onTabChange={mockOnTabChange}
        taskCounts={mockTaskCounts}
      />
    )

    const pendingCount = screen.getByText('5')
    expect(pendingCount).toHaveClass('bg-white', 'text-blue-600')
  })

  it('should apply inactive count badge styling to non-selected tabs', () => {
    render(
      <TaskTabs
        selectedTab="pending"
        onTabChange={mockOnTabChange}
        taskCounts={mockTaskCounts}
      />
    )

    const overdueCount = screen.getByText('2')
    const completedCount = screen.getByText('3')

    expect(overdueCount).toHaveClass('bg-gray-200', 'text-gray-600')
    expect(completedCount).toHaveClass('bg-gray-200', 'text-gray-600')
  })

  it('should handle zero task counts', () => {
    const zeroTaskCounts = {
      pending: 0,
      completed: 0,
      overdue: 0
    }

    render(
      <TaskTabs
        selectedTab="pending"
        onTabChange={mockOnTabChange}
        taskCounts={zeroTaskCounts}
      />
    )

    const counts = screen.getAllByText('0')
    expect(counts).toHaveLength(3)
  })

  it('should switch active tab when different tab is selected', () => {
    const { rerender } = render(
      <TaskTabs
        selectedTab="pending"
        onTabChange={mockOnTabChange}
        taskCounts={mockTaskCounts}
      />
    )

    let pendingButton = screen.getByText('Pending').closest('button')
    let overdueButton = screen.getByText('Overdue').closest('button')

    expect(pendingButton).toHaveClass('bg-blue-600', 'text-white')
    expect(overdueButton).toHaveClass('bg-gray-100', 'text-gray-700')

    rerender(
      <TaskTabs
        selectedTab="overdue"
        onTabChange={mockOnTabChange}
        taskCounts={mockTaskCounts}
      />
    )

    pendingButton = screen.getByText('Pending').closest('button')
    overdueButton = screen.getByText('Overdue').closest('button')

    expect(pendingButton).toHaveClass('bg-gray-100', 'text-gray-700')
    expect(overdueButton).toHaveClass('bg-blue-600', 'text-white')
  })

  it('should apply consistent spacing and layout classes', () => {
    const { container } = render(
      <TaskTabs
        selectedTab="pending"
        onTabChange={mockOnTabChange}
        taskCounts={mockTaskCounts}
      />
    )

    const tabsContainer = container.firstChild
    expect(tabsContainer).toHaveClass('flex', 'space-x-1', 'mb-6')

    const buttons = container.querySelectorAll('button')
    buttons.forEach(button => {
      expect(button).toHaveClass(
        'px-4',
        'py-2',
        'rounded-lg',
        'font-medium',
        'transition-colors',
        'flex',
        'items-center',
        'space-x-2'
      )
    })
  })

  it('should render count badges with correct styling', () => {
    const { container } = render(
      <TaskTabs
        selectedTab="pending"
        onTabChange={mockOnTabChange}
        taskCounts={mockTaskCounts}
      />
    )

    const countBadges = container.querySelectorAll('span:last-child')
    countBadges.forEach(badge => {
      expect(badge).toHaveClass(
        'px-2',
        'py-1',
        'rounded-full',
        'text-xs'
      )
    })
  })
})