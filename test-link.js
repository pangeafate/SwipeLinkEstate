const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://caddiaxjmtysnvnevcdr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSpecificLink() {
  const linkCode = 'awNmi9jF'
  
  console.log(`Testing link: ${linkCode}`)
  console.log('==========================================')
  
  try {
    // Step 1: Get the link
    console.log('1. Fetching link data...')
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('*')
      .eq('code', linkCode)
      .single()
    
    if (linkError) {
      console.error('❌ Link fetch failed:', linkError.message)
      return
    }
    
    console.log('✅ Link found:', {
      id: link.id,
      code: link.code,
      name: link.name,
      property_ids: link.property_ids
    })
    
    // Step 2: Get the properties for this link
    console.log('\n2. Fetching associated properties...')
    
    let propertyIds
    try {
      propertyIds = JSON.parse(link.property_ids)
      console.log('Property IDs:', propertyIds)
    } catch (parseError) {
      console.error('❌ Failed to parse property_ids:', parseError.message)
      return
    }
    
    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      console.log('⚠️  No properties associated with this link')
      return
    }
    
    const { data: properties, error: propsError } = await supabase
      .from('properties')
      .select('*')
      .in('id', propertyIds)
    
    if (propsError) {
      console.error('❌ Properties fetch failed:', propsError.message)
      return
    }
    
    console.log(`✅ Found ${properties?.length || 0} properties:`)
    properties?.forEach((prop, index) => {
      console.log(`   ${index + 1}. ${prop.address} - $${prop.price}`)
    })
    
    // Step 3: Test the LinkService logic
    console.log('\n3. Simulating LinkService.getLink()...')
    
    const linkWithProperties = {
      ...link,
      properties: properties || []
    }
    
    console.log('✅ LinkService would return:', {
      id: linkWithProperties.id,
      code: linkWithProperties.code,
      name: linkWithProperties.name,
      propertiesCount: linkWithProperties.properties.length
    })
    
    // Step 4: Check if SwipeService can initialize
    console.log('\n4. Testing SwipeService initialization...')
    
    // Simulate what SwipeService.initializeSession would do
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36)
    console.log('✅ Session ID generated:', sessionId)
    
    console.log('\n📋 SUMMARY:')
    console.log('==========================================')
    console.log(`✅ Link exists: ${linkCode}`)
    console.log(`✅ Properties found: ${properties?.length || 0}`)
    console.log(`✅ Data structure valid: ${linkWithProperties.properties.length > 0 ? 'Yes' : 'No'}`)
    console.log('\n🌐 Test URL: http://localhost:3000/link/' + linkCode)
    console.log('\n🎯 Expected behavior:')
    if (properties && properties.length > 0) {
      console.log('- Should show SwipeInterface with property cards')
      console.log('- Should allow swiping through properties')
      console.log('- Should track swipe actions in localStorage')
    } else {
      console.log('- Should show "No properties available" message')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testSpecificLink()