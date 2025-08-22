import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PropertyModal from '../PropertyModal'

// Import shared infrastructure following TESTING-GUIDELINES.md
import { 
  setupTest, 
  createMockProperty,
  fixtures
} from '@/test'

// Setup shared utilities
const { getWrapper } = setupTest()

describe('PropertyModal Component', () => {
  const mockOnClose = jest.fn()
  const mockOnNavigate = jest.fn()
  const mockOnBucketAssign = jest.fn()
  const mockOnBookVisit = jest.fn()

  // Use shared infrastructure for consistent test data
  const mockProperty = createMockProperty({
    id: 'prop-1',
    address: '123 Ocean Drive',
    price: 850000,
    bedrooms: 3,
    bathrooms: 2.5,
    squareFootage: 2500,
    description: 'Beautiful oceanfront property with stunning views',
    imageUrl: 'main-image.jpg',
    images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
    yearBuilt: 2015,
    lotSize: 0.25,
    neighborhood: 'Ocean View',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  })

  const defaultProps = {
    property: mockProperty,
    isOpen: true,
    onClose: mockOnClose,
    onNavigate: mockOnNavigate,
    onBucketAssign: mockOnBucketAssign,
    selectedBucket: null,
    canNavigatePrev: true,
    canNavigateNext: true,
    onBookVisit: mockOnBookVisit
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Modal Rendering', () => {
    it('should render modal when isOpen is true', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('property-modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal-backdrop')).toBeInTheDocument()
    })

    it('should not render modal when isOpen is false', () => {
      // ARRANGE
      const closedProps = { ...defaultProps, isOpen: false }

      // ACT
      render(<PropertyModal {...closedProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.queryByTestId('property-modal')).not.toBeInTheDocument()
    })

    it('should not render modal when property is null', () => {
      // ARRANGE
      const noPropertyProps = { ...defaultProps, property: null }

      // ACT
      render(<PropertyModal {...noPropertyProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.queryByTestId('property-modal')).not.toBeInTheDocument()
    })

    it('should display property address in modal header', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('modal-header')).toHaveTextContent('123 Ocean Drive')
    })

    it('should show close button in modal header', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('modal-close-btn')).toBeInTheDocument()
    })
  })

  describe('Media Gallery Section', () => {
    it('should display primary property image', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('primary-image')).toBeInTheDocument()
      expect(screen.getByTestId('primary-image')).toHaveAttribute('src', 'main-image.jpg')
      expect(screen.getByTestId('primary-image')).toHaveAttribute('alt', '123 Ocean Drive')
    })

    it('should show image counter when multiple images exist', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('image-counter')).toHaveTextContent('1 of 4')
    })

    it('should display thumbnail navigation', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('thumbnail-nav')).toBeInTheDocument()
      expect(screen.getAllByTestId(/^thumbnail-\d+$/)).toHaveLength(4) // main + 3 additional
    })

    it('should have image navigation arrows', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('image-prev-btn')).toBeInTheDocument()
      expect(screen.getByTestId('image-next-btn')).toBeInTheDocument()
    })

    it('should navigate between images when arrows are clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('image-next-btn'))

      // ASSERT
      expect(screen.getByTestId('image-counter')).toHaveTextContent('2 of 4')
    })

    it('should change image when thumbnail is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('thumbnail-2'))

      // ASSERT
      expect(screen.getByTestId('primary-image')).toHaveAttribute('src', 'image2.jpg')
      expect(screen.getByTestId('image-counter')).toHaveTextContent('3 of 4')
    })
  })

  describe('Property Details Section', () => {
    it('should display formatted price', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('property-price')).toHaveTextContent('$850,000')
    })

    it('should show property features', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('property-features')).toHaveTextContent('3 bed')
      expect(screen.getByTestId('property-features')).toHaveTextContent('2.5 bath')
      expect(screen.getByTestId('property-features')).toHaveTextContent('2,500 sqft')
    })

    it('should display property description', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('property-description')).toHaveTextContent(
        'Beautiful oceanfront property with stunning views'
      )
    })

    it('should show additional property details', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('property-details')).toHaveTextContent('Built in 2015')
      expect(screen.getByTestId('property-details')).toHaveTextContent('0.25 acre lot')
      expect(screen.getByTestId('property-details')).toHaveTextContent('Ocean View')
    })
  })

  describe('Interactive Map Section', () => {
    it('should display property location map', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('property-map')).toBeInTheDocument()
    })

    it('should show map with correct coordinates', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const mapElement = screen.getByTestId('property-map')
      expect(mapElement).toHaveAttribute('data-lat', '40.7128')
      expect(mapElement).toHaveAttribute('data-lng', '-74.006')
    })

    it('should have map expand button', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('map-expand-btn')).toBeInTheDocument()
    })

    it('should expand map when expand button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('map-expand-btn'))

      // ASSERT
      expect(screen.getByTestId('property-map')).toHaveClass('expanded')
    })
  })

  describe('Action Panel', () => {
    it('should show bucket assignment buttons', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-btn-liked')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-btn-considering')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-btn-disliked')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-btn-book_visit')).toBeInTheDocument()
    })

    it('should highlight selected bucket', () => {
      // ARRANGE
      const propsWithSelection = { ...defaultProps, selectedBucket: 'liked' }

      // ACT
      render(<PropertyModal {...propsWithSelection} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-btn-liked')).toHaveClass('selected')
    })

    it('should call onBucketAssign when bucket button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('bucket-btn-liked'))

      // ASSERT
      expect(mockOnBucketAssign).toHaveBeenCalledWith('prop-1', 'liked')
    })

    it('should display Book Visit button prominently', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('book-visit-btn')).toBeInTheDocument()
      expect(screen.getByTestId('book-visit-btn')).toHaveClass('primary')
    })

    it('should call onBookVisit when Book Visit button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('book-visit-btn'))

      // ASSERT
      expect(mockOnBookVisit).toHaveBeenCalledWith('prop-1')
    })
  })

  describe('Modal Navigation', () => {
    it('should show navigation arrows when navigation is available', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('modal-prev-btn')).toBeInTheDocument()
      expect(screen.getByTestId('modal-next-btn')).toBeInTheDocument()
    })

    it('should disable previous button when canNavigatePrev is false', () => {
      // ARRANGE
      const noPrevProps = { ...defaultProps, canNavigatePrev: false }

      // ACT
      render(<PropertyModal {...noPrevProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('modal-prev-btn')).toBeDisabled()
    })

    it('should disable next button when canNavigateNext is false', () => {
      // ARRANGE
      const noNextProps = { ...defaultProps, canNavigateNext: false }

      // ACT
      render(<PropertyModal {...noNextProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('modal-next-btn')).toBeDisabled()
    })

    it('should call onNavigate with prev when previous button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('modal-prev-btn'))

      // ASSERT
      expect(mockOnNavigate).toHaveBeenCalledWith('prev')
    })

    it('should call onNavigate with next when next button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('modal-next-btn'))

      // ASSERT
      expect(mockOnNavigate).toHaveBeenCalledWith('next')
    })
  })

  describe('Modal Closing', () => {
    it('should call onClose when close button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('modal-close-btn'))

      // ASSERT
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when backdrop is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('modal-backdrop'))

      // ASSERT
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when Escape key is pressed', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.keyboard('{Escape}')

      // ASSERT
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should navigate images with arrow keys', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })
      
      const modal = screen.getByTestId('property-modal')
      modal.focus()

      // ACT
      await user.keyboard('{ArrowRight}')

      // ASSERT
      expect(screen.getByTestId('image-counter')).toHaveTextContent('2 of 4')
    })

    it('should navigate between properties with Left/Right arrows when Ctrl is held', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })
      
      const modal = screen.getByTestId('property-modal')
      modal.focus()

      // ACT
      await user.keyboard('{Control>}{ArrowRight}{/Control}')

      // ASSERT
      expect(mockOnNavigate).toHaveBeenCalledWith('next')
    })

    it('should trap focus within modal', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.tab()

      // ASSERT
      expect(document.activeElement).toBeInTheDocument()
      // Focus should be within the modal
      expect(screen.getByTestId('property-modal')).toContainElement(document.activeElement)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('property-modal')).toHaveAttribute('aria-label', 'Property details')
      expect(screen.getByTestId('modal-close-btn')).toHaveAttribute('aria-label', 'Close modal')
      expect(screen.getByTestId('primary-image')).toHaveAttribute('alt', '123 Ocean Drive')
    })

    it('should announce modal opening to screen readers', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('modal-live-region')).toHaveTextContent(
        'Property details modal opened for 123 Ocean Drive'
      )
    })

    it('should have proper heading structure', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('123 Ocean Drive')
      expect(screen.getByRole('heading', { level: 2, name: /property details/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2, name: /location/i })).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should show image loading skeleton while images load', () => {
      // ARRANGE
      const propsWithoutImages = {
        ...defaultProps,
        property: { ...mockProperty, imageUrl: undefined, images: [] }
      }

      // ACT
      render(<PropertyModal {...propsWithoutImages} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('image-loading-skeleton')).toBeInTheDocument()
    })

    it('should show map loading state initially', () => {
      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('map-loading')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing property data gracefully', () => {
      // ARRANGE
      const incompleteProperty = createMockProperty({
        id: 'prop-incomplete',
        address: '456 Test St',
        price: undefined,
        description: undefined,
        images: undefined
      })
      const propsWithIncompleteData = { ...defaultProps, property: incompleteProperty }

      // ACT & ASSERT - Should not crash
      expect(() => {
        render(<PropertyModal {...propsWithIncompleteData} />, { wrapper: getWrapper() })
      }).not.toThrow()
    })

    it('should show fallback when images fail to load', async () => {
      // ARRANGE
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })
      const image = screen.getByTestId('primary-image')

      // ACT - Simulate image load error
      const errorEvent = new Event('error')
      image.dispatchEvent(errorEvent)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByTestId('image-fallback')).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('should adapt layout for mobile screens', () => {
      // ARRANGE
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('property-modal')).toHaveClass('mobile-layout')
    })

    it('should stack content vertically on small screens', () => {
      // ARRANGE
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      })

      // ACT
      render(<PropertyModal {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('modal-content')).toHaveClass('flex-col')
    })
  })
})