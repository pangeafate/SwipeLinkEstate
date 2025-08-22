import React from 'react'
import { render, screen } from '@testing-library/react'
import { RecentActivityFeed } from '../RecentActivityFeed'

const mockActivity = {
  newDeals: [
    { id: '1', dealName: 'Luxury Condo Deal', createdAt: '2024-01-15T10:00:00Z' },
    { id: '2', dealName: 'Beach House Deal', createdAt: '2024-01-14T15:30:00Z' }
  ],
  completedTasks: [
    { id: '3', title: 'Follow up with client', completedAt: '2024-01-16T09:00:00Z' },
    { id: '4', title: 'Schedule property viewing', completedAt: '2024-01-13T14:00:00Z' }
  ],
  hotLeads: [
    { id: '5', clientName: 'John Doe', updatedAt: '2024-01-17T11:00:00Z' },
    { id: '6', clientName: 'Jane Smith', updatedAt: '2024-01-12T16:00:00Z' }
  ]
}

describe('RecentActivityFeed Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render recent activity feed with all activities', () => {
    render(<RecentActivityFeed activity={mockActivity} />)
    
    expect(screen.getByText('New deal: Luxury Condo Deal')).toBeInTheDocument()
    expect(screen.getByText('New deal: Beach House Deal')).toBeInTheDocument()
    expect(screen.getByText('Completed: Follow up with client')).toBeInTheDocument()
    expect(screen.getByText('Completed: Schedule property viewing')).toBeInTheDocument()
    expect(screen.getByText('Hot lead: John Doe')).toBeInTheDocument()
    expect(screen.getByText('Hot lead: Jane Smith')).toBeInTheDocument()
  })

  it('should sort activities by timestamp in descending order', () => {
    render(<RecentActivityFeed activity={mockActivity} />)
    
    const activities = screen.getAllByText(/New deal:|Completed:|Hot lead:/)
    expect(activities[0]).toHaveTextContent('Hot lead: John Doe') // Most recent (2024-01-17)
    expect(activities[1]).toHaveTextContent('Completed: Follow up with client') // 2024-01-16
    expect(activities[2]).toHaveTextContent('New deal: Luxury Condo Deal') // 2024-01-15
  })

  it('should limit activities to 10 items', () => {
    const largeActivity = {
      newDeals: Array.from({ length: 15 }, (_, i) => ({
        id: `deal-${i}`,
        dealName: `Deal ${i}`,
        createdAt: `2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`
      })),
      completedTasks: [],
      hotLeads: []
    }

    render(<RecentActivityFeed activity={largeActivity} />)
    
    const activities = screen.getAllByText(/New deal:/)
    expect(activities).toHaveLength(10)
  })

  it('should display correct emojis for each activity type', () => {
    render(<RecentActivityFeed activity={mockActivity} />)
    
    expect(screen.getAllByText('📊')).toHaveLength(2) // Deal emojis
    expect(screen.getAllByText('✅')).toHaveLength(2) // Task emojis
    expect(screen.getAllByText('🔥')).toHaveLength(2) // Lead emojis
  })

  it('should display formatted dates', () => {
    render(<RecentActivityFeed activity={mockActivity} />)
    
    const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/)
    expect(dateElements.length).toBeGreaterThan(0)
  })

  it('should handle empty activity gracefully', () => {
    const emptyActivity = {
      newDeals: [],
      completedTasks: [],
      hotLeads: []
    }

    render(<RecentActivityFeed activity={emptyActivity} />)
    
    expect(screen.getByText('No recent activity')).toBeInTheDocument()
  })

  it('should handle missing deal names gracefully', () => {
    const activityWithMissingNames = {
      newDeals: [
        { id: '1', createdAt: '2024-01-15T10:00:00Z' } // No dealName
      ],
      completedTasks: [],
      hotLeads: []
    }

    render(<RecentActivityFeed activity={activityWithMissingNames} />)
    
    expect(screen.getByText('New deal: Unnamed Deal')).toBeInTheDocument()
  })

  it('should handle missing task titles gracefully', () => {
    const activityWithMissingTitles = {
      newDeals: [],
      completedTasks: [
        { id: '1', completedAt: '2024-01-15T10:00:00Z' } // No title
      ],
      hotLeads: []
    }

    render(<RecentActivityFeed activity={activityWithMissingTitles} />)
    
    expect(screen.getByText('Completed: Task')).toBeInTheDocument()
  })

  it('should handle missing client names gracefully', () => {
    const activityWithMissingNames = {
      newDeals: [],
      completedTasks: [],
      hotLeads: [
        { id: '1', updatedAt: '2024-01-15T10:00:00Z' } // No clientName
      ]
    }

    render(<RecentActivityFeed activity={activityWithMissingNames} />)
    
    expect(screen.getByText('Hot lead: Client')).toBeInTheDocument()
  })

  it('should render with proper styling classes', () => {
    const { container } = render(<RecentActivityFeed activity={mockActivity} />)
    
    const feedContainer = container.firstChild as HTMLElement
    expect(feedContainer).toHaveClass('space-y-3')
    
    const activityItems = container.querySelectorAll('.bg-gray-50')
    expect(activityItems.length).toBeGreaterThan(0)
  })

  it('should handle mixed activity types correctly', () => {
    const mixedActivity = {
      newDeals: [{ id: '1', dealName: 'Test Deal', createdAt: '2024-01-15T10:00:00Z' }],
      completedTasks: [{ id: '2', title: 'Test Task', completedAt: '2024-01-16T10:00:00Z' }],
      hotLeads: [{ id: '3', clientName: 'Test Client', updatedAt: '2024-01-17T10:00:00Z' }]
    }

    render(<RecentActivityFeed activity={mixedActivity} />)
    
    expect(screen.getByText('New deal: Test Deal')).toBeInTheDocument()
    expect(screen.getByText('Completed: Test Task')).toBeInTheDocument()
    expect(screen.getByText('Hot lead: Test Client')).toBeInTheDocument()
  })

  it('should handle invalid timestamps gracefully', () => {
    const activityWithInvalidDates = {
      newDeals: [
        { id: '1', dealName: 'Test Deal', createdAt: 'invalid-date' }
      ],
      completedTasks: [],
      hotLeads: []
    }

    render(<RecentActivityFeed activity={activityWithInvalidDates} />)
    
    expect(screen.getByText('New deal: Test Deal')).toBeInTheDocument()
  })

  it('should render accessibility-friendly structure', () => {
    const { container } = render(<RecentActivityFeed activity={mockActivity} />)
    
    const activityItems = container.querySelectorAll('div[class*="flex items-center"]')
    expect(activityItems.length).toBeGreaterThan(0)
    
    activityItems.forEach(item => {
      expect(item).toHaveAttribute('class')
    })
  })
})