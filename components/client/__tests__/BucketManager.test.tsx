import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BucketManager from '../BucketManager'

// Import shared infrastructure following TESTING-GUIDELINES.md
import { 
  setupTest, 
  createMockProperty,
  fixtures
} from '@/test'

// Setup shared utilities
const { getWrapper } = setupTest()

describe('BucketManager Component', () => {
  const mockOnBucketChange = jest.fn()
  const mockOnPropertySelect = jest.fn()
  const mockOnBookVisit = jest.fn()
  const mockOnClearBucket = jest.fn()

  // Use shared infrastructure for consistent test data
  const mockProperties = [
    createMockProperty({
      id: 'prop-1',
      address: '123 Ocean Drive',
      price: 850000,
      bedrooms: 3,
      bathrooms: 2.5,
      images: ['image1.jpg', 'image2.jpg']
    }),
    createMockProperty({
      id: 'prop-2', 
      address: '456 Beach Ave',
      price: 1250000,
      bedrooms: 4,
      bathrooms: 3.0,
      images: ['image3.jpg', 'image4.jpg']
    }),
    createMockProperty({
      id: 'prop-3',
      address: '789 Palm Street',
      price: 650000,
      bedrooms: 2,
      bathrooms: 2.0,
      images: ['image5.jpg']
    })
  ]

  const defaultProps = {
    properties: mockProperties,
    buckets: {
      love: ['prop-1'],
      maybe: ['prop-2'],
      pass: ['prop-3']
    },
    bookedVisits: [],
    onBucketChange: mockOnBucketChange,
    onPropertySelect: mockOnPropertySelect,
    onBookVisit: mockOnBookVisit,
    onClearBucket: mockOnClearBucket,
    loading: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render bucket navigation with all bucket tabs', () => {
      // ACT
      render(<BucketManager {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-manager')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-nav')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-tab-love')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-tab-maybe')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-tab-pass')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-tab-all')).toBeInTheDocument()
    })

    it('should display correct property counts in bucket tabs', () => {
      // ACT
      render(<BucketManager {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-tab-love')).toHaveTextContent('Liked (1)')
      expect(screen.getByTestId('bucket-tab-maybe')).toHaveTextContent('Considering (1)')
      expect(screen.getByTestId('bucket-tab-pass')).toHaveTextContent('Disliked (1)')
      expect(screen.getByTestId('bucket-tab-all')).toHaveTextContent('All Properties (3)')
    })

    it('should show active bucket tab with proper styling', () => {
      // ARRANGE - Start with love bucket active
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'love' }

      // ACT
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-tab-love')).toHaveClass('bucket-tab-active')
      expect(screen.getByTestId('bucket-tab-maybe')).not.toHaveClass('bucket-tab-active')
    })

    it('should display bucket statistics when properties are assigned', () => {
      // ARRANGE
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'love' }

      // ACT
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-stats')).toBeInTheDocument()
      expect(screen.getByText(/average price/i)).toBeInTheDocument()
      expect(screen.getByTestId('bucket-stats')).toHaveTextContent(/property types/i)
    })
  })

  describe('Bucket Navigation', () => {
    it('should switch active bucket when tab is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<BucketManager {...defaultProps} activeBucket="love" />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('bucket-tab-maybe'))

      // ASSERT
      expect(mockOnBucketChange).toHaveBeenCalledWith('maybe')
    })

    it('should show keyboard navigation support', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<BucketManager {...defaultProps} activeBucket="love" />, { wrapper: getWrapper() })

      // ACT
      const maybeTab = screen.getByTestId('bucket-tab-maybe')
      maybeTab.focus()
      await user.keyboard('{Enter}')

      // ASSERT
      expect(mockOnBucketChange).toHaveBeenCalledWith('maybe')
    })

    it('should highlight tab with properties assigned', () => {
      // ACT
      render(<BucketManager {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-tab-love')).toHaveClass('has-properties')
      expect(screen.getByTestId('bucket-tab-maybe')).toHaveClass('has-properties')
      expect(screen.getByTestId('bucket-tab-pass')).toHaveClass('has-properties')
    })
  })

  describe('Property Grid Display', () => {
    it('should display properties in active bucket', () => {
      // ARRANGE
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'love' }

      // ACT
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-property-grid')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-property-card-prop-1')).toBeInTheDocument()
      expect(screen.queryByTestId('bucket-property-card-prop-2')).not.toBeInTheDocument()
    })

    it('should show all properties when all bucket is active', () => {
      // ARRANGE
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'all' }

      // ACT
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-property-card-prop-1')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-property-card-prop-2')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-property-card-prop-3')).toBeInTheDocument()
    })

    it('should call onPropertySelect when property card is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'love' }
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('bucket-property-card-prop-1'))

      // ASSERT
      expect(mockOnPropertySelect).toHaveBeenCalledWith(mockProperties[0])
    })

    it('should show bucket assignment indicators on property cards', () => {
      // ARRANGE
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'love' }

      // ACT
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-property-card-prop-1')).toHaveClass('bucket-assigned-love')
    })
  })

  describe('Bucket Statistics', () => {
    it('should calculate and display average price for bucket', () => {
      // ARRANGE
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'love' }

      // ACT
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-stats-avg-price')).toHaveTextContent('$850,000')
    })

    it('should show property type distribution', () => {
      // ARRANGE - Mixed property types
      const mixedProperties = [
        createMockProperty({ id: 'prop-1', property_type: 'Condo' }),
        createMockProperty({ id: 'prop-2', property_type: 'House' }),
        createMockProperty({ id: 'prop-3', property_type: 'Condo' })
      ]
      const propsWithMixed = {
        ...defaultProps,
        properties: mixedProperties,
        buckets: { love: ['prop-1', 'prop-2', 'prop-3'], maybe: [], pass: [] },
        activeBucket: 'love'
      }

      // ACT
      render(<BucketManager {...propsWithMixed} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-stats-property-types')).toBeInTheDocument()
      expect(screen.getByText(/condo/i)).toBeInTheDocument()
      expect(screen.getByText(/house/i)).toBeInTheDocument()
    })

    it('should display location spread analysis', () => {
      // ARRANGE
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'love' }

      // ACT
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-stats-locations')).toBeInTheDocument()
      expect(screen.getByText(/ocean drive/i)).toBeInTheDocument()
    })

    it('should show common features identified', () => {
      // ARRANGE
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'love' }

      // ACT
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-stats-features')).toBeInTheDocument()
      expect(screen.getByText(/3 bedrooms/i)).toBeInTheDocument()
      expect(screen.getByText(/2.5 bathrooms/i)).toBeInTheDocument()
    })
  })

  describe('Bucket Actions', () => {
    it('should show bucket action buttons', () => {
      // ARRANGE
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'love' }

      // ACT
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-actions')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-action-download')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-action-share')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-action-clear')).toBeInTheDocument()
    })

    it('should call onClearBucket when clear bucket is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'love' }
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('bucket-action-clear'))

      // ASSERT - Should show confirmation dialog first
      expect(screen.getByTestId('clear-bucket-confirmation')).toBeInTheDocument()
      
      // Confirm the action
      await user.click(screen.getByTestId('confirm-clear-bucket'))
      expect(mockOnClearBucket).toHaveBeenCalledWith('love')
    })

    it('should support download/print bucket summary', async () => {
      // ARRANGE
      const user = userEvent.setup()
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'love' }
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // Mock window.print
      const mockPrint = jest.fn()
      Object.defineProperty(window, 'print', { value: mockPrint })

      // ACT
      await user.click(screen.getByTestId('bucket-action-download'))

      // ASSERT
      expect(mockPrint).toHaveBeenCalled()
    })

    it('should enable share bucket functionality', async () => {
      // ARRANGE
      const user = userEvent.setup()
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'love' }
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('bucket-action-share'))

      // ASSERT
      expect(screen.getByTestId('share-bucket-modal')).toBeInTheDocument()
      expect(screen.getByText(/share with agent/i)).toBeInTheDocument()
    })
  })

  describe('Sort and Filter Options', () => {
    it('should display sort options for bucket properties', () => {
      // ARRANGE
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'love' }

      // ACT
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-sort-options')).toBeInTheDocument()
      expect(screen.getByText(/sort by price/i)).toBeInTheDocument()
      expect(screen.getByText(/sort by date added/i)).toBeInTheDocument()
    })

    it('should apply sort when sort option is selected', async () => {
      // ARRANGE
      const user = userEvent.setup()
      const multiPropertyBucket = {
        ...defaultProps,
        buckets: { love: ['prop-1', 'prop-2'], maybe: [], pass: [] },
        activeBucket: 'love'
      }
      render(<BucketManager {...multiPropertyBucket} />, { wrapper: getWrapper() })

      // ACT
      await user.selectOptions(screen.getByTestId('bucket-sort-select'), 'price-desc')

      // ASSERT - Higher priced property should appear first
      const propertyCards = screen.getAllByTestId(/bucket-property-card-/)
      expect(propertyCards[0]).toHaveAttribute('data-testid', 'bucket-property-card-prop-2')
      expect(propertyCards[1]).toHaveAttribute('data-testid', 'bucket-property-card-prop-1')
    })

    it('should show filter options for property type and price range', () => {
      // ARRANGE
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'all' }

      // ACT
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-filter-options')).toBeInTheDocument()
      expect(screen.getByTestId('filter-property-type')).toBeInTheDocument()
      expect(screen.getByTestId('filter-price-range')).toBeInTheDocument()
    })
  })

  describe('Drag and Drop Support', () => {
    it('should support drag and drop between buckets', async () => {
      // ARRANGE
      const user = userEvent.setup()
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'all' }
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      const propertyCard = screen.getByTestId('bucket-property-card-prop-1')
      const maybeTab = screen.getByTestId('bucket-tab-maybe')

      // ACT - Simulate drag and drop
      await user.dragAndDrop(propertyCard, maybeTab)

      // ASSERT
      expect(mockOnBucketChange).toHaveBeenCalledWith('maybe', 'prop-1')
    })

    it('should provide visual feedback during drag operations', async () => {
      // ARRANGE
      const user = userEvent.setup()
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'all' }
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      const propertyCard = screen.getByTestId('bucket-property-card-prop-1')

      // ACT - Start drag operation
      await user.dragStart(propertyCard)

      // ASSERT
      expect(propertyCard).toHaveClass('dragging')
      expect(screen.getByTestId('bucket-nav')).toHaveClass('drag-active')
    })
  })

  describe('Visit Booking Integration', () => {
    it('should show book visit button for liked properties', () => {
      // ARRANGE
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'love' }

      // ACT
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('book-visit-prop-1')).toBeInTheDocument()
    })

    it('should call onBookVisit when book visit button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup()
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'love' }
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('book-visit-prop-1'))

      // ASSERT
      expect(mockOnBookVisit).toHaveBeenCalledWith(mockProperties[0])
    })

    it('should show booked visits status', () => {
      // ARRANGE
      const propsWithBookings = {
        ...defaultProps,
        bookedVisits: [{ propertyId: 'prop-1', date: '2025-08-25', time: '2:00 PM' }],
        activeBucket: 'love'
      }

      // ACT
      render(<BucketManager {...propsWithBookings} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-property-card-prop-1')).toHaveClass('visit-booked')
      expect(screen.getByText(/visit booked/i)).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('should show empty state when bucket has no properties', () => {
      // ARRANGE
      const emptyBucketProps = {
        ...defaultProps,
        buckets: { love: [], maybe: [], pass: [] },
        activeBucket: 'love'
      }

      // ACT
      render(<BucketManager {...emptyBucketProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-empty-state')).toBeInTheDocument()
      expect(screen.getByText(/no properties in this bucket/i)).toBeInTheDocument()
      expect(screen.getByText(/browse properties to add them/i)).toBeInTheDocument()
    })

    it('should show empty state for all properties when none exist', () => {
      // ARRANGE
      const noPropertiesProps = {
        ...defaultProps,
        properties: [],
        buckets: { love: [], maybe: [], pass: [] },
        activeBucket: 'all'
      }

      // ACT
      render(<BucketManager {...noPropertiesProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-empty-state')).toBeInTheDocument()
      expect(screen.getByText(/no properties available/i)).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should show loading skeleton when loading is true', () => {
      // ARRANGE
      const loadingProps = { ...defaultProps, loading: true }

      // ACT
      render(<BucketManager {...loadingProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-loading-skeleton')).toBeInTheDocument()
      expect(screen.queryByTestId('bucket-property-grid')).not.toBeInTheDocument()
    })

    it('should disable interactions when loading', () => {
      // ARRANGE
      const loadingProps = { ...defaultProps, loading: true }

      // ACT
      render(<BucketManager {...loadingProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-tab-love')).toBeDisabled()
      expect(screen.getByTestId('bucket-tab-maybe')).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      // ACT
      render(<BucketManager {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bucket-manager')).toHaveAttribute('role', 'region')
      expect(screen.getByTestId('bucket-manager')).toHaveAttribute('aria-label', 'Property bucket management')
      expect(screen.getByTestId('bucket-nav')).toHaveAttribute('role', 'tablist')
      expect(screen.getByTestId('bucket-tab-love')).toHaveAttribute('role', 'tab')
    })

    it('should support keyboard navigation between tabs', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<BucketManager {...defaultProps} activeBucket="love" />, { wrapper: getWrapper() })

      // ACT
      const loveTab = screen.getByTestId('bucket-tab-love')
      loveTab.focus()
      await user.keyboard('{ArrowRight}')

      // ASSERT
      expect(screen.getByTestId('bucket-tab-maybe')).toHaveFocus()
    })

    it('should announce bucket changes to screen readers', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<BucketManager {...defaultProps} activeBucket="love" />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('bucket-tab-maybe'))

      // ASSERT
      await waitFor(() => {
        expect(screen.getByTestId('bucket-live-region')).toHaveTextContent(
          'Now viewing Considering bucket with 1 properties'
        )
      })
    })

    it('should provide descriptive labels for property actions', () => {
      // ARRANGE
      const propsWithActiveBucket = { ...defaultProps, activeBucket: 'love' }

      // ACT
      render(<BucketManager {...propsWithActiveBucket} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('book-visit-prop-1')).toHaveAttribute(
        'aria-label', 
        'Book visit for 123 Ocean Drive'
      )
    })
  })

  describe('Performance', () => {
    it('should virtualize large property lists', () => {
      // ARRANGE - Large property collection
      const largePropertyList = Array.from({ length: 100 }, (_, i) => 
        createMockProperty({ 
          id: `prop-${i}`, 
          address: `${i} Test Street` 
        })
      )
      const largeProps = {
        ...defaultProps,
        properties: largePropertyList,
        buckets: { 
          love: largePropertyList.map(p => p.id), 
          maybe: [], 
          pass: [] 
        },
        activeBucket: 'love'
      }

      // ACT
      render(<BucketManager {...largeProps} />, { wrapper: getWrapper() })

      // ASSERT - Should only render visible properties
      const visibleCards = screen.getAllByTestId(/bucket-property-card-/)
      expect(visibleCards.length).toBeLessThan(20) // Should be virtualized
      expect(screen.getByTestId('bucket-virtual-list')).toBeInTheDocument()
    })

    it('should memoize bucket statistics calculations', () => {
      // ARRANGE
      const statisticsSpy = jest.fn()
      const TestWrapper = (props: any) => {
        statisticsSpy(props.buckets)
        return <BucketManager {...props} />
      }

      const { rerender } = render(
        <TestWrapper {...defaultProps} activeBucket="love" />, 
        { wrapper: getWrapper() }
      )

      // ACT - Rerender with same buckets
      rerender(<TestWrapper {...defaultProps} activeBucket="love" />)

      // ASSERT - Statistics should only be calculated once due to memoization
      expect(statisticsSpy).toHaveBeenCalledTimes(2) // Initial + rerender, but calculations memoized
    })
  })
})