import React from 'react'
import { render, screen } from '@testing-library/react'
import HomePage from '../page'

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: { children: React.ReactNode; href: string }) => {
    return <a href={href} {...props}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('HomePage', () => {
  it('should render homepage with all essential elements', () => {
    // ACT
    render(<HomePage />)

    // ASSERT - Main heading
    expect(screen.getByText('SwipeLink Estate')).toBeInTheDocument()
    
    // ASSERT - Description
    expect(screen.getByText('Discover your dream property with a simple swipe')).toBeInTheDocument()
    
    // ASSERT - Navigation links
    expect(screen.getByText('Agent Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Browse Properties')).toBeInTheDocument()
    
    // ASSERT - Helper text
    expect(screen.getByText('Have a link? Enter the code above or click the link to start swiping!')).toBeInTheDocument()
    
    // ASSERT - Footer text
    expect(screen.getByText('🏠 Built with Next.js & Supabase')).toBeInTheDocument()
  })

  it('should have correct link destinations', () => {
    // ACT
    render(<HomePage />)

    // ASSERT - Check link hrefs
    const agentLink = screen.getByText('Agent Dashboard')
    expect(agentLink.closest('a')).toHaveAttribute('href', '/dashboard')
    
    const browseLink = screen.getByText('Browse Properties')
    expect(browseLink.closest('a')).toHaveAttribute('href', '/properties')
  })

  it('should apply correct CSS classes for styling', () => {
    // ACT
    const { container } = render(<HomePage />)

    // ASSERT - Check main container has gradient background
    const main = container.querySelector('main')
    expect(main).toHaveClass('min-h-screen', 'bg-gradient-to-br', 'from-primary-50', 'to-primary-100')
    
    // ASSERT - Check card container styling
    const card = container.querySelector('.bg-white.rounded-2xl')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('shadow-xl', 'p-8')
  })

  it('should be accessible with proper semantic structure', () => {
    // ACT
    render(<HomePage />)

    // ASSERT - Check semantic elements
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })
})