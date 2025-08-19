-- SwipeLink Estate Database Schema
-- Based on Development Guidelines
-- Prototype Implementation Plan Version

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE property_status AS ENUM ('active', 'pending', 'sold', 'off-market', 'draft');
CREATE TYPE activity_action AS ENUM ('view', 'like', 'dislike', 'consider', 'detail', 'swipe_right', 'swipe_left', 'swipe_down', 'swipe_up');
CREATE TYPE link_status AS ENUM ('active', 'expired', 'archived');
CREATE TYPE pipeline_stage AS ENUM ('new_lead', 'first_contact', 'qualified', 'property_tour', 'offer_made', 'under_contract', 'closed_won', 'closed_lost');

-- ======================================
-- CORE TABLES (Phase 1 - Prototype)
-- ======================================

-- Properties table (Module 2: Property Management)
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Basic Information
  address TEXT NOT NULL,
  price DECIMAL(12,2),
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  area_sqft INTEGER,
  
  -- Extended Information
  description TEXT,
  property_type TEXT, -- 'apartment', 'house', 'condo', 'townhouse'
  year_built INTEGER,
  lot_size DECIMAL(10,2),
  
  -- Features and Media
  features JSONB DEFAULT '[]', -- Array of feature strings
  amenities JSONB DEFAULT '[]', -- Array of amenity strings
  cover_image TEXT,
  images JSONB DEFAULT '[]', -- Array of image URLs
  virtual_tour_url TEXT,
  
  -- Status and Metadata
  status property_status DEFAULT 'active',
  mls_number TEXT,
  listing_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Agent/Team assignment (for future)
  agent_id UUID,
  portfolio_id UUID
);

-- Links table (Module 4: Link Management)
CREATE TABLE IF NOT EXISTS links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Core Link Data
  code TEXT UNIQUE NOT NULL, -- Unique shareable code
  name TEXT, -- Optional friendly name
  description TEXT, -- Optional description for agent reference
  
  -- Property Association
  property_ids JSONB NOT NULL, -- Array of property UUIDs
  
  -- CRM Enhancement (as per architecture doc)
  pipeline_stage pipeline_stage DEFAULT 'new_lead',
  deal_value DECIMAL(12,2),
  probability_score INTEGER CHECK (probability_score >= 0 AND probability_score <= 100),
  
  -- Contact Association (for future)
  contact_id UUID,
  contact_email TEXT,
  contact_phone TEXT,
  contact_name TEXT,
  
  -- Link Configuration
  expires_at TIMESTAMPTZ,
  max_views INTEGER,
  password_protected BOOLEAN DEFAULT false,
  password_hash TEXT,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Status
  status link_status DEFAULT 'active',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  
  -- Agent association
  agent_id UUID
);

-- Sessions table (Module 5: Client Interface)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, -- Session identifier (could be UUID or custom)
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  
  -- Session Information
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  -- Device and Location Info
  device_info JSONB, -- User agent, screen size, etc.
  ip_address INET,
  location JSONB, -- City, country from IP
  
  -- Session Behavior Metrics
  properties_viewed INTEGER DEFAULT 0,
  total_swipes INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  
  -- Buckets State (for session persistence)
  liked_properties JSONB DEFAULT '[]',
  disliked_properties JSONB DEFAULT '[]',
  considering_properties JSONB DEFAULT '[]'
);

-- Activities table (Analytics & Tracking)
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Associations
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
  
  -- Activity Data
  action activity_action NOT NULL,
  
  -- Additional Context
  metadata JSONB DEFAULT '{}', -- Store additional data like swipe direction, duration, etc.
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for analytics
  CONSTRAINT unique_session_property_action UNIQUE (session_id, property_id, action)
);

-- ======================================
-- FUTURE TABLES (Phase 2+)
-- ======================================

-- Portfolios table (Module 3: Portfolio Management)
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'personal', -- 'personal', 'team', 'template', 'smart'
  
  -- Smart Portfolio Rules
  auto_include_rules JSONB, -- Criteria for automatic property inclusion
  
  -- Sharing and Permissions
  is_shared BOOLEAN DEFAULT false,
  shared_with JSONB DEFAULT '[]', -- Array of agent IDs
  
  -- Status
  is_archived BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Owner
  agent_id UUID
);

-- Portfolio Properties junction table
CREATE TABLE IF NOT EXISTS portfolio_properties (
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (portfolio_id, property_id)
);

-- Contacts table (Module 7: Contact Management)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Basic Information
  email TEXT UNIQUE,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  
  -- Progressive Enrichment
  enrichment_level TEXT DEFAULT 'ghost', -- 'ghost', 'basic', 'enriched', 'full', 'complete'
  
  -- Preferences (learned from behavior)
  preferences JSONB DEFAULT '{}',
  
  -- Tags and Segmentation
  tags JSONB DEFAULT '[]',
  segment TEXT,
  
  -- Source Tracking
  source TEXT, -- 'link_click', 'manual', 'import', etc.
  source_details JSONB,
  
  -- GDPR
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ,
  
  -- Agent association
  agent_id UUID
);

-- Link Contacts junction table (many-to-many)
CREATE TABLE IF NOT EXISTS link_contacts (
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (link_id, contact_id)
);

-- ======================================
-- INDEXES FOR PERFORMANCE
-- ======================================

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON properties(agent_id);

-- Links indexes
CREATE INDEX IF NOT EXISTS idx_links_code ON links(code);
CREATE INDEX IF NOT EXISTS idx_links_status ON links(status);
CREATE INDEX IF NOT EXISTS idx_links_pipeline_stage ON links(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON links(created_at);
CREATE INDEX IF NOT EXISTS idx_links_agent_id ON links(agent_id);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_link_id ON activities(link_id);
CREATE INDEX IF NOT EXISTS idx_activities_property_id ON activities(property_id);
CREATE INDEX IF NOT EXISTS idx_activities_session_id ON activities(session_id);
CREATE INDEX IF NOT EXISTS idx_activities_action ON activities(action);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_link_id ON sessions(link_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_active ON sessions(last_active);

-- ======================================
-- TRIGGERS AND FUNCTIONS
-- ======================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_properties_updated_at 
  BEFORE UPDATE ON properties 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_links_updated_at 
  BEFORE UPDATE ON links 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update session last_active when activity is created
CREATE OR REPLACE FUNCTION update_session_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sessions 
    SET last_active = NOW(),
        properties_viewed = properties_viewed + 1,
        total_swipes = total_swipes + 1
    WHERE id = NEW.session_id;
    
    -- Update link last_accessed_at
    UPDATE links 
    SET last_accessed_at = NOW()
    WHERE id = NEW.link_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_session_activity 
  AFTER INSERT ON activities 
  FOR EACH ROW EXECUTE FUNCTION update_session_last_active();

-- ======================================
-- ROW LEVEL SECURITY (RLS)
-- ======================================

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Public read access for properties (clients can view)
CREATE POLICY "Properties are publicly readable" ON properties
  FOR SELECT USING (true);

-- Public read access for links (clients can access via code)
CREATE POLICY "Links are publicly readable" ON links
  FOR SELECT USING (true);

-- Public insert for activities (track client actions)
CREATE POLICY "Activities can be inserted by anyone" ON activities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Activities are publicly readable" ON activities
  FOR SELECT USING (true);

-- Public access for sessions (client sessions)
CREATE POLICY "Sessions are publicly accessible" ON sessions
  FOR ALL USING (true);

-- ======================================
-- SAMPLE DATA FOR DEVELOPMENT
-- ======================================

-- Insert sample properties (Miami Beach properties as per plan)
INSERT INTO properties (
  address, price, bedrooms, bathrooms, area_sqft, 
  description, property_type, features, status, cover_image
) VALUES 
(
  '123 Ocean Drive, Miami Beach, FL 33139',
  850000, 2, 2.0, 1200,
  'Stunning oceanfront condo with panoramic views of the Atlantic Ocean. Recently renovated with high-end finishes.',
  'condo',
  '["Ocean View", "Balcony", "Pool", "Gym", "Parking", "24/7 Security"]',
  'active',
  '/images/properties/ocean-drive-1.jpg'
),
(
  '456 Collins Avenue, South Beach, FL 33139',
  1250000, 3, 2.5, 1800,
  'Luxury penthouse in the heart of South Beach. Walking distance to restaurants and nightlife.',
  'condo',
  '["Penthouse", "Rooftop Terrace", "City View", "Concierge", "Valet Parking", "Smart Home"]',
  'active',
  '/images/properties/collins-ave-1.jpg'
),
(
  '789 Lincoln Road, Miami Beach, FL 33139',
  650000, 1, 1.0, 900,
  'Modern studio apartment with high-end finishes and great location near Lincoln Road Mall.',
  'apartment',
  '["Modern Kitchen", "High Ceilings", "Walk-in Closet", "Pet Friendly"]',
  'active',
  '/images/properties/lincoln-road-1.jpg'
),
(
  '321 Alton Road, Miami Beach, FL 33140',
  2100000, 4, 3.5, 2500,
  'Spacious family home with private pool and tropical garden. Perfect for entertaining.',
  'house',
  '["Private Pool", "Garden", "2-Car Garage", "Guest Suite", "Home Office", "Wine Cellar"]',
  'active',
  '/images/properties/alton-road-1.jpg'
),
(
  '654 West Avenue, Miami Beach, FL 33139',
  950000, 2, 2.0, 1400,
  'Waterfront property with boat dock and sunset views over Biscayne Bay.',
  'condo',
  '["Waterfront", "Boat Dock", "Sunset Views", "Marina Access", "Fitness Center"]',
  'active',
  '/images/properties/west-ave-1.jpg'
),
(
  '987 Pine Tree Drive, Miami Beach, FL 33140',
  3500000, 5, 4.5, 4200,
  'Exclusive estate on prestigious Pine Tree Drive. Gated property with luxury amenities.',
  'house',
  '["Gated Entry", "Tennis Court", "Pool House", "6-Car Garage", "Smart Home", "Security System"]',
  'active',
  '/images/properties/pine-tree-1.jpg'
)
ON CONFLICT DO NOTHING;

-- Insert sample link
INSERT INTO links (code, name, property_ids, pipeline_stage, deal_value) 
VALUES (
  'DEMO2024',
  'Luxury Miami Beach Collection',
  '["' || (SELECT id FROM properties LIMIT 1) || '", "' || 
   (SELECT id FROM properties OFFSET 1 LIMIT 1) || '", "' || 
   (SELECT id FROM properties OFFSET 2 LIMIT 1) || '"]',
  'new_lead',
  2500000
) ON CONFLICT (code) DO NOTHING;

-- ======================================
-- VIEWS FOR EASIER QUERYING
-- ======================================

-- Property analytics view
CREATE OR REPLACE VIEW property_analytics AS
SELECT 
  p.id,
  p.address,
  p.price,
  COUNT(DISTINCT a.session_id) as unique_views,
  COUNT(CASE WHEN a.action = 'like' THEN 1 END) as likes,
  COUNT(CASE WHEN a.action = 'dislike' THEN 1 END) as dislikes,
  COUNT(CASE WHEN a.action = 'consider' THEN 1 END) as considerations,
  AVG(CASE WHEN a.action = 'detail' THEN 1 ELSE 0 END) as detail_view_rate
FROM properties p
LEFT JOIN activities a ON p.id = a.property_id
GROUP BY p.id, p.address, p.price;

-- Link performance view
CREATE OR REPLACE VIEW link_performance AS
SELECT 
  l.id,
  l.code,
  l.name,
  l.pipeline_stage,
  l.deal_value,
  COUNT(DISTINCT s.id) as total_sessions,
  COUNT(DISTINCT a.property_id) as properties_viewed,
  AVG(s.time_spent_seconds) as avg_session_duration,
  l.created_at,
  l.last_accessed_at
FROM links l
LEFT JOIN sessions s ON l.id = s.link_id
LEFT JOIN activities a ON l.id = a.link_id
GROUP BY l.id;

-- Grant permissions for views
GRANT SELECT ON property_analytics TO anon, authenticated;
GRANT SELECT ON link_performance TO anon, authenticated;