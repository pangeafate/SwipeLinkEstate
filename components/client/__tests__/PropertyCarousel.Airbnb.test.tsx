import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Import shared infrastructure following TESTING-GUIDELINES.md
import { 
  setupTest, 
  createMockProperty,
  DOMUtils,
  A11yUtils
} from '@/test'

// Component under test
import PropertyCarousel from '../PropertyCarousel'

// Setup shared utilities
const { getWrapper } = setupTest()

describe('PropertyCarousel - Airbnb-Style Implementation', () => {
  const mockOnNavigate = jest.fn()
  const mockOnPropertySelect = jest.fn()
  const mockOnBucketAssign = jest.fn()

  // Use shared infrastructure for consistent test data
  const mockProperties = [
    createMockProperty({
      id: 'airbnb-1',
      address: '123 Waterfront Ave, Miami Beach',
      price: 850000,
      bedrooms: 3,
      bathrooms: 2.5,
      images: ['/images/waterfront-1.jpg', '/images/waterfront-2.jpg'],
      cover_image: '/images/waterfront-1.jpg'
    }),
    createMockProperty({
      id: 'airbnb-2', 
      address: '456 Ocean Drive, Miami Beach',
      price: 1250000,
      bedrooms: 4,
      bathrooms: 3.0,
      images: ['/images/ocean-1.jpg', '/images/ocean-2.jpg'],
      cover_image: '/images/ocean-1.jpg'
    }),
    createMockProperty({
      id: 'airbnb-3',
      address: '789 Beach Walk, South Beach',
      price: 650000,
      bedrooms: 2,
      bathrooms: 2.0,
      images: ['/images/beach-1.jpg', '/images/beach-2.jpg'],
      cover_image: '/images/beach-1.jpg'
    }),
    createMockProperty({
      id: 'airbnb-4',
      address: '321 Collins Ave, Miami Beach',
      price: 950000,
      bedrooms: 3,
      bathrooms: 2.5,
      images: ['/images/collins-1.jpg', '/images/collins-2.jpg'],
      cover_image: '/images/collins-1.jpg'
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

  describe('1. Carousel Structure Tests - Airbnb Pattern', () => {
    it('should render horizontal carousel container with NO card stacking', () => {
      // ARRANGE & ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT - Horizontal carousel structure
      const carousel = screen.getByTestId('airbnb-carousel-container')
      expect(carousel).toBeInTheDocument()
      expect(carousel).toHaveClass('horizontal-scroll')
      expect(carousel).toHaveClass('flex', 'overflow-x-auto')
      
      // ASSERT - NO card stacking (z-index tests)
      const cards = screen.getAllByTestId(/property-card-airbnb-/)
      cards.forEach((card, index) => {
        // All cards should have same z-index (no stacking)
        expect(card).not.toHaveStyle('z-index: 10')
        expect(card).not.toHaveClass('card-stack')
        expect(card).not.toHaveClass('card-behind')
      })
    })

    it('should show single card on mobile (375px)', () => {
      // ARRANGE - Mock mobile viewport
      DOMUtils.resizeWindow(375, 812)
      
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const carouselContainer = screen.getByTestId('airbnb-carousel-container')
      expect(carouselContainer).toHaveClass('mobile-single-card')
      
      // Should show 1 full card width
      const visibleCards = screen.getAllByTestId(/property-card-visible/)
      expect(visibleCards).toHaveLength(1)
      
      // Card should be 343px width (375px - 32px padding)
      const activeCard = screen.getByTestId('property-card-airbnb-1')
      expect(activeCard).toHaveClass('w-[343px]')
    })

    it('should show 3-4 cards on desktop (1024px+)', () => {
      // ARRANGE - Mock desktop viewport
      DOMUtils.resizeWindow(1024, 768)
      
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const carouselContainer = screen.getByTestId('airbnb-carousel-container')
      expect(carouselContainer).toHaveClass('desktop-multi-card')
      
      // Should show 3-4 cards simultaneously
      const visibleCards = screen.getAllByTestId(/property-card-visible/)
      expect(visibleCards.length).toBeGreaterThanOrEqual(3)
      expect(visibleCards.length).toBeLessThanOrEqual(4)
    })

    it('should have dot indicators below cards', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const dotIndicators = screen.getByTestId('airbnb-dot-indicators')
      expect(dotIndicators).toBeInTheDocument()
      expect(dotIndicators).toHaveClass('flex', 'justify-center', 'mt-4')
      
      // Should have dot for each property
      const dots = screen.getAllByTestId(/dot-indicator-/)
      expect(dots).toHaveLength(mockProperties.length)
      
      // Active dot should be larger and different color
      const activeDot = screen.getByTestId('dot-indicator-0')
      expect(activeDot).toHaveClass('w-2', 'h-2', 'bg-gray-800') // 8px active
      
      const inactiveDot = screen.getByTestId('dot-indicator-1')
      expect(inactiveDot).toHaveClass('w-1.5', 'h-1.5', 'bg-gray-400') // 6px inactive
    })

    it('should have NO card stacking z-index layers', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT - All cards should have same visual layer
      const allCards = screen.getAllByTestId(/property-card-airbnb-/)
      allCards.forEach(card => {
        expect(card).not.toHaveClass('z-10', 'z-20', 'z-30')
        expect(card).not.toHaveAttribute('style', expect.stringContaining('z-index'))
      })
    })
  })

  describe('2. Navigation Tests - Horizontal Scroll Pattern', () => {
    it('should have horizontal scroll functionality', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const scrollContainer = screen.getByTestId('horizontal-scroll-container')
      expect(scrollContainer).toBeInTheDocument()
      expect(scrollContainer).toHaveClass('scroll-smooth', 'overflow-x-auto')
      expect(scrollContainer).toHaveAttribute('style', expect.stringContaining('scroll-behavior: smooth'))
    })

    it('should have snap-to-center alignment', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const scrollContainer = screen.getByTestId('horizontal-scroll-container')
      expect(scrollContainer).toHaveClass('snap-x', 'snap-mandatory')
      
      const cards = screen.getAllByTestId(/property-card-airbnb-/)
      cards.forEach(card => {
        expect(card).toHaveClass('snap-center')
      })
    })

    it('should update dot indicators on scroll', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT - Navigate to second card
      const nextArrow = screen.getByTestId('airbnb-next-arrow')
      await user.click(nextArrow)

      // ASSERT
      await waitFor(() => {
        const dot1 = screen.getByTestId('dot-indicator-1')
        expect(dot1).toHaveClass('bg-gray-800') // Active state
        
        const dot0 = screen.getByTestId('dot-indicator-0')
        expect(dot0).toHaveClass('bg-gray-400') // Inactive state
      })
    })

    it('should have arrow navigation on desktop', () => {
      // ARRANGE - Desktop viewport
      DOMUtils.resizeWindow(1024, 768)
      
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const leftArrow = screen.getByTestId('airbnb-left-arrow')
      const rightArrow = screen.getByTestId('airbnb-right-arrow')
      
      expect(leftArrow).toBeInTheDocument()
      expect(rightArrow).toBeInTheDocument()
      expect(leftArrow).toHaveClass('desktop-only')
      expect(rightArrow).toHaveClass('desktop-only')
    })

    it('should support keyboard navigation (arrow keys)', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      const carousel = screen.getByTestId('airbnb-carousel-container')
      carousel.focus()
      await user.keyboard('{ArrowRight}')

      // ASSERT
      expect(mockOnNavigate).toHaveBeenCalledWith(1)
      
      // ACT - Left arrow
      await user.keyboard('{ArrowLeft}')
      
      // ASSERT
      expect(mockOnNavigate).toHaveBeenCalledWith(0)
    })

    it('should have NO swipe gestures for decisions', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT - Should not have swipe gesture handlers for accept/reject
      const carousel = screen.getByTestId('airbnb-carousel-container')
      expect(carousel).not.toHaveAttribute('data-swipe-left')
      expect(carousel).not.toHaveAttribute('data-swipe-right')
      expect(carousel).not.toHaveClass('swipeable-decisions')
      
      // Should only have scroll gestures
      expect(carousel).toHaveClass('scroll-gestures-only')
    })
  })

  describe('3. Card Layout Tests - 70-30 Ratio', () => {
    it('should have image section as 70% of card height', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const imageSection = screen.getByTestId('card-image-section-airbnb-1')
      expect(imageSection).toBeInTheDocument()
      expect(imageSection).toHaveClass('h-[70%]')
      expect(imageSection).toHaveClass('relative') // For overlay positioning
    })

    it('should have content section as 30% of card height', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const contentSection = screen.getByTestId('card-content-section-airbnb-1')
      expect(contentSection).toBeInTheDocument()
      expect(contentSection).toHaveClass('h-[30%]')
      expect(contentSection).toHaveClass('p-3') // Padding for content
    })

    it('should position price badge bottom-left on image', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const priceBadge = screen.getByTestId('price-badge-airbnb-1')
      expect(priceBadge).toBeInTheDocument()
      expect(priceBadge).toHaveClass('absolute', 'bottom-3', 'left-3')
      expect(priceBadge).toHaveClass('bg-black/80', 'text-white', 'px-2', 'py-1', 'rounded')
      expect(priceBadge).toHaveTextContent('$850,000')
    })

    it('should position wishlist heart top-right on image', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const wishlistHeart = screen.getByTestId('wishlist-heart-airbnb-1')
      expect(wishlistHeart).toBeInTheDocument()
      expect(wishlistHeart).toHaveClass('absolute', 'top-3', 'right-3')
      expect(wishlistHeart).toHaveClass('w-8', 'h-8', 'rounded-full', 'bg-white/90')
      expect(wishlistHeart).toHaveAttribute('aria-label', 'Add to wishlist')
    })

    it('should position photo counter top-left on image', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const photoCounter = screen.getByTestId('photo-counter-airbnb-1')
      expect(photoCounter).toBeInTheDocument()
      expect(photoCounter).toHaveClass('absolute', 'top-3', 'left-3')
      expect(photoCounter).toHaveClass('bg-black/60', 'text-white', 'px-2', 'py-1', 'rounded', 'text-xs')
      expect(photoCounter).toHaveTextContent('1/2') // Based on mock data
    })
  })

  describe('4. Interaction Tests - Tap NOT Swipe', () => {
    it('should expand card on tap (NOT swipe)', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT - Tap the card
      const card = screen.getByTestId('property-card-airbnb-1')
      await user.click(card)

      // ASSERT
      expect(mockOnPropertySelect).toHaveBeenCalledWith(mockProperties[0])
      
      // Should not trigger swipe behavior
      expect(card).not.toHaveClass('swiped-left', 'swiped-right')
    })

    it('should show action overlay on tap', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      const card = screen.getByTestId('property-card-airbnb-1')
      await user.click(card)

      // ASSERT
      const actionOverlay = screen.getByTestId('action-overlay-airbnb-1')
      expect(actionOverlay).toBeInTheDocument()
      expect(actionOverlay).toHaveClass('absolute', 'bottom-16', 'left-4', 'right-4')
      expect(actionOverlay).toHaveClass('bg-white/95', 'rounded-lg', 'p-2')
      expect(actionOverlay).toHaveClass('animate-slide-up')
    })

    it('should have bucket buttons (Like/Consider/Pass/Book)', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const likeBtn = screen.getByTestId('bucket-btn-like-airbnb-1')
      const considerBtn = screen.getByTestId('bucket-btn-consider-airbnb-1')
      const passBtn = screen.getByTestId('bucket-btn-pass-airbnb-1')
      const bookBtn = screen.getByTestId('bucket-btn-book-airbnb-1')

      expect(likeBtn).toBeInTheDocument()
      expect(considerBtn).toBeInTheDocument()
      expect(passBtn).toBeInTheDocument()
      expect(bookBtn).toBeInTheDocument()

      // Each button should be 44px for touch targets
      expect(likeBtn).toHaveClass('w-11', 'h-11') // 44px
      expect(considerBtn).toHaveClass('w-11', 'h-11')
      expect(passBtn).toHaveClass('w-11', 'h-11')
      expect(bookBtn).toHaveClass('w-11', 'h-11')
    })

    it('should toggle wishlist heart', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      const wishlistHeart = screen.getByTestId('wishlist-heart-airbnb-1')
      await user.click(wishlistHeart)

      // ASSERT
      expect(mockOnBucketAssign).toHaveBeenCalledWith('airbnb-1', 'wishlist')
      expect(wishlistHeart).toHaveClass('bg-red-500', 'text-white')
    })

    it('should have NO rotation on any interaction', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT - Try various interactions
      const card = screen.getByTestId('property-card-airbnb-1')
      await user.click(card)
      await user.hover(card)

      // ASSERT - No rotation classes or styles
      expect(card).not.toHaveClass('rotate-1', 'rotate-2', 'rotate-3', '-rotate-1', '-rotate-2', '-rotate-3')
      expect(card).not.toHaveAttribute('style', expect.stringContaining('transform: rotate'))
      expect(card).not.toHaveAttribute('style', expect.stringContaining('rotateZ'))
    })

    it('should have NO velocity tracking', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const carousel = screen.getByTestId('airbnb-carousel-container')
      expect(carousel).not.toHaveAttribute('data-velocity-tracking')
      expect(carousel).not.toHaveClass('velocity-enabled')
      
      // No velocity-based classes should be present
      const cards = screen.getAllByTestId(/property-card-airbnb-/)
      cards.forEach(card => {
        expect(card).not.toHaveClass('velocity-fast', 'velocity-slow')
      })
    })
  })

  describe('5. Responsive Tests', () => {
    it('should show 1 card visible on mobile (343px width)', () => {
      // ARRANGE
      DOMUtils.resizeWindow(375, 812)
      
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const card = screen.getByTestId('property-card-airbnb-1')
      expect(card).toHaveClass('w-[343px]') // 375px - 32px padding
      expect(card).toHaveClass('mobile-card')
      
      // Only one card should be fully visible
      const visibleCards = screen.getAllByTestId(/property-card-visible/)
      expect(visibleCards).toHaveLength(1)
    })

    it('should show 2 cards on tablet', () => {
      // ARRANGE
      DOMUtils.resizeWindow(768, 1024)
      
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const carouselContainer = screen.getByTestId('airbnb-carousel-container')
      expect(carouselContainer).toHaveClass('tablet-layout')
      
      const visibleCards = screen.getAllByTestId(/property-card-visible/)
      expect(visibleCards).toHaveLength(2)
    })

    it('should show 3-4 cards on desktop', () => {
      // ARRANGE
      DOMUtils.resizeWindow(1200, 800)
      
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const carouselContainer = screen.getByTestId('airbnb-carousel-container')
      expect(carouselContainer).toHaveClass('desktop-layout')
      
      const visibleCards = screen.getAllByTestId(/property-card-visible/)
      expect(visibleCards.length).toBeGreaterThanOrEqual(3)
      expect(visibleCards.length).toBeLessThanOrEqual(4)
    })

    it('should have proper spacing and gaps', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const carouselContainer = screen.getByTestId('airbnb-carousel-container')
      expect(carouselContainer).toHaveClass('gap-4') // 16px gap between cards
      
      const card = screen.getByTestId('property-card-airbnb-1')
      expect(card).toHaveClass('flex-shrink-0') // Prevent card compression
    })
  })

  describe('6. Accessibility Tests', () => {
    it('should have ARIA labels present', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const carousel = screen.getByTestId('airbnb-carousel-container')
      expect(carousel).toHaveAttribute('role', 'region')
      expect(carousel).toHaveAttribute('aria-label', 'Property listings carousel')
      expect(carousel).toHaveAttribute('aria-roledescription', 'carousel')
      
      const card = screen.getByTestId('property-card-airbnb-1')
      expect(card).toHaveAttribute('role', 'article')
      expect(card).toHaveAttribute('aria-label', expect.stringContaining('3 bedroom property'))
    })

    it('should have keyboard navigation working', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      const carousel = screen.getByTestId('airbnb-carousel-container')
      await user.tab() // Focus carousel
      expect(carousel).toHaveFocus()

      // Test arrow key navigation
      await user.keyboard('{ArrowRight}')
      expect(mockOnNavigate).toHaveBeenCalledWith(1)

      await user.keyboard('{ArrowLeft}')
      expect(mockOnNavigate).toHaveBeenCalledWith(0)
    })

    it('should have 44px touch targets', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT - All interactive elements should meet 44px minimum
      const wishlistHeart = screen.getByTestId('wishlist-heart-airbnb-1')
      expect(wishlistHeart).toHaveClass('min-w-[44px]', 'min-h-[44px]')
      
      const bucketButtons = screen.getAllByTestId(/bucket-btn-.*-airbnb-1/)
      bucketButtons.forEach(button => {
        expect(button).toHaveClass('w-11', 'h-11') // 44px
      })
      
      const dotIndicators = screen.getAllByTestId(/dot-indicator-/)
      dotIndicators.forEach(dot => {
        expect(dot).toHaveClass('min-w-[44px]', 'min-h-[44px]')
      })
    })

    it('should have focus indicators visible', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      const carousel = screen.getByTestId('airbnb-carousel-container')
      await user.tab()

      // ASSERT
      expect(carousel).toHaveFocus()
      expect(carousel).toHaveClass('focus:ring-2', 'focus:ring-blue-500', 'focus:outline-none')
      
      // Interactive elements should have visible focus states
      const wishlistHeart = screen.getByTestId('wishlist-heart-airbnb-1')
      await user.tab()
      expect(wishlistHeart).toHaveClass('focus:ring-2', 'focus:ring-offset-2')
    })

    it('should use A11yUtils for comprehensive accessibility checks', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const carousel = screen.getByTestId('airbnb-carousel-container')
      
      // Use A11yUtils to check ARIA attributes
      A11yUtils.checkAriaAttributes(carousel, {
        'role': 'region',
        'aria-label': 'Property listings carousel',
        'aria-roledescription': 'carousel'
      })

      // Check keyboard accessibility
      A11yUtils.checkKeyboardAccessible(carousel)
      
      const cards = screen.getAllByTestId(/property-card-airbnb-/)
      cards.forEach(card => {
        A11yUtils.checkAriaAttributes(card, {
          'role': 'article',
          'tabindex': '0'
        })
      })
    })
  })

  describe('7. Anti-Tinder Mechanics Tests', () => {
    it('should have NO card stacks', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT - No stacking z-index values
      const cards = screen.getAllByTestId(/property-card-airbnb-/)
      cards.forEach((card, index) => {
        expect(card).not.toHaveClass('z-10', 'z-20', 'z-30')
        expect(card).not.toHaveClass('card-stack-layer')
        expect(card).not.toHaveAttribute('style', expect.stringContaining('z-index'))
      })
      
      // All cards should be in horizontal layout
      const container = screen.getByTestId('airbnb-carousel-container')
      expect(container).toHaveClass('flex', 'overflow-x-auto')
      expect(container).not.toHaveClass('card-stack', 'layered-cards')
    })

    it('should have NO swipe left/right for yes/no decisions', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const cards = screen.getAllByTestId(/property-card-airbnb-/)
      cards.forEach(card => {
        expect(card).not.toHaveAttribute('data-swipe-accept')
        expect(card).not.toHaveAttribute('data-swipe-reject')
        expect(card).not.toHaveClass('swipeable-decision')
      })

      // Should have explicit buttons instead
      expect(screen.getByTestId('bucket-btn-like-airbnb-1')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-btn-pass-airbnb-1')).toBeInTheDocument()
    })

    it('should have NO cards flying off screen', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT - No fly-away animations
      const cards = screen.getAllByTestId(/property-card-airbnb-/)
      cards.forEach(card => {
        expect(card).not.toHaveClass('fly-out-left', 'fly-out-right')
        expect(card).not.toHaveClass('animate-fly-away')
        expect(card).not.toHaveAttribute('style', expect.stringContaining('translateX(100%)'))
        expect(card).not.toHaveAttribute('style', expect.stringContaining('translateX(-100%)'))
      })
    })

    it('should have NO rotation/tilt during interactions', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT - Try various interactions
      const card = screen.getByTestId('property-card-airbnb-1')
      await user.hover(card)
      await user.click(card)

      // ASSERT - No rotation classes or transforms
      expect(card).not.toHaveClass('rotate-1', 'rotate-2', '-rotate-1', '-rotate-2')
      expect(card).not.toHaveClass('transform-gpu', 'rotate-on-drag')
      expect(card).not.toHaveAttribute('style', expect.stringContaining('rotate'))
      expect(card).not.toHaveAttribute('style', expect.stringContaining('rotateZ'))
    })

    it('should have NO binary decision making', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT - Should have multiple decision options, not just accept/reject
      const bucketButtons = screen.getAllByTestId(/bucket-btn-.*-airbnb-1/)
      expect(bucketButtons.length).toBeGreaterThan(2) // More than just yes/no

      // Specific buttons for multiple categories
      expect(screen.getByTestId('bucket-btn-like-airbnb-1')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-btn-consider-airbnb-1')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-btn-pass-airbnb-1')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-btn-book-airbnb-1')).toBeInTheDocument()

      // No binary yes/no buttons
      expect(screen.queryByTestId('accept-btn')).not.toBeInTheDocument()
      expect(screen.queryByTestId('reject-btn')).not.toBeInTheDocument()
    })

    it('should have NO spring-back animations', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const cards = screen.getAllByTestId(/property-card-airbnb-/)
      cards.forEach(card => {
        expect(card).not.toHaveClass('spring-back', 'bounce-back')
        expect(card).not.toHaveClass('elastic-return', 'snap-back')
        expect(card).not.toHaveAttribute('data-spring-back')
      })

      // Carousel should use smooth scroll instead
      const container = screen.getByTestId('horizontal-scroll-container')
      expect(container).toHaveClass('scroll-smooth')
      expect(container).toHaveAttribute('style', expect.stringContaining('scroll-behavior: smooth'))
    })
  })

  describe('8. Photography-First Design Tests', () => {
    it('should prioritize image display with minimal text overlay', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const imageSection = screen.getByTestId('card-image-section-airbnb-1')
      const contentSection = screen.getByTestId('card-content-section-airbnb-1')

      // Image should dominate (70% vs 30%)
      expect(imageSection).toHaveClass('h-[70%]')
      expect(contentSection).toHaveClass('h-[30%]')

      // Minimal overlay elements only
      const overlayElements = screen.getAllByTestId(/.*-overlay-airbnb-1$/)
      expect(overlayElements.length).toBeLessThanOrEqual(3) // price, wishlist, photo counter only
    })

    it('should have clean, trust-building aesthetic with white space', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const card = screen.getByTestId('property-card-airbnb-1')
      expect(card).toHaveClass('bg-white', 'rounded-xl', 'shadow-sm')
      
      const contentSection = screen.getByTestId('card-content-section-airbnb-1')
      expect(contentSection).toHaveClass('p-3') // Generous padding for white space
      
      // Clean typography without clutter
      const title = screen.getByTestId('property-title-airbnb-1')
      expect(title).toHaveClass('text-gray-900', 'font-medium')
      
      const details = screen.getByTestId('property-details-airbnb-1')
      expect(details).toHaveClass('text-gray-600', 'text-sm')
    })

    it('should use subtle shadows and clean borders', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const card = screen.getByTestId('property-card-airbnb-1')
      expect(card).toHaveClass('shadow-sm') // Subtle shadow
      expect(card).toHaveClass('border-0') // No harsh borders
      expect(card).toHaveClass('rounded-xl') // Soft rounded corners
      
      // No heavy visual elements
      expect(card).not.toHaveClass('shadow-lg', 'shadow-xl', 'border-2', 'border-4')
    })
  })

  describe('9. Loading States - Airbnb Style', () => {
    it('should show skeleton cards that match Airbnb design', () => {
      // ARRANGE
      const loadingProps = { ...defaultProps, loading: true }

      // ACT
      render(<PropertyCarousel {...loadingProps} />, { wrapper: getWrapper() })

      // ASSERT
      const skeletonContainer = screen.getByTestId('airbnb-loading-skeleton')
      expect(skeletonContainer).toBeInTheDocument()
      
      // Should have multiple skeleton cards for Airbnb layout
      const skeletonCards = screen.getAllByTestId(/skeleton-card-/)
      expect(skeletonCards.length).toBeGreaterThanOrEqual(3) // Show multiple cards on desktop
      
      skeletonCards.forEach(card => {
        expect(card).toHaveClass('animate-pulse', 'bg-gray-200', 'rounded-xl')
        
        // Skeleton should match real card proportions
        const skeletonImage = card.querySelector('[data-testid*="skeleton-image"]')
        const skeletonContent = card.querySelector('[data-testid*="skeleton-content"]')
        
        expect(skeletonImage).toHaveClass('h-[70%]')
        expect(skeletonContent).toHaveClass('h-[30%]')
      })
    })

    it('should show shimmer effect matching Airbnb style', () => {
      // ARRANGE
      const loadingProps = { ...defaultProps, loading: true }

      // ACT
      render(<PropertyCarousel {...loadingProps} />, { wrapper: getWrapper() })

      // ASSERT
      const skeletonCards = screen.getAllByTestId(/skeleton-card-/)
      skeletonCards.forEach(card => {
        expect(card).toHaveClass('bg-gradient-to-r', 'from-gray-200', 'via-gray-100', 'to-gray-200')
        expect(card).toHaveClass('animate-shimmer') // Custom shimmer animation
      })
    })
  })

  describe('10. Bottom Sheet Patterns', () => {
    it('should show bottom sheet for additional information', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      const moreInfoBtn = screen.getByTestId('more-info-btn-airbnb-1')
      await user.click(moreInfoBtn)

      // ASSERT
      const bottomSheet = screen.getByTestId('bottom-sheet-airbnb-1')
      expect(bottomSheet).toBeInTheDocument()
      expect(bottomSheet).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0')
      expect(bottomSheet).toHaveClass('bg-white', 'rounded-t-xl', 'shadow-2xl')
      expect(bottomSheet).toHaveClass('animate-slide-up-from-bottom')
    })

    it('should have drag handle and swipe-to-dismiss on bottom sheet', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      const moreInfoBtn = screen.getByTestId('more-info-btn-airbnb-1')
      await user.click(moreInfoBtn)

      // ASSERT
      const bottomSheet = screen.getByTestId('bottom-sheet-airbnb-1')
      const dragHandle = bottomSheet.querySelector('[data-testid="bottom-sheet-drag-handle"]')
      
      expect(dragHandle).toBeInTheDocument()
      expect(dragHandle).toHaveClass('w-12', 'h-1', 'bg-gray-300', 'rounded-full', 'mx-auto', 'mt-2')
      
      // Should support swipe-to-dismiss
      expect(bottomSheet).toHaveAttribute('data-swipe-dismiss', 'true')
    })
  })

  describe('11. Performance Requirements', () => {
    it('should lazy load images with proper priorities', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const firstCardImage = screen.getByTestId('property-image-airbnb-1')
      const otherCardImage = screen.getByTestId('property-image-airbnb-2')

      // First card should load eagerly
      expect(firstCardImage).toHaveAttribute('loading', 'eager')
      expect(firstCardImage).toHaveAttribute('fetchpriority', 'high')
      
      // Other cards should be lazy
      expect(otherCardImage).toHaveAttribute('loading', 'lazy')
    })

    it('should use WebP format with fallbacks', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const images = screen.getAllByTestId(/property-image-airbnb-/)
      images.forEach(img => {
        // Should be wrapped in <picture> element for WebP support
        const picture = img.closest('picture')
        expect(picture).toBeInTheDocument()
        
        const webpSource = picture?.querySelector('source[type="image/webp"]')
        expect(webpSource).toBeInTheDocument()
      })
    })

    it('should implement image sizing for different viewports', () => {
      // ACT
      render(<PropertyCarousel {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const image = screen.getByTestId('property-image-airbnb-1')
      expect(image).toHaveAttribute('sizes', 
        '(max-width: 640px) 343px, (max-width: 1024px) 50vw, 33vw'
      )
      
      // Should have srcSet for responsive images
      expect(image).toHaveAttribute('srcSet')
    })
  })
})