/**
 * PropertyCard Performance Tests
 * Testing performance optimizations for image loading and JSON parsing
 */
import { render, screen, fireEvent } from '@testing-library/react'
import PropertyCard from '../PropertyCard'
import type { Property } from '@/lib/supabase/types'

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onError, onLoad, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        onError={onError}
        onLoad={onLoad}
        data-testid="property-image"
        {...props}
      />
    )
  }
})

describe('PropertyCard Performance', () => {
  const mockProperty: Property = {
    id: '1',
    address: '123 Test Street, Test City, FL 33139',
    price: 850000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1200,
    status: 'active',
    features: JSON.stringify(['Pool', 'Garage', 'Ocean View']),
    images: JSON.stringify(['/images/properties/invalid-1.jpg', '/images/properties/invalid-2.jpg']),
    cover_image: '/images/properties/invalid-cover.jpg',
    description: 'Beautiful property with stunning views',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }

  describe('Image Loading Performance', () => {
    it('should handle image loading errors gracefully without blocking render', () => {
      // ARRANGE & ACT
      render(<PropertyCard property={mockProperty} />)
      
      // ASSERT - Component should render immediately without waiting for images
      expect(screen.getByText('123 Test Street, Test City')).toBeInTheDocument()
      expect(screen.getByTestId('property-image')).toBeInTheDocument()
      
      // Simulate image error
      const image = screen.getByTestId('property-image')
      fireEvent.error(image)
      
      // Component should still be functional after image error
      expect(screen.getByText('123 Test Street, Test City')).toBeInTheDocument()
    })

    it('should use fallback image when primary images fail', () => {
      // ARRANGE
      const propertyWithNoImages = {
        ...mockProperty,
        cover_image: null,
        images: null
      }

      // ACT
      render(<PropertyCard property={propertyWithNoImages} />)
      
      // ASSERT - Should use fallback image
      const image = screen.getByTestId('property-image')
      expect(image).toHaveAttribute('src', '/images/properties/sample-1.jpg')
    })

    it('should prioritize cover_image over images array', () => {
      // ARRANGE
      const propertyWithCover = {
        ...mockProperty,
        cover_image: '/images/properties/cover.jpg',
        images: JSON.stringify(['/images/properties/image1.jpg'])
      }

      // ACT
      render(<PropertyCard property={propertyWithCover} />)
      
      // ASSERT
      const image = screen.getByTestId('property-image')
      expect(image).toHaveAttribute('src', '/images/properties/cover.jpg')
    })
  })

  describe('JSON Parsing Performance', () => {
    it('should not re-parse JSON on every render', () => {
      // ARRANGE
      const parseJsonSpy = jest.spyOn(JSON, 'parse')
      
      // ACT - Initial render
      const { rerender } = render(<PropertyCard property={mockProperty} />)
      const initialParseCount = parseJsonSpy.mock.calls.length
      
      // Force re-render with same props
      rerender(<PropertyCard property={mockProperty} />)
      const secondParseCount = parseJsonSpy.mock.calls.length
      
      // ASSERT - Should not re-parse JSON on re-render with same props
      expect(secondParseCount).toBe(initialParseCount)
      
      parseJsonSpy.mockRestore()
    })

    it('should handle malformed JSON gracefully', () => {
      // ARRANGE
      const propertyWithBadJson = {
        ...mockProperty,
        features: 'invalid-json{',
        images: 'also-invalid['
      }

      // ACT & ASSERT - Should not throw error
      expect(() => {
        render(<PropertyCard property={propertyWithBadJson} />)
      }).not.toThrow()
      
      // Should still render the component
      expect(screen.getByText('123 Test Street, Test City')).toBeInTheDocument()
    })

    it('should handle array-type features and images without parsing', () => {
      // ARRANGE
      const propertyWithArrays = {
        ...mockProperty,
        features: ['Pool', 'Garage'] as any,
        images: ['/image1.jpg', '/image2.jpg'] as any
      }

      // ACT
      render(<PropertyCard property={propertyWithArrays} />)
      
      // ASSERT
      expect(screen.getByText('Pool')).toBeInTheDocument()
      expect(screen.getByText('Garage')).toBeInTheDocument()
    })
  })

  describe('Render Performance', () => {
    it('should render quickly without expensive computations', () => {
      // ARRANGE
      const startTime = performance.now()
      
      // ACT
      render(<PropertyCard property={mockProperty} />)
      
      // ASSERT
      const renderTime = performance.now() - startTime
      expect(renderTime).toBeLessThan(50) // Should render in less than 50ms
    })

    it('should memoize expensive calculations', () => {
      // ARRANGE - Property with complex data
      const complexProperty = {
        ...mockProperty,
        features: JSON.stringify(Array(100).fill('Feature')),
        description: 'A'.repeat(1000) // Long description
      }

      // ACT
      const { rerender } = render(<PropertyCard property={complexProperty} />)
      
      // Re-render with same props should be fast
      const startTime = performance.now()
      rerender(<PropertyCard property={complexProperty} />)
      const rerenderTime = performance.now() - startTime
      
      // ASSERT
      expect(rerenderTime).toBeLessThan(10) // Re-render should be very fast
    })
  })
})