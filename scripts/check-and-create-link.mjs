#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://caddiaxjmtysnvnevcdr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAndCreateLink() {
  const linkCode = '4vBAFDsV'
  
  console.log(`🔍 Checking for link with code: ${linkCode}`)
  
  try {
    // Check if link exists
    const { data: existingLink, error: fetchError } = await supabase
      .from('links')
      .select('*')
      .eq('code', linkCode)
      .single()
    
    if (existingLink && !fetchError) {
      console.log('✅ Link already exists:', existingLink)
      return existingLink
    }
    
    console.log('📝 Link not found, creating new link...')
    
    // Get some properties to add to the link
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id')
      .limit(6)
    
    if (propError) {
      console.error('❌ Error fetching properties:', propError)
      return
    }
    
    if (!properties || properties.length === 0) {
      console.error('❌ No properties found in database')
      return
    }
    
    console.log(`📦 Found ${properties.length} properties to add to link`)
    
    // Create the link
    const propertyIds = properties.map(p => p.id)
    const newLink = {
      code: linkCode,
      name: 'Luxury Miami Beach Collection',
      property_ids: propertyIds,
      created_at: new Date().toISOString(),
      expires_at: null // No expiration
    }
    
    const { data: createdLink, error: createError } = await supabase
      .from('links')
      .insert([newLink])
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Error creating link:', createError)
      return
    }
    
    console.log('✅ Link created successfully!')
    console.log('📋 Link details:', createdLink)
    console.log(`\n🔗 Access the link at: http://localhost:3000/link/${linkCode}`)
    
    return createdLink
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the function
checkAndCreateLink()
  .then(() => {
    console.log('\n✨ Script completed successfully')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })