import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://caddiaxjmtysnvnevcdr.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function createAndPopulateDatabase() {
  console.log('🚀 Setting up database with sample properties...')
  
  try {
    // Since we can't create tables via API, let's just try to insert sample data
    // The tables should already exist or be created via SQL Editor
    
    console.log('📝 Testing if tables exist and inserting sample properties...')
    const sampleProperties = [
      {
        address: '123 Ocean Drive, Miami Beach, FL 33139',
        price: 850000,
        bedrooms: 2,
        bathrooms: 2.0,
        area_sqft: 1200,
        description: 'Stunning oceanfront condo with panoramic views of the Atlantic Ocean. Perfect for those seeking luxury beachfront living.',
        features: ['Ocean View', 'Balcony', 'Pool', 'Gym', 'Concierge'],
        status: 'active'
      },
      {
        address: '456 Palm Avenue, South Beach, FL 33139',
        price: 1250000,
        bedrooms: 3,
        bathrooms: 2.5,
        area_sqft: 1800,
        description: 'Luxury penthouse in the heart of South Beach with rooftop terrace and stunning city views.',
        features: ['Penthouse', 'Rooftop Terrace', 'City View', 'Concierge', 'Valet Parking'],
        status: 'active'
      },
      {
        address: '789 Collins Street, Miami Beach, FL 33140',
        price: 650000,
        bedrooms: 1,
        bathrooms: 1.0,
        area_sqft: 900,
        description: 'Modern studio with high-end finishes and floor-to-ceiling windows in prime location.',
        features: ['Modern', 'High Ceilings', 'Stainless Appliances', 'Walk to Beach'],
        status: 'active'
      },
      {
        address: '321 Washington Ave, South Beach, FL 33139',
        price: 2100000,
        bedrooms: 4,
        bathrooms: 3.5,
        area_sqft: 2500,
        description: 'Spacious family home with private pool and lush tropical garden. Perfect for entertaining.',
        features: ['Private Pool', 'Garden', 'Garage', 'Family Room', 'Chef Kitchen'],
        status: 'active'
      },
      {
        address: '654 Lincoln Road, Miami Beach, FL 33139',
        price: 950000,
        bedrooms: 2,
        bathrooms: 2.0,
        area_sqft: 1400,
        description: 'Chic condo steps from Lincoln Road shopping and world-class dining and nightlife.',
        features: ['Shopping District', 'Restaurants', 'Nightlife', 'Walk Score 100'],
        status: 'active'
      }
    ]
    
    const { data: insertedProperties, error: insertError } = await supabase
      .from('properties')
      .insert(sampleProperties)
      .select()
    
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message)
      
      if (insertError.message.includes('table') && insertError.message.includes('does not exist')) {
        console.log('\n🔧 The database tables need to be created first.')
        console.log('📋 Please run this SQL in Supabase SQL Editor:')
        console.log('\n' + getSchemaSQL())
        return false
      } else {
        throw insertError
      }
    } else {
      console.log(`✅ Successfully inserted ${insertedProperties.length} sample properties!`)
      console.log('📍 Properties added:')
      insertedProperties.forEach(prop => {
        console.log(`   • ${prop.address} - $${prop.price.toLocaleString()}`)
      })
    }
    
    return true
  } catch (error) {
    console.error('💥 Database setup failed:', error.message)
    return false
  }
}

function getSchemaSQL() {
  return `
-- SwipeLink Estate Database Schema
-- Copy and paste this entire block into Supabase SQL Editor

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_links_code ON links(code);
CREATE INDEX IF NOT EXISTS idx_activities_link_id ON activities(link_id);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to properties (for client viewing)
CREATE POLICY "Properties are publicly readable" ON properties
  FOR SELECT USING (true);

-- Allow public insert/update for properties (for agent operations)
CREATE POLICY "Properties can be inserted by anyone" ON properties
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Properties can be updated by anyone" ON properties
  FOR UPDATE USING (true);

-- Allow public read access to links (for client access)
CREATE POLICY "Links are publicly readable" ON links
  FOR SELECT USING (true);

-- Allow public insert/update for links (for agent operations)
CREATE POLICY "Links can be inserted by anyone" ON links
  FOR INSERT WITH CHECK (true);

-- Allow public read/write access to activities (for tracking)
CREATE POLICY "Activities are publicly readable" ON activities
  FOR SELECT USING (true);

CREATE POLICY "Activities can be inserted by anyone" ON activities
  FOR INSERT WITH CHECK (true);

-- Allow public read/write access to sessions (for tracking)
CREATE POLICY "Sessions are publicly readable" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Sessions can be inserted by anyone" ON sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Sessions can be updated by anyone" ON sessions
  FOR UPDATE USING (true);
`
}

async function main() {
  const success = await createAndPopulateDatabase()
  
  if (success) {
    console.log('\n🎉 Database setup completed!')
    console.log('🔄 Refresh your dashboard: http://localhost:3000/dashboard')
    console.log('💡 You should now see 5 sample properties!')
  } else {
    console.log('\n⚠️ Database setup incomplete.')
    console.log('Please create the database schema first using the SQL above.')
  }
}

main()