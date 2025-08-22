/**
 * CRM Header Bar Component Tests
 * Following TDD approach - Tests written BEFORE implementation
 * 
 * Test Coverage:
 * - Component rendering and structure  
 * - Global search bar display (design only)
 * - Quick add button functionality (design only)
 * - User avatar and settings dropdown (design only)
 * - Breadcrumbs navigation display
 * - Responsive behavior
 * - Accessibility compliance
 * - User interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupTest } from '@/test'
import CRMHeaderBar from '../CRMHeaderBar'

// Setup shared test infrastructure
const { getWrapper } = setupTest()

describe('CRMHeaderBar Component', () => {
  describe('Component Rendering', () => {
    it('should render the header bar with correct structure', () => {
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      const header = screen.getByTestId('crm-header-bar')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('header-bar')
      
      // Check main container structure
      expect(header).toHaveClass('flex', 'items-center', 'justify-between')
      expect(header).toHaveClass('px-6', 'py-4', 'bg-white', 'border-b')
    })

    it('should render all header components', () => {
      render(
        <CRMHeaderBar 
          breadcrumbs={[{ label: 'CRM', href: '/crm' }, { label: 'Dashboard' }]}
        />, 
        { wrapper: getWrapper() }
      )
      
      // Check breadcrumbs
      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument()
      
      // Check search bar
      expect(screen.getByTestId('global-search-bar')).toBeInTheDocument()
      
      // Check quick add button
      expect(screen.getByTestId('quick-add-button')).toBeInTheDocument()
      
      // Check user avatar
      expect(screen.getByTestId('user-avatar')).toBeInTheDocument()
    })
  })

  describe('Global Search Bar', () => {
    it('should render search bar with correct styling and placeholder', () => {
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      const searchBar = screen.getByTestId('global-search-bar')
      expect(searchBar).toBeInTheDocument()
      
      const searchInput = screen.getByPlaceholderText('Search deals, contacts, properties...')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveClass('header-search')
      
      // Check dimensions according to spec (350px width, 40px height)
      expect(searchBar).toHaveClass('w-[350px]', 'h-10')
    })

    it('should display search icon correctly positioned', () => {
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      const searchContainer = screen.getByTestId('global-search-bar')
      const searchIcon = searchContainer.querySelector('[data-testid="search-icon"]')
      
      expect(searchIcon).toBeInTheDocument()
      expect(searchIcon).toHaveClass('absolute', 'left-3', 'top-1/2', 'transform', '-translate-y-1/2')
    })

    it('should handle search input changes (visual only - no functionality)', async () => {
      const user = userEvent.setup()
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      const searchInput = screen.getByPlaceholderText('Search deals, contacts, properties...')
      
      await user.type(searchInput, 'test search')
      
      expect(searchInput).toHaveValue('test search')
      // Note: No actual search functionality implemented - design only
    })

    it('should show focus state styling', async () => {
      const user = userEvent.setup()
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      const searchInput = screen.getByPlaceholderText('Search deals, contacts, properties...')
      
      await user.click(searchInput)
      
      expect(searchInput).toHaveFocus()
      expect(searchInput.parentElement).toHaveClass('border-blue-600')
    })
  })

  describe('Quick Add Button', () => {
    it('should render quick add button with correct styling', () => {
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      const quickAddButton = screen.getByTestId('quick-add-button')
      expect(quickAddButton).toBeInTheDocument()
      
      // Check dimensions and styling according to spec
      expect(quickAddButton).toHaveClass('w-10', 'h-10', 'bg-blue-600', 'rounded-md')
      expect(quickAddButton).toHaveClass('flex', 'items-center', 'justify-center')
      
      // Check plus icon
      const plusIcon = quickAddButton.querySelector('svg')
      expect(plusIcon).toBeInTheDocument()
    })

    it('should show hover state styling', async () => {
      const user = userEvent.setup()
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      const quickAddButton = screen.getByTestId('quick-add-button')
      
      await user.hover(quickAddButton)
      
      expect(quickAddButton).toHaveClass('hover:bg-blue-700')
    })

    it('should show dropdown menu on click (visual only)', async () => {
      const user = userEvent.setup()
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      const quickAddButton = screen.getByTestId('quick-add-button')
      await user.click(quickAddButton)
      
      // Check if dropdown appears (design only - no actual functionality)
      const dropdown = screen.getByTestId('quick-add-dropdown')
      expect(dropdown).toBeInTheDocument()
      
      // Check dropdown items
      expect(screen.getByText('Deal')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
      expect(screen.getByText('Property')).toBeInTheDocument()
      expect(screen.getByText('Link')).toBeInTheDocument()
    })

    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup()
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      const quickAddButton = screen.getByTestId('quick-add-button')
      await user.click(quickAddButton)
      
      expect(screen.getByTestId('quick-add-dropdown')).toBeInTheDocument()
      
      // Click outside
      await user.click(document.body)
      
      expect(screen.queryByTestId('quick-add-dropdown')).not.toBeInTheDocument()
    })
  })

  describe('User Avatar and Settings', () => {
    it('should render user avatar with correct styling', () => {
      const userData = { name: 'John Doe', email: 'john@example.com', initials: 'JD' }
      render(<CRMHeaderBar user={userData} />, { wrapper: getWrapper() })
      
      const userAvatar = screen.getByTestId('user-avatar')
      expect(userAvatar).toBeInTheDocument()
      
      // Check dimensions according to spec (32px circular)
      expect(userAvatar).toHaveClass('w-8', 'h-8', 'rounded-full')
      expect(userAvatar).toHaveClass('bg-gray-200', 'flex', 'items-center', 'justify-center')
      
      // Check initials display
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('should show user settings dropdown on avatar click', async () => {
      const user = userEvent.setup()
      const userData = { name: 'John Doe', email: 'john@example.com', initials: 'JD' }
      
      render(<CRMHeaderBar user={userData} />, { wrapper: getWrapper() })
      
      const userAvatar = screen.getByTestId('user-avatar')
      await user.click(userAvatar)
      
      const settingsDropdown = screen.getByTestId('settings-dropdown')
      expect(settingsDropdown).toBeInTheDocument()
      
      // Check dropdown positioning and styling
      expect(settingsDropdown).toHaveClass('absolute', 'top-12', 'right-0')
      expect(settingsDropdown).toHaveClass('w-48', 'bg-white', 'border', 'rounded-lg')
    })

    it('should render settings dropdown menu items', async () => {
      const user = userEvent.setup()
      const userData = { name: 'John Doe', email: 'john@example.com', initials: 'JD' }
      
      render(<CRMHeaderBar user={userData} />, { wrapper: getWrapper() })
      
      const userAvatar = screen.getByTestId('user-avatar')
      await user.click(userAvatar)
      
      // Check dropdown menu items (design only)
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Help')).toBeInTheDocument()
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })

    it('should handle avatar display when no user data provided', () => {
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      const userAvatar = screen.getByTestId('user-avatar')
      expect(userAvatar).toBeInTheDocument()
      
      // Should show default avatar
      expect(screen.getByText('U')).toBeInTheDocument() // Default initial
    })
  })

  describe('Breadcrumbs Navigation', () => {
    it('should render breadcrumbs when provided', () => {
      const breadcrumbs = [
        { label: 'CRM', href: '/crm' },
        { label: 'Deals', href: '/crm/deals' },
        { label: 'Pipeline' }
      ]
      
      render(<CRMHeaderBar breadcrumbs={breadcrumbs} />, { wrapper: getWrapper() })
      
      const breadcrumbsContainer = screen.getByTestId('breadcrumbs')
      expect(breadcrumbsContainer).toBeInTheDocument()
      
      // Check all breadcrumb items
      expect(screen.getByText('CRM')).toBeInTheDocument()
      expect(screen.getByText('Deals')).toBeInTheDocument()
      expect(screen.getByText('Pipeline')).toBeInTheDocument()
    })

    it('should render breadcrumb separators correctly', () => {
      const breadcrumbs = [
        { label: 'CRM', href: '/crm' },
        { label: 'Deals', href: '/crm/deals' },
        { label: 'Pipeline' }
      ]
      
      render(<CRMHeaderBar breadcrumbs={breadcrumbs} />, { wrapper: getWrapper() })
      
      const separators = screen.getAllByTestId('breadcrumb-separator')
      expect(separators).toHaveLength(2) // n-1 separators for n items
      
      separators.forEach(separator => {
        expect(separator).toHaveTextContent('/')
        expect(separator).toHaveClass('mx-2', 'text-gray-400')
      })
    })

    it('should style active breadcrumb differently', () => {
      const breadcrumbs = [
        { label: 'CRM', href: '/crm' },
        { label: 'Deals', href: '/crm/deals' },
        { label: 'Pipeline' } // No href = active
      ]
      
      render(<CRMHeaderBar breadcrumbs={breadcrumbs} />, { wrapper: getWrapper() })
      
      const activeBreadcrumb = screen.getByText('Pipeline')
      expect(activeBreadcrumb).toHaveClass('text-gray-900', 'font-medium')
      
      const linkBreadcrumb = screen.getByText('CRM')
      expect(linkBreadcrumb).toHaveClass('text-gray-600', 'hover:text-gray-900')
    })

    it('should not render breadcrumbs section when none provided', () => {
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should adapt search bar width on tablet', () => {
      render(<CRMHeaderBar isTablet={true} />, { wrapper: getWrapper() })
      
      const searchBar = screen.getByTestId('global-search-bar')
      expect(searchBar).toHaveClass('w-64') // Reduced width on tablet
    })

    it('should hide search bar on mobile', () => {
      render(<CRMHeaderBar isMobile={true} />, { wrapper: getWrapper() })
      
      expect(screen.queryByTestId('global-search-bar')).not.toBeInTheDocument()
    })

    it('should show hamburger menu button on mobile', () => {
      render(<CRMHeaderBar isMobile={true} />, { wrapper: getWrapper() })
      
      const hamburgerButton = screen.getByTestId('hamburger-menu-button')
      expect(hamburgerButton).toBeInTheDocument()
      expect(hamburgerButton).toHaveClass('md:hidden')
    })

    it('should condense breadcrumbs on mobile', () => {
      const breadcrumbs = [
        { label: 'CRM', href: '/crm' },
        { label: 'Deals', href: '/crm/deals' },
        { label: 'Pipeline' }
      ]
      
      render(<CRMHeaderBar breadcrumbs={breadcrumbs} isMobile={true} />, { wrapper: getWrapper() })
      
      // Should show only current page on mobile
      expect(screen.getByText('Pipeline')).toBeInTheDocument()
      expect(screen.queryByText('CRM')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility Compliance', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      const header = screen.getByTestId('crm-header-bar')
      expect(header).toHaveAttribute('role', 'banner')
      
      const searchInput = screen.getByPlaceholderText('Search deals, contacts, properties...')
      expect(searchInput).toHaveAttribute('aria-label', 'Global search')
      
      const quickAddButton = screen.getByTestId('quick-add-button')
      expect(quickAddButton).toHaveAttribute('aria-label', 'Quick add new item')
      
      const userAvatar = screen.getByTestId('user-avatar')
      expect(userAvatar).toHaveAttribute('aria-label', 'User menu')
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      const searchInput = screen.getByPlaceholderText('Search deals, contacts, properties...')
      const quickAddButton = screen.getByTestId('quick-add-button')
      const userAvatar = screen.getByTestId('user-avatar')
      
      // Test tab navigation
      await user.tab()
      expect(searchInput).toHaveFocus()
      
      await user.tab()
      expect(quickAddButton).toHaveFocus()
      
      await user.tab()
      expect(userAvatar).toHaveFocus()
    })

    it('should announce dropdown states to screen readers', async () => {
      const user = userEvent.setup()
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      const quickAddButton = screen.getByTestId('quick-add-button')
      
      // Initially collapsed
      expect(quickAddButton).toHaveAttribute('aria-expanded', 'false')
      
      await user.click(quickAddButton)
      
      // Expanded after click
      expect(quickAddButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should have proper focus indicators', async () => {
      const user = userEvent.setup()
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      const searchInput = screen.getByPlaceholderText('Search deals, contacts, properties...')
      
      await user.tab()
      
      expect(searchInput).toHaveFocus()
      expect(searchInput.parentElement).toHaveClass('focus-within:ring-2', 'focus-within:ring-blue-500')
    })
  })

  describe('Error States and Edge Cases', () => {
    it('should render gracefully without props', () => {
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      expect(screen.getByTestId('crm-header-bar')).toBeInTheDocument()
    })

    it('should handle empty breadcrumbs array', () => {
      render(<CRMHeaderBar breadcrumbs={[]} />, { wrapper: getWrapper() })
      
      expect(screen.queryByTestId('breadcrumbs')).not.toBeInTheDocument()
    })

    it('should handle user data with missing fields', () => {
      const userData = { name: 'John Doe' } // Missing email and initials
      
      render(<CRMHeaderBar user={userData} />, { wrapper: getWrapper() })
      
      const userAvatar = screen.getByTestId('user-avatar')
      expect(userAvatar).toBeInTheDocument()
      
      // Should generate initials from name
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('should maintain functionality when callbacks are not provided', async () => {
      const user = userEvent.setup()
      render(<CRMHeaderBar />, { wrapper: getWrapper() })
      
      const quickAddButton = screen.getByTestId('quick-add-button')
      
      // Should not throw error when clicked without callback
      await user.click(quickAddButton)
      
      expect(quickAddButton).toBeInTheDocument()
    })
  })
})