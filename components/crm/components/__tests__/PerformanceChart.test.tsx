/**
 * PerformanceChart Component Tests
 * Following TDD approach with shared test infrastructure
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from '@jest/globals'
import { PerformanceChart } from '../analytics/PerformanceChart'

describe('PerformanceChart Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const mockPerformanceData = {
    thisMonth: {
      dealsCreated: 15,
      dealsClosed: 3,
      revenue: 25000,
      conversionRate: 20.0
    },
    lastMonth: {
      dealsCreated: 12,
      dealsClosed: 2,
      revenue: 18000,
      conversionRate: 16.7
    }
  }

  it('should render current month performance metrics', () => {
    // ARRANGE & ACT
    render(<PerformanceChart {...mockPerformanceData} />)

    // ASSERT
    expect(screen.getByText('This Month')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('$25,000')).toBeInTheDocument()
    expect(screen.getByText('20.0%')).toBeInTheDocument()
  })

  it('should render last month performance metrics', () => {
    // ARRANGE & ACT
    render(<PerformanceChart {...mockPerformanceData} />)

    // ASSERT
    expect(screen.getByText('Last Month')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('$18,000')).toBeInTheDocument()
    expect(screen.getByText('16.7%')).toBeInTheDocument()
  })

  it('should show metric labels', () => {
    // ARRANGE & ACT
    render(<PerformanceChart {...mockPerformanceData} />)

    // ASSERT
    expect(screen.getAllByText('Deals Created').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Deals Closed').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Revenue').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Conversion Rate').length).toBeGreaterThanOrEqual(1)
  })

  it('should handle zero values gracefully', () => {
    // ARRANGE
    const zeroData = {
      thisMonth: {
        dealsCreated: 0,
        dealsClosed: 0,
        revenue: 0,
        conversionRate: 0
      },
      lastMonth: {
        dealsCreated: 0,
        dealsClosed: 0,
        revenue: 0,
        conversionRate: 0
      }
    }

    // ACT
    render(<PerformanceChart {...zeroData} />)

    // ASSERT
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(4) // Multiple zeros for deals
    expect(screen.getAllByText('$0').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('0.0%').length).toBeGreaterThanOrEqual(1)
  })

  it('should format large revenue numbers correctly', () => {
    // ARRANGE
    const largeRevenueData = {
      thisMonth: {
        dealsCreated: 50,
        dealsClosed: 10,
        revenue: 1250000,
        conversionRate: 20.0
      },
      lastMonth: {
        dealsCreated: 45,
        dealsClosed: 8,
        revenue: 980000,
        conversionRate: 17.8
      }
    }

    // ACT
    render(<PerformanceChart {...largeRevenueData} />)

    // ASSERT
    expect(screen.getByText('$1,250,000')).toBeInTheDocument()
    expect(screen.getByText('$980,000')).toBeInTheDocument()
  })
})