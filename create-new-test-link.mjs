#!/usr/bin/env node

/**
 * Create New Test Link Script
 * Create a new link with a different code that has 4 properties for testing
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://caddiaxjmtysnvnevcdr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createNewTestLink() {
  console.log('=== CREATING NEW TEST LINK ===\n')

  try {
    // 1. Get the 4 most recent properties (the ones we created)
    console.log('1. Getting 4 most recent properties...')
    const { data: recentProps, error: recentError } = await supabase
      .from('properties')
      .select('id, address, price, created_at')
      .order('created_at', { ascending: false })
      .limit(4)

    if (recentError) {
      console.error('❌ Error getting recent properties:', recentError)
      return
    }

    console.log(`✅ Found ${recentProps?.length || 0} recent properties:`)
    recentProps?.forEach((prop, index) => {
      console.log(`   ${index + 1}. ${prop.address} - $${prop.price?.toLocaleString()}`)
    })

    const propertyIds = recentProps?.map(p => p.id) || []

    // 2. Create new link with different code
    const newLinkCode = 'TEST4PR'
    console.log(`\n2. Creating new link with code: ${newLinkCode}...`)
    
    const { data: newLink, error: createError } = await supabase
      .from('links')
      .insert({
        code: newLinkCode,
        name: 'Miami Luxury Collection (4 Properties)',
        property_ids: JSON.stringify(propertyIds),
        expires_at: null
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating new link:', createError)
      return
    }

    console.log('✅ New link created:')
    console.log('   Code:', newLink.code)
    console.log('   Name:', newLink.name)
    console.log('   Property count:', JSON.parse(newLink.property_ids).length)

    // 3. Verify the new link works with LinkService simulation
    console.log('\n3. Testing LinkService simulation...')
    const linkPropertyIds = JSON.parse(newLink.property_ids)
    
    const { data: linkProps, error: linkPropsError } = await supabase
      .from('properties')
      .select('*')
      .in('id', linkPropertyIds)

    if (linkPropsError) {
      console.error('❌ Error testing link properties:', linkPropsError)
      return
    }

    // Simulate the ordering logic from LinkService
    const orderedProperties = linkPropertyIds
      .map(id => linkProps?.find(prop => prop.id === id))
      .filter(Boolean)

    console.log(`✅ LinkService simulation: ${orderedProperties?.length || 0} properties would be returned`)
    orderedProperties?.forEach((prop, index) => {
      console.log(`   ${index + 1}. ${prop.address} - $${prop.price?.toLocaleString()}`)
    })

    console.log('\n🎉 NEW TEST LINK CREATED SUCCESSFULLY!')
    console.log(`   Visit: http://localhost:3002/link/${newLinkCode}`)
    console.log(`   This link should show 4 properties`)
    console.log(`\n   For E2E tests, update the test link code from "km3yBlCT" to "${newLinkCode}"`)

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

createNewTestLink()