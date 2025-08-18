// PropertyCard Component Tests
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PropertyCard from '../components/PropertyCard'
import { PropertyStatus, type Property } from '../types'

const mockProperty: Property = {
  id: 'test-property-1',
  address: '123 Ocean Drive, Miami Beach, FL 33139',
  description: 'Beautiful oceanfront property with stunning views',
  price: 1200000,
  bedrooms: 3,
  bathrooms: 2,
  area_sqft: 1800,
  status: 'active' as PropertyStatus,
  cover_image: '/test-image.jpg',
  images: ['/test-image.jpg'] as any, // Cast to Json type
  features: ['Ocean View', 'Balcony', 'Parking'] as any, // Cast to Json type
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

describe('PropertyCard', () => {
  it('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} />)

    // Check address (should be shortened)
    expect(screen.getByText('123 Ocean Drive, Miami Beach')).toBeInTheDocument()
    
    // Check price
    expect(screen.getByText('$1,200,000')).toBeInTheDocument()
    
    // Check bedroom/bathroom info
    expect(screen.getByText('3 beds, 2 baths')).toBeInTheDocument()
    
    // Check area
    expect(screen.getByText('1,800 sq ft')).toBeInTheDocument()
    
    // Check features
    expect(screen.getByText('Ocean View')).toBeInTheDocument()
    expect(screen.getByText('Balcony')).toBeInTheDocument()
    expect(screen.getByText('Parking')).toBeInTheDocument()
    
    // Check description
    expect(screen.getByText('Beautiful oceanfront property with stunning views')).toBeInTheDocument()
  })

  it('displays correct status indicator color', () => {
    render(<PropertyCard property={mockProperty} />)
    
    const statusIndicator = screen.getByTestId('status-indicator')
    expect(statusIndicator).toHaveClass('bg-green-500') // Active status
  })

  it('calls onClick when card is clicked', () => {
    const mockOnClick = jest.fn()
    render(<PropertyCard property={mockProperty} onClick={mockOnClick} />)
    
    const card = screen.getByTestId('property-card')
    fireEvent.click(card)
    
    expect(mockOnClick).toHaveBeenCalledWith(mockProperty)
  })

  it('shows "more" indicator when there are more than 3 features', () => {
    const propertyWithManyFeatures = {
      ...mockProperty,
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5']
    }
    
    render(<PropertyCard property={propertyWithManyFeatures} />)
    
    expect(screen.getByText('+2 more')).toBeInTheDocument()
  })

  it('handles missing optional properties gracefully', () => {
    const minimalProperty: Property = {
      id: 'minimal-1',
      address: '456 Test Street',
      price: null,
      bedrooms: null,
      bathrooms: null,
      area_sqft: null,
      description: null,
      features: null,
      cover_image: null,
      images: null,
      status: 'active' as PropertyStatus,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    }
    
    render(<PropertyCard property={minimalProperty} />)
    
    // Should still render address
    expect(screen.getByText('456 Test Street')).toBeInTheDocument()
    
    // Should handle missing price gracefully
    expect(screen.getByText('Price on request')).toBeInTheDocument()
  })

  it('displays different status colors correctly', () => {
    const pendingProperty = { ...mockProperty, status: 'pending' as PropertyStatus }
    const { rerender } = render(<PropertyCard property={pendingProperty} />)
    
    let statusIndicator = screen.getByTestId('status-indicator')
    expect(statusIndicator).toHaveClass('bg-yellow-500')
    
    const soldProperty = { ...mockProperty, status: 'sold' as PropertyStatus }
    rerender(<PropertyCard property={soldProperty} />)
    
    statusIndicator = screen.getByTestId('status-indicator')
    expect(statusIndicator).toHaveClass('bg-blue-500')
  })
})