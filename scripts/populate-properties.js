const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://caddiaxjmtysnvnevcdr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE'

const supabase = createClient(supabaseUrl, supabaseKey)

const properties = [
  {
    address: '123 Ocean Drive, Miami Beach, FL 33139',
    price: 850000,
    bedrooms: 2,
    bathrooms: 2.0,
    area_sqft: 1200,
    description: 'Stunning modern apartment with breathtaking ocean views and premium finishes. Located in the heart of Miami Beach with direct beach access.',
    features: JSON.stringify(['Ocean View', 'Balcony', 'Pool', 'Gym', 'Concierge', 'Parking']),
    cover_image: '/images/properties/Apartment 1/0f30e2cbee415a4b38ebc3b0f380c05f.webp',
    images: JSON.stringify([
      '/images/properties/Apartment 1/0f30e2cbee415a4b38ebc3b0f380c05f.webp',
      '/images/properties/Apartment 1/1b8ed1647b39d2d109fecd9a6f51347f.webp',
      '/images/properties/Apartment 1/486f7485494934d78970542bf8c21411.webp',
      '/images/properties/Apartment 1/79766678faa8d1e4370aefc7c8cd8b32.webp',
      '/images/properties/Apartment 1/83e4294427ebd50d46c565544dee70c4.webp'
    ]),
    status: 'active'
  },
  {
    address: '456 Palm Avenue, South Beach, FL 33139',
    price: 1250000,
    bedrooms: 3,
    bathrooms: 2.5,
    area_sqft: 1800,
    description: 'Luxury penthouse in the heart of South Beach with stunning city skyline views and premium amenities.',
    features: JSON.stringify(['Penthouse', 'Rooftop Terrace', 'City View', 'Concierge', 'Wine Cellar', 'Private Elevator']),
    cover_image: '/images/properties/Apartment 2/2ac8aed28b4f90e44a6692d10d4f87f6.webp',
    images: JSON.stringify([
      '/images/properties/Apartment 2/2ac8aed28b4f90e44a6692d10d4f87f6.webp',
      '/images/properties/Apartment 2/cc6ced18d0f1931ca493c80e8f58ab04.webp',
      '/images/properties/Apartment 2/db0ff6b479a0a729313108a635b81653.webp',
      '/images/properties/Apartment 2/df007c9083b7168e7e8a093cd1516660.webp'
    ]),
    status: 'active'
  },
  {
    address: '789 Collins Street, Miami Beach, FL 33140',
    price: 650000,
    bedrooms: 1,
    bathrooms: 1.0,
    area_sqft: 900,
    description: 'Modern studio apartment with high-end finishes and contemporary design in a prime Miami Beach location.',
    features: JSON.stringify(['Modern', 'High Ceilings', 'Stainless Appliances', 'Walk-in Closet', 'Balcony']),
    cover_image: '/images/properties/Apartment 3/hd_zp_at_67fce865dc4d4-scaled.jpeg',
    images: JSON.stringify([
      '/images/properties/Apartment 3/hd_zp_at_67fce865dc4d4-scaled.jpeg',
      '/images/properties/Apartment 3/hd_zp_at_67fce86f2d57c-scaled.jpeg',
      '/images/properties/Apartment 3/hd_zp_at_67fce88e9a123-scaled.jpeg'
    ]),
    status: 'active'
  },
  {
    address: '321 Washington Ave, South Beach, FL 33139',
    price: 2100000,
    bedrooms: 4,
    bathrooms: 3.5,
    area_sqft: 2500,
    description: 'Spacious family home with private pool and garden in an exclusive South Beach neighborhood.',
    features: JSON.stringify(['Private Pool', 'Garden', 'Garage', 'Family Room', 'Home Office', 'Chef Kitchen']),
    cover_image: '/images/properties/House 1/property-image-2281ef1a-85f7-4dd6-b7dc-b75d0b5a3cd3-1755444910.jpg',
    images: JSON.stringify([
      '/images/properties/House 1/property-image-2281ef1a-85f7-4dd6-b7dc-b75d0b5a3cd3-1755444910.jpg',
      '/images/properties/House 1/property-image-7e7e34df-f007-4d33-b531-05e2ddfe3ed4-1755444911.jpg',
      '/images/properties/House 1/property-image-b1d25d8c-4f94-4a73-a418-4d4cfd5ab979-1755444911.jpg'
    ]),
    status: 'active'
  },
  {
    address: '654 Lincoln Road, Miami Beach, FL 33139',
    price: 950000,
    bedrooms: 2,
    bathrooms: 2.0,
    area_sqft: 1400,
    description: 'Chic contemporary home steps from Lincoln Road shopping district with modern amenities and stylish design.',
    features: JSON.stringify(['Shopping District', 'Restaurants', 'Nightlife', 'Modern Design', 'Outdoor Space']),
    cover_image: '/images/properties/House 2/Screenshot 2025-08-18 at 11.18.49 AM.png',
    images: JSON.stringify([
      '/images/properties/House 2/Screenshot 2025-08-18 at 11.18.49 AM.png',
      '/images/properties/House 2/Screenshot 2025-08-18 at 11.18.59 AM.png',
      '/images/properties/House 2/Screenshot 2025-08-18 at 11.19.10 AM.png'
    ]),
    status: 'active'
  },
  {
    address: '987 Bay Road, Miami Beach, FL 33141',
    price: 1850000,
    bedrooms: 3,
    bathrooms: 3.0,
    area_sqft: 2200,
    description: 'Elegant waterfront home with panoramic bay views, private dock, and luxurious outdoor entertaining spaces.',
    features: JSON.stringify(['Waterfront', 'Private Dock', 'Bay Views', 'Outdoor Kitchen', 'Pool', 'Spa']),
    cover_image: '/images/properties/House 3/hd_zp_at_6808c7118481e-scaled.jpeg',
    images: JSON.stringify([
      '/images/properties/House 3/hd_zp_at_6808c7118481e-scaled.jpeg',
      '/images/properties/House 3/hd_zp_at_6808c7184f281-scaled.jpeg',
      '/images/properties/House 3/hd_zp_at_6808c71b60b57-scaled.jpeg',
      '/images/properties/House 3/hd_zp_at_685bc663652e1.jpeg'
    ]),
    status: 'active'
  }
]

async function populateProperties() {
  try {
    console.log('🗑️  Clearing existing properties...')
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (deleteError) {
      console.error('Error deleting existing properties:', deleteError)
      return
    }

    console.log('📦 Inserting new properties...')
    const { data, error } = await supabase
      .from('properties')
      .insert(properties)
      .select()

    if (error) {
      console.error('Error inserting properties:', error)
      return
    }

    console.log(`✅ Successfully inserted ${data.length} properties:`)
    data.forEach((property, index) => {
      console.log(`   ${index + 1}. ${property.address} - $${property.price?.toLocaleString()}`)
    })

  } catch (error) {
    console.error('Script error:', error)
  }
}

populateProperties()