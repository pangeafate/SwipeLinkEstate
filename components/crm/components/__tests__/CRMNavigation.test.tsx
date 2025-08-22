/**
 * CRMNavigation Component Tests
 * 
 * Testing the Pipedrive-inspired sidebar navigation component with TDD approach.
 * Tests cover sidebar navigation, collapsible menu, and active state management.
 */

import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TestSetup } from '@/test/utils/testSetup'
import { CRMNavigation } from '../CRMNavigation'

// Setup test suite with shared infrastructure
const { getWrapper } = TestSetup.setupTestSuite({
  suppressConsoleErrors: true,
  mockSupabase: true
})

describe('CRMNavigation Component', () => {
  describe('Basic Rendering', () => {
    it('should render navigation sidebar', () => {
      render(<CRMNavigation />, { wrapper: getWrapper() })

      expect(screen.getByTestId('crm-navigation')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('should display SwipeLink Estate logo', () => {
      render(<CRMNavigation />, { wrapper: getWrapper() })

      expect(screen.getByTestId('navigation-logo')).toBeInTheDocument()
      expect(screen.getByText('SwipeLink Estate')).toBeInTheDocument()
    })

    it('should render all main navigation items', () => {
      render(<CRMNavigation />, { wrapper: getWrapper() })

      const expectedItems = [
        { text: 'Home', testId: 'nav-item-home' },
        { text: 'Deals', testId: 'nav-item-deals' }, 
        { text: 'Contacts', testId: 'nav-item-contacts' },
        { text: 'Leads', testId: 'nav-item-leads' },
        { text: 'Activities', testId: 'nav-item-activities' },
        { text: 'Campaigns', testId: 'nav-item-campaigns' },
        { text: 'Insights', testId: 'nav-item-insights' },
        { text: 'Properties', testId: 'nav-item-properties' },
        { text: 'Link Builder', testId: 'nav-item-link-builder' }
      ]

      expectedItems.forEach(item => {
        const navItem = screen.getByTestId(item.testId)
        expect(navItem).toBeInTheDocument()
        expect(within(navItem).getByText(item.text)).toBeInTheDocument()
      })
    })
  })

  describe('Pipedrive-Style Design', () => {
    it('should apply Pipedrive navigation styling classes', () => {
      render(<CRMNavigation />, { wrapper: getWrapper() })

      const navigation = screen.getByTestId('crm-navigation')
      expect(navigation).toHaveClass('pipedrive-nav')
      expect(navigation).toHaveClass('bg-white')
      expect(navigation).toHaveClass('border-r')
      expect(navigation).toHaveClass('w-64') // 256px default width
    })

    it('should display navigation icons for each menu item', () => {
      render(<CRMNavigation />, { wrapper: getWrapper() })

      const navItems = screen.getAllByTestId(/nav-item-/)
      navItems.forEach(item => {
        const icon = within(item).getByTestId('nav-icon')
        expect(icon).toBeInTheDocument()
      })
    })

    it('should have proper menu item structure', () => {
      render(<CRMNavigation />, { wrapper: getWrapper() })

      const homeItem = screen.getByTestId('nav-item-home')
      expect(homeItem).toHaveClass('nav-item')
      expect(within(homeItem).getByTestId('nav-icon')).toBeInTheDocument()
      expect(within(homeItem).getByText('Home')).toBeInTheDocument()
    })
  })

  describe('Active State Management', () => {
    it('should highlight active navigation item', () => {
      render(<CRMNavigation activeItem="deals" />, { wrapper: getWrapper() })

      const dealsItem = screen.getByTestId('nav-item-deals')
      expect(dealsItem).toHaveClass('nav-item--active')
      expect(dealsItem).toHaveAttribute('aria-current', 'page')
    })

    it('should not highlight inactive items', () => {
      render(<CRMNavigation activeItem="deals" />, { wrapper: getWrapper() })

      const homeItem = screen.getByTestId('nav-item-home')
      expect(homeItem).not.toHaveClass('nav-item--active')
      expect(homeItem).not.toHaveAttribute('aria-current')
    })

    it('should show active indicator border', () => {
      render(<CRMNavigation activeItem="deals" />, { wrapper: getWrapper() })

      const dealsItem = screen.getByTestId('nav-item-deals')
      const activeIndicator = within(dealsItem).getByTestId('active-indicator')
      expect(activeIndicator).toBeInTheDocument()
      expect(activeIndicator).toHaveClass('bg-blue-600')
    })

    it('should change active item when clicked', () => {
      const onNavigateMock = jest.fn()
      render(<CRMNavigation onNavigate={onNavigateMock} />, { wrapper: getWrapper() })

      const contactsItem = screen.getByTestId('nav-item-contacts')
      fireEvent.click(contactsItem)

      expect(onNavigateMock).toHaveBeenCalledWith('contacts')
    })
  })

  describe('Collapsible Menu', () => {
    it('should render collapse toggle button', () => {
      render(<CRMNavigation />, { wrapper: getWrapper() })

      expect(screen.getByTestId('nav-toggle')).toBeInTheDocument()
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument()
    })

    it('should collapse navigation when toggle is clicked', () => {
      render(<CRMNavigation />, { wrapper: getWrapper() })

      const navigation = screen.getByTestId('crm-navigation')
      const toggleButton = screen.getByTestId('nav-toggle')

      expect(navigation).not.toHaveClass('nav--collapsed')

      fireEvent.click(toggleButton)

      expect(navigation).toHaveClass('nav--collapsed')
      expect(navigation).toHaveClass('w-16') // Collapsed width
    })

    it('should hide text labels when collapsed', () => {
      render(<CRMNavigation isCollapsed={true} />, { wrapper: getWrapper() })

      const navigation = screen.getByTestId('crm-navigation')
      expect(navigation).toHaveClass('nav--collapsed')

      // Logo text should have hidden class
      const logoText = screen.getByText('SwipeLink Estate')
      expect(logoText).toHaveClass('hidden')
      
      // Navigation item labels should have hidden class
      const homeItem = screen.getByTestId('nav-item-home')
      const homeLabel = within(homeItem).getByText('Home')
      expect(homeLabel).toHaveClass('hidden')
    })

    it('should show tooltips when collapsed', () => {
      render(<CRMNavigation isCollapsed={true} />, { wrapper: getWrapper() })

      const homeItem = screen.getByTestId('nav-item-home')
      expect(homeItem).toHaveAttribute('title', 'Home')
    })

    it('should expand navigation when toggle is clicked again', () => {
      render(<CRMNavigation isCollapsed={true} />, { wrapper: getWrapper() })

      const navigation = screen.getByTestId('crm-navigation')
      const toggleButton = screen.getByTestId('nav-toggle')

      expect(navigation).toHaveClass('nav--collapsed')

      fireEvent.click(toggleButton)

      expect(navigation).not.toHaveClass('nav--collapsed')
      expect(navigation).toHaveClass('w-64') // Expanded width
    })
  })

  describe('Navigation Sections', () => {
    it('should render navigation sections with proper grouping', () => {
      render(<CRMNavigation />, { wrapper: getWrapper() })

      // Check section titles by looking at h3 elements specifically within sections
      const salesSection = screen.getByTestId('nav-section-sales')
      expect(within(salesSection).getByRole('heading', { level: 3 })).toHaveTextContent('Sales')
      
      const activitiesSection = screen.getByTestId('nav-section-activities')
      expect(within(activitiesSection).getByRole('heading', { level: 3 })).toHaveTextContent('Activities')
      
      const insightsSection = screen.getByTestId('nav-section-insights')
      expect(within(insightsSection).getByRole('heading', { level: 3 })).toHaveTextContent('Insights')
      
      const toolsSection = screen.getByTestId('nav-section-tools')
      expect(within(toolsSection).getByRole('heading', { level: 3 })).toHaveTextContent('Tools')
    })

    it('should group navigation items correctly', () => {
      render(<CRMNavigation />, { wrapper: getWrapper() })

      const salesSection = screen.getByTestId('nav-section-sales')
      expect(within(salesSection).getByText('Home')).toBeInTheDocument()
      expect(within(salesSection).getByText('Deals')).toBeInTheDocument()
      expect(within(salesSection).getByText('Contacts')).toBeInTheDocument()
      expect(within(salesSection).getByText('Leads')).toBeInTheDocument()
    })

    it('should hide section titles when collapsed', () => {
      render(<CRMNavigation isCollapsed={true} />, { wrapper: getWrapper() })

      // Check that section titles (h3 elements) have hidden class
      const salesSection = screen.getByTestId('nav-section-sales')
      const salesTitle = within(salesSection).getByRole('heading', { level: 3 })
      expect(salesTitle).toHaveClass('hidden')
      
      const activitiesSection = screen.getByTestId('nav-section-activities')
      const activitiesTitle = within(activitiesSection).getByRole('heading', { level: 3 })
      expect(activitiesTitle).toHaveClass('hidden')
      
      const insightsSection = screen.getByTestId('nav-section-insights')
      const insightsTitle = within(insightsSection).getByRole('heading', { level: 3 })
      expect(insightsTitle).toHaveClass('hidden')
      
      const toolsSection = screen.getByTestId('nav-section-tools')
      const toolsTitle = within(toolsSection).getByRole('heading', { level: 3 })
      expect(toolsTitle).toHaveClass('hidden')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<CRMNavigation />, { wrapper: getWrapper() })

      const navigation = screen.getByRole('navigation')
      expect(navigation).toHaveAttribute('aria-label', 'CRM Navigation')

      // Check navigation items specifically (not the toggle button)
      const navItems = screen.getAllByTestId(/nav-item-/)
      navItems.forEach(item => {
        expect(item).toHaveAttribute('tabindex', '0')
      })
    })

    it('should support keyboard navigation', () => {
      const onNavigateMock = jest.fn()
      render(<CRMNavigation onNavigate={onNavigateMock} />, { wrapper: getWrapper() })

      const homeItem = screen.getByTestId('nav-item-home')
      
      fireEvent.keyDown(homeItem, { key: 'Enter' })
      expect(onNavigateMock).toHaveBeenCalledWith('home')

      fireEvent.keyDown(homeItem, { key: ' ' })
      expect(onNavigateMock).toHaveBeenCalledWith('home')
    })

    it('should be keyboard navigable between items', () => {
      render(<CRMNavigation />, { wrapper: getWrapper() })

      const homeItem = screen.getByTestId('nav-item-home')
      const dealsItem = screen.getByTestId('nav-item-deals')

      homeItem.focus()
      expect(document.activeElement).toBe(homeItem)

      fireEvent.keyDown(homeItem, { key: 'ArrowDown' })
      expect(document.activeElement).toBe(dealsItem)
    })

    it('should announce state changes for screen readers', () => {
      render(<CRMNavigation activeItem="deals" />, { wrapper: getWrapper() })

      const dealsItem = screen.getByTestId('nav-item-deals')
      expect(dealsItem).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('Responsive Behavior', () => {
    it('should handle mobile view properly', () => {
      render(<CRMNavigation isMobile={true} />, { wrapper: getWrapper() })

      const navigation = screen.getByTestId('crm-navigation')
      expect(navigation).toHaveClass('nav--mobile')
    })

    it('should auto-collapse on mobile', () => {
      render(<CRMNavigation isMobile={true} />, { wrapper: getWrapper() })

      const navigation = screen.getByTestId('crm-navigation')
      expect(navigation).toHaveClass('nav--collapsed')
    })
  })

  describe('Integration', () => {
    it('should call onCollapse when navigation is toggled', () => {
      const onCollapseMock = jest.fn()
      render(<CRMNavigation onCollapse={onCollapseMock} />, { wrapper: getWrapper() })

      const toggleButton = screen.getByTestId('nav-toggle')
      fireEvent.click(toggleButton)

      expect(onCollapseMock).toHaveBeenCalledWith(true)
    })

    it('should accept custom className', () => {
      render(<CRMNavigation className="custom-nav" />, { wrapper: getWrapper() })

      const navigation = screen.getByTestId('crm-navigation')
      expect(navigation).toHaveClass('custom-nav')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid activeItem gracefully', () => {
      render(<CRMNavigation activeItem="invalid-item" />, { wrapper: getWrapper() })

      const navigation = screen.getByTestId('crm-navigation')
      expect(navigation).toBeInTheDocument()

      // No item should be active
      const navItems = screen.getAllByTestId(/nav-item-/)
      navItems.forEach(item => {
        expect(item).not.toHaveClass('nav-item--active')
      })
    })

    it('should render without optional props', () => {
      render(<CRMNavigation />, { wrapper: getWrapper() })

      expect(screen.getByTestId('crm-navigation')).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })
  })
})