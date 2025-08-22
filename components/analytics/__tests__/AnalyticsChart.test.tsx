import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AnalyticsChart } from '../AnalyticsChart'
import { setupTest } from '@/test/utils/testSetup'
import { fixtures } from '@/test/fixtures'

describe('AnalyticsChart - Comprehensive', () => {
  setupTest({ suppressConsoleErrors: true })

  const mockData = fixtures.chartData.basic

  describe('Basic Functionality', () => {
    it('should render chart with title', () => {
      render(<AnalyticsChart title="Test Chart" data={mockData} type="bar" />)
      
      expect(screen.getByText('Test Chart')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <AnalyticsChart 
          title="Test Chart" 
          data={mockData} 
          type="bar" 
          className="custom-class" 
        />
      )
      
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should show empty state when no data', () => {
      render(<AnalyticsChart title="Empty Chart" data={[]} type="bar" />)
      
      expect(screen.getByText('Empty Chart')).toBeInTheDocument()
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('should have proper heading structure', () => {
      render(<AnalyticsChart title="Accessible Chart" data={mockData} type="bar" />)
      
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Accessible Chart')
    })
  })

  describe('Chart Types', () => {
    it('should render different chart types correctly', () => {
      const chartTypes: Array<'bar' | 'line' | 'pie' | 'doughnut'> = ['bar', 'line', 'pie', 'doughnut']
      
      chartTypes.forEach((type) => {
        const { unmount } = render(
          <AnalyticsChart title={`${type} Chart`} data={mockData} type={type} />
        )
        
        expect(screen.getByText(`${type} Chart`)).toBeInTheDocument()
        expect(screen.getByText('Views')).toBeInTheDocument()
        unmount()
      })
    })

    it('should show empty state for all chart types', () => {
      const chartTypes: Array<'bar' | 'line' | 'pie' | 'doughnut'> = ['bar', 'line', 'pie', 'doughnut']
      
      chartTypes.forEach((type) => {
        const { unmount } = render(
          <AnalyticsChart title={`Empty ${type} Chart`} data={[]} type={type} />
        )
        
        expect(screen.getByText('No data available')).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Data Handling', () => {
    it('should render bar chart correctly', () => {
      render(<AnalyticsChart title="Bar Chart" data={mockData} type="bar" />)
      
      expect(screen.getByText('Views')).toBeInTheDocument()
      expect(screen.getByText('Likes')).toBeInTheDocument()
      expect(screen.getByText('Dislikes')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('75')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
    })

    it('should handle single data point', () => {
      const singleData = [{ label: 'Single', value: 42 }]
      
      render(<AnalyticsChart title="Single Point" data={singleData} type="bar" />)
      
      expect(screen.getByText('Single')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('should handle data with custom colors', () => {
      const coloredData = [
        { label: 'Red', value: 50, color: 'bg-red-500' },
        { label: 'Blue', value: 30, color: 'bg-blue-500' }
      ]
      
      render(<AnalyticsChart title="Colored Chart" data={coloredData} type="bar" />)
      
      expect(screen.getByText('Red')).toBeInTheDocument()
      expect(screen.getByText('Blue')).toBeInTheDocument()
    })

    it('should handle edge case values', () => {
      const edgeData = [
        { label: 'Zero', value: 0 },
        { label: 'Negative', value: -10 },
        { label: 'Large', value: 1000000 }
      ]
      
      render(<AnalyticsChart title="Edge Cases" data={edgeData} type="bar" />)
      
      expect(screen.getByText('Zero')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText('Negative')).toBeInTheDocument()
      expect(screen.getByText('-10')).toBeInTheDocument()
      expect(screen.getByText('Large')).toBeInTheDocument()
      expect(screen.getByText('1000000')).toBeInTheDocument()
    })
  })

  describe('Label Handling', () => {
    it('should truncate long labels and provide title attribute', () => {
      const longLabelData = [
        { label: 'Very Long Label That Should Be Truncated', value: 50 }
      ]
      
      render(<AnalyticsChart title="Long Labels" data={longLabelData} type="bar" />)
      
      const labelElement = screen.getByText('Very Long Label That Should Be Truncated')
      expect(labelElement).toHaveClass('truncate')
      expect(labelElement).toHaveAttribute('title', 'Very Long Label That Should Be Truncated')
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive classes', () => {
      const { container } = render(
        <AnalyticsChart title="Responsive Chart" data={mockData} type="bar" />
      )
      
      expect(container.firstChild).toHaveClass('bg-white', 'rounded-lg', 'shadow', 'p-6')
    })
  })
})