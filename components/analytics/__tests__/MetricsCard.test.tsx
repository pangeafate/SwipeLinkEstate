import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MetricsCard } from '../MetricsCard'

describe('MetricsCard', () => {
  describe('Basic Rendering', () => {
    it('should render with basic props', () => {
      render(<MetricsCard title="Total Views" value={1250} />)
      
      expect(screen.getByText('Total Views')).toBeInTheDocument()
      expect(screen.getByText('1.3k')).toBeInTheDocument() // 1250 gets formatted to 1.3k
    })

    it('should render with string value', () => {
      render(<MetricsCard title="Status" value="Active" />)
      
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <MetricsCard title="Test" value={100} className="custom-class" />
      )
      
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Value Formatting', () => {
    it('should format large numbers correctly', () => {
      render(<MetricsCard title="Big Number" value={1500000} />)
      
      expect(screen.getByText('1.5M')).toBeInTheDocument()
    })

    it('should format thousands correctly', () => {
      render(<MetricsCard title="Thousands" value={1500} />)
      
      expect(screen.getByText('1.5k')).toBeInTheDocument()
    })

    it('should not format small numbers', () => {
      render(<MetricsCard title="Small" value={999} />)
      
      expect(screen.getByText('999')).toBeInTheDocument()
    })

    it('should handle zero values', () => {
      render(<MetricsCard title="Zero" value={0} />)
      
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle negative values', () => {
      render(<MetricsCard title="Negative" value={-1500} />)
      
      expect(screen.getByText('-1500')).toBeInTheDocument() // Negative values aren't formatted
    })

    it('should format exact millions and thousands', () => {
      render(
        <div>
          <MetricsCard title="Million" value={1000000} />
          <MetricsCard title="Thousand" value={1000} />
        </div>
      )
      
      expect(screen.getByText('1.0M')).toBeInTheDocument()
      expect(screen.getByText('1.0k')).toBeInTheDocument()
    })
  })

  describe('Icon Display', () => {
    it('should display icon when provided', () => {
      render(<MetricsCard title="Views" value={100} icon="👁️" />)
      
      expect(screen.getByText('👁️')).toBeInTheDocument()
      expect(screen.getByRole('img', { name: 'Views' })).toBeInTheDocument()
    })

    it('should not display icon container when not provided', () => {
      render(<MetricsCard title="No Icon" value={100} />)
      
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  describe('Subtitle Display', () => {
    it('should display subtitle when provided', () => {
      render(
        <MetricsCard 
          title="Views" 
          value={100} 
          subtitle="Last 30 days" 
        />
      )
      
      expect(screen.getByText('Last 30 days')).toBeInTheDocument()
    })

    it('should not display subtitle when not provided', () => {
      render(<MetricsCard title="Views" value={100} />)
      
      // Should not have any subtitle text
      expect(screen.queryByText(/days/)).not.toBeInTheDocument()
    })

    it('should have title attribute for subtitle', () => {
      render(
        <MetricsCard 
          title="Views" 
          value={100} 
          subtitle="This is a very long subtitle that might be truncated" 
        />
      )
      
      const subtitle = screen.getByText('This is a very long subtitle that might be truncated')
      expect(subtitle).toHaveAttribute('title', 'This is a very long subtitle that might be truncated')
    })
  })

  describe('Trend Display', () => {
    it('should display upward trend correctly', () => {
      render(
        <MetricsCard 
          title="Views" 
          value={100} 
          trend={{
            value: 15,
            label: 'vs last month',
            direction: 'up'
          }}
        />
      )
      
      expect(screen.getByText('↗️')).toBeInTheDocument()
      expect(screen.getByText('15%')).toBeInTheDocument()
      expect(screen.getByText('vs last month')).toBeInTheDocument()
      
      const trendElement = screen.getByText('15%').parentElement
      expect(trendElement).toHaveClass('text-green-600')
    })

    it('should display downward trend correctly', () => {
      render(
        <MetricsCard 
          title="Views" 
          value={100} 
          trend={{
            value: 10,
            label: 'vs last month',
            direction: 'down'
          }}
        />
      )
      
      expect(screen.getByText('↘️')).toBeInTheDocument()
      expect(screen.getByText('10%')).toBeInTheDocument()
      
      const trendElement = screen.getByText('10%').parentElement
      expect(trendElement).toHaveClass('text-red-600')
    })

    it('should display neutral trend correctly', () => {
      render(
        <MetricsCard 
          title="Views" 
          value={100} 
          trend={{
            value: 0,
            label: 'no change',
            direction: 'neutral'
          }}
        />
      )
      
      expect(screen.getByText('→')).toBeInTheDocument()
      expect(screen.getByText('0%')).toBeInTheDocument()
      
      const trendElement = screen.getByText('0%').parentElement
      expect(trendElement).toHaveClass('text-gray-500')
    })

    it('should handle negative trend values correctly', () => {
      render(
        <MetricsCard 
          title="Views" 
          value={100} 
          trend={{
            value: -25,
            label: 'vs last month',
            direction: 'down'
          }}
        />
      )
      
      expect(screen.getByText('25%')).toBeInTheDocument() // Should show absolute value
    })

    it('should have proper aria labels for trend icons', () => {
      render(
        <MetricsCard 
          title="Views" 
          value={100} 
          trend={{
            value: 15,
            label: 'vs last month',
            direction: 'up'
          }}
        />
      )
      
      const trendIcon = screen.getByRole('img', { name: 'trend up' })
      expect(trendIcon).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should display loading skeleton when isLoading is true', () => {
      render(<MetricsCard title="Loading" value={100} isLoading={true} />)
      
      expect(screen.queryByText('100')).not.toBeInTheDocument()
      
      // Should have animation class
      const skeleton = document.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    it('should show loading skeleton with icon placeholder when icon provided', () => {
      render(<MetricsCard title="Loading" value={100} icon="👁️" isLoading={true} />)
      
      const skeleton = document.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
      expect(screen.queryByText('👁️')).not.toBeInTheDocument()
    })

    it('should not display loading state when isLoading is false', () => {
      render(<MetricsCard title="Not Loading" value={100} isLoading={false} />)
      
      expect(screen.getByText('Not Loading')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.queryByText('animate-pulse')).not.toBeInTheDocument()
    })
  })

  describe('Hover Effects', () => {
    it('should have hover transition classes', () => {
      const { container } = render(<MetricsCard title="Hover Test" value={100} />)
      
      expect(container.firstChild).toHaveClass('hover:shadow-md', 'transition-shadow')
    })
  })

  describe('Title Attributes for Accessibility', () => {
    it('should have title attribute on value for full number', () => {
      render(<MetricsCard title="Big Number" value={1500000} />)
      
      const valueElement = screen.getByText('1.5M')
      expect(valueElement).toHaveAttribute('title', '1500000')
    })

    it('should have title attribute on string values', () => {
      render(<MetricsCard title="Status" value="Very Long Status Text" />)
      
      const valueElement = screen.getByText('Very Long Status Text')
      expect(valueElement).toHaveAttribute('title', 'Very Long Status Text')
    })
  })

  describe('Layout and Styling', () => {
    it('should have proper responsive design classes', () => {
      const { container } = render(<MetricsCard title="Responsive" value={100} />)
      
      expect(container.firstChild).toHaveClass(
        'bg-white',
        'rounded-lg', 
        'shadow',
        'p-6'
      )
    })

    it('should truncate long titles', () => {
      render(<MetricsCard title="This is a very long title that should be truncated" value={100} />)
      
      const titleElement = screen.getByText('This is a very long title that should be truncated')
      expect(titleElement).toHaveClass('truncate')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined trend direction', () => {
      render(
        <MetricsCard 
          title="Views" 
          value={100} 
          trend={{
            value: 15,
            label: 'test',
            direction: undefined as any
          }}
        />
      )
      
      expect(screen.getByText('→')).toBeInTheDocument() // Should default to neutral
      
      const trendElement = screen.getByText('15%').parentElement
      expect(trendElement).toHaveClass('text-gray-500')
    })

    it('should handle trend without label', () => {
      render(
        <MetricsCard 
          title="Views" 
          value={100} 
          trend={{
            value: 15,
            direction: 'up'
          }}
        />
      )
      
      expect(screen.getByText('15%')).toBeInTheDocument()
      expect(screen.getByText('↗️')).toBeInTheDocument()
      // Should not crash when label is undefined
    })

    it('should handle very large trend values', () => {
      render(
        <MetricsCard 
          title="Views" 
          value={100} 
          trend={{
            value: 999,
            label: 'huge increase',
            direction: 'up'
          }}
        />
      )
      
      expect(screen.getByText('999%')).toBeInTheDocument()
    })
  })

  describe('Complex Combinations', () => {
    it('should render all props together correctly', () => {
      render(
        <MetricsCard 
          title="Complete Card"
          value={1500000}
          subtitle="Last 30 days performance"
          icon="📊"
          trend={{
            value: 25,
            label: 'vs previous period',
            direction: 'up'
          }}
          className="custom-metric-card"
        />
      )
      
      expect(screen.getByText('Complete Card')).toBeInTheDocument()
      expect(screen.getByText('1.5M')).toBeInTheDocument()
      expect(screen.getByText('Last 30 days performance')).toBeInTheDocument()
      expect(screen.getByText('📊')).toBeInTheDocument()
      expect(screen.getByText('25%')).toBeInTheDocument()
      expect(screen.getByText('vs previous period')).toBeInTheDocument()
      expect(screen.getByText('↗️')).toBeInTheDocument()
    })
  })
})