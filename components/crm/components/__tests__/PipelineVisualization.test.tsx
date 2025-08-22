/**
 * PipelineVisualization Component Tests
 * Following TDD approach with shared test infrastructure
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from '@jest/globals'
import { PipelineVisualization } from '../analytics/PipelineVisualization'
import type { PipelineMetrics } from '../../types'

describe('PipelineVisualization Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const mockPipelineData: PipelineMetrics = {
    totalDeals: 45,
    activeDeals: 32,
    dealsByStage: {
      created: 5,
      shared: 8,
      accessed: 12,
      engaged: 10,
      qualified: 6,
      advanced: 3,
      closed: 1
    },
    dealsByStatus: {
      active: 32,
      qualified: 8,
      nurturing: 4,
      'closed-won': 1,
      'closed-lost': 0
    },
    linkToEngagementRate: 75.5,
    engagementToQualifiedRate: 60.0,
    qualifiedToClosedRate: 12.5,
    overallConversionRate: 5.7,
    totalPipelineValue: 450000,
    averageDealValue: 10000,
    projectedRevenue: 50000,
    averageDealsPerAgent: 15,
    averageDealCycle: 45,
    dealVolumeChange: 15.3,
    conversionRateChange: -2.1,
    revenueChange: 8.9
  }

  it('should render pipeline stages with correct counts', () => {
    // ARRANGE & ACT
    render(<PipelineVisualization pipeline={mockPipelineData} />)

    // ASSERT
    expect(screen.getByText('Created')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Shared')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('Accessed')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('should display conversion rates', () => {
    // ARRANGE & ACT
    render(<PipelineVisualization pipeline={mockPipelineData} />)

    // ASSERT
    expect(screen.getByText('75.5%')).toBeInTheDocument()
    expect(screen.getByText('60.0%')).toBeInTheDocument()
    expect(screen.getByText('12.5%')).toBeInTheDocument()
  })

  it('should show total pipeline value', () => {
    // ARRANGE & ACT
    render(<PipelineVisualization pipeline={mockPipelineData} />)

    // ASSERT
    expect(screen.getByText('$450,000')).toBeInTheDocument()
    expect(screen.getByText('Total Pipeline Value')).toBeInTheDocument()
  })

  it('should handle zero values gracefully', () => {
    // ARRANGE
    const emptyPipeline: PipelineMetrics = {
      ...mockPipelineData,
      totalDeals: 0,
      activeDeals: 0,
      dealsByStage: {
        created: 0,
        shared: 0,
        accessed: 0,
        engaged: 0,
        qualified: 0,
        advanced: 0,
        closed: 0
      }
    }

    // ACT
    render(<PipelineVisualization pipeline={emptyPipeline} />)

    // ASSERT
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('No active deals')).toBeInTheDocument()
  })
})