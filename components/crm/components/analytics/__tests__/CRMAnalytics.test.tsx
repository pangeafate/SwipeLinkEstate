import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CRMAnalytics } from '../CRMAnalytics'
import { CRMService } from '../../../crm.service'
import type { CRMDashboard } from '../../../types'

// Mock the CRMService
jest.mock('../../../crm.service')
const mockCRMService = CRMService as jest.Mocked<typeof CRMService>

const mockDashboardData: CRMDashboard = {
  summary: {
    totalDeals: 42,
    hotLeads: 15,
    pendingTasks: 8,
    thisMonthRevenue: 250000
  },
  pipeline: {
    totalDeals: 42,
    activeDeals: 32,
    dealsByStage: {
      created: 10,
      shared: 8,
      accessed: 6,
      engaged: 4,
      qualified: 3,
      advanced: 2,
      closed: 1
    },
    dealsByStatus: {
      active: 32,
      qualified: 5,
      nurturing: 3,
      'closed-won': 1,
      'closed-lost': 1
    },
    linkToEngagementRate: 75,
    engagementToQualifiedRate: 50,
    qualifiedToClosedRate: 25,
    overallConversionRate: 25,
    totalPipelineValue: 6300000,
    averageDealValue: 150000,
    projectedRevenue: 1575000,
    averageDealsPerAgent: 14,
    averageDealCycle: 30,
    dealVolumeChange: 15,
    conversionRateChange: 5,
    revenueChange: 12
  },
  recentActivity: {
    newDeals: [
      { id: '1', dealName: 'Luxury Condo Deal', createdAt: '2024-01-15T10:00:00Z' }
    ],
    completedTasks: [
      { id: '2', title: 'Follow up with client', completedAt: '2024-01-16T09:00:00Z' }
    ],
    hotLeads: [
      { id: '3', clientName: 'John Doe', updatedAt: '2024-01-17T11:00:00Z' }
    ]
  },
  upcomingTasks: [
    {
      id: 'task-1',
      title: 'Follow up with client',
      description: 'Call John Doe about property viewing',
      priority: 'urgent',
      dueDate: '2024-01-20',
      type: 'Follow-up'
    }
  ],
  performanceMetrics: {
    thisMonth: {
      dealsCreated: 15,
      dealsClosed: 4,
      revenue: 250000,
      conversionRate: 24
    },
    lastMonth: {
      dealsCreated: 12,
      dealsClosed: 3,
      revenue: 180000,
      conversionRate: 22
    }
  }
}

describe('CRMAnalytics Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCRMService.getCRMDashboard.mockResolvedValue(mockDashboardData)
  })

  it('should render analytics dashboard with all sections', async () => {
    render(<CRMAnalytics />)
    
    await waitFor(() => {
      expect(screen.getByText('CRM Analytics')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Real estate deal pipeline and performance metrics')).toBeInTheDocument()
    expect(screen.getByText('Total Deals')).toBeInTheDocument()
    expect(screen.getByText('Hot Leads')).toBeInTheDocument()
    expect(screen.getByText('Pending Tasks')).toBeInTheDocument()
    expect(screen.getAllByText('Revenue').length).toBeGreaterThanOrEqual(1)
  })

  it('should display loading state initially', () => {
    mockCRMService.getCRMDashboard.mockImplementation(() => new Promise(() => {}))
    
    render(<CRMAnalytics />)
    
    const loadingElements = document.querySelectorAll('.animate-pulse')
    expect(loadingElements.length).toBeGreaterThan(0)
  })

  it('should call CRMService.getCRMDashboard on mount', async () => {
    render(<CRMAnalytics />)
    
    await waitFor(() => {
      expect(mockCRMService.getCRMDashboard).toHaveBeenCalledTimes(1)
    })
    
    expect(mockCRMService.getCRMDashboard).toHaveBeenCalledWith(undefined)
  })

  it('should call CRMService.getCRMDashboard with agentId when provided', async () => {
    render(<CRMAnalytics agentId="agent-123" />)
    
    await waitFor(() => {
      expect(mockCRMService.getCRMDashboard).toHaveBeenCalledWith('agent-123')
    })
  })

  it('should display summary cards with correct values', async () => {
    render(<CRMAnalytics />)
    
    await waitFor(() => {
      expect(screen.getAllByText('42').length).toBeGreaterThanOrEqual(1) // Total Deals (may appear in multiple places)
      expect(screen.getAllByText('15').length).toBeGreaterThanOrEqual(1) // Hot Leads (may appear in performance data too)
      expect(screen.getAllByText('8').length).toBeGreaterThanOrEqual(1) // Pending Tasks
      expect(screen.getAllByText('$250,000').length).toBeGreaterThanOrEqual(1) // Revenue
    })
  })

  it('should display section headers', async () => {
    render(<CRMAnalytics />)
    
    await waitFor(() => {
      expect(screen.getByText('CRM Analytics')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Deal Pipeline')).toBeInTheDocument()
    expect(screen.getByText('Performance Trends')).toBeInTheDocument()
    expect(screen.getByText('Conversion Funnel')).toBeInTheDocument()
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('Upcoming Tasks')).toBeInTheDocument()
  })

  it('should handle timeframe selection', async () => {
    render(<CRMAnalytics />)
    
    await waitFor(() => {
      expect(screen.getByText('CRM Analytics')).toBeInTheDocument()
    })
    
    const timeframeSelect = screen.getByDisplayValue('Last 30 days')
    fireEvent.change(timeframeSelect, { target: { value: '7d' } })
    
    expect(timeframeSelect).toHaveValue('7d')
  })

  it('should handle refresh button click', async () => {
    render(<CRMAnalytics />)
    
    await waitFor(() => {
      expect(screen.getByText('CRM Analytics')).toBeInTheDocument()
    })
    
    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)
    
    expect(mockCRMService.getCRMDashboard).toHaveBeenCalledTimes(2)
  })

  it('should display error state when data loading fails', async () => {
    const errorMessage = 'API Error'
    mockCRMService.getCRMDashboard.mockRejectedValue(new Error(errorMessage))
    
    render(<CRMAnalytics />)
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('should retry data loading when retry button is clicked', async () => {
    mockCRMService.getCRMDashboard.mockRejectedValueOnce(new Error('API Error'))
    mockCRMService.getCRMDashboard.mockResolvedValueOnce(mockDashboardData)
    
    render(<CRMAnalytics />)
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument()
    })
    
    const retryButton = screen.getByText('Retry')
    fireEvent.click(retryButton)
    
    await waitFor(() => {
      expect(screen.getByText('CRM Analytics')).toBeInTheDocument()
    })
    
    expect(mockCRMService.getCRMDashboard).toHaveBeenCalledTimes(2)
  })

  it('should display no data state when dashboard data is null', async () => {
    mockCRMService.getCRMDashboard.mockResolvedValue(null as any)
    
    render(<CRMAnalytics />)
    
    await waitFor(() => {
      expect(screen.getByText('No dashboard data available')).toBeInTheDocument()
    })
  })

  it('should render all modular components', async () => {
    render(<CRMAnalytics />)
    
    await waitFor(() => {
      expect(screen.getByText('CRM Analytics')).toBeInTheDocument()
    })
    
    // Check for summary cards
    expect(screen.getByText('Total Deals')).toBeInTheDocument()
    expect(screen.getByText('Hot Leads')).toBeInTheDocument()
    
    // Check for pipeline visualization
    expect(screen.getByText('Deal Pipeline')).toBeInTheDocument()
    
    // Check for performance chart
    expect(screen.getByText('Performance Trends')).toBeInTheDocument()
    
    // Check for conversion funnel
    expect(screen.getByText('Conversion Funnel')).toBeInTheDocument()
    
    // Check for recent activity
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    
    // Check for tasks list
    expect(screen.getByText('Upcoming Tasks')).toBeInTheDocument()
  })

  it('should reload data when timeframe changes', async () => {
    render(<CRMAnalytics />)
    
    await waitFor(() => {
      expect(mockCRMService.getCRMDashboard).toHaveBeenCalledTimes(1)
    })
    
    const timeframeSelect = screen.getByDisplayValue('Last 30 days')
    fireEvent.change(timeframeSelect, { target: { value: '90d' } })
    
    await waitFor(() => {
      expect(mockCRMService.getCRMDashboard).toHaveBeenCalledTimes(2)
    })
  })

  it('should reload data when agentId changes', async () => {
    const { rerender } = render(<CRMAnalytics agentId="agent-123" />)
    
    await waitFor(() => {
      expect(mockCRMService.getCRMDashboard).toHaveBeenCalledWith('agent-123')
    })
    
    rerender(<CRMAnalytics agentId="agent-456" />)
    
    await waitFor(() => {
      expect(mockCRMService.getCRMDashboard).toHaveBeenCalledWith('agent-456')
    })
    
    expect(mockCRMService.getCRMDashboard).toHaveBeenCalledTimes(2)
  })

  it('should handle console errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const error = new Error('Test error')
    mockCRMService.getCRMDashboard.mockRejectedValue(error)
    
    render(<CRMAnalytics />)
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument()
    })
    
    expect(consoleSpy).toHaveBeenCalledWith('Error loading CRM dashboard:', error)
    
    consoleSpy.mockRestore()
  })

  it('should limit upcoming tasks to 5 items', async () => {
    const dashboardWithManyTasks: CRMDashboard = {
      ...mockDashboardData,
      upcomingTasks: Array.from({ length: 10 }, (_, i) => ({
        id: `task-${i}`,
        dealId: 'deal-1',
        agentId: 'agent-1',
        title: `Task ${i}`,
        description: `Description ${i}`,
        priority: 'medium' as any,
        dueDate: '2024-01-30',
        type: 'General',
        status: 'pending' as any,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      }))
    }
    
    mockCRMService.getCRMDashboard.mockResolvedValue(dashboardWithManyTasks)
    
    render(<CRMAnalytics />)
    
    await waitFor(() => {
      expect(screen.getByText('Upcoming Tasks')).toBeInTheDocument()
    })
    
    // Should only show 5 tasks (slice(0, 5))
    expect(screen.getByText('Task 0')).toBeInTheDocument()
    expect(screen.getByText('Task 4')).toBeInTheDocument()
    expect(screen.queryByText('Task 5')).not.toBeInTheDocument()
  })

  it('should have proper accessibility structure', async () => {
    const { container } = render(<CRMAnalytics />)
    
    await waitFor(() => {
      expect(screen.getByText('CRM Analytics')).toBeInTheDocument()
    })
    
    const headings = container.querySelectorAll('h1, h2, h3')
    expect(headings.length).toBeGreaterThan(0)
    
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})