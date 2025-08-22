import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ActivityFeed } from '../ActivityFeed'
import type { ActivityWithContext } from '@/lib/analytics/types'

describe('ActivityFeed', () => {
  const mockActivities: ActivityWithContext[] = [
    {
      id: '1',
      action: 'view',
      created_at: '2023-01-01T12:00:00Z',
      property: {
        id: 'prop-1',
        address: '123 Main St',
        price: 500000
      },
      link: {
        id: 'link-1',
        code: 'ABC123',
        name: 'Waterfront Collection'
      }
    },
    {
      id: '2',
      action: 'like',
      created_at: '2023-01-01T11:30:00Z',
      property: {
        id: 'prop-2',
        address: '456 Oak Ave',
        price: 750000
      },
      link: {
        id: 'link-2',
        code: 'XYZ789',
        name: null
      }
    },
    {
      id: '3',
      action: 'dislike',
      created_at: '2023-01-01T11:00:00Z',
      property: {
        id: 'prop-3',
        address: '789 Pine Rd',
        price: null
      }
    }
  ]

  beforeEach(() => {
    // Mock Date.now() for consistent time formatting tests
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2023-01-01T12:30:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<ActivityFeed activities={mockActivities} />)
      
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText('Viewed 123 Main St')).toBeInTheDocument()
      expect(screen.getByText('Liked 456 Oak Ave')).toBeInTheDocument()
      expect(screen.getByText('Passed on 789 Pine Rd')).toBeInTheDocument()
    })

    it('should render with custom title', () => {
      render(<ActivityFeed activities={mockActivities} title="Custom Activity Feed" />)
      
      expect(screen.getByText('Custom Activity Feed')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <ActivityFeed activities={mockActivities} className="custom-class" />
      )
      
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no activities', () => {
      render(<ActivityFeed activities={[]} />)
      
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText('No recent activity')).toBeInTheDocument()
      expect(screen.getByText('📊')).toBeInTheDocument()
    })

    it('should show custom title in empty state', () => {
      render(<ActivityFeed activities={[]} title="My Custom Feed" />)
      
      expect(screen.getByText('My Custom Feed')).toBeInTheDocument()
      expect(screen.getByText('No recent activity')).toBeInTheDocument()
    })
  })

  describe('Activity Display', () => {
    it('should display correct action descriptions', () => {
      const activities: ActivityWithContext[] = [
        {
          id: '1',
          action: 'view',
          created_at: '2023-01-01T12:00:00Z',
          property: { id: 'p1', address: '123 Main St', price: 100000 }
        },
        {
          id: '2',
          action: 'like',
          created_at: '2023-01-01T12:00:00Z',
          property: { id: 'p2', address: '456 Oak Ave', price: 200000 }
        },
        {
          id: '3',
          action: 'dislike',
          created_at: '2023-01-01T12:00:00Z',
          property: { id: 'p3', address: '789 Pine Rd', price: 300000 }
        },
        {
          id: '4',
          action: 'swipe',
          created_at: '2023-01-01T12:00:00Z',
          property: { id: 'p4', address: '321 Elm St', price: 400000 }
        },
        {
          id: '5',
          action: 'click',
          created_at: '2023-01-01T12:00:00Z',
          property: { id: 'p5', address: '654 Birch Ln', price: 500000 }
        },
        {
          id: '6',
          action: 'share',
          created_at: '2023-01-01T12:00:00Z',
          property: { id: 'p6', address: '987 Cedar Dr', price: 600000 }
        },
        {
          id: '7',
          action: 'custom',
          created_at: '2023-01-01T12:00:00Z',
          property: { id: 'p7', address: '111 Maple Ave', price: 700000 }
        }
      ]

      render(<ActivityFeed activities={activities} />)
      
      expect(screen.getByText('Viewed 123 Main St')).toBeInTheDocument()
      expect(screen.getByText('Liked 456 Oak Ave')).toBeInTheDocument()
      expect(screen.getByText('Passed on 789 Pine Rd')).toBeInTheDocument()
      expect(screen.getByText('Swiped on 321 Elm St')).toBeInTheDocument()
      expect(screen.getByText('Clicked 654 Birch Ln')).toBeInTheDocument()
      expect(screen.getByText('Shared 987 Cedar Dr')).toBeInTheDocument()
      expect(screen.getByText('custom on 111 Maple Ave')).toBeInTheDocument()
    })

    it('should display correct action icons', () => {
      const activities: ActivityWithContext[] = [
        {
          id: '1',
          action: 'view',
          created_at: '2023-01-01T12:00:00Z',
          property: { id: 'p1', address: '123 Main St', price: 100000 }
        },
        {
          id: '2',
          action: 'like',
          created_at: '2023-01-01T12:00:00Z',
          property: { id: 'p2', address: '456 Oak Ave', price: 200000 }
        },
        {
          id: '3',
          action: 'unknown',
          created_at: '2023-01-01T12:00:00Z',
          property: { id: 'p3', address: '789 Pine Rd', price: 300000 }
        }
      ]

      render(<ActivityFeed activities={activities} />)
      
      expect(screen.getByText('👁️')).toBeInTheDocument() // view icon
      expect(screen.getByText('👍')).toBeInTheDocument() // like icon
      expect(screen.getByText('📊')).toBeInTheDocument() // default icon
    })
  })

  describe('Link Information', () => {
    it('should display link information when available', () => {
      render(<ActivityFeed activities={mockActivities} />)
      
      expect(screen.getByText('via Waterfront Collection')).toBeInTheDocument()
      expect(screen.getByText('via XYZ789')).toBeInTheDocument()
    })

    it('should handle missing link information', () => {
      const activitiesNoLink: ActivityWithContext[] = [
        {
          id: '1',
          action: 'view',
          created_at: '2023-01-01T12:00:00Z',
          property: {
            id: 'prop-1',
            address: '123 Main St',
            price: 500000
          }
        }
      ]

      render(<ActivityFeed activities={activitiesNoLink} />)
      
      expect(screen.queryByText(/via/)).not.toBeInTheDocument()
    })
  })

  describe('Property Price Display', () => {
    it('should display formatted property prices', () => {
      render(<ActivityFeed activities={mockActivities} />)
      
      expect(screen.getByText('$500,000')).toBeInTheDocument()
      expect(screen.getByText('$750,000')).toBeInTheDocument()
    })

    it('should handle null property prices', () => {
      const activityWithNullPrice: ActivityWithContext[] = [
        {
          id: '1',
          action: 'view',
          created_at: '2023-01-01T12:00:00Z',
          property: {
            id: 'prop-1',
            address: '123 Main St',
            price: null
          }
        }
      ]

      render(<ActivityFeed activities={activityWithNullPrice} />)
      
      expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
    })
  })

  describe('Time Formatting', () => {
    it('should format time correctly for recent activities', () => {
      // Test with activities that should show relative time
      const recentActivities: ActivityWithContext[] = [
        {
          id: '1',
          action: 'view',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
          property: { id: 'p1', address: '123 Main St', price: 100000 }
        },
        {
          id: '2',
          action: 'like',
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1h ago
          property: { id: 'p2', address: '456 Oak Ave', price: 200000 }
        }
      ]
      
      render(<ActivityFeed activities={recentActivities} />)
      
      expect(screen.getByText('30m ago')).toBeInTheDocument()
      expect(screen.getByText('1h ago')).toBeInTheDocument()
    })

    it('should show "just now" for very recent activities', () => {
      const recentActivity: ActivityWithContext[] = [
        {
          id: '1',
          action: 'view',
          created_at: new Date(Date.now() - 10 * 1000).toISOString(), // 10 seconds ago
          property: { id: 'p1', address: '123 Main St', price: 100000 }
        }
      ]

      render(<ActivityFeed activities={recentActivity} />)
      
      expect(screen.getByText('just now')).toBeInTheDocument()
    })

    it('should show date for older activities', () => {
      const oldActivity: ActivityWithContext[] = [
        {
          id: '1',
          action: 'view',
          created_at: '2022-12-01T12:00:00Z', // Much older
          property: { id: 'p1', address: '123 Main St', price: 100000 }
        }
      ]

      render(<ActivityFeed activities={oldActivity} />)
      
      // Should show date format for old activities
      expect(screen.getByText(/12\/1\/2022|1\/12\/2022/)).toBeInTheDocument() // Date format may vary by locale
    })
  })

  describe('Pagination and Limits', () => {
    it('should respect maxItems limit', () => {
      const manyActivities = Array.from({ length: 15 }, (_, i) => ({
        id: `${i + 1}`,
        action: 'view',
        created_at: '2023-01-01T12:00:00Z',
        property: {
          id: `prop-${i + 1}`,
          address: `${i + 1} Test St`,
          price: 100000
        }
      }))

      render(<ActivityFeed activities={manyActivities} maxItems={5} />)
      
      expect(screen.getByText('Showing 5 of 15')).toBeInTheDocument()
      expect(screen.getByText('View all 15 activities →')).toBeInTheDocument()
      
      // Should only show first 5 activities
      expect(screen.getByText('Viewed 1 Test St')).toBeInTheDocument()
      expect(screen.getByText('Viewed 5 Test St')).toBeInTheDocument()
      expect(screen.queryByText('Viewed 6 Test St')).not.toBeInTheDocument()
    })

    it('should not show pagination when activities fit in limit', () => {
      render(<ActivityFeed activities={mockActivities} maxItems={10} />)
      
      expect(screen.queryByText(/Showing/)).not.toBeInTheDocument()
      expect(screen.queryByText(/View all/)).not.toBeInTheDocument()
    })
  })

  describe('Metadata Display', () => {
    it('should display metadata when available', () => {
      const activityWithMetadata: ActivityWithContext[] = [
        {
          id: '1',
          action: 'view',
          created_at: '2023-01-01T12:00:00Z',
          property: { id: 'p1', address: '123 Main St', price: 100000 },
          metadata: {
            deviceType: 'mobile',
            referrer: 'google'
          }
        }
      ]

      render(<ActivityFeed activities={activityWithMetadata} />)
      
      expect(screen.getByText('View details')).toBeInTheDocument()
    })

    it('should not display metadata section when no metadata', () => {
      render(<ActivityFeed activities={mockActivities} />)
      
      expect(screen.queryByText('View details')).not.toBeInTheDocument()
    })
  })

  describe('Property Address Handling', () => {
    it('should handle missing property information', () => {
      const activityNoProperty: ActivityWithContext[] = [
        {
          id: '1',
          action: 'view',
          created_at: '2023-01-01T12:00:00Z'
        }
      ]

      render(<ActivityFeed activities={activityNoProperty} />)
      
      expect(screen.getByText('Viewed Unknown Property')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and structure', () => {
      render(<ActivityFeed activities={mockActivities} />)
      
      const headings = screen.getAllByRole('heading', { level: 3 })
      expect(headings[0]).toHaveTextContent('Recent Activity')
    })

    it('should have proper hover states', () => {
      render(<ActivityFeed activities={mockActivities} />)
      
      const activityItems = screen.getAllByText(/Viewed|Liked|Passed/).map(
        el => el.closest('.hover\\:bg-gray-50')
      )
      
      expect(activityItems.length).toBeGreaterThan(0)
    })
  })
})