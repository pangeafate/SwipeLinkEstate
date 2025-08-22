import { render, screen } from '@testing-library/react'
import { AgentNavigation } from '../AgentNavigation'
import { usePathname } from 'next/navigation'

// Mock Next.js navigation hook (App Router)
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

describe('AgentNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
  })

  it('should render all navigation links with consistent labels', () => {
    render(<AgentNavigation />)
    
    // Test consistent navigation labels across all agent pages
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Links' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Analytics' })).toBeInTheDocument()
  })

  it('should have correct href attributes for all navigation links', () => {
    render(<AgentNavigation />)
    
    // Test correct routes
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: 'Links' })).toHaveAttribute('href', '/links')
    expect(screen.getByRole('link', { name: 'Analytics' })).toHaveAttribute('href', '/analytics')
  })

  it('should highlight the current active navigation item', () => {
    render(<AgentNavigation />)
    
    // Dashboard should be active (highlighted) when on /dashboard
    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' })
    expect(dashboardLink).toHaveClass('text-blue-600', 'border-b-2', 'border-blue-600')
    
    // Other links should not be active
    const linksLink = screen.getByRole('link', { name: 'Links' })
    expect(linksLink).not.toHaveClass('text-blue-600', 'border-b-2', 'border-blue-600')
  })

  it('should highlight Links when on /links page', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/links')
    render(<AgentNavigation />)
    
    const linksLink = screen.getByRole('link', { name: 'Links' })
    expect(linksLink).toHaveClass('text-blue-600', 'border-b-2', 'border-blue-600')
    
    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' })
    expect(dashboardLink).not.toHaveClass('text-blue-600', 'border-b-2', 'border-blue-600')
  })

  it('should highlight Analytics when on /analytics page', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/analytics')
    render(<AgentNavigation />)
    
    const analyticsLink = screen.getByRole('link', { name: 'Analytics' })
    expect(analyticsLink).toHaveClass('text-blue-600', 'border-b-2', 'border-blue-600')
  })

  it('should have consistent styling across all navigation items', () => {
    render(<AgentNavigation />)
    
    const allLinks = screen.getAllByRole('link')
    
    allLinks.forEach(link => {
      // All links should have consistent base styling
      expect(link).toHaveClass('px-4', 'py-2', 'text-sm', 'font-medium', 'hover:text-blue-600')
    })
  })

  it('should render with proper semantic HTML structure', () => {
    const { container } = render(<AgentNavigation />)
    
    // Should use nav element for accessibility
    const nav = container.querySelector('nav')
    expect(nav).toBeInTheDocument()
    
    // Should have proper ARIA labels
    expect(nav).toHaveAttribute('aria-label', 'Agent navigation')
  })

  it('should be keyboard accessible', () => {
    render(<AgentNavigation />)
    
    const allLinks = screen.getAllByRole('link')
    
    allLinks.forEach(link => {
      // All links should be focusable
      expect(link).toHaveAttribute('tabIndex', '0')
    })
  })

  // Edge case: Should handle unknown routes gracefully
  it('should not highlight any item when on unknown route', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/unknown-route')
    render(<AgentNavigation />)
    
    const allLinks = screen.getAllByRole('link')
    
    allLinks.forEach(link => {
      expect(link).not.toHaveClass('text-blue-600', 'border-b-2', 'border-blue-600')
    })
  })
})