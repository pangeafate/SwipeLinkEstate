import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://caddiaxjmtysnvnevcdr.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function createDatabaseSchema() {
  console.log('🚀 Creating database schema...')
  
  try {
    // Execute the complete schema
    const schemaSQL = `
      -- Create properties table
      CREATE TABLE IF NOT EXISTS properties (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        address TEXT NOT NULL,
        price DECIMAL(12,2),
        bedrooms INTEGER,
        bathrooms DECIMAL(3,1),
        area_sqft INTEGER,
        description TEXT,
        features JSONB DEFAULT '[]',
        cover_image TEXT,
        images JSONB DEFAULT '[]',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create links table
      CREATE TABLE IF NOT EXISTS links (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT,
        property_ids JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ
      );

      -- Create activities table
      CREATE TABLE IF NOT EXISTS activities (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        link_id UUID REFERENCES links(id),
        property_id UUID REFERENCES properties(id),
        action TEXT CHECK (action IN ('view', 'like', 'dislike', 'consider', 'detail')),
        session_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create sessions table
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        link_id UUID REFERENCES links(id),
        started_at TIMESTAMPTZ DEFAULT NOW(),
        last_active TIMESTAMPTZ DEFAULT NOW(),
        device_info JSONB
      );
    `
    
    console.log('📝 Executing schema creation...')
    const { data, error } = await supabase.rpc('exec_sql', { sql: schemaSQL })
    
    if (error) {
      console.error('❌ Schema creation failed:', error)
      throw error
    }
    
    console.log('✅ Schema creation successful')
    
    // Now create indexes
    console.log('📝 Creating indexes...')
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
      CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
      CREATE INDEX IF NOT EXISTS idx_links_code ON links(code);
      CREATE INDEX IF NOT EXISTS idx_activities_link_id ON activities(link_id);
    `
    
    const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSQL })
    
    if (indexError) {
      console.log('⚠️ Index creation may have failed (but schema should work):', indexError.message)
    } else {
      console.log('✅ Indexes created successfully')
    }
    
    // Insert sample data
    console.log('📝 Inserting sample properties...')
    const { data: insertData, error: insertError } = await supabase
      .from('properties')
      .insert([
        {
          address: '123 Ocean Drive, Miami Beach, FL 33139',
          price: 850000,
          bedrooms: 2,
          bathrooms: 2.0,
          area_sqft: 1200,
          description: 'Stunning oceanfront condo with panoramic views',
          features: ['Ocean View', 'Balcony', 'Pool', 'Gym'],
          status: 'active'
        },
        {
          address: '456 Palm Avenue, South Beach, FL 33139',
          price: 1250000,
          bedrooms: 3,
          bathrooms: 2.5,
          area_sqft: 1800,
          description: 'Luxury penthouse in the heart of South Beach',
          features: ['Penthouse', 'Rooftop Terrace', 'City View', 'Concierge'],
          status: 'active'
        },
        {
          address: '789 Collins Street, Miami Beach, FL 33140',
          price: 650000,
          bedrooms: 1,
          bathrooms: 1.0,
          area_sqft: 900,
          description: 'Modern studio with high-end finishes',
          features: ['Modern', 'High Ceilings', 'Stainless Appliances'],
          status: 'active'
        },
        {
          address: '321 Washington Ave, South Beach, FL 33139',
          price: 2100000,
          bedrooms: 4,
          bathrooms: 3.5,
          area_sqft: 2500,
          description: 'Spacious family home with private pool',
          features: ['Private Pool', 'Garden', 'Garage', 'Family Room'],
          status: 'active'
        },
        {
          address: '654 Lincoln Road, Miami Beach, FL 33139',
          price: 950000,
          bedrooms: 2,
          bathrooms: 2.0,
          area_sqft: 1400,
          description: 'Chic condo steps from Lincoln Road shopping',
          features: ['Shopping District', 'Restaurants', 'Nightlife'],
          status: 'active'
        }
      ])
      .select()
    
    if (insertError) {
      console.log('⚠️ Sample data insertion failed:', insertError.message)
      console.log('   (This might be due to RLS policies - continuing...)')
    } else {
      console.log(`✅ Inserted ${insertData.length} sample properties`)
    }
    
  } catch (error) {
    console.error('💥 Schema creation process failed:', error.message)
    throw error
  }
}

async function main() {
  try {
    await createDatabaseSchema()
    console.log('\n🎉 Database setup completed!')
    console.log('💡 Your database now has:')
    console.log('   • Properties table')
    console.log('   • Links table')
    console.log('   • Activities table')
    console.log('   • Sessions table')
    console.log('   • Sample properties (if RLS allows)')
    console.log('\n🔄 Check your dashboard: http://localhost:3000/dashboard')
  } catch (error) {
    console.error('\n💥 Database setup failed:', error.message)
    process.exit(1)
  }
}

main()