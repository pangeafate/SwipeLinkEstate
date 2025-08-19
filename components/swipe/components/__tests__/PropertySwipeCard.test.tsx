import React from 'react'
import { render, screen } from '@testing-library/react'
import PropertySwipeCard from '../PropertySwipeCard'
import type { PropertyCardData } from '../../types'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}))

// Mock next/image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />
  }
})

describe('PropertySwipeCard', () => {
  const mockProperty: PropertyCardData = {
    id: 'prop-123',
    address: '123 Ocean Drive, Miami Beach, FL',
    price: 850000,
    bedrooms: 3,
    bathrooms: 2.5,
    area_sqft: 1200,
    cover_image: '/images/property1.jpg',
    images: ['/images/property1.jpg', '/images/property2.jpg'],
    features: ['Pool', 'Ocean View', 'Garage'],
    property_type: 'condo'
  }

  it('should render property information correctly', () => {
    // ACT
    render(<PropertySwipeCard property={mockProperty} />)

    // ASSERT
    expect(screen.getByText('$850,000')).toBeInTheDocument()
    expect(screen.getByText('123 Ocean Drive, Miami Beach, FL')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument() // bedrooms
    expect(screen.getByText('2.5')).toBeInTheDocument() // bathrooms
    expect(screen.getByText('1,200 sq ft')).toBeInTheDocument()
  })

  it('should display cover image with proper alt text', () => {
    // ACT
    render(<PropertySwipeCard property={mockProperty} />)

    // ASSERT
    const image = screen.getByAltText('Property at 123 Ocean Drive, Miami Beach, FL')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/images/property1.jpg')
  })

  it('should show image count when multiple images available', () => {
    // ACT
    render(<PropertySwipeCard property={mockProperty} />)

    // ASSERT
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('should display features when available', () => {
    // ACT
    render(<PropertySwipeCard property={mockProperty} />)

    // ASSERT
    expect(screen.getByText('Pool')).toBeInTheDocument()
    expect(screen.getByText('Ocean View')).toBeInTheDocument()
    expect(screen.getByText('Garage')).toBeInTheDocument()
  })

  it('should handle property without features gracefully', () => {
    // ARRANGE
    const propertyWithoutFeatures: PropertyCardData = {
      ...mockProperty,
      features: undefined
    }

    // ACT & ASSERT - Should not throw
    expect(() => {
      render(<PropertySwipeCard property={propertyWithoutFeatures} />)
    }).not.toThrow()
  })

  it('should handle property without area gracefully', () => {
    // ARRANGE
    const propertyWithoutArea: PropertyCardData = {
      ...mockProperty,
      area_sqft: undefined
    }

    // ACT
    render(<PropertySwipeCard property={propertyWithoutArea} />)

    // ASSERT
    expect(screen.queryByText(/sq ft/)).not.toBeInTheDocument()
  })

  it('should format price with commas', () => {
    // ARRANGE
    const expensiveProperty: PropertyCardData = {
      ...mockProperty,
      price: 1250000
    }

    // ACT
    render(<PropertySwipeCard property={expensiveProperty} />)

    // ASSERT
    expect(screen.getByText('$1,250,000')).toBeInTheDocument()
  })

  it('should handle fractional bathrooms display', () => {
    // ARRANGE
    const propertyWithHalfBath: PropertyCardData = {
      ...mockProperty,
      bathrooms: 1.5
    }

    // ACT
    render(<PropertySwipeCard property={propertyWithHalfBath} />)

    // ASSERT
    expect(screen.getByText('1.5')).toBeInTheDocument()
  })

  it('should show placeholder when no cover image', () => {
    // ARRANGE
    const propertyWithoutImage: PropertyCardData = {
      ...mockProperty,
      cover_image: undefined,
      images: undefined
    }

    // ACT
    render(<PropertySwipeCard property={propertyWithoutImage} />)

    // ASSERT
    const placeholder = screen.getByText('No Image Available')
    expect(placeholder).toBeInTheDocument()
  })

  it('should apply correct CSS classes for styling', () => {
    // ACT
    const { container } = render(<PropertySwipeCard property={mockProperty} />)

    // ASSERT
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-lg')
  })
})