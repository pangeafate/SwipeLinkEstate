/**
 * Test for dashboard error fix
 * Testing the issue where properties.length causes "Cannot read properties of undefined"
 */
import { render, screen } from '@testing-library/react'
import AgentDashboard from '../page'

// Mock the query hooks to simulate error conditions
jest.mock('@/lib/query/usePropertiesQuery', () => ({
  usePropertiesQuery: jest.fn()
}))

jest.mock('@/lib/query/useAnalyticsQuery', () => ({
  useDashboardAnalytics: jest.fn()
}))

jest.mock('@/lib/query/useLinksQuery', () => ({
  useLinksQuery: jest.fn()
}))

// Mock components to focus on the data handling logic
jest.mock('@/components/debug/PropertyDebug', () => {
  const MockPropertyDebug = () => <div>PropertyDebug</div>
  MockPropertyDebug.displayName = 'MockPropertyDebug'
  return MockPropertyDebug
})
jest.mock('@/components/agent/PropertyCard', () => {
  const MockPropertyCard = () => <div>PropertyCard</div>
  MockPropertyCard.displayName = 'MockPropertyCard'
  return MockPropertyCard
})
jest.mock('@/components/property/components/PropertyForm', () => {
  const MockPropertyForm = () => <div>PropertyForm</div>
  MockPropertyForm.displayName = 'MockPropertyForm'
  return MockPropertyForm
})

describe('Dashboard Error Fix', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
  })

  it('should handle undefined properties data without crashing', () => {
    // ARRANGE - Mock hooks to return undefined data
    const { usePropertiesQuery } = require('@/lib/query/usePropertiesQuery')
    const { useDashboardAnalytics } = require('@/lib/query/useAnalyticsQuery')
    const { useLinksQuery } = require('@/lib/query/useLinksQuery')

    usePropertiesQuery.mockReturnValue({
      data: undefined, // This should cause the error
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
      data: undefined,
      isLoading: false
    })

    // ACT & ASSERT - Should not crash when data is undefined
    expect(() => {
      render(<AgentDashboard />)
    }).not.toThrow()

    // Should show "No properties found" message
    expect(screen.getByText('No properties found')).toBeInTheDocument()
  })

  it('should handle properties data with null/undefined properties array', () => {
    // ARRANGE - Mock hooks to return data with undefined properties
    const { usePropertiesQuery } = require('@/lib/query/usePropertiesQuery')
    const { useDashboardAnalytics } = require('@/lib/query/useAnalyticsQuery')
    const { useLinksQuery } = require('@/lib/query/useLinksQuery')

    usePropertiesQuery.mockReturnValue({
      data: { data: null }, // Properties array is null
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
      data: { data: undefined }, // Links array is undefined
      isLoading: false
    })

    // ACT & ASSERT - Should not crash when properties array is null
    expect(() => {
      render(<AgentDashboard />)
    }).not.toThrow()

    // Should show "No properties found" message
    expect(screen.getByText('No properties found')).toBeInTheDocument()
  })
})