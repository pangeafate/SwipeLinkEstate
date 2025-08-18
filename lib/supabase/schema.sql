-- Create custom types
CREATE TYPE property_status AS ENUM ('active', 'pending', 'sold', 'off-market');
CREATE TYPE activity_action AS ENUM ('view', 'like', 'dislike', 'consider', 'detail');

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  address TEXT NOT NULL,
  price DECIMAL(12,2),
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  area_sqft INTEGER,
  description TEXT,
  features JSONB DEFAULT '[]',
  cover_image TEXT,
  images JSONB DEFAULT '[]',
  status property_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT,
  property_ids JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  device_info JSONB
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  action activity_action NOT NULL,
  session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);

CREATE INDEX IF NOT EXISTS idx_links_code ON links(code);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at);

CREATE INDEX IF NOT EXISTS idx_activities_link_id ON activities(link_id);
CREATE INDEX IF NOT EXISTS idx_activities_property_id ON activities(property_id);
CREATE INDEX IF NOT EXISTS idx_activities_session_id ON activities(session_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

CREATE INDEX IF NOT EXISTS idx_sessions_link_id ON sessions(link_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_active ON sessions(last_active);

-- Create trigger for updated_at on properties
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at 
  BEFORE UPDATE ON properties 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for last_active on sessions
CREATE OR REPLACE FUNCTION update_session_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sessions 
    SET last_active = NOW() 
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_session_activity 
  AFTER INSERT ON activities 
  FOR EACH ROW EXECUTE FUNCTION update_session_last_active();

-- Insert sample data
INSERT INTO properties (address, price, bedrooms, bathrooms, area_sqft, description, features, status) VALUES 
  ('123 Ocean Drive, Miami Beach, FL 33139', 850000, 2, 2.0, 1200, 'Stunning oceanfront condo with panoramic views', '["Ocean View", "Balcony", "Pool", "Gym"]', 'active'),
  ('456 Palm Avenue, South Beach, FL 33139', 1250000, 3, 2.5, 1800, 'Luxury penthouse in the heart of South Beach', '["Penthouse", "Rooftop Terrace", "City View", "Concierge"]', 'active'),
  ('789 Collins Street, Miami Beach, FL 33140', 650000, 1, 1.0, 900, 'Modern studio with high-end finishes', '["Modern", "High Ceilings", "Stainless Appliances"]', 'active'),
  ('321 Washington Ave, South Beach, FL 33139', 2100000, 4, 3.5, 2500, 'Spacious family home with private pool', '["Private Pool", "Garden", "Garage", "Family Room"]', 'active'),
  ('654 Lincoln Road, Miami Beach, FL 33139', 950000, 2, 2.0, 1400, 'Chic condo steps from Lincoln Road shopping', '["Shopping District", "Restaurants", "Nightlife"]', 'active')
ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) policies
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to properties (for client viewing)
CREATE POLICY "Properties are publicly readable" ON properties
  FOR SELECT USING (true);

-- Allow public read access to links (for client access)
CREATE POLICY "Links are publicly readable" ON links
  FOR SELECT USING (true);

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