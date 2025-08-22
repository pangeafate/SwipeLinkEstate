/**
 * SummaryCard Component Tests
 * Following TDD approach with shared test infrastructure
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from '@jest/globals'
import { SummaryCard } from '../analytics/SummaryCard'

describe('SummaryCard Component', () => {
  // Setup test environment for each test
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render card with basic information', () => {
    // ARRANGE
    const props = {
      title: 'Total Deals',
      value: 42,
      icon: '📊'
    }

    // ACT
    render(<SummaryCard {...props} />)

    // ASSERT
    expect(screen.getByText('Total Deals')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('📊')).toBeInTheDocument()
  })

  it('should render card with string value', () => {
    // ARRANGE
    const props = {
      title: 'Revenue',
      value: '$50,000',
      icon: '💰'
    }

    // ACT
    render(<SummaryCard {...props} />)

    // ASSERT
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('$50,000')).toBeInTheDocument()
    expect(screen.getByText('💰')).toBeInTheDocument()
  })

  it('should render positive trend indicator', () => {
    // ARRANGE
    const props = {
      title: 'Hot Leads',
      value: 15,
      icon: '🔥',
      trend: { direction: 'up' as const, percentage: 25 }
    }

    // ACT
    render(<SummaryCard {...props} />)

    // ASSERT
    expect(screen.getByText('Hot Leads')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('↗️')).toBeInTheDocument()
    expect(screen.getByText('25% vs last month')).toBeInTheDocument()
    
    // Check positive trend styling
    const trendElement = screen.getByText('25% vs last month').parentElement
    expect(trendElement).toHaveClass('text-green-600')
  })

  it('should render negative trend indicator', () => {
    // ARRANGE
    const props = {
      title: 'Pending Tasks',
      value: 8,
      icon: '✅',
      trend: { direction: 'down' as const, percentage: 15 }
    }

    // ACT
    render(<SummaryCard {...props} />)

    // ASSERT
    expect(screen.getByText('Pending Tasks')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('↘️')).toBeInTheDocument()
    expect(screen.getByText('15% vs last month')).toBeInTheDocument()
    
    // Check negative trend styling
    const trendElement = screen.getByText('15% vs last month').parentElement
    expect(trendElement).toHaveClass('text-red-600')
  })

  it('should not render trend when not provided', () => {
    // ARRANGE
    const props = {
      title: 'Simple Card',
      value: 100,
      icon: '📈'
    }

    // ACT
    render(<SummaryCard {...props} />)

    // ASSERT
    expect(screen.getByText('Simple Card')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.queryByText('vs last month')).not.toBeInTheDocument()
    expect(screen.queryByText('↗️')).not.toBeInTheDocument()
    expect(screen.queryByText('↘️')).not.toBeInTheDocument()
  })

  it('should apply correct styling classes', () => {
    // ARRANGE
    const props = {
      title: 'Styled Card',
      value: 'Test',
      icon: '🎨'
    }

    // ACT
    const { container } = render(<SummaryCard {...props} />)
    
    // ASSERT
    const cardContainer = container.firstChild as HTMLElement
    expect(cardContainer).toHaveClass('bg-white', 'rounded-xl', 'shadow-lg', 'p-6')
  })
})