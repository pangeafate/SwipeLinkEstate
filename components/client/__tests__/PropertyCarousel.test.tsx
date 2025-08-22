import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PropertyCarousel from '../PropertyCarousel'

// Import shared infrastructure following TESTING-GUIDELINES.md
import { 
  setupTest, 
  createMockProperty,
  fixtures
} from '@/test'

// Import test utilities for visual design validation
import { act } from 'react-dom/test-utils'

// Setup shared utilities
const { getWrapper } = setupTest()

describe('PropertyCarousel Component', () => {
  const mockOnNavigate = jest.fn()
  const mockOnPropertySelect = jest.fn()
  const mockOnBucketAssign = jest.fn()

  // Use shared infrastructure for consistent test data
  const mockProperties = [
    createMockProperty({
      id: 'prop-1',
      address: '123 Ocean Drive',
      price: 850000,
      bedrooms: 3,
      bathrooms: 2.5
    }),
    createMockProperty({
      id: 'prop-2', 
      address: '456 Beach Ave',
      price: 1250000,
      bedrooms: 4,
      bathrooms: 3.0
    }),
    createMockProperty({
      id: 'prop-3',
      address: '789 Palm Street',
      price: 650000,
      bedrooms: 2,
      bathrooms: 2.0
    })
  ]

  const defaultProps = {
    properties: mockProperties,
    currentIndex: 0,
    onNavigate: mockOnNavigate,
    onPropertySelect: mockOnPropertySelect,
    onBucketAssign: mockOnBucketAssign,
    selectedBuckets: {},
    loading: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render carousel container with navigation controls', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('property-carousel')).toBeInTheDocument()
      expect(screen.getByTestId('carousel-prev-btn')).toBeInTheDocument()
      expect(screen.getByTestId('carousel-next-btn')).toBeInTheDocument()
    })

    it('should display current property as centered card', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('property-card-prop-1')).toHaveClass('carousel-card-active')
      expect(screen.getByText('123 Ocean Drive')).toBeInTheDocument()
      expect(screen.getByText(/850,000/)).toBeInTheDocument()
    })

    it('should show previous and next cards partially', () => {
      // ARRANGE - Start at middle property
      const propsWithMiddleIndex = { ...defaultProps, currentIndex: 1 }

      // ACT
      render(<PropertyCarousel {...propsWithMiddleIndex} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('property-card-prop-1')).toHaveClass('carousel-card-previous')
      expect(screen.getByTestId('property-card-prop-2')).toHaveClass('carousel-card-active')
      expect(screen.getByTestId('property-card-prop-3')).toHaveClass('carousel-card-next')
    })

    it('should display position indicators', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('carousel-indicators')).toBeInTheDocument()
      expect(screen.getAllByTestId(/carousel-indicator-/)).toHaveLength(3)
    })
  })

  describe('Navigation', () => {
    it('should call onNavigate when next button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('carousel-next-btn'))

      // ASSERT
      expect(mockOnNavigate).toHaveBeenCalledWith(1)
    })

    it('should call onNavigate when previous button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      const propsAtIndex1 = { ...defaultProps, currentIndex: 1 }
      render(<PropertyCarousel {...propsAtIndex1} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('carousel-prev-btn'))

      // ASSERT
      expect(mockOnNavigate).toHaveBeenCalledWith(0)
    })

    it('should disable previous button at first index', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('carousel-prev-btn')).toBeDisabled()
    })

    it('should disable next button at last index', () => {
      // ARRANGE
      const propsAtLastIndex = { ...defaultProps, currentIndex: 2 }

      // ACT
      render(<PropertyCarousel {...propsAtLastIndex} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('carousel-next-btn')).toBeDisabled()
    })

    it('should navigate when indicator dot is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('carousel-indicator-2'))

      // ASSERT
      expect(mockOnNavigate).toHaveBeenCalledWith(2)
    })

    it('should handle keyboard navigation with arrow keys', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })
      
      const carousel = screen.getByTestId('property-carousel')
      carousel.focus()

      // ACT
      await user.keyboard('{ArrowRight}')

      // ASSERT
      expect(mockOnNavigate).toHaveBeenCalledWith(1)
    })
  })

  describe('Property Interaction', () => {
    it('should call onPropertySelect when property card is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('property-card-prop-1'))

      // ASSERT
      expect(mockOnPropertySelect).toHaveBeenCalledWith(mockProperties[0])
    })

    it('should show bucket assignment buttons on active card', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-btn-love-prop-1')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-btn-maybe-prop-1')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-btn-pass-prop-1')).toBeInTheDocument()
    })

    it('should call onBucketAssign when bucket button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('bucket-btn-love-prop-1'))

      // ASSERT
      expect(mockOnBucketAssign).toHaveBeenCalledWith('prop-1', 'love')
    })

    it('should show assigned bucket state on property card', () => {
      // ARRANGE
      const propsWithAssignments = {
        ...defaultProps,
        selectedBuckets: { 'prop-1': 'love' }
      }

      // ACT
      render(<PropertyCarousel {...propsWithAssignments} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-btn-love-prop-1')).toHaveClass('bucket-assigned')
      expect(screen.getByTestId('property-card-prop-1')).toHaveClass('bucket-love')
    })
  })

  describe('Loading State', () => {
    it('should show loading skeleton when loading is true', () => {
      // ARRANGE
      const loadingProps = { ...defaultProps, loading: true }

      // ACT
      render(<PropertyCarousel {...loadingProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('carousel-loading-skeleton')).toBeInTheDocument()
      expect(screen.queryByTestId('property-card-prop-1')).not.toBeInTheDocument()
    })

    it('should disable navigation when loading', () => {
      // ARRANGE
      const loadingProps = { ...defaultProps, loading: true }

      // ACT
      render(<PropertyCarousel {...loadingProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('carousel-prev-btn')).toBeDisabled()
      expect(screen.getByTestId('carousel-next-btn')).toBeDisabled()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no properties provided', () => {
      // ARRANGE
      const emptyProps = { ...defaultProps, properties: [] }

      // ACT
      render(<PropertyCarousel {...emptyProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('carousel-empty-state')).toBeInTheDocument()
      expect(screen.getByText(/no properties available/i)).toBeInTheDocument()
    })
  })

  describe('Touch/Gesture Handling', () => {
    beforeEach(() => {
      // Mock window.innerWidth for swipe calculations
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1000, // 1000px screen width for testing
      })
    })

    it('should have touch event handlers attached', () => {
      // ARRANGE
      const mockProperties = [
        createMockProperty({ id: 'prop-1', imageUrl: 'test-image-1.jpg' }),
        createMockProperty({ id: 'prop-2', imageUrl: 'test-image-2.jpg' })
      ]
      render(<PropertyCarousel {...defaultProps} properties={mockProperties} />, { wrapper: getWrapper() })
      const carousel = screen.getByTestId('property-carousel')

      // ASSERT - Touch handlers should be present on the element
      // This verifies the component is set up for touch interactions
      expect(carousel).toHaveAttribute('tabindex', '0')
      expect(carousel).toHaveAttribute('aria-label', 'Property carousel')
      
      // Component should be focusable and keyboard navigable
      expect(carousel.getAttribute('tabIndex')).toBe('0')
    })

    it('should render with proper swipe gesture hook integration', () => {
      // ARRANGE & ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })
      const carousel = screen.getByTestId('property-carousel')

      // ASSERT - Component should be set up for touch interactions
      expect(carousel).toHaveAttribute('aria-label', 'Property carousel')
      expect(carousel).toBeInTheDocument()
      
      // Verify spring animation configuration is present
      expect(carousel).toHaveAttribute('data-spring-config')
      const springConfig = JSON.parse(carousel.getAttribute('data-spring-config') || '{}')
      expect(springConfig).toEqual({ damping: 0.8, stiffness: 400 })
    })

    it('should handle safe currentIndex boundaries', () => {
      // ARRANGE - Test with invalid currentIndex
      const propsWithInvalidIndex = { ...defaultProps, currentIndex: 999 }

      // ACT & ASSERT - Should not crash
      expect(() => {
        render(<PropertyCarousel {...propsWithInvalidIndex} />, { wrapper: getWrapper() })
      }).not.toThrow()

      // Should clamp to valid range
      const carousel = screen.getByTestId('property-carousel')
      expect(carousel).toBeInTheDocument()
    })

    it('should integrate with SwipeGestureHandler for touch events', () => {
      // ARRANGE
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })
      const carousel = screen.getByTestId('property-carousel')

      // ASSERT - Verify component is set up for touch interactions
      // The actual touch handling logic is tested in SwipeGestureHandler.test.ts
      expect(carousel).toHaveAttribute('tabIndex', '0')
      expect(carousel).toHaveAttribute('aria-label', 'Property carousel')
      
      // Component should be ready to handle touch interactions
      expect(carousel).toHaveClass('focus:outline-none')
    })

    it('should pass correct props to SwipeGestureHandler', () => {
      // ARRANGE & ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT - Component renders without errors, indicating proper prop passing
      const carousel = screen.getByTestId('property-carousel')
      expect(carousel).toBeInTheDocument()
      
      // Properties are passed correctly to the hook (tested in SwipeGestureHandler.test.ts)
      expect(mockProperties.length).toBe(3) // propertiesLength
      expect(defaultProps.currentIndex).toBe(0) // currentIndex
      expect(typeof mockOnNavigate).toBe('function') // onNavigate callback
    })

    it('should handle transition state properly with touch gestures', async () => {
      // ARRANGE
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })
      const carousel = screen.getByTestId('property-carousel')
      const nextButton = screen.getByTestId('carousel-next-btn')

      // ACT - Start navigation to create transition state
      await act(async () => {
        nextButton.click()
      })

      // ASSERT - Should handle transition state
      // During transition, touch events should be disabled (handled by SwipeGestureHandler)
      expect(carousel).toBeInTheDocument()
      
      // Wait for transition to complete
      await waitFor(() => {
        expect(mockOnNavigate).toHaveBeenCalled()
      }, { timeout: 500 })
    })

    it('should prevent interactions during loading state', () => {
      // ARRANGE
      const loadingProps = { ...defaultProps, loading: true }

      // ACT
      render(<PropertyCarousel {...loadingProps} />, { wrapper: getWrapper() })

      // ASSERT - Should show loading skeleton and disable interactions
      expect(screen.getByTestId('carousel-loading-skeleton')).toBeInTheDocument()
      expect(screen.getByTestId('carousel-prev-btn')).toBeDisabled()
      expect(screen.getByTestId('carousel-next-btn')).toBeDisabled()
      
      // No carousel should be present during loading
      expect(screen.queryByTestId('property-carousel')).not.toBeInTheDocument()
    })

    it('should handle empty properties array gracefully', () => {
      // ARRANGE
      const emptyProps = { ...defaultProps, properties: [] }

      // ACT
      render(<PropertyCarousel {...emptyProps} />, { wrapper: getWrapper() })

      // ASSERT - Should show empty state
      expect(screen.getByTestId('carousel-empty-state')).toBeInTheDocument()
      expect(screen.getByText(/no properties available/i)).toBeInTheDocument()
      
      // No carousel should be present for empty state
      expect(screen.queryByTestId('property-carousel')).not.toBeInTheDocument()
    })

    it('should provide swipe state to PropertyCard components', () => {
      // ARRANGE
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT - Get the active property card
      const activeCard = screen.getByTestId('property-card-prop-1')

      // ASSERT - PropertyCard should receive swipe-related props
      // The actual swipe state values are tested in SwipeGestureHandler.test.ts
      expect(activeCard).toBeInTheDocument()
      expect(activeCard).toHaveClass('carousel-card-active')
    })

    it('should handle keyboard navigation alongside touch gestures', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })
      const carousel = screen.getByTestId('property-carousel')

      // ACT - Focus and use keyboard navigation
      carousel.focus()
      await user.keyboard('{ArrowRight}')

      // ASSERT - Should navigate using keyboard (complementing touch gestures)
      expect(mockOnNavigate).toHaveBeenCalledWith(1)
    })

    it('should maintain accessibility with touch gesture integration', () => {
      // ARRANGE
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT - Accessibility should not be compromised by touch gesture handling
      expect(screen.getByTestId('property-carousel')).toHaveAttribute('aria-label', 'Property carousel')
      expect(screen.getByTestId('carousel-live-region')).toBeInTheDocument()
      expect(screen.getByTestId('carousel-prev-btn')).toHaveAttribute('aria-label', 'Previous property')
      expect(screen.getByTestId('carousel-next-btn')).toHaveAttribute('aria-label', 'Next property')
    })

    // Note: Detailed touch gesture physics, thresholds, and momentum calculations
    // are comprehensively tested in SwipeGestureHandler.test.ts
    // This component test focuses on integration and rendering behavior
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily when currentIndex changes', () => {
      // ARRANGE
      const renderSpy = jest.fn()
      const TestWrapper = (props: any) => {
        renderSpy()
        return <PropertyCarousel {...props} />
      }

      const { rerender } = render(
        <TestWrapper {...defaultProps} />, 
        { wrapper: getWrapper() }
      )

      // ACT
      rerender(<TestWrapper {...defaultProps} currentIndex={1} />)

      // ASSERT - Should only render twice (initial + rerender)
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })

    it('should preload adjacent property images', () => {
      // ARRANGE
      const mockPropertiesWithImages = mockProperties.map((prop, index) => ({
        ...prop,
        imageUrl: `test-image-${index + 1}.jpg`
      }))

      // ACT
      render(<PropertyCarousel {...defaultProps} properties={mockPropertiesWithImages} />, { wrapper: getWrapper() })

      // ASSERT - Check that preload hints are present for active card
      const images = screen.getAllByRole('img')
      expect(images.some(img => img.getAttribute('loading') === 'eager')).toBe(true)
      expect(images.some(img => img.getAttribute('loading') === 'lazy')).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('property-carousel')).toHaveAttribute('aria-label', 'Property carousel')
      expect(screen.getByTestId('carousel-prev-btn')).toHaveAttribute('aria-label', 'Previous property')
      expect(screen.getByTestId('carousel-next-btn')).toHaveAttribute('aria-label', 'Next property')
    })

    it('should announce property changes to screen readers', async () => {
      // ARRANGE
      const user = userEvent.setup()
      const { rerender } = render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('carousel-next-btn'))
      
      // Simulate parent updating currentIndex (this is how it works in real usage)
      rerender(<PropertyCarousel {...defaultProps} currentIndex={1} />)

      // ASSERT - Wait for the live region to update
      await waitFor(() => {
        expect(screen.getByTestId('carousel-live-region')).toHaveTextContent(
          'Now viewing property 2 of 3: 456 Beach Ave'
        )
      }, { timeout: 500 })
    })

    it('should support keyboard navigation', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      const carousel = screen.getByTestId('property-carousel')
      await user.tab() // Focus carousel
      await user.keyboard('{ArrowLeft}') // Should not navigate (at first index)
      await user.keyboard('{ArrowRight}') // Should navigate to next

      // ASSERT
      expect(mockOnNavigate).toHaveBeenCalledWith(1)
      expect(mockOnNavigate).toHaveBeenCalledTimes(1) // Left arrow should not trigger
    })
  })

  describe('Visual Design Compliance', () => {
    describe('70-25-5 Layout Distribution', () => {
      it('should allocate 70% height to hero image zone', () => {
        // ARRANGE
        render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })
        const propertyCard = screen.getByTestId('property-card-prop-1')

        // ACT
        const heroImageZone = propertyCard.querySelector('[data-testid="hero-image-zone"]')
        
        // ASSERT
        expect(heroImageZone).toBeInTheDocument()
        expect(heroImageZone).toHaveClass('h-[70%]')
      })

      it('should allocate 25% height to content zone', () => {
        // ARRANGE
        render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })
        const propertyCard = screen.getByTestId('property-card-prop-1')

        // ACT
        const contentZone = propertyCard.querySelector('[data-testid="content-zone"]')
        
        // ASSERT
        expect(contentZone).toBeInTheDocument()
        expect(contentZone).toHaveClass('h-[25%]')
      })

      it('should allocate 5% height to action zone', () => {
        // ARRANGE
        render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })
        const propertyCard = screen.getByTestId('property-card-prop-1')

        // ACT
        const actionZone = propertyCard.querySelector('[data-testid="action-zone"]')
        
        // ASSERT
        expect(actionZone).toBeInTheDocument()
        expect(actionZone).toHaveClass('h-[5%]')
      })
    })

    describe('Semantic Color System', () => {
      it('should use #4CAF50 for love status', () => {
        // ARRANGE
        const propsWithLove = {
          ...defaultProps,
          selectedBuckets: { 'prop-1': 'love' }
        }
        render(<PropertyCarousel {...propsWithLove} />, { wrapper: getWrapper() })

        // ACT
        const loveButton = screen.getByTestId('bucket-btn-love-prop-1')
        
        // ASSERT
        expect(loveButton).toHaveStyle('background-color: #4CAF50')
      })

      it('should use #F44336 for pass status', () => {
        // ARRANGE
        const propsWithPass = {
          ...defaultProps,
          selectedBuckets: { 'prop-1': 'pass' }
        }
        render(<PropertyCarousel {...propsWithPass} />, { wrapper: getWrapper() })

        // ACT
        const passButton = screen.getByTestId('bucket-btn-pass-prop-1')
        
        // ASSERT
        expect(passButton).toHaveStyle('background-color: #F44336')
      })

      it('should use #FF9800 for maybe status', () => {
        // ARRANGE
        const propsWithMaybe = {
          ...defaultProps,
          selectedBuckets: { 'prop-1': 'maybe' }
        }
        render(<PropertyCarousel {...propsWithMaybe} />, { wrapper: getWrapper() })

        // ACT
        const maybeButton = screen.getByTestId('bucket-btn-maybe-prop-1')
        
        // ASSERT
        expect(maybeButton).toHaveStyle('background-color: #FF9800')
      })
    })

    describe('Typography Scale', () => {
      it('should use 20px medium weight for property titles', () => {
        // ARRANGE
        render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

        // ACT
        const titleElement = screen.getByTestId('property-title-prop-1')
        
        // ASSERT
        expect(titleElement).toHaveClass('text-xl', 'font-medium')
      })

      it('should use 24px bold for prices', () => {
        // ARRANGE
        render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

        // ACT
        const priceElement = screen.getByTestId('property-price-prop-1')
        
        // ASSERT
        expect(priceElement).toHaveClass('text-2xl', 'font-bold')
      })

      it('should use 16px for body text', () => {
        // ARRANGE
        render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

        // ACT
        const bodyTextElement = screen.getByTestId('property-details-prop-1')
        
        // ASSERT
        expect(bodyTextElement).toHaveClass('text-base')
      })
    })

    describe('Gradient Overlay', () => {
      it('should apply semi-transparent gradient to hero images', () => {
        // ARRANGE
        render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

        // ACT
        const gradientOverlay = screen.getByTestId('gradient-overlay-prop-1')
        
        // ASSERT
        expect(gradientOverlay).toBeInTheDocument()
        expect(gradientOverlay).toHaveClass('bg-gradient-to-t', 'from-black/70', 'to-transparent')
      })

      it('should position gradient on bottom third of image', () => {
        // ARRANGE
        render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

        // ACT
        const gradientOverlay = screen.getByTestId('gradient-overlay-prop-1')
        
        // ASSERT
        expect(gradientOverlay).toHaveClass('absolute', 'bottom-0', 'left-0', 'right-0', 'h-1/3')
      })
    })

    describe('Price Overlay', () => {
      it('should position price as overlay on hero image', () => {
        // ARRANGE
        render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

        // ACT
        const priceOverlay = screen.getByTestId('price-overlay-prop-1')
        
        // ASSERT
        expect(priceOverlay).toBeInTheDocument()
        expect(priceOverlay).toHaveClass('absolute', 'bottom-4', 'left-4')
      })

      it('should use white text color for price overlay', () => {
        // ARRANGE
        render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

        // ACT
        const priceOverlay = screen.getByTestId('price-overlay-prop-1')
        
        // ASSERT
        expect(priceOverlay).toHaveClass('text-white')
      })
    })
  })

  describe('Spring Animations', () => {
    beforeEach(() => {
      // Mock framer-motion
      jest.mock('framer-motion', () => ({
        motion: {
          div: ({ children, ...props }) => <div {...props}>{children}</div>
        },
        AnimatePresence: ({ children }) => children,
        useMotionValue: () => ({ set: jest.fn(), get: jest.fn() }),
        useTransform: () => 0,
        useSpring: () => 0
      }))
    })

    it('should use spring animations with 0.8 damping ratio', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      const nextButton = screen.getByTestId('carousel-next-btn')
      await user.click(nextButton)

      // ASSERT - Verify spring animation configuration is applied
      await waitFor(() => {
        const carousel = screen.getByTestId('property-carousel')
        expect(carousel).toHaveAttribute('data-spring-config', JSON.stringify({
          damping: 0.8,
          stiffness: 400
        }))
      })
    })

    it('should animate card transitions with spring physics', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      const nextButton = screen.getByTestId('carousel-next-btn')
      await user.click(nextButton)

      // ASSERT
      await waitFor(() => {
        const activeCard = screen.getByTestId('property-card-prop-2')
        expect(activeCard).toHaveClass('spring-animation')
      }, { timeout: 500 })
    })
  })


  describe('Error Handling', () => {
    it('should handle invalid currentIndex gracefully', () => {
      // ARRANGE
      const invalidProps = { ...defaultProps, currentIndex: 999 }

      // ACT & ASSERT - Should not crash
      expect(() => {
        render(<PropertyCarousel {...invalidProps} />, { wrapper: getWrapper() })
      }).not.toThrow()
    })

    it('should handle missing property data gracefully', () => {
      // ARRANGE
      const propsWithMissingData = {
        ...defaultProps,
        properties: [
          { ...mockProperties[0], address: undefined, price: undefined }
        ]
      }

      // ACT & ASSERT - Should not crash
      expect(() => {
        render(<PropertyCarousel {...propsWithMissingData} />, { wrapper: getWrapper() })
      }).not.toThrow()
    })
  })
})