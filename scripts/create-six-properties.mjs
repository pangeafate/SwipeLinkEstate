import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://caddiaxjmtysnvnevcdr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE'

const supabase = createClient(supabaseUrl, supabaseKey)

// Property data based on the image folders
const properties = [
  {
    address: "1250 Ocean Drive, Miami Beach, FL 33139",
    price: 875000,
    bedrooms: 2,
    bathrooms: 2.0,
    area_sqft: 1250,
    description: "Luxury oceanfront apartment with stunning Atlantic Ocean views. This modern 2-bedroom, 2-bathroom condo features floor-to-ceiling windows, a spacious balcony, and premium finishes throughout. Located in the heart of South Beach with easy access to world-class dining and nightlife.",
    features: ["Ocean View", "Balcony", "Floor-to-Ceiling Windows", "Modern Kitchen", "Pool", "Gym", "Concierge", "Valet Parking"],
    cover_image: "/images/properties/Apartment 1/0f30e2cbee415a4b38ebc3b0f380c05f.webp",
    images: [
      "/images/properties/Apartment 1/0f30e2cbee415a4b38ebc3b0f380c05f.webp",
      "/images/properties/Apartment 1/1b8ed1647b39d2d109fecd9a6f51347f.webp",
      "/images/properties/Apartment 1/486f7485494934d78970542bf8c21411.webp",
      "/images/properties/Apartment 1/79766678faa8d1e4370aefc7c8cd8b32.webp",
      "/images/properties/Apartment 1/83e4294427ebd50d46c565544dee70c4.webp"
    ],
    status: "active"
  },
  {
    address: "456 Collins Avenue, South Beach, FL 33139",
    price: 1150000,
    bedrooms: 2,
    bathrooms: 2.5,
    area_sqft: 1400,
    description: "Sophisticated high-rise apartment in the prestigious Collins Avenue corridor. This elegant 2-bedroom, 2.5-bathroom residence offers contemporary living with panoramic city and partial ocean views. Features include a gourmet kitchen, marble bathrooms, and access to premium building amenities.",
    features: ["City View", "Partial Ocean View", "Gourmet Kitchen", "Marble Bathrooms", "High-Rise", "Rooftop Pool", "Spa", "Business Center"],
    cover_image: "/images/properties/Apartment 2/2ac8aed28b4f90e44a6692d10d4f87f6.webp",
    images: [
      "/images/properties/Apartment 2/2ac8aed28b4f90e44a6692d10d4f87f6.webp",
      "/images/properties/Apartment 2/cc6ced18d0f1931ca493c80e8f58ab04.webp",
      "/images/properties/Apartment 2/db0ff6b479a0a729313108a635b81653.webp",
      "/images/properties/Apartment 2/df007c9083b7168e7e8a093cd1516660.webp"
    ],
    status: "active"
  },
  {
    address: "789 Lincoln Road, Miami Beach, FL 33139",
    price: 695000,
    bedrooms: 1,
    bathrooms: 1.5,
    area_sqft: 980,
    description: "Chic boutique apartment in the heart of Lincoln Road's pedestrian mall. This stylish 1-bedroom, 1.5-bathroom unit features modern design elements, high ceilings, and an open floor plan. Perfect for those wanting to be steps away from world-class shopping, dining, and entertainment.",
    features: ["Lincoln Road Location", "High Ceilings", "Open Floor Plan", "Modern Design", "Shopping District", "Restaurants", "Walking Distance to Beach"],
    cover_image: "/images/properties/Apartment 3/hd_zp_at_67fce865dc4d4-scaled.jpeg",
    images: [
      "/images/properties/Apartment 3/hd_zp_at_67fce865dc4d4-scaled.jpeg",
      "/images/properties/Apartment 3/hd_zp_at_67fce86f2d57c-scaled.jpeg",
      "/images/properties/Apartment 3/hd_zp_at_67fce88e9a123-scaled.jpeg"
    ],
    status: "active"
  },
  {
    address: "321 Coral Way, Coral Gables, FL 33134",
    price: 1850000,
    bedrooms: 4,
    bathrooms: 3.5,
    area_sqft: 2800,
    description: "Magnificent Mediterranean-style house in prestigious Coral Gables. This stunning 4-bedroom, 3.5-bathroom home features classic architecture, lush landscaping, and spacious indoor-outdoor living. Includes a private pool, two-car garage, and beautifully appointed interiors with original hardwood floors.",
    features: ["Mediterranean Style", "Private Pool", "Two-Car Garage", "Hardwood Floors", "Lush Landscaping", "Coral Gables Location", "Family Room", "Formal Dining"],
    cover_image: "/images/properties/House 1/property-image-2281ef1a-85f7-4dd6-b7dc-b75d0b5a3cd3-1755444910.jpg",
    images: [
      "/images/properties/House 1/property-image-2281ef1a-85f7-4dd6-b7dc-b75d0b5a3cd3-1755444910.jpg",
      "/images/properties/House 1/property-image-7e7e34df-f007-4d33-b531-05e2ddfe3ed4-1755444911.jpg",
      "/images/properties/House 1/property-image-b1d25d8c-4f94-4a73-a418-4d4cfd5ab979-1755444911.jpg"
    ],
    status: "active"
  },
  {
    address: "654 Bay Harbor Drive, Bay Harbor Islands, FL 33154",
    price: 2250000,
    bedrooms: 5,
    bathrooms: 4.0,
    area_sqft: 3200,
    description: "Exceptional waterfront estate on prestigious Bay Harbor Islands. This luxurious 5-bedroom, 4-bathroom home offers breathtaking bay views, a private dock, and resort-style amenities. Features include a chef's kitchen, master suite with water views, and beautifully landscaped grounds perfect for entertaining.",
    features: ["Waterfront", "Private Dock", "Bay Views", "Chef's Kitchen", "Master Suite", "Resort-Style Amenities", "Landscaped Grounds", "Bay Harbor Islands"],
    cover_image: "/images/properties/House 2/Screenshot 2025-08-18 at 11.18.49 AM.png",
    images: [
      "/images/properties/House 2/Screenshot 2025-08-18 at 11.18.49 AM.png",
      "/images/properties/House 2/Screenshot 2025-08-18 at 11.18.59 AM.png",
      "/images/properties/House 2/Screenshot 2025-08-18 at 11.19.10 AM.png"
    ],
    status: "active"
  },
  {
    address: "987 Sunset Drive, Pinecrest, FL 33156",
    price: 1625000,
    bedrooms: 3,
    bathrooms: 2.5,
    area_sqft: 2400,
    description: "Contemporary family home in the sought-after Pinecrest community. This beautiful 3-bedroom, 2.5-bathroom residence combines modern luxury with comfortable family living. Features include an open-concept design, gourmet kitchen, spacious backyard with pool, and top-rated school district location.",
    features: ["Contemporary Design", "Open Concept", "Gourmet Kitchen", "Backyard Pool", "Top-Rated Schools", "Pinecrest Location", "Family Friendly", "Two-Car Garage"],
    cover_image: "/images/properties/House 3/hd_zp_at_6808c7118481e-scaled.jpeg",
    images: [
      "/images/properties/House 3/hd_zp_at_6808c7118481e-scaled.jpeg",
      "/images/properties/House 3/hd_zp_at_6808c7184f281-scaled.jpeg",
      "/images/properties/House 3/hd_zp_at_6808c71b60b57-scaled.jpeg",
      "/images/properties/House 3/hd_zp_at_685bc663652e1.jpeg"
    ],
    status: "active"
  }
]

async function createProperties() {
  console.log('Starting to create 6 properties...')
  
  try {
    // Clear existing properties first
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .gte('created_at', '1900-01-01')
    
    if (deleteError) {
      console.log('Note: Could not clear existing properties:', deleteError.message)
    } else {
      console.log('Cleared existing properties')
    }

    // Insert all properties
    const { data, error } = await supabase
      .from('properties')
      .insert(properties)
      .select()

    if (error) {
      console.error('Error creating properties:', error)
      return
    }

    console.log(`Successfully created ${data.length} properties:`)
    data.forEach((property, index) => {
      console.log(`${index + 1}. ${property.address} - $${property.price.toLocaleString()}`)
    })

  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

createProperties()