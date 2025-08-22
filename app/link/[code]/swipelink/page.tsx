'use client'

import SwipeLinkCarousel from '@/components/client/SwipeLinkCarousel'
import { Property } from '@/components/client/SwipeLinkCarousel/types'

// Mock data for testing
const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Downtown Loft',
    address: '123 Main St, San Francisco, CA',
    price: 850000,
    priceFormatted: '$850,000',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800'
    ],
    description: 'Stunning modern loft in the heart of downtown with floor-to-ceiling windows and city views.',
    features: ['City View', 'Hardwood Floors', 'Stainless Steel Appliances', 'In-Unit Laundry'],
    propertyType: 'condo',
    listingDate: '2024-01-15'
  },
  {
    id: '2',
    title: 'Charming Victorian House',
    address: '456 Oak Ave, San Francisco, CA',
    price: 1250000,
    priceFormatted: '$1,250,000',
    bedrooms: 3,
    bathrooms: 2.5,
    sqft: 2100,
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'
    ],
    description: 'Beautifully restored Victorian home with original details and modern amenities.',
    features: ['Garden', 'Fireplace', 'High Ceilings', 'Garage'],
    propertyType: 'house',
    listingDate: '2024-01-10'
  },
  {
    id: '3',
    title: 'Luxury Penthouse Suite',
    address: '789 Market St, San Francisco, CA',
    price: 2500000,
    priceFormatted: '$2,500,000',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 3500,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'
    ],
    description: 'Exclusive penthouse with panoramic bay views and private rooftop terrace.',
    features: ['Bay View', 'Rooftop Terrace', 'Wine Cellar', 'Smart Home'],
    propertyType: 'condo',
    listingDate: '2024-01-20'
  },
  {
    id: '4',
    title: 'Cozy Studio Apartment',
    address: '321 Pine St, San Francisco, CA',
    price: 450000,
    priceFormatted: '$450,000',
    bedrooms: 0,
    bathrooms: 1,
    sqft: 500,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800'
    ],
    description: 'Efficient studio layout perfect for urban living with modern finishes.',
    features: ['Walk-in Closet', 'Updated Kitchen', 'Pet Friendly', 'Gym'],
    propertyType: 'apartment',
    listingDate: '2024-01-25'
  },
  {
    id: '5',
    title: 'Suburban Family Home',
    address: '654 Elm Dr, San Francisco, CA',
    price: 980000,
    priceFormatted: '$980,000',
    bedrooms: 4,
    bathrooms: 2.5,
    sqft: 2800,
    images: [
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
      'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800'
    ],
    description: 'Spacious family home with large backyard and excellent school district.',
    features: ['Pool', 'Two-car Garage', 'Home Office', 'Solar Panels'],
    propertyType: 'house',
    listingDate: '2024-01-18'
  },
  {
    id: '6',
    title: 'Waterfront Townhouse',
    address: '987 Marina Blvd, San Francisco, CA',
    price: 1750000,
    priceFormatted: '$1,750,000',
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2400,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
    ],
    description: 'Stunning waterfront townhouse with private dock and marina access.',
    features: ['Water View', 'Private Dock', 'Deck', 'Beach Access'],
    propertyType: 'townhouse',
    listingDate: '2024-01-22'
  }
]

interface PageProps {
  params: {
    code: string
  }
}

export default function SwipeLinkPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Collection Overview Header */}
      <div className="max-w-7xl mx-auto px-4 py-8" data-testid="collection-overview">
        <div className="mb-8" data-testid="agent-branding">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Curated Property Collection
          </h1>
          <p className="text-gray-600">
            Handpicked properties matching your preferences
          </p>
        </div>

        {/* Property Preview Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Browse Properties</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {mockProperties.slice(0, 4).map((property, index) => (
              <div
                key={property.id}
                className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                data-testid={`preview-property-card-${index}`}
              >
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => {
              // Scroll to carousel
              document.getElementById('property-carousel')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="bg-[#FF385C] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#E31C5F] transition-colors"
          >
            Start Browsing
          </button>
        </div>
      </div>

      {/* SwipeLink Carousel */}
      <div id="property-carousel" className="py-8">
        <SwipeLinkCarousel
          properties={mockProperties}
          linkCode={params.code}
        />
      </div>
    </div>
  )
}