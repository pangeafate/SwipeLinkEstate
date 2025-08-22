/**
 * AgentNavigation Integration Tests
 * Testing the addition of CRM to main navigation
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { AgentNavigation } from '../AgentNavigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

describe('AgentNavigation CRM Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Navigation Items', () => {
    it('should include CRM in navigation items', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
      
      render(<AgentNavigation />)
      
      // Check all navigation items exist
      expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Links' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'CRM' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Analytics' })).toBeInTheDocument()
    })

    it('should have correct href for CRM link', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
      
      render(<AgentNavigation />)
      
      const crmLink = screen.getByRole('link', { name: 'CRM' })
      expect(crmLink).toHaveAttribute('href', '/crm')
    })

    it('should highlight CRM when on CRM page', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/crm')
      
      render(<AgentNavigation />)
      
      const crmLink = screen.getByRole('link', { name: 'CRM' })
      const dashboardLink = screen.getByRole('link', { name: 'Dashboard' })
      
      // CRM should be active
      expect(crmLink).toHaveClass('text-gray-900')
      // Dashboard should not be active
      expect(dashboardLink).toHaveClass('text-gray-500')
    })

    it('should maintain CRM active state on CRM sub-routes', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/crm/contacts')
      
      render(<AgentNavigation />)
      
      const crmLink = screen.getByRole('link', { name: 'CRM' })
      expect(crmLink).toHaveClass('text-gray-900')
    })
  })

  describe('Navigation Order', () => {
    it('should place CRM between Links and Analytics', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
      
      render(<AgentNavigation />)
      
      const links = screen.getAllByRole('link')
      const linkTexts = links.map(link => link.textContent)
      
      const crmIndex = linkTexts.indexOf('CRM')
      const linksIndex = linkTexts.indexOf('Links')
      const analyticsIndex = linkTexts.indexOf('Analytics')
      
      // CRM should be after Links and before Analytics
      expect(crmIndex).toBeGreaterThan(linksIndex)
      expect(crmIndex).toBeLessThan(analyticsIndex)
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should include CRM in mobile navigation', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
      
      // Mock mobile viewport
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(max-width: 768px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))
      
      render(<AgentNavigation />)
      
      // CRM should still be present in mobile view
      expect(screen.getByRole('link', { name: 'CRM' })).toBeInTheDocument()
    })
  })
})