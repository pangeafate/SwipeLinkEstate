import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupTest } from '@/test'
import CRMSidebar from '../CRMSidebar'
import { useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Setup shared test utilities
const { getWrapper } = setupTest()

describe('CRMSidebar', () => {
  const mockRouter = { push: jest.fn() }
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter)
    jest.clearAllMocks()
  })

  const defaultProps = {
    currentPath: '/crm',
    upcomingTasks: [
      { id: '1', title: 'Follow up with John', dueDate: '2024-01-20', priority: 'high' },
      { id: '2', title: 'Send proposal', dueDate: '2024-01-21', priority: 'medium' }
    ],
    hotLeads: [
      { id: '1', clientName: 'Acme Corp', dealName: 'Enterprise Deal', engagementScore: 95 },
      { id: '2', clientName: 'Tech Co', dealName: 'SaaS Contract', engagementScore: 88 }
    ]
  }

  describe('Navigation Section', () => {
    it('should render all navigation items', () => {
      render(<CRMSidebar {...defaultProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Deals')).toBeInTheDocument()
      expect(screen.getByText('Contacts')).toBeInTheDocument()
      expect(screen.getByText('Activities')).toBeInTheDocument()
      expect(screen.getByText('Reports')).toBeInTheDocument()
    })

    it('should highlight active navigation item', () => {
      render(<CRMSidebar {...defaultProps} currentPath="/crm" />, { wrapper: getWrapper() })
      
      const dashboardItem = screen.getByRole('button', { name: /dashboard/i })
      expect(dashboardItem).toHaveClass('bg-blue-50')
    })

    it('should navigate when clicking navigation items', async () => {
      const user = userEvent.setup()
      const onNavigate = jest.fn()
      
      render(
        <CRMSidebar {...defaultProps} onNavigate={onNavigate} />, 
        { wrapper: getWrapper() }
      )
      
      const dealsButton = screen.getByRole('button', { name: /deals/i })
      await user.click(dealsButton)
      
      expect(onNavigate).toHaveBeenCalledWith('/crm/deals')
    })

    it('should show icons for navigation items', () => {
      render(<CRMSidebar {...defaultProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByTestId('icon-dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('icon-deals')).toBeInTheDocument()
      expect(screen.getByTestId('icon-contacts')).toBeInTheDocument()
    })
  })

  describe('Quick Actions', () => {
    it('should render quick action buttons', () => {
      render(<CRMSidebar {...defaultProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByRole('button', { name: /add deal/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add contact/i })).toBeInTheDocument()
    })

    it('should trigger add deal action', async () => {
      const user = userEvent.setup()
      const onAddDeal = jest.fn()
      
      render(
        <CRMSidebar {...defaultProps} onAddDeal={onAddDeal} />, 
        { wrapper: getWrapper() }
      )
      
      const addDealButton = screen.getByRole('button', { name: /add deal/i })
      await user.click(addDealButton)
      
      expect(onAddDeal).toHaveBeenCalled()
    })
  })

  describe('Upcoming Tasks Section', () => {
    it('should display upcoming tasks', () => {
      render(<CRMSidebar {...defaultProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByText('Upcoming Tasks')).toBeInTheDocument()
      expect(screen.getByText('Follow up with John')).toBeInTheDocument()
      expect(screen.getByText('Send proposal')).toBeInTheDocument()
    })

    it('should show task due dates', () => {
      render(<CRMSidebar {...defaultProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByText(/Jan 20/)).toBeInTheDocument()
      expect(screen.getByText(/Jan 21/)).toBeInTheDocument()
    })

    it('should show priority indicators', () => {
      render(<CRMSidebar {...defaultProps} />, { wrapper: getWrapper() })
      
      const highPriorityTask = screen.getByTestId('task-1')
      expect(highPriorityTask).toHaveClass('border-red-500')
      
      const mediumPriorityTask = screen.getByTestId('task-2')
      expect(mediumPriorityTask).toHaveClass('border-yellow-500')
    })

    it('should handle empty task list', () => {
      render(<CRMSidebar {...defaultProps} upcomingTasks={[]} />, { wrapper: getWrapper() })
      
      expect(screen.getByText('No upcoming tasks')).toBeInTheDocument()
    })

    it('should limit displayed tasks to 5', () => {
      const manyTasks = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        title: `Task ${i}`,
        dueDate: '2024-01-20',
        priority: 'medium'
      }))
      
      render(<CRMSidebar {...defaultProps} upcomingTasks={manyTasks} />, { wrapper: getWrapper() })
      
      const taskElements = screen.getAllByTestId(/^task-/)
      expect(taskElements).toHaveLength(5)
      expect(screen.getByText('View all tasks')).toBeInTheDocument()
    })
  })

  describe('Hot Leads Section', () => {
    it('should display hot leads', () => {
      render(<CRMSidebar {...defaultProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByText('🔥 Hot Leads')).toBeInTheDocument()
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      expect(screen.getByText('Tech Co')).toBeInTheDocument()
    })

    it('should show engagement scores', () => {
      render(<CRMSidebar {...defaultProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByText('Score: 95/100')).toBeInTheDocument()
      expect(screen.getByText('Score: 88/100')).toBeInTheDocument()
    })

    it('should show contact buttons for leads', () => {
      render(<CRMSidebar {...defaultProps} />, { wrapper: getWrapper() })
      
      // Get only the Contact buttons in hot leads section
      const leadContacts = screen.getAllByText('Contact')
      expect(leadContacts).toHaveLength(2)
    })

    it('should handle empty hot leads', () => {
      render(<CRMSidebar {...defaultProps} hotLeads={[]} />, { wrapper: getWrapper() })
      
      expect(screen.getByText('No hot leads at the moment')).toBeInTheDocument()
    })

    it('should limit displayed leads to 3', () => {
      const manyLeads = Array.from({ length: 5 }, (_, i) => ({
        id: `${i}`,
        clientName: `Client ${i}`,
        dealName: `Deal ${i}`,
        engagementScore: 90 - i
      }))
      
      render(<CRMSidebar {...defaultProps} hotLeads={manyLeads} />, { wrapper: getWrapper() })
      
      const leadElements = screen.getAllByTestId(/^lead-/)
      expect(leadElements).toHaveLength(3)
    })
  })

  describe('Collapse Functionality', () => {
    it('should show collapse button', () => {
      render(<CRMSidebar {...defaultProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByRole('button', { name: /toggle sidebar/i })).toBeInTheDocument()
    })

    it('should collapse to icon-only view', async () => {
      const user = userEvent.setup()
      const onToggleCollapse = jest.fn()
      
      render(
        <CRMSidebar {...defaultProps} isCollapsed={false} onToggleCollapse={onToggleCollapse} />,
        { wrapper: getWrapper() }
      )
      
      const collapseButton = screen.getByRole('button', { name: /toggle sidebar/i })
      await user.click(collapseButton)
      
      expect(onToggleCollapse).toHaveBeenCalled()
    })

    it('should hide text when collapsed', () => {
      render(<CRMSidebar {...defaultProps} isCollapsed={true} />, { wrapper: getWrapper() })
      
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      expect(screen.queryByText('Upcoming Tasks')).not.toBeInTheDocument()
      expect(screen.queryByText('Hot Leads')).not.toBeInTheDocument()
      
      // Icons should still be visible
      expect(screen.getByTestId('icon-dashboard')).toBeInTheDocument()
    })

    it('should adjust width when collapsed', () => {
      const { rerender } = render(
        <CRMSidebar {...defaultProps} isCollapsed={false} />,
        { wrapper: getWrapper() }
      )
      
      const sidebar = screen.getByTestId('crm-sidebar')
      expect(sidebar).toHaveStyle({ width: '280px' })
      
      rerender(<CRMSidebar {...defaultProps} isCollapsed={true} />)
      expect(sidebar).toHaveStyle({ width: '60px' })
    })
  })

  describe('Responsive Behavior', () => {
    it('should hide on mobile by default', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      render(<CRMSidebar {...defaultProps} />, { wrapper: getWrapper() })
      
      const sidebar = screen.getByTestId('crm-sidebar')
      expect(sidebar).toHaveClass('hidden', 'lg:block')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<CRMSidebar {...defaultProps} />, { wrapper: getWrapper() })
      
      expect(screen.getByRole('navigation', { name: /crm navigation/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /upcoming tasks/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /hot leads/i })).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(<CRMSidebar {...defaultProps} />, { wrapper: getWrapper() })
      
      // First tab goes to toggle button
      await user.tab()
      expect(screen.getByRole('button', { name: /toggle sidebar/i })).toHaveFocus()
      
      // Second tab goes to Dashboard
      await user.tab()
      expect(screen.getByRole('button', { name: /dashboard/i })).toHaveFocus()
      
      // Third tab goes to Deals
      await user.tab()
      expect(screen.getByRole('button', { name: /deals/i })).toHaveFocus()
    })

    it('should announce state changes', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <CRMSidebar {...defaultProps} isCollapsed={false} />,
        { wrapper: getWrapper() }
      )
      
      const sidebar = screen.getByTestId('crm-sidebar')
      expect(sidebar).toHaveAttribute('aria-expanded', 'true')
      
      rerender(<CRMSidebar {...defaultProps} isCollapsed={true} />)
      expect(sidebar).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Scroll Behavior', () => {
    it('should allow independent scrolling of content', () => {
      const manyTasks = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        title: `Task ${i}`,
        dueDate: '2024-01-20',
        priority: 'medium'
      }))
      
      render(<CRMSidebar {...defaultProps} upcomingTasks={manyTasks} />, { wrapper: getWrapper() })
      
      // Check that the scrollable container exists (not the sidebar itself)
      const scrollContainer = screen.getByTestId('crm-sidebar').querySelector('.overflow-y-auto')
      expect(scrollContainer).toBeInTheDocument()
    })
  })
})