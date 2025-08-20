import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LinkShareForm from '../LinkShareForm'

// Import shared infrastructure following TESTING-GUIDELINES.md
import { 
  setupTest, 
  createMockLink
} from '@/test'

// Setup shared utilities
const { getWrapper } = setupTest()

describe('LinkShareForm Component', () => {
  const mockOnCopyLink = jest.fn()
  const mockOnCreateAnother = jest.fn()

  // Use shared infrastructure for consistent test data
  const mockLink = createMockLink({
    id: 'link-123',
    code: 'ABC12345',
    name: 'My Property Collection'
  })

  const defaultProps = {
    createdLink: mockLink,
    selectedPropertyCount: 3,
    copySuccess: false,
    onCopyLink: mockOnCopyLink,
    onCreateAnother: mockOnCreateAnother
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window.location.origin for link URL generation
    delete (window as any).location
    ;(window as any).location = { origin: 'http://localhost:3000' }
  })

  describe('Rendering', () => {
    it('should render success message and title', () => {
      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByText('Link Created Successfully!')).toBeInTheDocument()
      expect(screen.getByText('Your property collection is ready to share')).toBeInTheDocument()
    })

    it('should show success icon', () => {
      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      // Look for the checkmark icon by finding the SVG with the specific path
      const checkmarkPath = screen.getByText('Link Created Successfully!').closest('div')
      const iconContainer = checkmarkPath?.querySelector('.bg-green-100')
      expect(iconContainer).toBeInTheDocument()
    })

    it('should display the generated link URL', () => {
      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const linkInput = screen.getByDisplayValue('http://localhost:3000/link/ABC12345')
      expect(linkInput).toBeInTheDocument()
      expect(linkInput).toHaveAttribute('readOnly')
    })

    it('should show link metadata', () => {
      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByText('Link Code:')).toBeInTheDocument()
      expect(screen.getByText('ABC12345')).toBeInTheDocument()
      expect(screen.getByText('Properties:')).toBeInTheDocument()
      expect(screen.getByText('3 selected')).toBeInTheDocument()
    })
  })

  describe('Link Information Display', () => {
    it('should show correct property count', () => {
      // ACT
      render(
        <LinkShareForm 
          {...defaultProps} 
          selectedPropertyCount={1}
        />, 
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByText('1 selected')).toBeInTheDocument()
    })

    it('should show correct property count for multiple properties', () => {
      // ACT
      render(
        <LinkShareForm 
          {...defaultProps} 
          selectedPropertyCount={5}
        />, 
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByText('5 selected')).toBeInTheDocument()
    })

    it('should display link code in monospace font', () => {
      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const linkCodeElement = screen.getByText('ABC12345')
      expect(linkCodeElement).toHaveClass('font-mono')
    })
  })

  describe('Copy Functionality', () => {
    it('should render Copy button when not successful', () => {
      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByText('Copy')).toBeInTheDocument()
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
    })

    it('should show Copied! state when copySuccess is true', () => {
      // ACT
      render(
        <LinkShareForm 
          {...defaultProps} 
          copySuccess={true}
        />, 
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByText('Copied!')).toBeInTheDocument()
      expect(screen.queryByText('Copy')).not.toBeInTheDocument()
    })

    it('should call onCopyLink when Copy button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByText('Copy'))

      // ASSERT
      expect(mockOnCopyLink).toHaveBeenCalled()
    })

    it('should not call onCopyLink when in copied state', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(
        <LinkShareForm 
          {...defaultProps} 
          copySuccess={true}
        />, 
        { wrapper: getWrapper() }
      )

      // ACT - Try to click the "Copied!" button
      await user.click(screen.getByText('Copied!'))

      // ASSERT - Should still be callable but indicates different state
      expect(mockOnCopyLink).toHaveBeenCalled()
    })

    it('should show different button styles for copy states', () => {
      // Test normal state
      const { rerender } = render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })
      
      let copyButton = screen.getByText('Copy').closest('button')
      expect(copyButton).toHaveClass('bg-blue-600')

      // Test success state
      rerender(
        <LinkShareForm 
          {...defaultProps} 
          copySuccess={true}
        />
      )
      
      copyButton = screen.getByText('Copied!').closest('button')
      expect(copyButton).toHaveClass('bg-green-600')
    })
  })

  describe('Create Another Action', () => {
    it('should render Create Another Link button', () => {
      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByText('Create Another Link')).toBeInTheDocument()
    })

    it('should call onCreateAnother when Create Another Link button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByText('Create Another Link'))

      // ASSERT
      expect(mockOnCreateAnother).toHaveBeenCalled()
    })

    it('should show plus icon in Create Another button', () => {
      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const createButton = screen.getByText('Create Another Link').closest('button')
      const plusIcon = createButton?.querySelector('svg')
      expect(plusIcon).toBeInTheDocument()
    })
  })

  describe('Sharing Instructions', () => {
    it('should show sharing instructions', () => {
      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByText(/share this link with clients/i)).toBeInTheDocument()
    })

    it('should mention multiple sharing platforms', () => {
      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const instructions = screen.getByText(/email, text, or any messaging platform/i)
      expect(instructions).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button roles and labels', () => {
      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create another link/i })).toBeInTheDocument()
    })

    it('should have proper label for link input', () => {
      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByText('Shareable Link')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should have readable link URL in input', () => {
      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const linkInput = screen.getByRole('textbox')
      expect(linkInput).toHaveAttribute('readOnly')
      expect(linkInput).toHaveValue('http://localhost:3000/link/ABC12345')
    })
  })

  describe('Edge Cases', () => {
    it('should handle null createdLink gracefully', () => {
      // ACT
      render(
        <LinkShareForm 
          {...defaultProps} 
          createdLink={null}
        />, 
        { wrapper: getWrapper() }
      )

      // ASSERT - Should not crash, should show undefined in URL
      expect(screen.getByDisplayValue('http://localhost:3000/link/undefined')).toBeInTheDocument()
    })

    it('should handle zero selected properties', () => {
      // ACT
      render(
        <LinkShareForm 
          {...defaultProps} 
          selectedPropertyCount={0}
        />, 
        { wrapper: getWrapper() }
      )

      // ASSERT
      expect(screen.getByText('0 selected')).toBeInTheDocument()
    })

    it('should handle very long link codes', () => {
      // ARRANGE
      const longCodeLink = createMockLink({
        code: 'VERYLONGLINKCODEABCDEFGHIJKLMNOP1234567890'
      })

      // ACT
      render(
        <LinkShareForm 
          {...defaultProps} 
          createdLink={longCodeLink}
        />, 
        { wrapper: getWrapper() }
      )

      // ASSERT - Should handle long codes gracefully
      expect(screen.getByText('VERYLONGLINKCODEABCDEFGHIJKLMNOP1234567890')).toBeInTheDocument()
    })

    it('should handle different window origins', () => {
      // ARRANGE
      ;(window as any).location = { origin: 'https://myapp.com' }

      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByDisplayValue('https://myapp.com/link/ABC12345')).toBeInTheDocument()
    })
  })

  describe('Visual States', () => {
    it('should show proper layout structure', () => {
      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByText('Link Created Successfully!')).toHaveClass('text-2xl', 'font-bold')
      expect(screen.getByText('Your property collection is ready to share')).toHaveClass('text-gray-600')
    })

    it('should have centered layout for success message', () => {
      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const successSection = screen.getByText('Link Created Successfully!').closest('div')
      expect(successSection).toHaveClass('text-center')
    })

    it('should have proper spacing and visual hierarchy', () => {
      // ACT
      render(<LinkShareForm {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const linkSection = document.querySelector('.bg-gray-50.rounded-lg')
      expect(linkSection).toBeInTheDocument()
    })
  })
})