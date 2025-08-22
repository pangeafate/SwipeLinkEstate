#!/usr/bin/env node

/**
 * Create Test Link Script
 * Creates sample properties and a test link for demo purposes
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://caddiaxjmtysnvnevcdr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE'

const supabase = createClient(supabaseUrl, supabaseKey)

const sampleProperties = [
  {
    address: '123 Ocean Boulevard, Miami Beach, FL 33139',
    price: 850000,
    bedrooms: 3,
    bathrooms: 2.5,
    area_sqft: 2200,
    property_type: 'condo',
    images: ['/images/properties/sample-1.jpg'],
    features: ['ocean_view', 'parking', 'pool', 'gym'],
    description: 'Stunning oceanfront condo with panoramic views and modern amenities. This luxurious 3-bedroom, 2.5-bathroom condo features floor-to-ceiling windows, a gourmet kitchen, and access to world-class building amenities.',
    status: 'active'
  },
  {
    address: '456 Palm Avenue, Coral Gables, FL 33134', 
    price: 1250000,
    bedrooms: 4,
    bathrooms: 3,
    area_sqft: 3500,
    property_type: 'house',
    images: ['/images/properties/sample-2.jpg'],
    features: ['garden', 'garage', 'pool', 'smart_home'],
    description: 'Elegant single-family home in prestigious Coral Gables neighborhood. This 4-bedroom, 3-bathroom home features a beautiful garden, two-car garage, and smart home technology throughout.',
    status: 'active'
  },
  {
    address: '789 Sunset Drive, Key Biscayne, FL 33149',
    price: 650000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1800,
    property_type: 'apartment',
    images: ['/images/properties/sample-3.jpg'],
    features: ['balcony', 'parking', 'pet_friendly', 'water_view'],
    description: 'Modern apartment with resort-style amenities in Key Biscayne. This 2-bedroom, 2-bathroom apartment features a large balcony with water views and is located in a pet-friendly building.',
    status: 'active'
  },
  {
    address: '321 Brickell Avenue, Miami, FL 33131',
    price: 750000,
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1600,
    property_type: 'condo',
    images: ['/images/properties/sample-1.jpg'],
    features: ['city_view', 'parking', 'gym', 'concierge'],
    description: 'Luxury high-rise condo in the heart of Brickell financial district. This 2-bedroom, 2-bathroom condo offers stunning city views and access to premium building amenities including gym and concierge services.',
    status: 'active'
  }
]

async function createTestData() {
  console.log('Creating test properties and link...')

  try {
    // First, check if link already exists
    const { data: existingLink } = await supabase
      .from('links')
      .select('*')
      .eq('code', 'km3yBlCT')
      .single()

    if (existingLink) {
      console.log('✓ Link km3yBlCT already exists')
      return
    }

    // Create properties
    console.log('Creating properties...')
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .insert(sampleProperties)
      .select()

    if (propError) {
      console.error('Error creating properties:', propError)
      return
    }

    console.log(`✓ Created ${properties.length} properties`)

    // Create link
    const propertyIds = properties.map(p => p.id)
    const { data: link, error: linkError } = await supabase
      .from('links')
      .insert({
        code: 'km3yBlCT',
        name: 'Miami Luxury Collection',
        property_ids: propertyIds,
        expires_at: null // No expiration
      })
      .select()
      .single()

    if (linkError) {
      console.error('Error creating link:', linkError)
      return
    }

    console.log(`✓ Created link: ${link.code}`)
    console.log(`✓ Link URL: http://localhost:3002/link/${link.code}`)
    console.log('✅ Test data created successfully!')

  } catch (error) {
    console.error('Failed to create test data:', error)
  }
}

createTestData()