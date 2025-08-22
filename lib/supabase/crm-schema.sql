-- CRM Database Schema Extensions
-- Phase 1 Foundation: Core CRM Tables
-- Version: 1.0
-- Last Updated: 2025-08-21

-- Create custom types for CRM
CREATE TYPE deal_status AS ENUM ('active', 'qualified', 'nurturing', 'closed-won', 'closed-lost');
CREATE TYPE deal_stage AS ENUM ('created', 'shared', 'accessed', 'engaged', 'qualified', 'advanced', 'closed');
CREATE TYPE client_temperature AS ENUM ('hot', 'warm', 'cold');
CREATE TYPE task_type AS ENUM ('call', 'email', 'showing', 'follow-up', 'meeting', 'document');
CREATE TYPE task_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE task_status AS ENUM ('pending', 'completed', 'dismissed', 'overdue');

-- Extend existing links table with CRM fields
-- NOTE: This extends the existing links table rather than creating a separate deals table
ALTER TABLE links ADD COLUMN IF NOT EXISTS deal_status deal_status DEFAULT 'active';
ALTER TABLE links ADD COLUMN IF NOT EXISTS deal_stage deal_stage DEFAULT 'created';
ALTER TABLE links ADD COLUMN IF NOT EXISTS deal_value DECIMAL(12,2) DEFAULT 0;
ALTER TABLE links ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
ALTER TABLE links ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100);
ALTER TABLE links ADD COLUMN IF NOT EXISTS temperature client_temperature DEFAULT 'cold';
ALTER TABLE links ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ;
ALTER TABLE links ADD COLUMN IF NOT EXISTS agent_id UUID; -- Will reference users table when auth is implemented
ALTER TABLE links ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE links ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

-- Create clients table (Progressive Client Profiling)
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT DEFAULT 'link', -- 'link', 'referral', 'marketing', 'direct'
  engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  temperature client_temperature DEFAULT 'cold',
  preferences JSONB DEFAULT '{}',
  behavioral_data JSONB DEFAULT '{}',
  total_sessions INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in seconds
  first_interaction TIMESTAMPTZ DEFAULT NOW(),
  last_interaction TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table (Task Automation)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID REFERENCES links(id) ON DELETE CASCADE, -- Using links table as deals
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  agent_id UUID, -- Will reference users table when auth is implemented
  type task_type NOT NULL,
  priority task_priority DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_automated BOOLEAN DEFAULT false,
  automation_trigger TEXT, -- JSON string describing trigger conditions
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced activities table (already exists, but add CRM-specific fields)
ALTER TABLE activities ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS engagement_value INTEGER DEFAULT 0; -- Points contributed to engagement score
ALTER TABLE activities ADD COLUMN IF NOT EXISTS session_duration INTEGER DEFAULT 0; -- Duration of this activity in seconds

-- Create engagement_sessions table (Session Management)
CREATE TABLE IF NOT EXISTS engagement_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL, -- Links to existing sessions table
  deal_id UUID REFERENCES links(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  properties_viewed INTEGER DEFAULT 0,
  properties_liked INTEGER DEFAULT 0,
  properties_considered INTEGER DEFAULT 0,
  completion_rate DECIMAL(3,2) DEFAULT 0, -- 0.0 to 1.0
  engagement_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_links_deal_status ON links(deal_status);
CREATE INDEX IF NOT EXISTS idx_links_deal_stage ON links(deal_stage);
CREATE INDEX IF NOT EXISTS idx_links_temperature ON links(temperature);
CREATE INDEX IF NOT EXISTS idx_links_engagement_score ON links(engagement_score);
CREATE INDEX IF NOT EXISTS idx_links_last_activity ON links(last_activity);
CREATE INDEX IF NOT EXISTS idx_links_agent_id ON links(agent_id);
CREATE INDEX IF NOT EXISTS idx_links_client_id ON links(client_id);

CREATE INDEX IF NOT EXISTS idx_clients_temperature ON clients(temperature);
CREATE INDEX IF NOT EXISTS idx_clients_engagement_score ON clients(engagement_score);
CREATE INDEX IF NOT EXISTS idx_clients_last_interaction ON clients(last_interaction);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);

CREATE INDEX IF NOT EXISTS idx_tasks_deal_id ON tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_is_automated ON tasks(is_automated);

CREATE INDEX IF NOT EXISTS idx_activities_client_id ON activities(client_id);
CREATE INDEX IF NOT EXISTS idx_activities_engagement_value ON activities(engagement_value);

CREATE INDEX IF NOT EXISTS idx_engagement_sessions_deal_id ON engagement_sessions(deal_id);
CREATE INDEX IF NOT EXISTS idx_engagement_sessions_client_id ON engagement_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_engagement_sessions_session_id ON engagement_sessions(session_id);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON clients 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update client last_interaction when activity occurs
CREATE OR REPLACE FUNCTION update_client_last_interaction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.client_id IS NOT NULL THEN
        UPDATE clients 
        SET last_interaction = NOW(),
            updated_at = NOW()
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_interaction_on_activity 
  AFTER INSERT ON activities 
  FOR EACH ROW EXECUTE FUNCTION update_client_last_interaction();

-- Trigger to update deal last_activity when activity occurs
CREATE OR REPLACE FUNCTION update_deal_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE links 
    SET last_activity = NOW()
    WHERE id = NEW.link_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_deal_activity_on_activity 
  AFTER INSERT ON activities 
  FOR EACH ROW EXECUTE FUNCTION update_deal_last_activity();

-- Row Level Security (RLS) policies for new tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to clients (for client profile viewing)
CREATE POLICY "Clients are publicly readable" ON clients
  FOR SELECT USING (true);

-- Allow public insert/update for clients (for progressive profiling)
CREATE POLICY "Clients can be created" ON clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Clients can be updated" ON clients
  FOR UPDATE USING (true);

-- Tasks policies
CREATE POLICY "Tasks are publicly readable" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Tasks can be created" ON tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Tasks can be updated" ON tasks
  FOR UPDATE USING (true);

-- Engagement sessions policies
CREATE POLICY "Engagement sessions are publicly readable" ON engagement_sessions
  FOR SELECT USING (true);

CREATE POLICY "Engagement sessions can be created" ON engagement_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Engagement sessions can be updated" ON engagement_sessions
  FOR UPDATE USING (true);

-- Comments for documentation
COMMENT ON TABLE clients IS 'Client profiles with progressive enhancement from anonymous to full profiles';
COMMENT ON TABLE tasks IS 'CRM tasks including automated and manual tasks with priority and due dates';
COMMENT ON TABLE engagement_sessions IS 'Session-level engagement tracking with completion rates and scores';

COMMENT ON COLUMN links.deal_status IS 'Current business status of the deal';
COMMENT ON COLUMN links.deal_stage IS 'Current stage in the deal lifecycle (7-stage pipeline)';
COMMENT ON COLUMN links.engagement_score IS 'Calculated engagement score 0-100 based on client interactions';
COMMENT ON COLUMN links.temperature IS 'Client temperature: hot (80+), warm (50-79), cold (0-49)';
COMMENT ON COLUMN clients.behavioral_data IS 'JSON object storing client behavior patterns and preferences';
COMMENT ON COLUMN tasks.automation_trigger IS 'Conditions that triggered automated task creation';