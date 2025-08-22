/**
 * CRMSidebar Navigation Integration Tests
 * Testing the updated navigation items for platform integration
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import CRMSidebar from '../CRMSidebar'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

describe('CRMSidebar Navigation Integration', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })
  })

  describe('Navigation Items', () => {
    it('should have Current Deals item that navigates to /links', () => {
      render(
        <CRMSidebar 
          currentPath="/crm"
          upcomingTasks={[]}
          hotLeads={[]}
        />
      )

      const dealsButton = screen.getByRole('button', { name: /current deals/i })
      expect(dealsButton).toBeInTheDocument()
      
      fireEvent.click(dealsButton)
      expect(mockPush).toHaveBeenCalledWith('/links')
    })

    it('should have Properties item that navigates to /dashboard', () => {
      render(
        <CRMSidebar 
          currentPath="/crm"
          upcomingTasks={[]}
          hotLeads={[]}
        />
      )

      const propertiesButton = screen.getByRole('button', { name: /properties/i })
      expect(propertiesButton).toBeInTheDocument()
      
      fireEvent.click(propertiesButton)
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should maintain other navigation items', () => {
      render(
        <CRMSidebar 
          currentPath="/crm"
          upcomingTasks={[]}
          hotLeads={[]}
        />
      )

      // Check that other items still exist
      expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /contacts/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /activities/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reports/i })).toBeInTheDocument()
    })

    it('should show correct active state for current path', () => {
      const { rerender } = render(
        <CRMSidebar 
          currentPath="/links"
          upcomingTasks={[]}
          hotLeads={[]}
        />
      )

      // Current Deals should be active when on /links
      const dealsButton = screen.getByRole('button', { name: /current deals/i })
      expect(dealsButton).toHaveClass('bg-blue-50', 'text-blue-600')

      // Properties should be active when on /dashboard
      rerender(
        <CRMSidebar 
          currentPath="/dashboard"
          upcomingTasks={[]}
          hotLeads={[]}
        />
      )
      
      const propertiesButton = screen.getByRole('button', { name: /properties/i })
      expect(propertiesButton).toHaveClass('bg-blue-50', 'text-blue-600')
    })
  })

  describe('Navigation Icons', () => {
    it('should display appropriate icons for each navigation item', () => {
      render(
        <CRMSidebar 
          currentPath="/crm"
          upcomingTasks={[]}
          hotLeads={[]}
        />
      )

      // Check that icons are rendered (we'll verify specific icons after implementation)
      const navButtons = screen.getAllByRole('button')
      navButtons.forEach(button => {
        if (button.textContent?.includes('Properties')) {
          // Should have Home icon
          expect(button.querySelector('svg')).toBeInTheDocument()
        }
        if (button.textContent?.includes('Current Deals')) {
          // Should have Briefcase icon
          expect(button.querySelector('svg')).toBeInTheDocument()
        }
      })
    })
  })

  describe('Mobile Behavior', () => {
    it('should work correctly in collapsed state', () => {
      render(
        <CRMSidebar 
          currentPath="/crm"
          upcomingTasks={[]}
          hotLeads={[]}
          isCollapsed={true}
        />
      )

      // Items should still be clickable when collapsed
      const buttons = screen.getAllByRole('button')
      const propertiesButton = buttons.find(btn => 
        btn.getAttribute('aria-label') === 'Properties' || 
        btn.textContent?.includes('Properties')
      )
      
      expect(propertiesButton).toBeInTheDocument()
      fireEvent.click(propertiesButton!)
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('Custom Navigation Handler', () => {
    it('should use custom onNavigate handler when provided', () => {
      const mockNavigate = jest.fn()
      
      render(
        <CRMSidebar 
          currentPath="/crm"
          upcomingTasks={[]}
          hotLeads={[]}
          onNavigate={mockNavigate}
        />
      )

      const dealsButton = screen.getByRole('button', { name: /current deals/i })
      fireEvent.click(dealsButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('/links')
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})