-- SwipeLink Estate Database Schema - Final Fixed Version

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_links_code ON links(code);
CREATE INDEX IF NOT EXISTS idx_activities_link_id ON activities(link_id);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for properties
CREATE POLICY "Properties are publicly readable" ON properties FOR SELECT USING (true);
CREATE POLICY "Properties can be inserted by anyone" ON properties FOR INSERT WITH CHECK (true);
CREATE POLICY "Properties can be updated by anyone" ON properties FOR UPDATE USING (true);

-- Create policies for links
CREATE POLICY "Links are publicly readable" ON links FOR SELECT USING (true);
CREATE POLICY "Links can be inserted by anyone" ON links FOR INSERT WITH CHECK (true);

-- Create policies for activities
CREATE POLICY "Activities are publicly readable" ON activities FOR SELECT USING (true);
CREATE POLICY "Activities can be inserted by anyone" ON activities FOR INSERT WITH CHECK (true);

-- Create policies for sessions
CREATE POLICY "Sessions are publicly readable" ON sessions FOR SELECT USING (true);
CREATE POLICY "Sessions can be inserted by anyone" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Sessions can be updated by anyone" ON sessions FOR UPDATE USING (true);

-- Insert sample properties with proper JSON formatting
INSERT INTO properties (address, price, bedrooms, bathrooms, area_sqft, description, features, status) VALUES 
  ('123 Ocean Drive, Miami Beach, FL 33139', 850000, 2, 2.0, 1200, 'Stunning oceanfront condo with panoramic views', '["Ocean View", "Balcony", "Pool", "Gym"]'::jsonb, 'active'),
  ('456 Palm Avenue, South Beach, FL 33139', 1250000, 3, 2.5, 1800, 'Luxury penthouse in the heart of South Beach', '["Penthouse", "Rooftop Terrace", "City View", "Concierge"]'::jsonb, 'active'),
  ('789 Collins Street, Miami Beach, FL 33140', 650000, 1, 1.0, 900, 'Modern studio with high-end finishes', '["Modern", "High Ceilings", "Stainless Appliances"]'::jsonb, 'active'),
  ('321 Washington Ave, South Beach, FL 33139', 2100000, 4, 3.5, 2500, 'Spacious family home with private pool', '["Private Pool", "Garden", "Garage", "Family Room"]'::jsonb, 'active'),
  ('654 Lincoln Road, Miami Beach, FL 33139', 950000, 2, 2.0, 1400, 'Chic condo steps from Lincoln Road shopping', '["Shopping District", "Restaurants", "Nightlife"]'::jsonb, 'active')
ON CONFLICT DO NOTHING;