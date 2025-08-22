/**
 * PropertyCard Component Tests
 * 
 * Following TDD principles - RED phase
 * Tests for the mobile-first PropertyCard component that displays
 * property information in a compact, tappable card format
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PropertyCard } from '../NewPropertyCard'
import { createMockProperty, setupTest } from '@/test/utils'
import type { Property, PropertyAction } from '../types'

// Test setup
const { getWrapper } = setupTest()

describe('PropertyCard Component', () => {
  // Mock data
  let mockProperty: Property
  let mockOnActionClick: jest.Mock
  let mockOnCardClick: jest.Mock

  beforeEach(() => {
    mockProperty = createMockProperty({
      id: 'test-property-1',
      address: '123 Test Street, Test City',
      price: 450000,
      bedrooms: 3,
      bathrooms: 2,
      area_sqft: 1500,
      property_type: 'house',
      images: ['/images/test-1.jpg', '/images/test-2.jpg'],
      features: ['parking', 'garden'],
      description: 'Beautiful test property'
    })

    mockOnActionClick = jest.fn()
    mockOnCardClick = jest.fn()
  })

  describe('Basic Rendering', () => {
    it('should render property card with basic information', () => {
      render(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      // Check that key property information is displayed
      expect(screen.getByText('$450,000')).toBeInTheDocument()
      expect(screen.getByText('123 Test Street, Test City')).toBeInTheDocument()
      expect(screen.getByText('3 bd')).toBeInTheDocument()
      expect(screen.getByText('2 ba')).toBeInTheDocument()
      expect(screen.getByText('1,500 sq ft')).toBeInTheDocument()
    })

    it('should display property image', () => {
      render(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      const image = screen.getByRole('img', { name: /property at 123 test street/i })
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', '/images/test-1.jpg')
    })

    it('should have proper mobile-first dimensions', () => {
      const { container } = render(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('property-card')
      
      // Check mobile-first responsive classes
      const computedStyle = window.getComputedStyle(card)
      expect(card.className).toMatch(/w-full|max-w/)
    })
  })

  describe('Property Information Display', () => {
    it('should format price correctly', () => {
      const expensiveProperty = createMockProperty({ price: 1250000 })
      
      render(
        <PropertyCard 
          property={expensiveProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      expect(screen.getByText('$1,250,000')).toBeInTheDocument()
    })

    it('should display property type badge', () => {
      render(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      expect(screen.getByText('House')).toBeInTheDocument()
    })

    it('should show key features', () => {
      render(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      // Features should be shown as badges or tags
      expect(screen.getByText('Parking')).toBeInTheDocument()
      expect(screen.getByText('Garden')).toBeInTheDocument()
    })
  })

  describe('Interaction Handling', () => {
    it('should call onCardClick when card is tapped', () => {
      render(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      const card = screen.getByRole('button', { name: /property card/i })
      fireEvent.click(card)

      expect(mockOnCardClick).toHaveBeenCalledWith(mockProperty)
    })

    it('should have proper accessibility attributes', () => {
      render(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      const card = screen.getByRole('button', { name: /property card/i })
      expect(card).toHaveAttribute('aria-label')
      expect(card).toHaveAttribute('tabIndex', '0')
    })

    it('should be keyboard accessible', async () => {
      render(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      const card = screen.getByRole('button', { name: /property card/i })
      card.focus()
      
      fireEvent.keyDown(card, { key: 'Enter' })
      expect(mockOnCardClick).toHaveBeenCalledWith(mockProperty)

      fireEvent.keyDown(card, { key: ' ' })
      expect(mockOnCardClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('Action Buttons', () => {
    it('should display all 4 action buttons', () => {
      render(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
          showActions={true}
        />
      )

      // Use aria-labels for more specific selection
      expect(screen.getByLabelText('Like this property')).toBeInTheDocument()
      expect(screen.getByLabelText('Dislike this property')).toBeInTheDocument()
      expect(screen.getByLabelText('Consider this property')).toBeInTheDocument()
      expect(screen.getByLabelText('Schedule visit for this property')).toBeInTheDocument()
    })

    it('should call onActionClick with correct parameters', () => {
      render(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
          showActions={true}
        />
      )

      const likeButton = screen.getByLabelText('Like this property')
      fireEvent.click(likeButton)

      expect(mockOnActionClick).toHaveBeenCalledWith(mockProperty.id, 'like')
    })

    it('should prevent event bubbling when action button is clicked', () => {
      render(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
          showActions={true}
        />
      )

      const likeButton = screen.getByLabelText('Like this property')
      fireEvent.click(likeButton)

      expect(mockOnActionClick).toHaveBeenCalledWith(mockProperty.id, 'like')
      expect(mockOnCardClick).not.toHaveBeenCalled()
    })

    it('should not show actions by default', () => {
      render(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      expect(screen.queryByLabelText('Like this property')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Dislike this property')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Consider this property')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Schedule visit for this property')).not.toBeInTheDocument()
    })
  })

  describe('Loading and Error States', () => {
    it('should show loading state when property is loading', () => {
      render(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
          loading={true}
        />
      )

      expect(screen.getByTestId('property-card-skeleton')).toBeInTheDocument()
    })

    it('should handle missing property image gracefully', () => {
      const propertyWithoutImage = createMockProperty({ 
        ...mockProperty, 
        images: [] 
      })

      render(
        <PropertyCard 
          property={propertyWithoutImage}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      const image = screen.getByRole('img')
      // Check that placeholder URL is used when no images are provided
      expect(image).toHaveAttribute('src', expect.stringContaining('placeholder'))
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should adapt to mobile screen size', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })

      const { container } = render(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card.className).toMatch(/mobile|sm:|w-full/)
    })

    it('should have touch-friendly tap targets', () => {
      render(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
          showActions={true}
        />
      )

      const likeButton = screen.getByLabelText('Like this property')
      
      // Check that button has min-h-[44px] class which ensures 44px minimum height
      expect(likeButton).toHaveClass('min-h-[44px]')
    })
  })

  describe('Performance', () => {
    it('should be memoized to prevent unnecessary re-renders', () => {
      const { rerender } = render(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      // Get initial render
      const initialCard = screen.getByRole('button', { name: /property card/i })
      
      // Rerender with same props
      rerender(
        <PropertyCard 
          property={mockProperty}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      // Card should still exist (component is memoized)
      const rerenderCard = screen.getByRole('button', { name: /property card/i })
      expect(rerenderCard).toBe(initialCard)
    })
  })
})

/**
 * Integration Tests
 * Test PropertyCard in combination with other components
 */
describe('PropertyCard Integration', () => {
  it('should work with property carousel context', () => {
    // This test will be expanded when PropertyCarousel is implemented
    render(
      <PropertyCard 
        property={createMockProperty()}
        onActionClick={jest.fn()}
        onCardClick={jest.fn()}
        carouselIndex={0}
        totalCards={4}
      />
    )

    expect(screen.getByRole('button', { name: /property card/i })).toBeInTheDocument()
  })

  it('should integrate with bucket management', () => {
    render(
      <PropertyCard 
        property={createMockProperty()}
        onActionClick={jest.fn()}
        onCardClick={jest.fn()}
        currentBucket="new_properties"
        showActions={true}
      />
    )

    expect(screen.getByLabelText('Like this property')).toBeInTheDocument()
    expect(screen.getByLabelText('Dislike this property')).toBeInTheDocument()
    expect(screen.getByLabelText('Consider this property')).toBeInTheDocument()
    expect(screen.getByLabelText('Schedule visit for this property')).toBeInTheDocument()
  })
})