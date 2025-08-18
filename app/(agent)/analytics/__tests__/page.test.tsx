import React from 'react'
import { render, screen } from '@testing-library/react'
import AnalyticsPage from '../page'

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: { children: React.ReactNode; href: string }) => {
    return <a href={href} {...props}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('AnalyticsPage', () => {
  it('should render header with navigation correctly', () => {
    // ACT
    render(<AnalyticsPage />)

    // ASSERT - Header elements
    expect(screen.getByText('SwipeLink Estate')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Analytics Dashboard' })).toBeInTheDocument()

    // ASSERT - Navigation links with correct active state
    expect(screen.getByText('Properties')).toBeInTheDocument()
    expect(screen.getByText('Links')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('should display coming soon message', () => {
    // ACT
    render(<AnalyticsPage />)

    // ASSERT - Main content
    expect(screen.getByRole('heading', { name: 'Analytics Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Track property engagement and client interactions in real-time')).toBeInTheDocument()
    expect(screen.getByText('🚧 Analytics features are coming soon! 🚧')).toBeInTheDocument()
  })

  it('should have correct navigation link destinations', () => {
    // ACT
    render(<AnalyticsPage />)

    // ASSERT - Check link hrefs
    const logoLink = screen.getByText('SwipeLink Estate')
    expect(logoLink.closest('a')).toHaveAttribute('href', '/')

    const propertiesLink = screen.getByText('Properties')
    expect(propertiesLink.closest('a')).toHaveAttribute('href', '/dashboard')

    const linksLink = screen.getByText('Links')
    expect(linksLink.closest('a')).toHaveAttribute('href', '/links')

    const analyticsLink = screen.getByText('Analytics')
    expect(analyticsLink.closest('a')).toHaveAttribute('href', '/analytics')
  })

  it('should apply correct styling classes', () => {
    // ACT
    const { container } = render(<AnalyticsPage />)

    // ASSERT - Check main container has correct background
    const mainDiv = container.firstChild
    expect(mainDiv).toHaveClass('min-h-screen', 'bg-gray-50')

    // ASSERT - Check header styling
    const header = container.querySelector('header')
    expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b')

    // ASSERT - Check main content card styling
    const mainContent = container.querySelector('main .bg-white.rounded-lg.shadow')
    expect(mainContent).toBeInTheDocument()
    expect(mainContent).toHaveClass('text-center')
  })

  it('should have proper semantic structure for accessibility', () => {
    // ACT
    render(<AnalyticsPage />)

    // ASSERT - Check semantic elements
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument() // header
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('should highlight analytics nav item as active', () => {
    // ACT
    const { container } = render(<AnalyticsPage />)

    // ASSERT - Analytics link should have active styling
    const analyticsNav = screen.getByText('Analytics').closest('a')
    expect(analyticsNav).toHaveClass('text-gray-900')

    // ASSERT - Other nav items should have inactive styling
    const propertiesNav = screen.getByText('Properties').closest('a')
    expect(propertiesNav).toHaveClass('text-gray-500')

    const linksNav = screen.getByText('Links').closest('a')
    expect(linksNav).toHaveClass('text-gray-500')
  })
})