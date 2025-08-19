import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://caddiaxjmtysnvnevcdr.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test basic connection
    console.log('1. Testing basic connection...')
    const { data, error } = await supabase
      .from('properties')
      .select('count')
    
    console.log('   Result:', { data, error: error?.message })
    
    // Test table structure
    console.log('2. Testing table structure...')
    const { data: tableData, error: tableError } = await supabase
      .from('properties')
      .select('*')
      .limit(1)
    
    console.log('   Result:', { data: tableData, error: tableError?.message })
    
    // Test insert with anon key
    console.log('3. Testing insert with anon key...')
    const { data: insertData, error: insertError } = await supabase
      .from('properties')
      .insert({
        address: 'Test Property',
        price: 500000,
        bedrooms: 2,
        bathrooms: 2,
        area_sqft: 1200,
        status: 'active'
      })
      .select()
    
    console.log('   Insert result:', { data: insertData, error: insertError?.message })
    
    if (insertData && insertData.length > 0) {
      console.log('✅ Insert worked! Cleaning up...')
      await supabase.from('properties').delete().eq('id', insertData[0].id)
    }
    
  } catch (error) {
    console.error('💥 Connection test failed:', error.message)
  }
}

testConnection()