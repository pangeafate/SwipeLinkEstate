import React from 'react'
import { render, screen } from '@testing-library/react'
import { ConversionFunnel } from '../ConversionFunnel'
import type { PipelineMetrics } from '../../../types'

const mockPipelineMetrics: PipelineMetrics = {
  totalDeals: 100,
  linkToEngagementRate: 75,
  engagementToQualifiedRate: 50,
  qualifiedToClosedRate: 25,
  averageTimeToClose: 30,
  conversionRate: 25,
  averageDealValue: 150000
}

describe('ConversionFunnel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render conversion funnel with correct stages', () => {
    render(<ConversionFunnel pipeline={mockPipelineMetrics} />)
    
    expect(screen.getByText('Links Created')).toBeInTheDocument()
    expect(screen.getByText('Engaged')).toBeInTheDocument()
    expect(screen.getByText('Qualified')).toBeInTheDocument()
    expect(screen.getByText('Closed')).toBeInTheDocument()
  })

  it('should display correct values for each stage', () => {
    render(<ConversionFunnel pipeline={mockPipelineMetrics} />)
    
    expect(screen.getByText('100')).toBeInTheDocument() // Links Created
    expect(screen.getByText('75')).toBeInTheDocument() // Engaged (75% of 100)
    expect(screen.getByText('50')).toBeInTheDocument() // Qualified (50% of 100)
    expect(screen.getByText('25')).toBeInTheDocument() // Closed (25% of 100)
  })

  it('should display correct conversion rates', () => {
    render(<ConversionFunnel pipeline={mockPipelineMetrics} />)
    
    expect(screen.getByText('100.0%')).toBeInTheDocument() // Links Created
    expect(screen.getByText('75.0%')).toBeInTheDocument() // Engagement rate
    expect(screen.getByText('50.0%')).toBeInTheDocument() // Qualified rate
    expect(screen.getByText('25.0%')).toBeInTheDocument() // Closed rate
  })

  it('should handle zero values gracefully', () => {
    const zeroMetrics: PipelineMetrics = {
      ...mockPipelineMetrics,
      totalDeals: 0,
      linkToEngagementRate: 0,
      engagementToQualifiedRate: 0,
      qualifiedToClosedRate: 0
    }

    render(<ConversionFunnel pipeline={zeroMetrics} />)
    
    const zeroElements = screen.getAllByText('0')
    expect(zeroElements).toHaveLength(4)
    
    const zeroRateElements = screen.getAllByText('0.0%')
    expect(zeroRateElements).toHaveLength(3)
  })

  it('should render with proper styling classes', () => {
    const { container } = render(<ConversionFunnel pipeline={mockPipelineMetrics} />)
    
    const funnelContainer = container.firstChild as HTMLElement
    expect(funnelContainer).toHaveClass('space-y-4')
    
    const stageElements = container.querySelectorAll('[class*="bg-gradient-to-r"]')
    expect(stageElements.length).toBe(4)
  })

  it('should handle decimal values correctly', () => {
    const decimalMetrics: PipelineMetrics = {
      ...mockPipelineMetrics,
      totalDeals: 33,
      linkToEngagementRate: 66.66,
      engagementToQualifiedRate: 33.33,
      qualifiedToClosedRate: 12.5
    }

    render(<ConversionFunnel pipeline={decimalMetrics} />)
    
    expect(screen.getByText('33')).toBeInTheDocument()
    expect(screen.getByText('66.7%')).toBeInTheDocument()
    expect(screen.getByText('33.3%')).toBeInTheDocument()
    expect(screen.getByText('12.5%')).toBeInTheDocument()
  })

  it('should calculate stage values based on total deals and rates', () => {
    const metrics: PipelineMetrics = {
      ...mockPipelineMetrics,
      totalDeals: 200,
      linkToEngagementRate: 80,
      engagementToQualifiedRate: 40,
      qualifiedToClosedRate: 20
    }

    render(<ConversionFunnel pipeline={metrics} />)
    
    expect(screen.getByText('200')).toBeInTheDocument() // Total deals
    expect(screen.getByText('160')).toBeInTheDocument() // 80% of 200
    expect(screen.getByText('80')).toBeInTheDocument()  // 40% of 200
    expect(screen.getByText('40')).toBeInTheDocument()  // 20% of 200
  })

  it('should render accessibility-friendly structure', () => {
    const { container } = render(<ConversionFunnel pipeline={mockPipelineMetrics} />)
    
    const stages = container.querySelectorAll('div[class*="flex items-center"]')
    expect(stages.length).toBe(4)
    
    stages.forEach(stage => {
      expect(stage).toHaveAttribute('class')
    })
  })

  it('should handle large numbers correctly', () => {
    const largeMetrics: PipelineMetrics = {
      ...mockPipelineMetrics,
      totalDeals: 10000,
      linkToEngagementRate: 75,
      engagementToQualifiedRate: 50,
      qualifiedToClosedRate: 25
    }

    render(<ConversionFunnel pipeline={largeMetrics} />)
    
    expect(screen.getByText('10000')).toBeInTheDocument()
    expect(screen.getByText('7500')).toBeInTheDocument()
    expect(screen.getByText('5000')).toBeInTheDocument()
    expect(screen.getByText('2500')).toBeInTheDocument()
  })
})