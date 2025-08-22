/**
 * CRM Layout Component Tests
 * Following TDD approach - Tests written BEFORE implementation
 * 
 * Test Coverage:
 * - Component rendering and structure
 * - Sidebar and header integration
 * - Main content area layout
 * - Responsive grid system
 * - Color system implementation
 * - Layout state management
 * - Accessibility compliance
 * - Performance considerations
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupTest } from '@/test'
import CRMLayout from '../CRMLayout'

// Setup shared test infrastructure
const { getWrapper } = setupTest()

// Mock child content for testing
const MockContent = () => <div data-testid="mock-content">Test Content</div>

describe('CRMLayout Component', () => {
  describe('Component Rendering', () => {
    it('should render the layout with correct structure', () => {
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const layout = screen.getByTestId('crm-layout')
      expect(layout).toBeInTheDocument()
      expect(layout).toHaveClass('crm-layout', 'flex', 'h-screen', 'bg-gray-50')
    })

    it('should render sidebar and header components', () => {
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      // Check sidebar is rendered
      expect(screen.getByTestId('crm-navigation-sidebar')).toBeInTheDocument()
      
      // Check header is rendered
      expect(screen.getByTestId('crm-header-bar')).toBeInTheDocument()
      
      // Check main content area
      expect(screen.getByTestId('crm-main-content')).toBeInTheDocument()
    })

    it('should render children content in main area', () => {
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const mainContent = screen.getByTestId('crm-main-content')
      expect(mainContent).toBeInTheDocument()
      
      // Check children are rendered inside main content
      expect(screen.getByTestId('mock-content')).toBeInTheDocument()
      expect(mainContent).toContainElement(screen.getByTestId('mock-content'))
    })
  })

  describe('Layout Structure Integration', () => {
    it('should have proper layout structure with sidebar and main area', () => {
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const layout = screen.getByTestId('crm-layout')
      const sidebar = screen.getByTestId('crm-navigation-sidebar')
      const mainArea = screen.getByTestId('crm-main-area')
      
      // Check layout is flex container
      expect(layout).toHaveClass('flex')
      
      // Check sidebar and main area positioning
      expect(sidebar).toBeInTheDocument()
      expect(mainArea).toBeInTheDocument()
      expect(mainArea).toHaveClass('flex-1', 'flex', 'flex-col')
    })

    it('should position header correctly within main area', () => {
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const mainArea = screen.getByTestId('crm-main-area')
      const header = screen.getByTestId('crm-header-bar')
      const content = screen.getByTestId('crm-main-content')
      
      // Header should be in main area
      expect(mainArea).toContainElement(header)
      
      // Content should be below header in main area
      expect(mainArea).toContainElement(content)
      expect(content).toHaveClass('flex-1', 'overflow-auto')
    })

    it('should apply proper spacing and padding', () => {
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const mainContent = screen.getByTestId('crm-main-content')
      expect(mainContent).toHaveClass('p-6') // Proper spacing according to spec
    })
  })

  describe('Responsive Behavior', () => {
    it('should adapt layout for desktop viewport', () => {
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const layout = screen.getByTestId('crm-layout')
      const sidebar = screen.getByTestId('crm-navigation-sidebar')
      
      // Desktop: sidebar should be visible and full width
      expect(sidebar).toBeInTheDocument()
      expect(sidebar).toHaveClass('w-60') // 240px width
      expect(layout).toHaveClass('flex-row') // Horizontal layout
    })

    it('should adapt layout for tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 900,
      })
      
      render(
        <CRMLayout isTablet={true}>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const sidebar = screen.getByTestId('crm-navigation-sidebar')
      const toggleButton = screen.getByTestId('sidebar-toggle-button')
      
      // Tablet: sidebar should be collapsible
      expect(sidebar).toBeInTheDocument()
      expect(toggleButton).toBeInTheDocument()
    })

    it('should adapt layout for mobile viewport', () => {
      render(
        <CRMLayout isMobile={true}>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const layout = screen.getByTestId('crm-layout')
      
      // Mobile: sidebar should be hidden, replaced by bottom nav
      expect(screen.queryByTestId('crm-navigation-sidebar')).not.toBeInTheDocument()
      expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument()
      expect(layout).toHaveClass('flex-col') // Vertical layout
    })

    it('should show hamburger menu on mobile header', () => {
      render(
        <CRMLayout isMobile={true}>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const header = screen.getByTestId('crm-header-bar')
      const hamburgerButton = screen.getByTestId('hamburger-menu-button')
      
      expect(header).toContainElement(hamburgerButton)
      expect(hamburgerButton).toHaveClass('md:hidden')
    })
  })

  describe('Sidebar State Management', () => {
    it('should handle sidebar collapse/expand functionality', async () => {
      const user = userEvent.setup()
      
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const sidebar = screen.getByTestId('crm-navigation-sidebar')
      const toggleButton = screen.getByTestId('sidebar-toggle-button')
      
      // Initially expanded
      expect(sidebar).toHaveClass('w-60')
      
      // Click to collapse
      await user.click(toggleButton)
      
      await waitFor(() => {
        expect(sidebar).toHaveClass('w-15') // 60px collapsed width
      })
    })

    it('should adjust main content area when sidebar is collapsed', async () => {
      const user = userEvent.setup()
      
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const mainArea = screen.getByTestId('crm-main-area')
      const toggleButton = screen.getByTestId('sidebar-toggle-button')
      
      // Click to collapse sidebar
      await user.click(toggleButton)
      
      await waitFor(() => {
        // Main area should expand to use more space
        expect(mainArea).toHaveClass('ml-15') // Adjust margin for collapsed sidebar
      })
    })

    it('should persist sidebar state across re-renders', async () => {
      const user = userEvent.setup()
      
      const { rerender } = render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const toggleButton = screen.getByTestId('sidebar-toggle-button')
      
      // Collapse sidebar
      await user.click(toggleButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('crm-navigation-sidebar')).toHaveClass('w-15')
      })
      
      // Re-render component
      rerender(
        <CRMLayout>
          <div data-testid="new-content">New Content</div>
        </CRMLayout>
      )
      
      // Sidebar should still be collapsed
      expect(screen.getByTestId('crm-navigation-sidebar')).toHaveClass('w-15')
    })
  })

  describe('Color System Implementation', () => {
    it('should apply correct background colors according to specification', () => {
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const layout = screen.getByTestId('crm-layout')
      const sidebar = screen.getByTestId('crm-navigation-sidebar')
      const header = screen.getByTestId('crm-header-bar')
      const mainContent = screen.getByTestId('crm-main-content')
      
      // Check color system from specification
      expect(layout).toHaveClass('bg-gray-50') // --crm-bg-primary
      expect(sidebar).toHaveClass('bg-white') // --crm-bg-card
      expect(header).toHaveClass('bg-white', 'border-gray-200')
      expect(mainContent).toHaveClass('bg-gray-50') // Inherits from layout
    })

    it('should apply CSS custom properties for CRM color system', () => {
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const layout = screen.getByTestId('crm-layout')
      
      // Check that layout applies CRM-specific styles
      expect(layout).toHaveAttribute('data-crm-layout', 'true')
      
      // In a real implementation, this would check computed styles
      // For now, verify the CSS classes are applied
      expect(layout).toHaveClass('crm-layout')
    })
  })

  describe('Navigation Integration', () => {
    it('should pass active navigation state to sidebar', () => {
      render(
        <CRMLayout activeNavItem="deals">
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const sidebar = screen.getByTestId('crm-navigation-sidebar')
      
      // Sidebar should receive activeItem prop
      expect(sidebar).toHaveAttribute('data-active-item', 'deals')
    })

    it('should pass breadcrumbs to header', () => {
      const breadcrumbs = [
        { label: 'CRM', href: '/crm' },
        { label: 'Deals' }
      ]
      
      render(
        <CRMLayout breadcrumbs={breadcrumbs}>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const header = screen.getByTestId('crm-header-bar')
      
      // Header should display breadcrumbs
      expect(header).toContainElement(screen.getByTestId('breadcrumbs'))
      expect(screen.getByText('CRM')).toBeInTheDocument()
      expect(screen.getByText('Deals')).toBeInTheDocument()
    })

    it('should handle navigation item clicks', async () => {
      const user = userEvent.setup()
      const onNavItemClick = jest.fn()
      
      render(
        <CRMLayout onNavItemClick={onNavItemClick}>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const dealsNavItem = screen.getByTestId('nav-deals')
      await user.click(dealsNavItem)
      
      expect(onNavItemClick).toHaveBeenCalledWith('deals')
    })
  })

  describe('Accessibility Compliance', () => {
    it('should have proper landmark roles', () => {
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      // Check landmark roles
      expect(screen.getByRole('banner')).toBeInTheDocument() // Header
      expect(screen.getByRole('navigation')).toBeInTheDocument() // Sidebar
      expect(screen.getByRole('main')).toBeInTheDocument() // Main content
    })

    it('should support keyboard navigation between layout sections', async () => {
      const user = userEvent.setup()
      
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      // Test skip links for keyboard navigation
      const skipLink = screen.getByText('Skip to main content')
      expect(skipLink).toBeInTheDocument()
      
      await user.click(skipLink)
      
      const mainContent = screen.getByRole('main')
      expect(mainContent).toHaveFocus()
    })

    it('should announce layout changes to screen readers', async () => {
      const user = userEvent.setup()
      
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const toggleButton = screen.getByTestId('sidebar-toggle-button')
      
      // Should announce sidebar state changes
      expect(toggleButton).toHaveAttribute('aria-label', 'Toggle sidebar')
      
      await user.click(toggleButton)
      
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-label', 'Toggle sidebar (collapsed)')
      })
    })

    it('should have proper focus management', async () => {
      const user = userEvent.setup()
      
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      // Focus should be managed properly when navigating
      const searchInput = screen.getByPlaceholderText('Search deals, contacts, properties...')
      
      await user.tab()
      expect(searchInput).toHaveFocus()
    })
  })

  describe('Performance Considerations', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn()
      
      const TestContent = () => {
        renderSpy()
        return <div data-testid="test-content">Test</div>
      }
      
      const { rerender } = render(
        <CRMLayout>
          <TestContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      // Initial render
      expect(renderSpy).toHaveBeenCalledTimes(1)
      
      // Re-render with same props
      rerender(
        <CRMLayout>
          <TestContent />
        </CRMLayout>
      )
      
      // Should not cause unnecessary re-renders
      expect(renderSpy).toHaveBeenCalledTimes(1)
    })

    it('should handle large content efficiently', () => {
      const LargeContent = () => (
        <div data-testid="large-content">
          {Array.from({ length: 1000 }, (_, i) => (
            <div key={i}>Item {i}</div>
          ))}
        </div>
      )
      
      const startTime = performance.now()
      
      render(
        <CRMLayout>
          <LargeContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render efficiently (under 100ms for test content)
      expect(renderTime).toBeLessThan(100)
      
      const mainContent = screen.getByTestId('crm-main-content')
      expect(mainContent).toHaveClass('overflow-auto') // Should handle overflow
    })
  })

  describe('Error States and Edge Cases', () => {
    it('should render gracefully without children', () => {
      render(<CRMLayout />, { wrapper: getWrapper() })
      
      const layout = screen.getByTestId('crm-layout')
      const mainContent = screen.getByTestId('crm-main-content')
      
      expect(layout).toBeInTheDocument()
      expect(mainContent).toBeInTheDocument()
    })

    it('should handle missing props gracefully', () => {
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      // Should render without errors
      expect(screen.getByTestId('crm-layout')).toBeInTheDocument()
      expect(screen.getByTestId('mock-content')).toBeInTheDocument()
    })

    it('should maintain layout stability during rapid state changes', async () => {
      const user = userEvent.setup()
      
      render(
        <CRMLayout>
          <MockContent />
        </CRMLayout>,
        { wrapper: getWrapper() }
      )
      
      const toggleButton = screen.getByTestId('sidebar-toggle-button')
      
      // Rapid toggle clicks
      await user.click(toggleButton)
      await user.click(toggleButton)
      await user.click(toggleButton)
      
      // Layout should remain stable
      expect(screen.getByTestId('crm-layout')).toBeInTheDocument()
      expect(screen.getByTestId('mock-content')).toBeInTheDocument()
    })
  })
})