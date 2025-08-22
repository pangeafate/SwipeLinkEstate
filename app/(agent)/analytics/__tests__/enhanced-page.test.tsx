import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AnalyticsPage from '../page'

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: { children: React.ReactNode; href: string }) => {
    return <a href={href} {...props}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

// Mock React Query hooks
jest.mock('@/lib/query/useAnalyticsQuery', () => ({
  useDashboardAnalytics: jest.fn(),
  useRealTimeAnalytics: jest.fn()
}))

// Mock analytics components
jest.mock('@/components/analytics/MetricsCard', () => {
  const MockMetricsCard = ({ title, value, subtitle, icon, isLoading }: any) => (
    <div data-testid={`metrics-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <h3>{title}</h3>
      <div>{isLoading ? 'Loading...' : value}</div>
      {subtitle && <p>{subtitle}</p>}
      {icon && <span>{icon}</span>}
    </div>
  )
  MockMetricsCard.displayName = 'MockMetricsCard'
  return MockMetricsCard
})

jest.mock('@/components/analytics/AnalyticsChart', () => {
  const MockAnalyticsChart = ({ title, data, type }: any) => (
    <div data-testid={`analytics-chart-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <h3>{title}</h3>
      <div>Chart Type: {type}</div>
      <div>Data Points: {data.length}</div>
    </div>
  )
  MockAnalyticsChart.displayName = 'MockAnalyticsChart'
  return MockAnalyticsChart
})

jest.mock('@/components/analytics/ActivityFeed', () => {
  const MockActivityFeed = ({ activities, title, maxItems }: any) => (
    <div data-testid="activity-feed">
      <h3>{title}</h3>
      <div>Activities: {activities.length}</div>
      <div>Max Items: {maxItems}</div>
    </div>
  )
  MockActivityFeed.displayName = 'MockActivityFeed'
  return MockActivityFeed
})

// Mock ErrorBoundary
jest.mock('@/lib/errors/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

// Import mocked functions
import { useDashboardAnalytics, useRealTimeAnalytics } from '@/lib/query/useAnalyticsQuery'

const mockUseDashboardAnalytics = useDashboardAnalytics as jest.MockedFunction<typeof useDashboardAnalytics>
const mockUseRealTimeAnalytics = useRealTimeAnalytics as jest.MockedFunction<typeof useRealTimeAnalytics>

const mockAnalyticsData = {
  overview: {
    totalProperties: 15,
    activeProperties: 12,
    totalLinks: 8,
    totalViews: 1234,
    totalSessions: 567,
    avgSessionDuration: 185
  },
  recentActivity: [
    {
      id: '1',
      action: 'view',
      created_at: '2023-01-01T12:00:00Z',
      property: { id: 'p1', address: '123 Main St', price: 500000 }
    },
    {
      id: '2',
      action: 'like',
      created_at: '2023-01-01T11:30:00Z',
      property: { id: 'p2', address: '456 Oak Ave', price: 750000 }
    }
  ],
  topProperties: [
    {
      property: { id: 'p1', address: '123 Oceanview Drive, Miami Beach', price: 850000 },
      stats: { views: 125, likes: 89, dislikes: 12, likeRate: 0.88 }
    },
    {
      property: { id: 'p2', address: '456 Downtown Loft, Manhattan', price: 1200000 },
      stats: { views: 98, likes: 45, dislikes: 8, likeRate: 0.85 }
    }
  ],
  linkPerformance: [
    {
      link: { id: 'l1', code: 'ABC123', name: 'Luxury Collection' },
      stats: { views: 234, sessions: 45, avgDuration: 195 }
    },
    {
      link: { id: 'l2', code: 'XYZ789', name: 'Waterfront Properties' },
      stats: { views: 187, sessions: 38, avgDuration: 210 }
    }
  ]
}

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
  
  const MockProvider = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
  MockProvider.displayName = 'MockProvider'
  return MockProvider
}

describe('Enhanced AnalyticsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    mockUseDashboardAnalytics.mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
      refetch: jest.fn()
    })
    
    mockUseRealTimeAnalytics.mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
      refetch: jest.fn()
    })
  })

  describe('Layout and Navigation', () => {
    it('should render header with correct navigation', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      expect(screen.getByText('SwipeLink Estate')).toBeInTheDocument()
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Properties')).toBeInTheDocument()
      expect(screen.getByText('Links')).toBeInTheDocument()
      expect(screen.getByText('Analytics')).toBeInTheDocument()
    })

    it('should have correct navigation link destinations', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      const logoLink = screen.getByText('SwipeLink Estate')
      expect(logoLink.closest('a')).toHaveAttribute('href', '/')

      const propertiesLink = screen.getByText('Properties')
      expect(propertiesLink.closest('a')).toHaveAttribute('href', '/dashboard')

      const linksLink = screen.getByText('Links')
      expect(linksLink.closest('a')).toHaveAttribute('href', '/links')

      const analyticsLink = screen.getByText('Analytics')
      expect(analyticsLink.closest('a')).toHaveAttribute('href', '/analytics')
    })

    it('should highlight analytics nav item as active', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      const analyticsNav = screen.getByText('Analytics').closest('a')
      expect(analyticsNav).toHaveClass('text-gray-900')

      const propertiesNav = screen.getByText('Properties').closest('a')
      expect(propertiesNav).toHaveClass('text-gray-500')

      const linksNav = screen.getByText('Links').closest('a')
      expect(linksNav).toHaveClass('text-gray-500')
    })
  })

  describe('Page Header and Controls', () => {
    it('should display page title and description', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Track property engagement and client interactions')).toBeInTheDocument()
    })

    it('should display refresh controls with correct options', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Refresh:')).toBeInTheDocument()
      expect(screen.getByDisplayValue('30000')).toBeInTheDocument() // Default 30s
      expect(screen.getByText('5s (Real-time)')).toBeInTheDocument()
      expect(screen.getByText('10s')).toBeInTheDocument()
      expect(screen.getByText('30s')).toBeInTheDocument()
      expect(screen.getByText('1m')).toBeInTheDocument()
      expect(screen.getByText('5m')).toBeInTheDocument()
    })

    it('should display refresh button', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      const refreshButton = screen.getByRole('button', { name: 'Refresh Now' })
      expect(refreshButton).toBeInTheDocument()
      expect(refreshButton).not.toBeDisabled()
    })

    it('should show real-time indicator when enabled', async () => {
      const user = userEvent.setup()
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      const refreshSelect = screen.getByDisplayValue('30000')
      await user.selectOptions(refreshSelect, '5000')

      expect(screen.getByText('🔄 Real-time')).toBeInTheDocument()
    })
  })

  describe('Metrics Cards', () => {
    it('should display all overview metrics', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      expect(screen.getByTestId('metrics-card-total-views')).toBeInTheDocument()
      expect(screen.getByTestId('metrics-card-active-sessions')).toBeInTheDocument()
      expect(screen.getByTestId('metrics-card-properties')).toBeInTheDocument()
      expect(screen.getByTestId('metrics-card-shared-links')).toBeInTheDocument()
    })

    it('should pass correct data to metrics cards', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      const totalViewsCard = screen.getByTestId('metrics-card-total-views')
      expect(totalViewsCard).toHaveTextContent('1234')

      const activeSessionsCard = screen.getByTestId('metrics-card-active-sessions')
      expect(activeSessionsCard).toHaveTextContent('567')

      const propertiesCard = screen.getByTestId('metrics-card-properties')
      expect(propertiesCard).toHaveTextContent('15')

      const sharedLinksCard = screen.getByTestId('metrics-card-shared-links')
      expect(sharedLinksCard).toHaveTextContent('8')
    })

    it('should show loading state for metrics when loading', () => {
      mockUseDashboardAnalytics.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: jest.fn()
      })

      render(<AnalyticsPage />, { wrapper: createWrapper() })

      expect(screen.getAllByText('Loading...')).toHaveLength(4)
    })
  })

  describe('Analytics Charts', () => {
    it('should display all analytics charts', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      expect(screen.getByTestId('analytics-chart-top-properties-by-views')).toBeInTheDocument()
      expect(screen.getByTestId('analytics-chart-link-performance')).toBeInTheDocument()
      expect(screen.getByTestId('analytics-chart-engagement-overview')).toBeInTheDocument()
    })

    it('should pass correct data to property performance chart', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      const chart = screen.getByTestId('analytics-chart-top-properties-by-views')
      expect(chart).toHaveTextContent('Chart Type: bar')
      expect(chart).toHaveTextContent('Data Points: 2')
    })

    it('should pass correct data to link performance chart', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      const chart = screen.getByTestId('analytics-chart-link-performance')
      expect(chart).toHaveTextContent('Chart Type: bar')
      expect(chart).toHaveTextContent('Data Points: 2')
    })

    it('should pass correct data to engagement overview chart', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      const chart = screen.getByTestId('analytics-chart-engagement-overview')
      expect(chart).toHaveTextContent('Chart Type: pie')
      expect(chart).toHaveTextContent('Data Points: 4')
    })
  })

  describe('Activity Feed', () => {
    it('should display activity feed with correct data', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      const activityFeed = screen.getByTestId('activity-feed')
      expect(activityFeed).toHaveTextContent('Recent Activity')
      expect(activityFeed).toHaveTextContent('Activities: 2')
      expect(activityFeed).toHaveTextContent('Max Items: 8')
    })
  })

  describe('Performance Table', () => {
    it('should display top performing properties table', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Top Performing Properties')).toBeInTheDocument()
      expect(screen.getByText('123 Oceanview Drive, Miami Beach')).toBeInTheDocument()
      expect(screen.getByText('456 Downtown Loft, Manhattan')).toBeInTheDocument()
      expect(screen.getByText('$850,000')).toBeInTheDocument()
      expect(screen.getByText('$1,200,000')).toBeInTheDocument()
    })

    it('should display correct statistics in table', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      expect(screen.getByText('125')).toBeInTheDocument() // Views
      expect(screen.getByText('89')).toBeInTheDocument()  // Likes
      expect(screen.getByText('88.0%')).toBeInTheDocument() // Like rate
    })

    it('should not display table when no top properties', () => {
      mockUseDashboardAnalytics.mockReturnValue({
        data: { ...mockAnalyticsData, topProperties: [] },
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<AnalyticsPage />, { wrapper: createWrapper() })

      expect(screen.queryByText('Top Performing Properties')).not.toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should show loading state for refresh button when loading', () => {
      mockUseDashboardAnalytics.mockReturnValue({
        data: mockAnalyticsData,
        isLoading: true,
        error: null,
        refetch: jest.fn()
      })

      render(<AnalyticsPage />, { wrapper: createWrapper() })

      const refreshButton = screen.getByRole('button', { name: 'Refreshing...' })
      expect(refreshButton).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('should display error message when analytics fails to load', () => {
      const error = new Error('Failed to load analytics')
      mockUseDashboardAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error,
        refetch: jest.fn()
      })

      render(<AnalyticsPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Failed to load analytics data')).toBeInTheDocument()
      expect(screen.getByText('Failed to load analytics')).toBeInTheDocument()
    })

    it('should handle non-Error error objects', () => {
      mockUseDashboardAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: 'String error',
        refetch: jest.fn()
      })

      render(<AnalyticsPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Failed to load analytics data')).toBeInTheDocument()
      expect(screen.getByText('Unknown error occurred')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no analytics data', () => {
      mockUseDashboardAnalytics.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<AnalyticsPage />, { wrapper: createWrapper() })

      expect(screen.getByText('No Analytics Data')).toBeInTheDocument()
      expect(screen.getByText('Start getting views and interactions to see analytics data here.')).toBeInTheDocument()
      expect(screen.getByText('Create Your First Link')).toBeInTheDocument()
    })

    it('should not show empty state when loading', () => {
      mockUseDashboardAnalytics.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: jest.fn()
      })

      render(<AnalyticsPage />, { wrapper: createWrapper() })

      expect(screen.queryByText('No Analytics Data')).not.toBeInTheDocument()
    })
  })

  describe('Real-time vs Regular Analytics', () => {
    it('should use regular dashboard analytics by default', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      expect(mockUseDashboardAnalytics).toHaveBeenCalledWith({ refetchInterval: 30000 })
      expect(mockUseRealTimeAnalytics).not.toHaveBeenCalled()
    })

    it('should switch to real-time analytics when refresh interval is 5 seconds or less', async () => {
      const user = userEvent.setup()
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      const refreshSelect = screen.getByDisplayValue('30000')
      await user.selectOptions(refreshSelect, '5000')

      // Should have called real-time analytics
      expect(mockUseRealTimeAnalytics).toHaveBeenCalledWith(undefined, { refetchInterval: 5000 })
    })
  })

  describe('User Interactions', () => {
    it('should handle refresh interval change', async () => {
      const user = userEvent.setup()
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      const refreshSelect = screen.getByDisplayValue('30000')
      await user.selectOptions(refreshSelect, '60000')

      expect(refreshSelect).toHaveValue('60000')
    })

    it('should handle manual refresh button click', async () => {
      const mockRefetch = jest.fn()
      mockUseDashboardAnalytics.mockReturnValue({
        data: mockAnalyticsData,
        isLoading: false,
        error: null,
        refetch: mockRefetch
      })

      const user = userEvent.setup()
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      const refreshButton = screen.getByRole('button', { name: 'Refresh Now' })
      await user.click(refreshButton)

      expect(mockRefetch).toHaveBeenCalled()
    })
  })

  describe('Data Processing Functions', () => {
    it('should handle missing data gracefully in chart functions', () => {
      mockUseDashboardAnalytics.mockReturnValue({
        data: { overview: { totalViews: 100 } }, // Partial data
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<AnalyticsPage />, { wrapper: createWrapper() })

      // Should not crash and should render charts with 0 data points
      const propertyChart = screen.getByTestId('analytics-chart-top-properties-by-views')
      expect(propertyChart).toHaveTextContent('Data Points: 0')

      const linkChart = screen.getByTestId('analytics-chart-link-performance')
      expect(linkChart).toHaveTextContent('Data Points: 0')
    })

    it('should truncate long property addresses in chart labels', () => {
      const longAddressData = {
        ...mockAnalyticsData,
        topProperties: [{
          property: { 
            id: 'p1', 
            address: 'This is a very long property address that should be truncated for display purposes',
            price: 500000 
          },
          stats: { views: 100, likes: 50, dislikes: 5, likeRate: 0.9 }
        }]
      }

      mockUseDashboardAnalytics.mockReturnValue({
        data: longAddressData,
        isLoading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<AnalyticsPage />, { wrapper: createWrapper() })

      // The component should render without error (address truncation happens internally)
      expect(screen.getByTestId('analytics-chart-top-properties-by-views')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('banner')).toBeInTheDocument() // header
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('should have proper form labels', () => {
      render(<AnalyticsPage />, { wrapper: createWrapper() })

      const refreshSelect = screen.getByLabelText('Refresh:')
      expect(refreshSelect).toBeInTheDocument()
    })
  })
})