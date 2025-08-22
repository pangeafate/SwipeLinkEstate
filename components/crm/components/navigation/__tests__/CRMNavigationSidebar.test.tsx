/**
 * CRM Navigation Sidebar Component Tests
 * Following TDD approach - Tests written BEFORE implementation
 * 
 * Test Coverage:
 * - Component rendering and structure
 * - Menu items and icons display
 * - Active/inactive states
 * - Collapsible functionality
 * - Responsive behavior
 * - Accessibility compliance
 * - User interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupTest } from '@/test'
import CRMNavigationSidebar from '../CRMNavigationSidebar'

// Setup shared test infrastructure
const { getWrapper } = setupTest()

describe('CRMNavigationSidebar Component', () => {
  describe('Component Rendering', () => {
    it('should render the navigation sidebar with correct structure', () => {
      render(<CRMNavigationSidebar />, { wrapper: getWrapper() })
      
      // Check main container
      const sidebar = screen.getByTestId('crm-navigation-sidebar')
      expect(sidebar).toBeInTheDocument()
      expect(sidebar).toHaveClass('nav-menu')
      
      // Check default width (240px)
      expect(sidebar).toHaveClass('w-60') // 240px in Tailwind
    })

    it('should render all menu items with correct icons and labels', () => {
      render(<CRMNavigationSidebar />, { wrapper: getWrapper() })
      
      // Check all menu items exist according to specification
      const menuItems = [
        { testId: 'nav-dashboard', label: 'Dashboard' },
        { testId: 'nav-leads', label: 'Leads' },
        { testId: 'nav-deals', label: 'Deals' },
        { testId: 'nav-contacts', label: 'Contacts' },
        { testId: 'nav-activities', label: 'Activities' },
        { testId: 'nav-email', label: 'Email' },
        { testId: 'nav-calendar', label: 'Calendar' },
        { testId: 'nav-insights', label: 'Insights' },
        { testId: 'nav-properties', label: 'Properties' },
        { testId: 'nav-more', label: 'More' }
      ]
      
      menuItems.forEach(({ testId, label }) => {
        const menuItem = screen.getByTestId(testId)
        expect(menuItem).toBeInTheDocument()
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })

    it('should render menu items with correct Lucide React icons', () => {
      render(<CRMNavigationSidebar />, { wrapper: getWrapper() })
      
      // Check that SVG icons are rendered for each menu item
      const iconSelectors = [
        'nav-dashboard', 'nav-leads', 'nav-deals', 'nav-contacts',
        'nav-activities', 'nav-email', 'nav-calendar', 'nav-insights',
        'nav-properties', 'nav-more'
      ]
      
      iconSelectors.forEach(testId => {
        const menuItem = screen.getByTestId(testId)
        const icon = menuItem.querySelector('svg')
        expect(icon).toBeInTheDocument()
        expect(icon).toHaveClass('w-5', 'h-5') // 20px size according to spec
      })
    })
  })

  describe('Active State Management', () => {
    it('should highlight the active menu item', () => {
      render(<CRMNavigationSidebar activeItem="deals" />, { wrapper: getWrapper() })
      
      const dealsItem = screen.getByTestId('nav-deals')
      expect(dealsItem).toHaveClass('nav-item--active')
      expect(dealsItem).toHaveClass('bg-blue-50', 'text-blue-600', 'border-l-3', 'border-blue-600')
    })

    it('should not highlight inactive menu items', () => {
      render(<CRMNavigationSidebar activeItem="deals" />, { wrapper: getWrapper() })
      
      const dashboardItem = screen.getByTestId('nav-dashboard')
      expect(dashboardItem).not.toHaveClass('nav-item--active')
      expect(dashboardItem).toHaveClass('text-gray-600')
    })

    it('should update active state when activeItem prop changes', () => {
      const { rerender } = render(
        <CRMNavigationSidebar activeItem="deals" />, 
        { wrapper: getWrapper() }
      )
      
      expect(screen.getByTestId('nav-deals')).toHaveClass('nav-item--active')
      
      rerender(<CRMNavigationSidebar activeItem="contacts" />)
      
      expect(screen.getByTestId('nav-deals')).not.toHaveClass('nav-item--active')
      expect(screen.getByTestId('nav-contacts')).toHaveClass('nav-item--active')
    })
  })

  describe('Collapsible Functionality', () => {
    it('should render in expanded state by default', () => {
      render(<CRMNavigationSidebar />, { wrapper: getWrapper() })
      
      const sidebar = screen.getByTestId('crm-navigation-sidebar')
      expect(sidebar).toHaveClass('w-60') // 240px expanded
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('should collapse to icon-only mode when isCollapsed is true', () => {
      render(<CRMNavigationSidebar isCollapsed={true} />, { wrapper: getWrapper() })
      
      const sidebar = screen.getByTestId('crm-navigation-sidebar')
      expect(sidebar).toHaveClass('w-15') // 60px collapsed
      
      // Visible labels should be hidden in collapsed mode (tooltips may still exist)
      const dashboardItem = screen.getByTestId('nav-dashboard')
      const visibleLabel = dashboardItem.querySelector('span')
      expect(visibleLabel).not.toBeInTheDocument()
      
      // Icons should still be visible
      const icon = dashboardItem.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should show tooltips on hover when collapsed', async () => {
      const user = userEvent.setup()
      render(<CRMNavigationSidebar isCollapsed={true} />, { wrapper: getWrapper() })
      
      const dashboardItem = screen.getByTestId('nav-dashboard')
      
      await user.hover(dashboardItem)
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip', { name: /dashboard/i })).toBeInTheDocument()
      })
    })

    it('should handle toggle functionality when onToggle is provided', async () => {
      const user = userEvent.setup()
      const onToggle = jest.fn()
      
      render(<CRMNavigationSidebar onToggle={onToggle} />, { wrapper: getWrapper() })
      
      const toggleButton = screen.getByTestId('sidebar-toggle-button')
      await user.click(toggleButton)
      
      expect(onToggle).toHaveBeenCalled()
    })
  })

  describe('User Interactions', () => {
    it('should call onClick handler when menu item is clicked', async () => {
      const user = userEvent.setup()
      const onItemClick = jest.fn()
      
      render(<CRMNavigationSidebar onItemClick={onItemClick} />, { wrapper: getWrapper() })
      
      const dealsItem = screen.getByTestId('nav-deals')
      await user.click(dealsItem)
      
      expect(onItemClick).toHaveBeenCalledWith('deals')
    })

    it('should apply hover styles on menu item hover', async () => {
      const user = userEvent.setup()
      render(<CRMNavigationSidebar />, { wrapper: getWrapper() })
      
      const dashboardItem = screen.getByTestId('nav-dashboard')
      
      await user.hover(dashboardItem)
      
      expect(dashboardItem).toHaveClass('bg-blue-25', 'text-blue-600')
    })

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup()
      const onItemClick = jest.fn()
      
      render(<CRMNavigationSidebar onItemClick={onItemClick} />, { wrapper: getWrapper() })
      
      const dashboardItem = screen.getByTestId('nav-dashboard')
      dashboardItem.focus()
      
      await user.keyboard('{Enter}')
      
      expect(onItemClick).toHaveBeenCalledWith('dashboard')
    })
  })

  describe('Responsive Behavior', () => {
    it('should adapt to mobile viewport', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })
      
      render(<CRMNavigationSidebar isMobile={true} />, { wrapper: getWrapper() })
      
      const sidebar = screen.getByTestId('crm-navigation-sidebar')
      expect(sidebar).toHaveClass('hidden') // Hidden on mobile, replaced by bottom nav
    })

    it('should show in tablet mode with collapsible behavior', () => {
      render(<CRMNavigationSidebar isTablet={true} />, { wrapper: getWrapper() })
      
      const sidebar = screen.getByTestId('crm-navigation-sidebar')
      expect(sidebar).toBeInTheDocument()
      
      // Should have toggle button on tablet
      const toggleButton = screen.getByTestId('sidebar-toggle-button')
      expect(toggleButton).toBeInTheDocument()
    })

    it('should show full sidebar on desktop', () => {
      render(<CRMNavigationSidebar />, { wrapper: getWrapper() })
      
      const sidebar = screen.getByTestId('crm-navigation-sidebar')
      expect(sidebar).toHaveClass('w-60') // Full width on desktop
      
      // All labels should be visible
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Deals')).toBeInTheDocument()
    })
  })

  describe('Accessibility Compliance', () => {
    it('should have proper ARIA roles and labels', () => {
      render(<CRMNavigationSidebar />, { wrapper: getWrapper() })
      
      const navigation = screen.getByRole('navigation')
      expect(navigation).toBeInTheDocument()
      expect(navigation).toHaveAttribute('aria-label', 'CRM Navigation')
      
      const menuItems = screen.getAllByRole('button')
      menuItems.forEach(item => {
        expect(item).toHaveAttribute('aria-label')
      })
    })

    it('should support keyboard navigation with tab order', () => {
      render(<CRMNavigationSidebar />, { wrapper: getWrapper() })
      
      const menuItems = [
        'nav-dashboard', 'nav-leads', 'nav-deals', 'nav-contacts',
        'nav-activities', 'nav-email', 'nav-calendar', 'nav-insights',
        'nav-properties', 'nav-more'
      ]
      
      menuItems.forEach(testId => {
        const item = screen.getByTestId(testId)
        expect(item).toHaveAttribute('tabIndex', '0')
      })
    })

    it('should have proper focus indicators', async () => {
      const user = userEvent.setup()
      render(<CRMNavigationSidebar />, { wrapper: getWrapper() })
      
      const dashboardItem = screen.getByTestId('nav-dashboard')
      
      await user.tab() // Focus first item
      
      expect(dashboardItem).toHaveFocus()
      expect(dashboardItem).toHaveClass('focus:ring-2', 'focus:ring-blue-500')
    })

    it('should announce active state to screen readers', () => {
      render(<CRMNavigationSidebar activeItem="deals" />, { wrapper: getWrapper() })
      
      const dealsItem = screen.getByTestId('nav-deals')
      expect(dealsItem).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('More Submenu Functionality', () => {
    it('should expand More submenu when clicked', async () => {
      const user = userEvent.setup()
      render(<CRMNavigationSidebar />, { wrapper: getWrapper() })
      
      const moreItem = screen.getByTestId('nav-more')
      await user.click(moreItem)
      
      // Check submenu items appear
      expect(screen.getByTestId('nav-link-builder')).toBeInTheDocument()
      expect(screen.getByTestId('nav-settings')).toBeInTheDocument()
      expect(screen.getByTestId('nav-reports')).toBeInTheDocument()
      expect(screen.getByTestId('nav-help')).toBeInTheDocument()
    })

    it('should collapse More submenu when clicked again', async () => {
      const user = userEvent.setup()
      render(<CRMNavigationSidebar />, { wrapper: getWrapper() })
      
      const moreItem = screen.getByTestId('nav-more')
      
      // Expand
      await user.click(moreItem)
      expect(screen.getByTestId('nav-link-builder')).toBeInTheDocument()
      
      // Collapse
      await user.click(moreItem)
      expect(screen.queryByTestId('nav-link-builder')).not.toBeInTheDocument()
    })

    it('should handle submenu item clicks', async () => {
      const user = userEvent.setup()
      const onItemClick = jest.fn()
      
      render(<CRMNavigationSidebar onItemClick={onItemClick} />, { wrapper: getWrapper() })
      
      // Expand More menu
      const moreItem = screen.getByTestId('nav-more')
      await user.click(moreItem)
      
      // Click submenu item
      const settingsItem = screen.getByTestId('nav-settings')
      await user.click(settingsItem)
      
      expect(onItemClick).toHaveBeenCalledWith('settings')
    })
  })

  describe('Error States and Edge Cases', () => {
    it('should render gracefully without props', () => {
      render(<CRMNavigationSidebar />, { wrapper: getWrapper() })
      
      expect(screen.getByTestId('crm-navigation-sidebar')).toBeInTheDocument()
    })

    it('should handle invalid activeItem prop', () => {
      render(<CRMNavigationSidebar activeItem="invalid-item" />, { wrapper: getWrapper() })
      
      // Should render without errors and no items should be active
      const menuItems = screen.getAllByRole('button')
      menuItems.forEach(item => {
        expect(item).not.toHaveClass('nav-item--active')
      })
    })

    it('should maintain functionality when callbacks are not provided', async () => {
      const user = userEvent.setup()
      render(<CRMNavigationSidebar />, { wrapper: getWrapper() })
      
      const dashboardItem = screen.getByTestId('nav-dashboard')
      
      // Should not throw error when clicked without onItemClick
      await user.click(dashboardItem)
      
      expect(dashboardItem).toBeInTheDocument()
    })
  })
})