/**
 * PropertyCarousel Component Tests
 * 
 * Following TDD principles - RED phase
 * Tests for the mobile-first PropertyCarousel component that displays
 * 4 properties in a compact carousel or 2x2 grid format
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PropertyCarousel } from '../NewPropertyCarousel'
import { createMockProperty, setupTest } from '@/test/utils'
import type { Property, PropertyAction, BucketType } from '../types'

// Test setup
const { getWrapper } = setupTest()

describe('PropertyCarousel Component', () => {
  // Mock data
  let mockProperties: Property[]
  let mockOnActionClick: jest.Mock
  let mockOnCardClick: jest.Mock
  let mockOnBucketChange: jest.Mock

  beforeEach(() => {
    mockProperties = Array.from({ length: 4 }, (_, index) => 
      createMockProperty({
        id: `property-${index + 1}`,
        address: `${123 + index} Test Street, Test City`,
        price: 400000 + (index * 50000),
        bedrooms: 2 + index,
        bathrooms: 1 + index,
        area_sqft: 1200 + (index * 300),
        property_type: ['house', 'apartment', 'condo', 'townhouse'][index],
        images: [`/images/test-${index + 1}.jpg`],
        features: ['parking', 'garden', 'pool', 'garage'][index] ? [['parking', 'garden', 'pool', 'garage'][index]] : []
      })
    )

    mockOnActionClick = jest.fn()
    mockOnCardClick = jest.fn()
    mockOnBucketChange = jest.fn()
  })

  describe('Basic Rendering', () => {
    it('should render carousel container', () => {
      render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      expect(screen.getByTestId('property-carousel')).toBeInTheDocument()
    })

    it('should display exactly 4 property cards', () => {
      render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      const cards = screen.getAllByRole('button', { name: /property card/i })
      expect(cards).toHaveLength(4)
    })

    it('should show all property information for each card', () => {
      render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      // Check first property
      expect(screen.getByText('$400,000')).toBeInTheDocument()
      expect(screen.getByText('123 Test Street, Test City')).toBeInTheDocument()
      
      // Check last property
      expect(screen.getByText('$550,000')).toBeInTheDocument()
      expect(screen.getByText('126 Test Street, Test City')).toBeInTheDocument()
    })
  })

  describe('Mobile Layout (2x2 Grid)', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
    })

    it('should arrange cards in 2x2 grid on mobile', () => {
      const { container } = render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      const carousel = container.querySelector('[data-testid="property-carousel"]')
      expect(carousel).toHaveClass('grid', 'grid-cols-2', 'gap-2')
    })

    it('should have mobile-friendly card sizes', () => {
      const { container } = render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      const cards = container.querySelectorAll('.property-card')
      cards.forEach(card => {
        expect(card).toHaveClass('w-full')
      })
    })

    it('should be scrollable vertically on mobile', () => {
      const { container } = render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      const carousel = container.querySelector('[data-testid="property-carousel"]')
      const computedStyle = window.getComputedStyle(carousel as Element)
      expect(['auto', 'scroll']).toContain(computedStyle.overflowY)
    })
  })

  describe('Desktop Layout', () => {
    beforeEach(() => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      })
    })

    it('should arrange cards in horizontal carousel on desktop', () => {
      const { container } = render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      const carousel = container.querySelector('[data-testid="property-carousel"]')
      expect(carousel).toHaveClass('flex', 'overflow-x-auto')
    })
  })

  describe('Navigation Controls', () => {
    it('should show navigation dots for 4 properties', () => {
      render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
          showNavigation={true}
        />
      )

      const dots = screen.getAllByRole('button', { name: /go to property \d+/i })
      expect(dots).toHaveLength(4)
    })

    it('should highlight active property in navigation', () => {
      render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
          showNavigation={true}
          activeIndex={1}
        />
      )

      const activeDot = screen.getByRole('button', { name: /go to property 2/i })
      expect(activeDot).toHaveClass('bg-blue-600')
    })

    it('should navigate to property when dot is clicked', () => {
      const mockOnNavigate = jest.fn()
      
      render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
          showNavigation={true}
          onNavigate={mockOnNavigate}
        />
      )

      const secondDot = screen.getByRole('button', { name: /go to property 2/i })
      fireEvent.click(secondDot)

      expect(mockOnNavigate).toHaveBeenCalledWith(1)
    })
  })

  describe('Touch Interactions', () => {
    it('should support swipe gestures on mobile', () => {
      const mockOnSwipe = jest.fn()
      
      render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
          onSwipe={mockOnSwipe}
        />
      )

      const carousel = screen.getByTestId('property-carousel')
      const innerCarousel = carousel.querySelector('.scroll-smooth')
      
      // Simulate swipe left
      fireEvent.touchStart(innerCarousel!, {
        touches: [{ clientX: 100, clientY: 0 }]
      })
      fireEvent.touchMove(innerCarousel!, {
        touches: [{ clientX: 40, clientY: 0 }]
      })
      fireEvent.touchEnd(innerCarousel!, {
        changedTouches: [{ clientX: 40, clientY: 0 }]
      })

      expect(mockOnSwipe).toHaveBeenCalledWith('left')
    })

    it('should have touch-friendly tap targets', () => {
      render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      const cards = screen.getAllByRole('button', { name: /property card/i })
      
      cards.forEach(card => {
        const styles = window.getComputedStyle(card)
        const minHeight = parseInt(styles.minHeight) || parseInt(styles.height)
        expect(minHeight >= 44).toBeTruthy()
      })
    })
  })

  describe('Property Actions Integration', () => {
    it('should pass action clicks to parent handler', () => {
      render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
          showActions={true}
        />
      )

      // Click like button on first property
      const likeButtons = screen.getAllByLabelText(/like this property/i)
      fireEvent.click(likeButtons[0])

      expect(mockOnActionClick).toHaveBeenCalledWith('property-1', 'like')
    })

    it('should pass card clicks to parent handler', () => {
      render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      const cards = screen.getAllByRole('button', { name: /property card/i })
      fireEvent.click(cards[0])

      expect(mockOnCardClick).toHaveBeenCalledWith(mockProperties[0])
    })
  })

  describe('Loading States', () => {
    it('should show loading skeletons when loading', () => {
      render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
          loading={true}
        />
      )

      const skeletons = screen.getAllByTestId('property-card-skeleton')
      expect(skeletons).toHaveLength(4)
    })

    it('should show empty state when no properties', () => {
      render(
        <PropertyCarousel 
          properties={[]}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      expect(screen.getByTestId('carousel-empty-state')).toBeInTheDocument()
      expect(screen.getByText(/no properties available/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      const carousel = screen.getByTestId('property-carousel')
      expect(carousel).toHaveAttribute('aria-label', 'Property carousel')
      expect(carousel).toHaveAttribute('role', 'region')
    })

    it('should support keyboard navigation', () => {
      render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      const firstCard = screen.getAllByRole('button', { name: /property card/i })[0]
      firstCard.focus()
      
      fireEvent.keyDown(firstCard, { key: 'ArrowRight' })
      
      const secondCard = screen.getAllByRole('button', { name: /property card/i })[1]
      expect(secondCard).toHaveFocus()
    })

    it('should announce property count to screen readers', () => {
      render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      expect(screen.getByText('Showing 4 properties', { 
        selector: '.sr-only' 
      })).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should adapt layout based on viewport width', async () => {
      const { rerender, container } = render(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      // Mobile
      Object.defineProperty(window, 'innerWidth', { value: 375 })
      window.dispatchEvent(new Event('resize'))
      
      // Force re-render
      rerender(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )
      
      await waitFor(() => {
        const carousel = container.querySelector('[data-testid="property-carousel"]')
        expect(carousel).toHaveClass('grid')
      })

      // Desktop
      Object.defineProperty(window, 'innerWidth', { value: 1024 })
      window.dispatchEvent(new Event('resize'))
      
      rerender(
        <PropertyCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      await waitFor(() => {
        const carousel = container.querySelector('[data-testid="property-carousel"]')
        expect(carousel).toHaveClass('flex')
      })
    })
  })

  describe('Performance', () => {
    it('should not re-render when properties haven\'t changed', () => {
      const renderSpy = jest.fn()
      
      const TestCarousel = React.memo(function TestCarousel(props: any) {
        renderSpy()
        return <PropertyCarousel {...props} />
      })

      const { rerender } = render(
        <TestCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      expect(renderSpy).toHaveBeenCalledTimes(1)

      // Rerender with same props (using same references)
      rerender(
        <TestCarousel 
          properties={mockProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      // Should re-render once more because parent re-renders
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })

    it('should implement virtual scrolling for large property lists', () => {
      const manyProperties = Array.from({ length: 100 }, (_, i) => 
        createMockProperty({ id: `property-${i}` })
      )

      render(
        <PropertyCarousel 
          properties={manyProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
          virtualScrolling={true}
        />
      )

      // Should only render visible cards + buffer
      const cards = screen.getAllByRole('button', { name: /property card/i })
      expect(cards.length).toBeLessThan(manyProperties.length)
      expect(cards.length).toBeLessThanOrEqual(10) // 4 visible + 6 buffer
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid property data gracefully', () => {
      const invalidProperties = [
        createMockProperty({ id: 'valid-1' }),
        { id: 'invalid', price: null, address: null } as any,
        createMockProperty({ id: 'valid-2' })
      ]

      render(
        <PropertyCarousel 
          properties={invalidProperties}
          onActionClick={mockOnActionClick}
          onCardClick={mockOnCardClick}
        />
      )

      // Should render valid properties and skip invalid ones
      const cards = screen.getAllByRole('button', { name: /property card/i })
      expect(cards).toHaveLength(2)
    })
  })
})

/**
 * Integration Tests
 * Test PropertyCarousel in combination with other components
 */
describe('PropertyCarousel Integration', () => {
  let mockProperties: Property[]
  let mockOnActionClick: jest.Mock
  let mockOnCardClick: jest.Mock

  beforeEach(() => {
    mockProperties = Array.from({ length: 4 }, (_, index) => 
      createMockProperty({
        id: `property-${index + 1}`,
        address: `${123 + index} Test Street`
      })
    )
    
    mockOnActionClick = jest.fn()
    mockOnCardClick = jest.fn()
  })

  it('should integrate with bucket navigation', () => {
    render(
      <PropertyCarousel 
        properties={mockProperties}
        onActionClick={mockOnActionClick}
        onCardClick={mockOnCardClick}
        currentBucket="new_properties"
        bucketCounts={{
          new_properties: 4,
          liked: 0,
          disliked: 0,
          considering: 0,
          schedule_visit: 0
        }}
      />
    )

    expect(screen.getByTestId('property-carousel')).toBeInTheDocument()
  })

  it('should work with state management', () => {
    const mockState = {
      currentBucket: 'new_properties' as BucketType,
      properties: mockProperties,
      loading: false
    }

    render(
      <PropertyCarousel 
        properties={mockState.properties}
        onActionClick={mockOnActionClick}
        onCardClick={mockOnCardClick}
        currentBucket={mockState.currentBucket}
        loading={mockState.loading}
      />
    )

    expect(screen.getAllByRole('button', { name: /property card/i })).toHaveLength(4)
  })
})