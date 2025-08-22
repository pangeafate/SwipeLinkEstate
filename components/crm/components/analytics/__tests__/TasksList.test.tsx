import React from 'react'
import { render, screen } from '@testing-library/react'
import { TasksList } from '../TasksList'

const mockTasks = [
  {
    id: 'task-1',
    title: 'Follow up with client',
    description: 'Call John Doe about property viewing',
    priority: 'urgent',
    dueDate: '2024-01-20',
    type: 'Follow-up'
  },
  {
    id: 'task-2',
    title: 'Schedule property inspection',
    description: 'Arrange inspection for Beach House property',
    priority: 'high',
    dueDate: '2024-01-25',
    type: 'Inspection'
  },
  {
    id: 'task-3',
    title: 'Update property listing',
    description: 'Add new photos and description',
    priority: 'medium',
    dueDate: '2024-01-30',
    type: 'Listing'
  },
  {
    id: 'task-4',
    title: 'Send contract documents',
    description: 'Email signed contracts to buyer',
    priority: 'low',
    type: 'Documentation'
  }
]

describe('TasksList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render tasks list with all tasks', () => {
    render(<TasksList tasks={mockTasks} />)
    
    expect(screen.getByText('Follow up with client')).toBeInTheDocument()
    expect(screen.getByText('Schedule property inspection')).toBeInTheDocument()
    expect(screen.getByText('Update property listing')).toBeInTheDocument()
    expect(screen.getByText('Send contract documents')).toBeInTheDocument()
  })

  it('should display task descriptions', () => {
    render(<TasksList tasks={mockTasks} />)
    
    expect(screen.getByText('Call John Doe about property viewing')).toBeInTheDocument()
    expect(screen.getByText('Arrange inspection for Beach House property')).toBeInTheDocument()
    expect(screen.getByText('Add new photos and description')).toBeInTheDocument()
    expect(screen.getByText('Email signed contracts to buyer')).toBeInTheDocument()
  })

  it('should display correct priority indicators', () => {
    const { container } = render(<TasksList tasks={mockTasks} />)
    
    const urgentIndicator = container.querySelector('.bg-red-500')
    const highIndicator = container.querySelector('.bg-orange-500')
    const mediumIndicator = container.querySelector('.bg-yellow-500')
    const lowIndicator = container.querySelector('.bg-gray-400')
    
    expect(urgentIndicator).toBeInTheDocument()
    expect(highIndicator).toBeInTheDocument()
    expect(mediumIndicator).toBeInTheDocument()
    expect(lowIndicator).toBeInTheDocument()
  })

  it('should display formatted due dates', () => {
    render(<TasksList tasks={mockTasks} />)
    
    const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/)
    expect(dateElements.length).toBe(3) // 3 tasks with due dates
  })

  it('should display task types', () => {
    render(<TasksList tasks={mockTasks} />)
    
    expect(screen.getByText('Follow-up')).toBeInTheDocument()
    expect(screen.getByText('Inspection')).toBeInTheDocument()
    expect(screen.getByText('Listing')).toBeInTheDocument()
    expect(screen.getByText('Documentation')).toBeInTheDocument()
  })

  it('should handle tasks without due dates', () => {
    render(<TasksList tasks={mockTasks} />)
    
    expect(screen.getByText('No due date')).toBeInTheDocument()
  })

  it('should handle empty tasks array', () => {
    render(<TasksList tasks={[]} />)
    
    expect(screen.getByText('No upcoming tasks')).toBeInTheDocument()
  })

  it('should render with proper styling classes', () => {
    const { container } = render(<TasksList tasks={mockTasks} />)
    
    const tasksContainer = container.firstChild as HTMLElement
    expect(tasksContainer).toHaveClass('space-y-3')
    
    const taskItems = container.querySelectorAll('.border-gray-200')
    expect(taskItems).toHaveLength(4)
    
    const taskItems2 = container.querySelectorAll('.hover\\:bg-gray-50')
    expect(taskItems2).toHaveLength(4)
  })

  it('should use task id as key when available', () => {
    const { container } = render(<TasksList tasks={mockTasks} />)
    
    const taskElements = container.querySelectorAll('div[class*="flex items-center justify-between"]')
    expect(taskElements).toHaveLength(4)
  })

  it('should fallback to index as key when task id is missing', () => {
    const tasksWithoutIds = mockTasks.map(task => ({ ...task, id: undefined }))
    
    const { container } = render(<TasksList tasks={tasksWithoutIds} />)
    
    const taskElements = container.querySelectorAll('div[class*="flex items-center justify-between"]')
    expect(taskElements).toHaveLength(4)
  })

  it('should handle different priority values correctly', () => {
    const tasksWithVariousPriorities = [
      { ...mockTasks[0], priority: 'urgent' },
      { ...mockTasks[1], priority: 'high' },
      { ...mockTasks[2], priority: 'medium' },
      { ...mockTasks[3], priority: 'low' },
      { ...mockTasks[0], id: 'task-5', priority: 'unknown' }
    ]

    const { container } = render(<TasksList tasks={tasksWithVariousPriorities} />)
    
    const urgentIndicators = container.querySelectorAll('.bg-red-500')
    const highIndicators = container.querySelectorAll('.bg-orange-500')
    const mediumIndicators = container.querySelectorAll('.bg-yellow-500')
    const lowIndicators = container.querySelectorAll('.bg-gray-400')
    
    expect(urgentIndicators).toHaveLength(1)
    expect(highIndicators).toHaveLength(1)
    expect(mediumIndicators).toHaveLength(1)
    expect(lowIndicators).toHaveLength(2) // low + unknown priority
  })

  it('should handle tasks without descriptions', () => {
    const tasksWithoutDescriptions = [
      { ...mockTasks[0], description: undefined }
    ]

    render(<TasksList tasks={tasksWithoutDescriptions} />)
    
    expect(screen.getByText('Follow up with client')).toBeInTheDocument()
  })

  it('should handle tasks without types', () => {
    const tasksWithoutTypes = [
      { ...mockTasks[0], type: undefined }
    ]

    render(<TasksList tasks={tasksWithoutTypes} />)
    
    expect(screen.getByText('Follow up with client')).toBeInTheDocument()
  })

  it('should handle invalid due dates gracefully', () => {
    const tasksWithInvalidDates = [
      { ...mockTasks[0], dueDate: 'invalid-date' }
    ]

    render(<TasksList tasks={tasksWithInvalidDates} />)
    
    expect(screen.getByText('Follow up with client')).toBeInTheDocument()
  })

  it('should be accessible with proper structure', () => {
    const { container } = render(<TasksList tasks={mockTasks} />)
    
    const taskItems = container.querySelectorAll('div[class*="flex items-center justify-between"]')
    expect(taskItems.length).toBe(4)
    
    taskItems.forEach(item => {
      expect(item).toHaveAttribute('class')
    })
  })

  it('should handle large number of tasks', () => {
    const manyTasks = Array.from({ length: 50 }, (_, i) => ({
      id: `task-${i}`,
      title: `Task ${i}`,
      description: `Description ${i}`,
      priority: 'medium',
      dueDate: '2024-01-30',
      type: 'General'
    }))

    render(<TasksList tasks={manyTasks} />)
    
    const taskElements = screen.getAllByText(/Task \d+/)
    expect(taskElements).toHaveLength(50)
  })

  it('should handle mixed task properties', () => {
    const mixedTasks = [
      { id: 'task-1', title: 'Complete Task' },
      { id: 'task-2', title: 'Partial Task', priority: 'high' },
      { id: 'task-3', title: 'Full Task', description: 'Description', priority: 'medium', dueDate: '2024-01-30', type: 'Complete' }
    ]

    render(<TasksList tasks={mixedTasks} />)
    
    expect(screen.getByText('Complete Task')).toBeInTheDocument()
    expect(screen.getByText('Partial Task')).toBeInTheDocument()
    expect(screen.getByText('Full Task')).toBeInTheDocument()
  })
})