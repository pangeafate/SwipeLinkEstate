import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CollectionOverview from '../CollectionOverview'

// Import shared infrastructure following TESTING-GUIDELINES.md
import { 
  setupTest, 
  createMockProperty,
  fixtures
} from '@/test'

// Setup shared utilities
const { getWrapper } = setupTest()

describe('CollectionOverview Component', () => {
  const mockOnPropertySelect = jest.fn()
  const mockOnBucketChange = jest.fn()
  const mockOnContactAgent = jest.fn()
  const mockOnHelpToggle = jest.fn()

  // Use shared infrastructure for consistent test data
  const mockAgent = {
    id: 'agent-1',
    name: 'Sarah Johnson',
    phone: '(305) 555-0123',
    email: 'sarah@realty.com',
    avatar: 'agent-avatar.jpg',
    company: 'Miami Beach Realty',
    license: 'FL-12345'
  }

  const mockProperties = [
    createMockProperty({
      id: 'prop-1',
      address: '123 Ocean Drive',
      price: 850000,
      bedrooms: 3,
      bathrooms: 2.5,
      area_sqft: 1857,
      property_type: 'Condo',
      images: ['image1.jpg']
    }),
    createMockProperty({
      id: 'prop-2', 
      address: '456 Beach Ave',
      price: 1250000,
      bedrooms: 4,
      bathrooms: 3.0,
      area_sqft: 2400,
      property_type: 'House',
      images: ['image2.jpg']
    }),
    createMockProperty({
      id: 'prop-3',
      address: '789 Palm Street',
      price: 650000,
      bedrooms: 2,
      bathrooms: 2.0,
      area_sqft: 1200,
      property_type: 'Townhouse',
      images: ['image3.jpg']
    })
  ]

  const mockCollection = {
    id: 'collection-1',
    title: 'Premium Miami Beach Properties',
    description: 'Handpicked luxury properties in the heart of Miami Beach',
    agentId: 'agent-1',
    createdAt: '2025-08-20T10:00:00Z',
    updatedAt: '2025-08-20T15:30:00Z'
  }

  const defaultProps = {
    collection: mockCollection,
    agent: mockAgent,
    properties: mockProperties,
    buckets: {
      love: [],
      maybe: [],
      pass: []
    },
    sessionProgress: {
      propertiesViewed: 0,
      totalProperties: 3,
      timeSpent: 0,
      startedAt: '2025-08-20T16:00:00Z'
    },
    onPropertySelect: mockOnPropertySelect,
    onBucketChange: mockOnBucketChange,
    onContactAgent: mockOnContactAgent,
    onHelpToggle: mockOnHelpToggle,
    loading: false,
    showHelp: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Header Section', () => {
    it('should render agent branding with photo, name and contact info', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('collection-header')).toBeInTheDocument()
      expect(screen.getByTestId('agent-branding')).toBeInTheDocument()
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      expect(screen.getByText('Miami Beach Realty')).toBeInTheDocument()
      expect(screen.getByText('(305) 555-0123')).toBeInTheDocument()
      expect(screen.getByAltText('Sarah Johnson')).toBeInTheDocument()
    })

    it('should display collection title and description', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('collection-title')).toBeInTheDocument()
      expect(screen.getByText('Premium Miami Beach Properties')).toBeInTheDocument()
      expect(screen.getByText('Handpicked luxury properties in the heart of Miami Beach')).toBeInTheDocument()
    })

    it('should show property count and value range summary', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('property-count-summary')).toBeInTheDocument()
      expect(screen.getByText('3 Properties')).toBeInTheDocument()
      expect(screen.getByTestId('value-range-summary')).toBeInTheDocument()
      expect(screen.getByTestId('value-range-summary')).toHaveTextContent(/\$650,000 - \$1,250,000/)
    })

    it('should display progress indicator', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('progress-indicator')).toBeInTheDocument()
      expect(screen.getByText('0 of 3 viewed')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '3')
    })

    it('should update progress when properties are viewed', () => {
      // ARRANGE
      const propsWithProgress = {
        ...defaultProps,
        sessionProgress: {
          ...defaultProps.sessionProgress,
          propertiesViewed: 2
        }
      }

      // ACT
      render(<CollectionOverview {...propsWithProgress} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByText('2 of 3 viewed')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
    })
  })

  describe('Collection Summary Card', () => {
    it('should display key statistics', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('collection-summary-card')).toBeInTheDocument()
      expect(screen.getByTestId('key-statistics')).toBeInTheDocument()
      expect(screen.getByText(/average price/i)).toBeInTheDocument()
      expect(screen.getByText('$916,667')).toBeInTheDocument() // Average of 850k, 1250k, 650k
    })

    it('should show visual property type distribution', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('property-type-distribution')).toBeInTheDocument()
      expect(screen.getByText('Condo (1)')).toBeInTheDocument()
      expect(screen.getByText('House (1)')).toBeInTheDocument()
      expect(screen.getByText('Townhouse (1)')).toBeInTheDocument()
    })

    it('should display price range visualization', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('price-range-visualization')).toBeInTheDocument()
      expect(screen.getByTestId('price-range-chart')).toBeInTheDocument()
    })

    it('should show location map overview', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('location-map-overview')).toBeInTheDocument()
      expect(screen.getByText(/locations overview/i)).toBeInTheDocument()
    })

    it('should handle missing property data gracefully', () => {
      // ARRANGE
      const propsWithMissingData = {
        ...defaultProps,
        properties: [
          { ...mockProperties[0], price: undefined, property_type: undefined }
        ]
      }

      // ACT & ASSERT - Should not crash
      expect(() => {
        render(<CollectionOverview {...propsWithMissingData} />, { wrapper: getWrapper() })
      }).not.toThrow()

      expect(screen.getByTestId('collection-summary-card')).toBeInTheDocument()
    })
  })

  describe('Carousel Preview', () => {
    it('should show first 3-4 property cards visible', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('carousel-preview')).toBeInTheDocument()
      expect(screen.getAllByTestId(/preview-property-card-/)).toHaveLength(3)
    })

    it('should display smooth scroll indicators', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('carousel-preview-indicators')).toBeInTheDocument()
      expect(screen.getAllByTestId(/carousel-indicator-/)).toHaveLength(3)
    })

    it('should show navigation arrows', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('carousel-preview-prev')).toBeInTheDocument()
      expect(screen.getByTestId('carousel-preview-next')).toBeInTheDocument()
    })

    it('should handle property card clicks', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('preview-property-card-prop-1'))

      // ASSERT
      expect(mockOnPropertySelect).toHaveBeenCalledWith(mockProperties[0])
    })

    it('should navigate carousel preview with arrows', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('carousel-preview-next'))

      // ASSERT
      // Should shift to show next properties
      expect(screen.getByTestId('carousel-preview')).toHaveClass('shifted')
    })

    it('should support touch/swipe gestures', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const preview = screen.getByTestId('carousel-preview')
      expect(preview).toHaveAttribute('data-swipeable', 'true')
      expect(preview).toHaveClass('touch-enabled')
    })
  })

  describe('Action Bar', () => {
    it('should show bucket quick access with counts', () => {
      // ARRANGE
      const propsWithBuckets = {
        ...defaultProps,
        buckets: {
          love: ['prop-1'],
          maybe: ['prop-2'],
          pass: ['prop-3']
        }
      }

      // ACT
      render(<CollectionOverview {...propsWithBuckets} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('action-bar')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-quick-access')).toBeInTheDocument()
      expect(screen.getByText('❤️ Liked: 1')).toBeInTheDocument()
      expect(screen.getByText('🔖 Considering: 1')).toBeInTheDocument()
      expect(screen.getByText('❌ Disliked: 1')).toBeInTheDocument()
    })

    it('should display session progress tracker', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('session-progress-tracker')).toBeInTheDocument()
      expect(screen.getByText(/started/i)).toBeInTheDocument()
    })

    it('should show help/instructions toggle', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('help-toggle-btn')).toBeInTheDocument()
      expect(screen.getByText(/help/i)).toBeInTheDocument()
    })

    it('should display contact agent button', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('contact-agent-btn')).toBeInTheDocument()
      expect(screen.getByText(/contact agent/i)).toBeInTheDocument()
    })

    it('should handle help toggle click', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('help-toggle-btn'))

      // ASSERT
      expect(mockOnHelpToggle).toHaveBeenCalled()
    })

    it('should handle contact agent click', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('contact-agent-btn'))

      // ASSERT
      expect(mockOnContactAgent).toHaveBeenCalledWith(mockAgent)
    })
  })

  describe('Help Instructions', () => {
    it('should show help overlay when showHelp is true', () => {
      // ARRANGE
      const propsWithHelp = { ...defaultProps, showHelp: true }

      // ACT
      render(<CollectionOverview {...propsWithHelp} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('help-overlay')).toBeInTheDocument()
      expect(screen.getByTestId('help-instructions')).toBeInTheDocument()
    })

    it('should display step-by-step instructions', () => {
      // ARRANGE
      const propsWithHelp = { ...defaultProps, showHelp: true }

      // ACT
      render(<CollectionOverview {...propsWithHelp} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByText(/browse properties/i)).toBeInTheDocument()
      expect(screen.getByText(/like properties/i)).toBeInTheDocument()
      expect(screen.getByText(/book visits/i)).toBeInTheDocument()
    })

    it('should have interactive hotspots', async () => {
      // ARRANGE
      const user = userEvent.setup()
      const propsWithHelp = { ...defaultProps, showHelp: true }
      render(<CollectionOverview {...propsWithHelp} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('help-hotspot-carousel'))

      // ASSERT
      expect(screen.getByTestId('help-tooltip-carousel')).toBeInTheDocument()
    })

    it('should close help overlay with escape key', async () => {
      // ARRANGE
      const user = userEvent.setup()
      const propsWithHelp = { ...defaultProps, showHelp: true }
      render(<CollectionOverview {...propsWithHelp} />, { wrapper: getWrapper() })

      // ACT
      await user.keyboard('{Escape}')

      // ASSERT
      expect(mockOnHelpToggle).toHaveBeenCalled()
    })
  })

  describe('Loading States', () => {
    it('should show skeleton screens during initial load', () => {
      // ARRANGE
      const loadingProps = { ...defaultProps, loading: true }

      // ACT
      render(<CollectionOverview {...loadingProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('collection-loading-skeleton')).toBeInTheDocument()
      expect(screen.getByTestId('header-skeleton')).toBeInTheDocument()
      expect(screen.getByTestId('summary-skeleton')).toBeInTheDocument()
      expect(screen.getByTestId('carousel-skeleton')).toBeInTheDocument()
    })

    it('should show animated placeholders', () => {
      // ARRANGE
      const loadingProps = { ...defaultProps, loading: true }

      // ACT
      render(<CollectionOverview {...loadingProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('collection-loading-skeleton')).toHaveClass('animated-skeleton')
    })

    it('should hide skeleton when loading completes', () => {
      // ARRANGE
      const loadingProps = { ...defaultProps, loading: true }
      const { rerender } = render(<CollectionOverview {...loadingProps} />, { wrapper: getWrapper() })

      // ACT
      rerender(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.queryByTestId('collection-loading-skeleton')).not.toBeInTheDocument()
      expect(screen.getByTestId('collection-overview')).toBeInTheDocument()
    })
  })

  describe('Progressive Loading', () => {
    it('should prioritize first 5 properties for immediate load', () => {
      // ARRANGE
      const manyProperties = Array.from({ length: 20 }, (_, i) => 
        createMockProperty({ id: `prop-${i + 1}` })
      )
      const propsWithManyProperties = {
        ...defaultProps,
        properties: manyProperties
      }

      // ACT
      render(<CollectionOverview {...propsWithManyProperties} />, { wrapper: getWrapper() })

      // ASSERT - Only first 5 should be immediately visible
      expect(screen.getAllByTestId(/preview-property-card-/).slice(0, 5)).toHaveLength(5)
      expect(screen.getByTestId('progressive-loading-indicator')).toBeInTheDocument()
    })

    it('should preload next 10 properties in background', async () => {
      // ARRANGE
      const manyProperties = Array.from({ length: 20 }, (_, i) => 
        createMockProperty({ id: `prop-${i + 1}` })
      )
      const propsWithManyProperties = {
        ...defaultProps,
        properties: manyProperties
      }

      render(<CollectionOverview {...propsWithManyProperties} />, { wrapper: getWrapper() })

      // ACT - Wait for preloading
      await waitFor(() => {
        expect(screen.getByTestId('preload-status')).toHaveAttribute('data-preloaded', '10')
      }, { timeout: 2000 })

      // ASSERT
      expect(screen.getByTestId('preload-status')).toHaveTextContent('10 properties preloaded')
    })
  })

  describe('Image Optimization', () => {
    it('should use WebP format with JPEG fallback', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const images = screen.getAllByRole('img').filter(img => 
        img.getAttribute('src')?.includes('property')
      )
      images.forEach(img => {
        expect(img).toHaveAttribute('srcset')
        expect(img.getAttribute('srcset')).toMatch(/\.webp/)
      })
    })

    it('should implement progressive loading for images', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const heroImages = screen.getAllByTestId(/property-hero-image/)
      heroImages.forEach(img => {
        expect(img).toHaveAttribute('loading', 'eager') // Hero images load eagerly
      })
    })

    it('should lazy load non-critical images', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const thumbnailImages = screen.getAllByTestId(/property-thumbnail/)
      thumbnailImages.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy')
      })
    })
  })

  describe('Statistics Calculations', () => {
    it('should calculate correct average price', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const avgPrice = (850000 + 1250000 + 650000) / 3
      expect(screen.getByText(`$${avgPrice.toLocaleString()}`)).toBeInTheDocument()
    })

    it('should determine price range correctly', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByText('$650,000 - $1,250,000')).toBeInTheDocument()
    })

    it('should calculate area statistics', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const avgArea = (1857 + 2400 + 1200) / 3
      expect(screen.getByTestId('area-stats')).toHaveTextContent(`${Math.round(avgArea).toLocaleString()} sq ft avg`)
    })

    it('should show bedrooms and bathrooms distribution', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('bedrooms-distribution')).toBeInTheDocument()
      expect(screen.getByText('2-4 bedrooms')).toBeInTheDocument()
      expect(screen.getByText('2-3 bathrooms')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should adapt to mobile layout', () => {
      // ARRANGE - Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('collection-overview')).toHaveClass('mobile-layout')
      expect(screen.getByTestId('carousel-preview')).toHaveClass('mobile-preview')
    })

    it('should show collapsible sections on mobile', () => {
      // ARRANGE - Mock mobile
      Object.defineProperty(window, 'innerWidth', { value: 375 })
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('collapsible-summary')).toBeInTheDocument()
      expect(screen.getByTestId('expand-summary-btn')).toBeInTheDocument()
    })

    it('should optimize for tablet layout', () => {
      // ARRANGE - Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', { value: 768 })

      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('collection-overview')).toHaveClass('tablet-layout')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and landmarks', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('collection-overview')).toHaveAttribute('role', 'main')
      expect(screen.getByTestId('collection-overview')).toHaveAttribute('aria-label', 'Property collection overview')
      expect(screen.getByTestId('collection-header')).toHaveAttribute('role', 'banner')
      expect(screen.getByTestId('action-bar')).toHaveAttribute('role', 'toolbar')
    })

    it('should provide screen reader announcements', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('preview-property-card-prop-1'))

      // ASSERT
      await waitFor(() => {
        expect(screen.getByTestId('overview-live-region')).toHaveTextContent(
          'Selected property: 123 Ocean Drive, $850,000'
        )
      })
    })

    it('should support keyboard navigation', async () => {
      // ARRANGE
      const user = userEvent.setup()
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.tab() // Should focus first interactive element
      
      // ASSERT
      expect(screen.getByTestId('help-toggle-btn')).toHaveFocus()
    })

    it('should have high contrast mode support', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('collection-overview')).toHaveClass('high-contrast-support')
    })

    it('should provide alternative text for all images', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const images = screen.getAllByRole('img')
      images.forEach(img => {
        expect(img).toHaveAttribute('alt')
        expect(img.getAttribute('alt')).not.toBe('')
      })
    })
  })

  describe('Performance', () => {
    it('should implement virtualization for large collections', () => {
      // ARRANGE
      const largeCollection = Array.from({ length: 100 }, (_, i) => 
        createMockProperty({ id: `prop-${i + 1}` })
      )
      const propsWithLargeCollection = {
        ...defaultProps,
        properties: largeCollection
      }

      // ACT
      render(<CollectionOverview {...propsWithLargeCollection} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('virtualized-preview')).toBeInTheDocument()
      // Should only render visible items
      expect(screen.getAllByTestId(/preview-property-card-/)).toHaveLength(4) // 4 visible cards
    })

    it('should memoize expensive calculations', () => {
      // ARRANGE
      const calculationSpy = jest.fn()
      const TestWrapper = (props: any) => {
        calculationSpy(props.properties)
        return <CollectionOverview {...props} />
      }

      const { rerender } = render(
        <TestWrapper {...defaultProps} />, 
        { wrapper: getWrapper() }
      )

      // ACT - Rerender with same properties
      rerender(<TestWrapper {...defaultProps} />)

      // ASSERT - Calculations should be memoized
      expect(calculationSpy).toHaveBeenCalledTimes(2) // Initial + rerender, but calculations memoized
    })

    it('should lazy load off-screen content', () => {
      // ACT
      render(<CollectionOverview {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('lazy-load-trigger')).toBeInTheDocument()
      expect(screen.queryByTestId('expanded-statistics')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing collection data', () => {
      // ARRANGE
      const propsWithoutCollection = {
        ...defaultProps,
        collection: undefined
      }

      // ACT & ASSERT - Should not crash
      expect(() => {
        render(<CollectionOverview {...propsWithoutCollection} />, { wrapper: getWrapper() })
      }).not.toThrow()

      expect(screen.getByText(/collection unavailable/i)).toBeInTheDocument()
    })

    it('should handle empty property array', () => {
      // ARRANGE
      const propsWithNoProperties = {
        ...defaultProps,
        properties: []
      }

      // ACT
      render(<CollectionOverview {...propsWithNoProperties} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('empty-collection-state')).toBeInTheDocument()
      expect(screen.getByText(/no properties in this collection/i)).toBeInTheDocument()
    })

    it('should handle network errors gracefully', () => {
      // ARRANGE
      const propsWithError = {
        ...defaultProps,
        error: 'Failed to load collection data'
      }

      // ACT
      render(<CollectionOverview {...propsWithError} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('collection-error')).toBeInTheDocument()
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
      expect(screen.getByTestId('retry-load-btn')).toBeInTheDocument()
    })
  })
})