'use client'

import React from 'react'
import SwipeLinkClient from '../../../components/client/SwipeLinkClient'
import { Property } from '../../../components/client/types'

// Mock property data for demo
const mockProperties: Property[] = [
  {
    id: 'prop-1',
    address: '123 Sunset Boulevard, Beverly Hills, CA 90210',
    price: 2450000,
    bedrooms: 4,
    bathrooms: 3,
    area_sqft: 3200,
    property_type: 'house',
    images: [
      '/images/properties/sample-1.jpg',
      '/images/properties/sample-2.jpg',
      '/images/properties/sample-3.jpg'
    ],
    features: ['Swimming Pool', 'Gourmet Kitchen', 'Mountain Views', 'Hardwood Floors'],
    description: 'Stunning modern home with breathtaking mountain views and luxurious amenities. This beautifully designed property features an open-concept layout, chef\'s kitchen, and resort-style backyard.',
    year_built: 2019,
    lot_size: 8500,
    garage_spaces: 2,
    neighborhood: 'Beverly Hills',
    school_district: 'Beverly Hills Unified',
    latitude: 34.0736,
    longitude: -118.4004
  },
  {
    id: 'prop-2',
    address: '456 Ocean Drive, Malibu, CA 90265',
    price: 3875000,
    bedrooms: 5,
    bathrooms: 4,
    area_sqft: 4100,
    property_type: 'house',
    images: [
      '/images/properties/House 1/property-image-2281ef1a-85f7-4dd6-b7dc-b75d0b5a3cd3-1755444910.jpg',
      '/images/properties/House 1/property-image-7e7e34df-f007-4d33-b531-05e2ddfe3ed4-1755444911.jpg',
      '/images/properties/House 1/property-image-b1d25d8c-4f94-4a73-a418-4d4cfd5ab979-1755444911.jpg'
    ],
    features: ['Ocean View', 'Private Beach Access', 'Wine Cellar', 'Home Theater'],
    description: 'Spectacular oceanfront estate with direct beach access and panoramic Pacific views. This architectural masterpiece offers the ultimate California coastal living experience.',
    year_built: 2020,
    lot_size: 12000,
    garage_spaces: 3,
    neighborhood: 'Malibu',
    school_district: 'Santa Monica-Malibu USD',
    latitude: 34.0259,
    longitude: -118.7798
  },
  {
    id: 'prop-3',
    address: '789 Hollywood Hills Drive, Los Angeles, CA 90069',
    price: 1950000,
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 2800,
    property_type: 'house',
    images: [
      '/images/properties/House 2/Screenshot 2025-08-18 at 11.18.49 AM.png',
      '/images/properties/House 2/Screenshot 2025-08-18 at 11.18.59 AM.png',
      '/images/properties/House 2/Screenshot 2025-08-18 at 11.19.10 AM.png'
    ],
    features: ['City Views', 'Modern Kitchen', 'Large Deck', 'Smart Home Features'],
    description: 'Contemporary Hollywood Hills home with stunning city views and modern amenities. Perfect for entertaining with an open floor plan and spacious outdoor deck.',
    year_built: 2018,
    lot_size: 6200,
    garage_spaces: 2,
    neighborhood: 'Hollywood Hills',
    school_district: 'Los Angeles USD',
    latitude: 34.1341,
    longitude: -118.3215
  },
  {
    id: 'prop-4',
    address: '321 Venice Beach Way, Venice, CA 90291',
    price: 1675000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1800,
    property_type: 'condo',
    images: [
      '/images/properties/Apartment 1/0f30e2cbee415a4b38ebc3b0f380c05f.webp',
      '/images/properties/Apartment 1/1b8ed1647b39d2d109fecd9a6f51347f.webp',
      '/images/properties/Apartment 1/486f7485494934d78970542bf8c21411.webp'
    ],
    features: ['Beach Proximity', 'Rooftop Terrace', 'In-Unit Laundry', 'Concierge Service'],
    description: 'Luxury beachside condo just steps from Venice Beach. This modern unit features floor-to-ceiling windows and access to building amenities including rooftop terrace.',
    year_built: 2021,
    garage_spaces: 1,
    neighborhood: 'Venice',
    school_district: 'Los Angeles USD',
    latitude: 33.9850,
    longitude: -118.4695
  },
  {
    id: 'prop-5',
    address: '654 Santa Monica Boulevard, Santa Monica, CA 90401',
    price: 2200000,
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 2400,
    property_type: 'townhouse',
    images: [
      '/images/properties/Apartment 2/2ac8aed28b4f90e44a6692d10d4f87f6.webp',
      '/images/properties/Apartment 2/cc6ced18d0f1931ca493c80e8f58ab04.webp',
      '/images/properties/Apartment 2/db0ff6b479a0a729313108a635b81653.webp'
    ],
    features: ['Private Patio', 'Two-Car Garage', 'Walk to Beach', 'High Ceilings'],
    description: 'Elegant townhouse in the heart of Santa Monica with private outdoor space and modern finishes throughout. Walking distance to beach, shopping, and dining.',
    year_built: 2017,
    garage_spaces: 2,
    neighborhood: 'Santa Monica',
    school_district: 'Santa Monica-Malibu USD',
    latitude: 34.0195,
    longitude: -118.4912
  },
  {
    id: 'prop-6',
    address: '987 Rodeo Drive, Beverly Hills, CA 90210',
    price: 4250000,
    bedrooms: 6,
    bathrooms: 5,
    area_sqft: 5200,
    property_type: 'house',
    images: [
      '/images/properties/House 3/hd_zp_at_6808c7118481e-scaled.jpeg',
      '/images/properties/House 3/hd_zp_at_6808c7184f281-scaled.jpeg',
      '/images/properties/House 3/hd_zp_at_6808c71b60b57-scaled.jpeg'
    ],
    features: ['Tennis Court', 'Guest House', 'Formal Gardens', 'Wine Storage'],
    description: 'Magnificent estate on prestigious Rodeo Drive featuring traditional architecture with modern luxury. Includes separate guest house and beautifully landscaped grounds.',
    year_built: 2015,
    lot_size: 15000,
    garage_spaces: 4,
    neighborhood: 'Beverly Hills',
    school_district: 'Beverly Hills Unified',
    latitude: 34.0676,
    longitude: -118.4005
  },
  {
    id: 'prop-7',
    address: '147 Manhattan Beach Boulevard, Manhattan Beach, CA 90266',
    price: 3100000,
    bedrooms: 4,
    bathrooms: 3,
    area_sqft: 3600,
    property_type: 'house',
    images: [
      '/images/properties/Apartment 3/hd_zp_at_67fce865dc4d4-scaled.jpeg',
      '/images/properties/Apartment 3/hd_zp_at_67fce86f2d57c-scaled.jpeg',
      '/images/properties/Apartment 3/hd_zp_at_67fce88e9a123-scaled.jpeg'
    ],
    features: ['Ocean Views', 'Beach Access', 'Chef\'s Kitchen', 'Master Suite'],
    description: 'Beautiful beach house with panoramic ocean views and direct beach access. This coastal retreat features premium finishes and an ideal layout for beach living.',
    year_built: 2019,
    lot_size: 7800,
    garage_spaces: 2,
    neighborhood: 'Manhattan Beach',
    school_district: 'Manhattan Beach USD',
    latitude: 33.8847,
    longitude: -118.4109
  },
  {
    id: 'prop-8',
    address: '258 Melrose Avenue, West Hollywood, CA 90046',
    price: 1850000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1950,
    property_type: 'condo',
    images: [
      '/images/properties/Apartment 1/79766678faa8d1e4370aefc7c8cd8b32.webp',
      '/images/properties/Apartment 1/83e4294427ebd50d46c565544dee70c4.webp',
      '/images/properties/sample-1.jpg'
    ],
    features: ['City Views', 'Balcony', 'Fitness Center', 'Valet Parking'],
    description: 'Sophisticated condo in trendy West Hollywood with city views and luxury building amenities. Perfect urban living with easy access to nightlife and shopping.',
    year_built: 2020,
    garage_spaces: 1,
    neighborhood: 'West Hollywood',
    school_district: 'Los Angeles USD',
    latitude: 34.0840,
    longitude: -118.3840
  },
  {
    id: 'prop-9',
    address: '369 Pacific Coast Highway, Redondo Beach, CA 90277',
    price: 1425000,
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 2100,
    property_type: 'townhouse',
    images: [
      '/images/properties/Apartment 2/df007c9083b7168e7e8a093cd1516660.webp',
      '/images/properties/sample-2.jpg',
      '/images/properties/sample-3.jpg'
    ],
    features: ['Ocean Breeze', 'Private Garage', 'Patio', 'Close to Beach'],
    description: 'Charming coastal townhouse with ocean breezes and modern updates. Located minutes from the beach with easy access to recreational activities.',
    year_built: 2016,
    garage_spaces: 2,
    neighborhood: 'Redondo Beach',
    school_district: 'Redondo Beach USD',
    latitude: 33.8436,
    longitude: -118.3842
  },
  {
    id: 'prop-10',
    address: '741 Wilshire Boulevard, Beverly Hills, CA 90212',
    price: 2750000,
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 2900,
    property_type: 'condo',
    images: [
      '/images/properties/House 3/hd_zp_at_685bc663652e1.jpeg',
      '/images/properties/sample-1.jpg',
      '/images/properties/sample-2.jpg'
    ],
    features: ['Penthouse Views', 'Concierge', 'Gym Access', 'Rooftop Pool'],
    description: 'Luxurious penthouse condo with panoramic city views and premium building amenities. This sophisticated residence offers the finest in urban living.',
    year_built: 2021,
    garage_spaces: 2,
    neighborhood: 'Beverly Hills',
    school_district: 'Beverly Hills Unified',
    latitude: 34.0622,
    longitude: -118.3991
  },
  {
    id: 'prop-11',
    address: '852 Pacific Avenue, Hermosa Beach, CA 90254',
    price: 1650000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1650,
    property_type: 'condo',
    images: [
      '/images/properties/sample-1.jpg',
      '/images/properties/sample-2.jpg',
      '/images/properties/sample-3.jpg'
    ],
    features: ['Beachfront', 'Balcony', 'Updated Kitchen', 'Walk to Pier'],
    description: 'Beachfront condo with direct ocean access and stunning sunset views. This prime location offers the ultimate beach lifestyle with modern amenities.',
    year_built: 2018,
    garage_spaces: 1,
    neighborhood: 'Hermosa Beach',
    school_district: 'Hermosa Beach City SD',
    latitude: 33.8622,
    longitude: -118.3998
  },
  {
    id: 'prop-12',
    address: '963 Sunset Strip, West Hollywood, CA 90069',
    price: 3450000,
    bedrooms: 4,
    bathrooms: 4,
    area_sqft: 3800,
    property_type: 'house',
    images: [
      '/images/properties/sample-3.jpg',
      '/images/properties/sample-1.jpg',
      '/images/properties/sample-2.jpg'
    ],
    features: ['City Lights Views', 'Infinity Pool', 'Home Office', 'Entertainment Deck'],
    description: 'Modern architectural masterpiece on the famous Sunset Strip with spectacular city lights views. This contemporary home features cutting-edge design and luxury finishes.',
    year_built: 2022,
    lot_size: 9200,
    garage_spaces: 3,
    neighborhood: 'West Hollywood',
    school_district: 'Los Angeles USD',
    latitude: 34.0901,
    longitude: -118.3850
  }
]

export default function ClientDemoPage() {
  // Mock analytics event handler
  const handleAnalyticsEvent = (event: string, data?: any) => {
    console.log('Analytics Event:', event, data)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                SwipeLink Client Demo
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Interactive property browsing with bucket organization
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {mockProperties.length} properties loaded
            </div>
          </div>
        </div>
      </div>

      {/* Demo Instructions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            Demo Instructions
          </h2>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Browse properties using the carousel navigation</li>
            <li>• Click on property cards to view detailed information</li>
            <li>• Organize properties into buckets: Liked, Disliked, Considering, or Schedule Visit</li>
            <li>• Use the bottom navigation to switch between buckets</li>
            <li>• Test on mobile, tablet, and desktop for responsive design</li>
          </ul>
        </div>

        {/* SwipeLink Client Component */}
        <SwipeLinkClient
          linkCode="DEMO-CLIENT-2024"
          properties={mockProperties}
          onAnalyticsEvent={handleAnalyticsEvent}
          className="demo-swipelink-client"
        />
      </div>
    </div>
  )
}