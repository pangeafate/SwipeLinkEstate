/**
 * PropertyModal Component Tests
 * 
 * Following TDD principles - RED phase
 * Tests for the PropertyModal component that shows expanded property view
 * with 4 action buttons when a property card is tapped
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PropertyModal } from '../NewPropertyModal'
import { createMockProperty, setupTest } from '@/test/utils'
import type { Property, PropertyAction } from '../types'

// Test setup
const { getWrapper } = setupTest()

describe('PropertyModal Component', () => {
  // Mock data
  let mockProperty: Property
  let mockOnActionClick: jest.Mock
  let mockOnClose: jest.Mock

  beforeEach(() => {
    mockProperty = createMockProperty({
      id: 'test-property-1',
      address: '123 Test Street, Test City, FL 12345',
      price: 450000,
      bedrooms: 3,
      bathrooms: 2,
      area_sqft: 1500,
      property_type: 'house',
      images: ['/images/test-1.jpg', '/images/test-2.jpg', '/images/test-3.jpg'],
      features: ['parking', 'garden', 'pool', 'garage'],
      description: 'Beautiful test property with all amenities'
    })

    mockOnActionClick = jest.fn()
    mockOnClose = jest.fn()
  })

  describe('Modal Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByTestId('property-modal')).toBeInTheDocument()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should not render modal when isOpen is false', () => {
      render(
        <PropertyModal
          isOpen={false}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      expect(screen.queryByTestId('property-modal')).not.toBeInTheDocument()
    })

    it('should have proper modal accessibility attributes', () => {
      render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-labelledby')
      expect(modal).toHaveAttribute('aria-describedby')
      expect(modal).toHaveAttribute('aria-modal', 'true')
    })
  })

  describe('Property Information Display', () => {
    beforeEach(() => {
      render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )
    })

    it('should display property price prominently', () => {
      expect(screen.getByText('$450,000')).toBeInTheDocument()
    })

    it('should display full property address', () => {
      expect(screen.getByText('123 Test Street, Test City, FL 12345')).toBeInTheDocument()
    })

    it('should display property details', () => {
      expect(screen.getByText(/3 bedrooms/i)).toBeInTheDocument()
      expect(screen.getByText(/2 bathrooms/i)).toBeInTheDocument()
      expect(screen.getByText(/1,500 sq ft/i)).toBeInTheDocument()
    })

    it('should display property type', () => {
      expect(screen.getByText('House')).toBeInTheDocument()
    })

    it('should display property description', () => {
      expect(screen.getByText('Beautiful test property with all amenities')).toBeInTheDocument()
    })

    it('should display all property features', () => {
      expect(screen.getByText('Parking')).toBeInTheDocument()
      expect(screen.getByText('Garden')).toBeInTheDocument()
      expect(screen.getByText('Pool')).toBeInTheDocument()
      expect(screen.getByText('Garage')).toBeInTheDocument()
    })
  })

  describe('Image Gallery', () => {
    beforeEach(() => {
      render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )
    })

    it('should display main property image', () => {
      const mainImage = screen.getByRole('img', { name: /property at 123 test street/i })
      expect(mainImage).toBeInTheDocument()
      expect(mainImage).toHaveAttribute('src', '/images/test-1.jpg')
    })

    it('should show image counter', () => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })

    it('should show thumbnail gallery', () => {
      const thumbnails = screen.getAllByRole('button', { name: /view image \d+/i })
      expect(thumbnails).toHaveLength(3)
    })

    it('should navigate between images when thumbnails are clicked', async () => {
      const secondThumbnail = screen.getByRole('button', { name: /view image 2/i })
      fireEvent.click(secondThumbnail)

      await waitFor(() => {
        expect(screen.getByText('2 / 3')).toBeInTheDocument()
      })
    })

    it('should support keyboard navigation for images', () => {
      const gallery = screen.getByTestId('image-gallery')
      
      // Press arrow right to go to next image
      fireEvent.keyDown(gallery, { key: 'ArrowRight' })
      expect(screen.getByText('2 / 3')).toBeInTheDocument()

      // Press arrow left to go to previous image
      fireEvent.keyDown(gallery, { key: 'ArrowLeft' })
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    beforeEach(() => {
      render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )
    })

    it('should display all 4 action buttons', () => {
      expect(screen.getByRole('button', { name: /like this property/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /dislike this property/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /consider this property/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /schedule visit/i })).toBeInTheDocument()
    })

    it('should call onActionClick when like button is clicked', () => {
      const likeButton = screen.getByRole('button', { name: /like this property/i })
      fireEvent.click(likeButton)

      expect(mockOnActionClick).toHaveBeenCalledWith('test-property-1', 'like')
    })

    it('should call onActionClick when dislike button is clicked', () => {
      const dislikeButton = screen.getByRole('button', { name: /dislike this property/i })
      fireEvent.click(dislikeButton)

      expect(mockOnActionClick).toHaveBeenCalledWith('test-property-1', 'dislike')
    })

    it('should call onActionClick when consider button is clicked', () => {
      const considerButton = screen.getByRole('button', { name: /consider this property/i })
      fireEvent.click(considerButton)

      expect(mockOnActionClick).toHaveBeenCalledWith('test-property-1', 'consider')
    })

    it('should call onActionClick when schedule visit button is clicked', () => {
      const scheduleButton = screen.getByRole('button', { name: /schedule visit/i })
      fireEvent.click(scheduleButton)

      expect(mockOnActionClick).toHaveBeenCalledWith('test-property-1', 'schedule_visit')
    })

    it('should have touch-friendly button sizes', () => {
      const buttons = screen.getAllByRole('button').filter(button => 
        button.textContent?.includes('Like') || 
        button.textContent?.includes('Dislike') || 
        button.textContent?.includes('Consider') || 
        button.textContent?.includes('Visit')
      )

      buttons.forEach(button => {
        const styles = window.getComputedStyle(button)
        const minHeight = parseInt(styles.minHeight) || parseInt(styles.height)
        expect(minHeight >= 44).toBeTruthy()
      })
    })
  })

  describe('Modal Interactions', () => {
    it('should close modal when close button is clicked', () => {
      render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      const closeButton = screen.getByRole('button', { name: /close modal/i })
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close modal when backdrop is clicked', () => {
      render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      const backdrop = screen.getByTestId('modal-backdrop')
      fireEvent.click(backdrop)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close modal when Escape key is pressed', () => {
      render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should not close modal when clicking inside modal content', () => {
      render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      const modalContent = screen.getByTestId('modal-content')
      fireEvent.click(modalContent)

      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
    })

    it('should adapt layout for mobile screen', () => {
      const { container } = render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      const modal = container.querySelector('[data-testid="property-modal"]')
      expect(modal).toHaveClass('mobile-modal')
    })

    it('should stack action buttons vertically on small screens', () => {
      render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      const actionContainer = screen.getByTestId('action-buttons')
      expect(actionContainer).toHaveClass('flex-col', 'space-y-2')
    })

    it('should make modal full-screen on mobile', () => {
      const { container } = render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      const modalContent = container.querySelector('[data-testid="modal-content"]')
      expect(modalContent).toHaveClass('h-full', 'w-full')
    })
  })

  describe('Loading States', () => {
    it('should show loading state when property is loading', () => {
      render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
          loading={true}
        />
      )

      expect(screen.getByTestId('modal-loading')).toBeInTheDocument()
    })

    it('should show skeleton for images when loading', () => {
      render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
          loading={true}
        />
      )

      expect(screen.getByTestId('image-skeleton')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing property data gracefully', () => {
      const incompleteProperty = {
        id: 'incomplete',
        address: 'Test Address',
        price: null,
        images: []
      } as any

      render(
        <PropertyModal
          isOpen={true}
          property={incompleteProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      // Should still render modal without crashing
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should show placeholder when no images available', () => {
      const propertyWithoutImages = createMockProperty({
        ...mockProperty,
        images: []
      })

      render(
        <PropertyModal
          isOpen={true}
          property={propertyWithoutImages}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByTestId('image-placeholder')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should trap focus within modal when open', () => {
      render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      const modal = screen.getByRole('dialog')
      const closeButton = screen.getByRole('button', { name: /close modal/i })
      
      // Focus should be trapped within modal
      expect(document.activeElement).toBe(closeButton)
    })

    it('should restore focus when modal closes', () => {
      const triggerButton = document.createElement('button')
      document.body.appendChild(triggerButton)
      triggerButton.focus()

      const { rerender } = render(
        <PropertyModal
          isOpen={false}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      // Open modal
      rerender(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      // Close modal
      rerender(
        <PropertyModal
          isOpen={false}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      // Focus should return to trigger
      expect(document.activeElement).toBe(triggerButton)
      document.body.removeChild(triggerButton)
    })

    it('should have proper heading structure', () => {
      render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('123 Test Street, Test City, FL 12345')
    })

    it('should announce modal state to screen readers', () => {
      render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      const liveRegion = screen.getByText('Property details modal opened', { 
        selector: '.sr-only' 
      })
      expect(liveRegion).toBeInTheDocument()
    })
  })

  describe('Animation and Transitions', () => {
    it('should animate modal entrance', async () => {
      const { container } = render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      const modal = container.querySelector('[data-testid="property-modal"]')
      expect(modal).toHaveClass('animate-fade-in')
    })

    it('should animate modal exit', async () => {
      const { container, rerender } = render(
        <PropertyModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      rerender(
        <PropertyModal
          isOpen={false}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      await waitFor(() => {
        const modal = container.querySelector('[data-testid="property-modal"]')
        expect(modal).toHaveClass('animate-fade-out')
      })
    })
  })

  describe('Performance', () => {
    it('should not re-render when property hasn\'t changed', () => {
      const renderSpy = jest.fn()
      
      const TestModal = (props: any) => {
        renderSpy()
        return <PropertyModal {...props} />
      }

      const { rerender } = render(
        <TestModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      expect(renderSpy).toHaveBeenCalledTimes(1)

      // Rerender with same props
      rerender(
        <TestModal
          isOpen={true}
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onClose={mockOnClose}
        />
      )

      // Should not re-render if props haven't changed
      expect(renderSpy).toHaveBeenCalledTimes(1)
    })
  })
})

/**
 * Integration Tests
 * Test PropertyModal in combination with other components
 */
describe('PropertyModal Integration', () => {
  let mockProperty: Property
  let mockOnActionClick: jest.Mock
  let mockOnClose: jest.Mock

  beforeEach(() => {
    mockProperty = createMockProperty({
      id: 'integration-test',
      address: '456 Integration Street'
    })
    
    mockOnActionClick = jest.fn()
    mockOnClose = jest.fn()
  })

  it('should integrate with PropertyCard workflow', () => {
    render(
      <PropertyModal
        isOpen={true}
        property={mockProperty}
        onActionClick={mockOnActionClick}
        onClose={mockOnClose}
        openedFrom="property-card"
      />
    )

    // Should show context about where modal was opened from
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should integrate with bucket management system', () => {
    render(
      <PropertyModal
        isOpen={true}
        property={mockProperty}
        onActionClick={mockOnActionClick}
        onClose={mockOnClose}
        currentBucket="new_properties"
      />
    )

    // Action buttons should reflect current bucket context
    const actionButtons = screen.getAllByRole('button').filter(button => 
      ['Like', 'Dislike', 'Consider', 'Visit'].some(action => 
        button.textContent?.includes(action)
      )
    )
    expect(actionButtons).toHaveLength(4)
  })
})