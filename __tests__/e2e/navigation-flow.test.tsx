/**
 * End-to-End Navigation Flow Test
 * Verifies the complete navigation integration between CRM and main platform
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'

// Mock components
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn()
}))

// Import actual components to test integration
import CRMDashboard from '@/app/(agent)/crm/page'
import AgentDashboard from '@/app/(agent)/dashboard/page'
import LinksPage from '@/app/(agent)/links/page'

// Mock data services
jest.mock('@/components/crm/hooks/useCRMDashboard', () => ({
  useCRMDashboard: () => ({
    dashboard: {
      summary: { totalDeals: 10, hotLeads: 3, pendingTasks: 5, thisMonthRevenue: 50000 },
      recentActivity: { tasks: [], hotLeads: [] },
      pipeline: { totalDeals: 10 }
    },
    loading: false,
    error: null
  })
}))

jest.mock('@/lib/query/usePropertiesQuery', () => ({
  usePropertiesQuery: () => ({
    properties: [],
    isLoading: false,
    error: null
  })
}))

jest.mock('@/lib/query/useLinksQuery', () => ({
  useLinksQuery: () => ({
    links: [],
    isLoading: false,
    error: null
  })
}))

describe('End-to-End Navigation Flow', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })
  })

  describe('CRM to Platform Navigation', () => {
    it('should allow navigation from CRM to Links page', async () => {
      // Start in CRM
      ;(usePathname as jest.Mock).mockReturnValue('/crm')
      
      const { container } = render(<CRMDashboard />)
      
      // Find the Current Deals button in the sidebar
      const dealsButton = await screen.findByRole('button', { name: /current deals/i })
      expect(dealsButton).toBeInTheDocument()
      
      // Click to navigate to Links
      fireEvent.click(dealsButton)
      
      // Verify navigation was triggered
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/links')
      })
    })

    it('should allow navigation from CRM to Properties dashboard', async () => {
      // Start in CRM
      ;(usePathname as jest.Mock).mockReturnValue('/crm')
      
      render(<CRMDashboard />)
      
      // Find the Properties button in the sidebar
      const propertiesButton = await screen.findByRole('button', { name: /properties/i })
      expect(propertiesButton).toBeInTheDocument()
      
      // Click to navigate to Dashboard
      fireEvent.click(propertiesButton)
      
      // Verify navigation was triggered
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  describe('Platform to CRM Navigation', () => {
    it('should have CRM link in main dashboard navigation', async () => {
      // Start in Dashboard
      ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
      
      render(<AgentDashboard />)
      
      // Find the CRM link in navigation
      const crmLink = await screen.findByRole('link', { name: 'CRM' })
      expect(crmLink).toBeInTheDocument()
      expect(crmLink).toHaveAttribute('href', '/crm')
    })

    it('should have CRM link in links page navigation', async () => {
      // Start in Links page
      ;(usePathname as jest.Mock).mockReturnValue('/links')
      
      render(<LinksPage />)
      
      // Find the CRM link in navigation
      const crmLink = await screen.findByRole('link', { name: 'CRM' })
      expect(crmLink).toBeInTheDocument()
      expect(crmLink).toHaveAttribute('href', '/crm')
    })
  })

  describe('Navigation State Consistency', () => {
    it('should maintain active states correctly across navigation', async () => {
      // Test CRM page with /crm active
      ;(usePathname as jest.Mock).mockReturnValue('/crm')
      const { unmount } = render(<CRMDashboard />)
      
      // Dashboard button should be active in CRM sidebar
      let dashboardButton = await screen.findByRole('button', { name: /^dashboard$/i })
      expect(dashboardButton).toHaveClass('bg-blue-50')
      
      unmount()
      
      // Test Links page with Links active
      ;(usePathname as jest.Mock).mockReturnValue('/links')
      render(<LinksPage />)
      
      // Links should be active in main nav
      const linksNavItem = await screen.findByRole('link', { name: 'Links' })
      expect(linksNavItem).toHaveClass('text-gray-900')
    })
  })

  describe('Navigation Accessibility', () => {
    it('should have proper ARIA labels for navigation', async () => {
      ;(usePathname as jest.Mock).mockReturnValue('/crm')
      
      render(<CRMDashboard />)
      
      // Check for navigation landmarks
      const crmNav = screen.getByRole('navigation', { name: /crm navigation/i })
      expect(crmNav).toBeInTheDocument()
      
      // Check for button labels
      const propertiesButton = screen.getByRole('button', { name: /properties/i })
      expect(propertiesButton).toHaveAttribute('aria-label', 'Properties')
    })
  })
})