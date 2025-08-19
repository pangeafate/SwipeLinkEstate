const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://caddiaxjmtysnvnevcdr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // Test basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('links')
      .select('count')
      .limit(1)
    
    if (healthError) {
      console.error('Connection failed:', healthError.message)
      return
    }
    
    console.log('✅ Connection successful!')
    
    // Check for existing links
    const { data: links, error: linksError } = await supabase
      .from('links')
      .select('*')
      .limit(5)
    
    if (linksError) {
      console.error('Error fetching links:', linksError.message)
      return
    }
    
    console.log(`Found ${links?.length || 0} links in database:`)
    links?.forEach(link => {
      console.log(`- Code: ${link.code}, Name: ${link.name || 'Unnamed'}`)
    })
    
    // Check for properties
    const { data: properties, error: propsError } = await supabase
      .from('properties')
      .select('*')
      .limit(3)
    
    if (propsError) {
      console.error('Error fetching properties:', propsError.message)
      return
    }
    
    console.log(`Found ${properties?.length || 0} properties in database`)
    
    if (links && links.length > 0) {
      // Test getting a specific link
      const testLink = links[0]
      console.log(`\nTesting link retrieval for code: ${testLink.code}`)
      
      const { data: linkData, error: linkError } = await supabase
        .from('links')
        .select('*')
        .eq('code', testLink.code)
        .single()
      
      if (linkError) {
        console.error('Error getting link:', linkError.message)
      } else {
        console.log('✅ Link retrieval successful')
        console.log('Test this link at: http://localhost:3000/link/' + testLink.code)
      }
    } else {
      console.log('\n⚠️  No links found. You may need to create some test data.')
      console.log('You can create a link through the agent dashboard at: http://localhost:3000/dashboard')
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message)
  }
}

testConnection()