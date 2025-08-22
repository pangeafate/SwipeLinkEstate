/**
 * CRM Navigation Integration Test
 * Tests the complete navigation flow between CRM and main platform
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import CRMSidebar from '@/components/crm/components/sidebar/CRMSidebar'
import { AgentNavigation } from '@/components/shared/AgentNavigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn()
}))

describe('CRM Navigation Integration', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })
  })

  describe('Cross-Platform Navigation', () => {
    it('should navigate from CRM to Links overview', async () => {
      ;(usePathname as jest.Mock).mockReturnValue('/crm')
      
      render(
        <CRMSidebar 
          currentPath="/crm"
          upcomingTasks={[]}
          hotLeads={[]}
        />
      )
      
      const dealsButton = screen.getByRole('button', { name: /current deals/i })
      fireEvent.click(dealsButton)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/links')
      })
    })

    it('should navigate from CRM to Property Dashboard', async () => {
      ;(usePathname as jest.Mock).mockReturnValue('/crm')
      
      render(
        <CRMSidebar 
          currentPath="/crm"
          upcomingTasks={[]}
          hotLeads={[]}
        />
      )
      
      const propertiesButton = screen.getByRole('button', { name: /properties/i })
      fireEvent.click(propertiesButton)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should navigate from main platform to CRM', async () => {
      ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
      
      render(<AgentNavigation />)
      
      const crmLink = screen.getByRole('link', { name: 'CRM' })
      expect(crmLink).toHaveAttribute('href', '/crm')
    })
  })

  describe('Active State Synchronization', () => {
    it('should show Links as active in CRM sidebar when on /links', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/links')
      
      render(
        <CRMSidebar 
          currentPath="/links"
          upcomingTasks={[]}
          hotLeads={[]}
        />
      )
      
      const dealsButton = screen.getByRole('button', { name: /current deals/i })
      expect(dealsButton).toHaveClass('bg-blue-50', 'text-blue-600')
    })

    it('should show Properties as active in CRM sidebar when on /dashboard', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
      
      render(
        <CRMSidebar 
          currentPath="/dashboard"
          upcomingTasks={[]}
          hotLeads={[]}
        />
      )
      
      const propertiesButton = screen.getByRole('button', { name: /properties/i })
      expect(propertiesButton).toHaveClass('bg-blue-50', 'text-blue-600')
    })

    it('should show CRM as active in main nav when on CRM pages', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/crm/contacts')
      
      render(<AgentNavigation />)
      
      const crmLink = screen.getByRole('link', { name: 'CRM' })
      expect(crmLink).toHaveClass('text-gray-900')
    })
  })

  describe('Navigation Context', () => {
    it('should maintain navigation context when switching modules', () => {
      const { rerender } = render(
        <div>
          <AgentNavigation />
          <CRMSidebar 
            currentPath="/crm"
            upcomingTasks={[]}
            hotLeads={[]}
          />
        </div>
      )
      
      // Start in CRM
      ;(usePathname as jest.Mock).mockReturnValue('/crm')
      rerender(
        <div>
          <AgentNavigation />
          <CRMSidebar 
            currentPath="/crm"
            upcomingTasks={[]}
            hotLeads={[]}
          />
        </div>
      )
      
      // Navigate to Links
      const dealsButton = screen.getByRole('button', { name: /current deals/i })
      fireEvent.click(dealsButton)
      expect(mockPush).toHaveBeenCalledWith('/links')
      
      // Simulate navigation completion
      ;(usePathname as jest.Mock).mockReturnValue('/links')
      rerender(
        <div>
          <AgentNavigation />
          <CRMSidebar 
            currentPath="/links"
            upcomingTasks={[]}
            hotLeads={[]}
          />
        </div>
      )
      
      // Both navigations should show Links as active
      const mainNavLinks = screen.getByRole('link', { name: 'Links' })
      expect(mainNavLinks).toHaveClass('text-gray-900')
      
      const sidebarDeals = screen.getByRole('button', { name: /current deals/i })
      expect(sidebarDeals).toHaveClass('bg-blue-50')
    })
  })
})