/**
 * Test for dashboard properties rendering fix
 * Testing that properties are correctly accessed from React Query data
 */
import { render, screen } from '@testing-library/react'
import AgentDashboard from '../page'

// Mock the query hooks
jest.mock('@/lib/query/usePropertiesQuery', () => ({
  usePropertiesQuery: jest.fn()
}))

jest.mock('@/lib/query/useAnalyticsQuery', () => ({
  useDashboardAnalytics: jest.fn()
}))

jest.mock('@/lib/query/useLinksQuery', () => ({
  useLinksQuery: jest.fn()
}))

// Mock components
jest.mock('@/components/debug/PropertyDebug', () => {
  const MockPropertyDebug = () => <div>PropertyDebug</div>
  MockPropertyDebug.displayName = 'MockPropertyDebug'
  return MockPropertyDebug
})
jest.mock('@/components/agent/PropertyCard', () => {
  const MockPropertyCard = ({ property }: any) => (
    <div data-testid="property-card">{property.address}</div>
  )
  MockPropertyCard.displayName = 'MockPropertyCard'
  return MockPropertyCard
})
jest.mock('@/components/property/components/PropertyForm', () => {
  const MockPropertyForm = () => <div>PropertyForm</div>
  MockPropertyForm.displayName = 'MockPropertyForm'
  return MockPropertyForm
})

describe('Dashboard Properties Rendering Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render properties when React Query returns array directly', () => {
    // ARRANGE - Mock hooks to return data as direct arrays (not wrapped in .data)
    const mockProperties = [
      { id: '1', address: '123 Ocean Drive', status: 'active', price: 850000 },
      { id: '2', address: '456 Collins Ave', status: 'active', price: 1250000 }
    ]

    const { usePropertiesQuery } = require('@/lib/query/usePropertiesQuery')
    const { useDashboardAnalytics } = require('@/lib/query/useAnalyticsQuery')
    const { useLinksQuery } = require('@/lib/query/useLinksQuery')

    usePropertiesQuery.mockReturnValue({
      data: mockProperties, // Direct array, not { data: [...] }
      isLoading: false,
      error: null,
      refetch: jest.fn()
    })

    useDashboardAnalytics.mockReturnValue({
      data: {
        overview: {
          totalProperties: 2,
          activeProperties: 2,
          totalLinks: 0,
          totalViews: 0,
          totalSessions: 0,
          avgSessionDuration: 0
        }
      },
      isLoading: false,
      error: null
    })

    useLinksQuery.mockReturnValue({
      data: [], // Direct array
      isLoading: false
    })

    // ACT
    render(<AgentDashboard />)

    // ASSERT - Properties should be rendered
    const propertyCards = screen.getAllByTestId('property-card')
    expect(propertyCards).toHaveLength(2)
    expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
    expect(screen.getByText('456 Collins Ave')).toBeInTheDocument()
  })

  it('should show "No properties found" when React Query returns empty array', () => {
    // ARRANGE
    const { usePropertiesQuery } = require('@/lib/query/usePropertiesQuery')
    const { useDashboardAnalytics } = require('@/lib/query/useAnalyticsQuery')
    const { useLinksQuery } = require('@/lib/query/useLinksQuery')

    usePropertiesQuery.mockReturnValue({
      data: [], // Empty array directly
      isLoading: false,
      error: null,
      refetch: jest.fn()
    })

    useDashboardAnalytics.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null
    })

    useLinksQuery.mockReturnValue({
      data: [],
      isLoading: false
    })

    // ACT
    render(<AgentDashboard />)

    // ASSERT
    expect(screen.getByText('No properties found')).toBeInTheDocument()
    expect(screen.getByText('Add Your First Property')).toBeInTheDocument()
  })

  it('should correctly count links from direct array', () => {
    // ARRANGE
    const mockLinks = [
      { id: '1', code: 'ABC123', name: 'Test Link 1' },
      { id: '2', code: 'DEF456', name: 'Test Link 2' }
    ]

    const { usePropertiesQuery } = require('@/lib/query/usePropertiesQuery')
    const { useDashboardAnalytics } = require('@/lib/query/useAnalyticsQuery')
    const { useLinksQuery } = require('@/lib/query/useLinksQuery')

    usePropertiesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn()
    })

    useDashboardAnalytics.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null
    })

    useLinksQuery.mockReturnValue({
      data: mockLinks, // Direct array
      isLoading: false
    })

    // ACT
    render(<AgentDashboard />)

    // ASSERT - Should show correct link count
    const activeLinksSection = screen.getByText('Active Links').parentElement
    expect(activeLinksSection).toHaveTextContent('2')
  })
})