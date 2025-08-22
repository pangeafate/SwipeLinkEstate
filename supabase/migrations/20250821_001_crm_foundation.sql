-- SwipeLink Estate CRM Foundation Migration
-- Migration: 20250821_001_crm_foundation
-- Description: Implements core CRM schema extensions following the CRM Master Specification
-- Author: Database Administrator
-- Created: 2025-08-21
-- Rollback: 20250821_001_crm_foundation_rollback.sql

-- =============================================================================
-- PHASE 1: CREATE CUSTOM TYPES
-- =============================================================================

-- Deal lifecycle status enum
DO $$ BEGIN
    CREATE TYPE deal_status AS ENUM (
        'active',       -- Link created and ready for sharing
        'qualified',    -- Client has accessed link and shown engagement (score >50)  
        'nurturing',    -- Ongoing follow-up and relationship building
        'closed-won',   -- Successful property transaction completed
        'closed-lost'   -- Deal ended without transaction
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Deal pipeline stage enum (7-stage pipeline)
DO $$ BEGIN
    CREATE TYPE deal_stage AS ENUM (
        'created',      -- Agent creates property link
        'shared',       -- Link sent to client  
        'accessed',     -- Client opens link
        'engaged',      -- Client swipes through properties
        'qualified',    -- High engagement detected (score >50)
        'advanced',     -- Property showing scheduled/completed
        'closed'        -- Deal completed (Won/Lost)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Client temperature classification
DO $$ BEGIN
    CREATE TYPE client_temperature AS ENUM (
        'hot',          -- 80-100 engagement score - immediate follow-up priority
        'warm',         -- 50-79 engagement score - scheduled follow-up within 48h
        'cold'          -- 0-49 engagement score - nurture campaign, weekly check-ins
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Task management types
DO $$ BEGIN
    CREATE TYPE task_type AS ENUM (
        'call',         -- Phone call task
        'email',        -- Email follow-up task
        'showing',      -- Property showing task
        'follow-up',    -- General follow-up task
        'meeting',      -- Meeting task
        'document'      -- Document preparation task
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('high', 'medium', 'low');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM (
        'pending',      -- Task not yet started
        'completed',    -- Task finished successfully
        'dismissed',    -- Task dismissed by agent
        'overdue'       -- Task past due date
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Client data source enum
DO $$ BEGIN
    CREATE TYPE client_source AS ENUM (
        'link',         -- Client from property link interaction
        'referral',     -- Referred by existing client
        'marketing',    -- From marketing campaign
        'direct'        -- Direct contact/walk-in
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- PHASE 2: EXTEND LINKS TABLE FOR CRM
-- =============================================================================

-- Add CRM fields to existing links table (Link-as-Deal architecture)
ALTER TABLE links ADD COLUMN IF NOT EXISTS deal_status deal_status DEFAULT 'active';
ALTER TABLE links ADD COLUMN IF NOT EXISTS deal_stage deal_stage DEFAULT 'created';
ALTER TABLE links ADD COLUMN IF NOT EXISTS deal_value DECIMAL(12,2) DEFAULT 0;
ALTER TABLE links ADD COLUMN IF NOT EXISTS client_id UUID;
ALTER TABLE links ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0 
    CHECK (engagement_score >= 0 AND engagement_score <= 100);
ALTER TABLE links ADD COLUMN IF NOT EXISTS temperature client_temperature DEFAULT 'cold';
ALTER TABLE links ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ;
ALTER TABLE links ADD COLUMN IF NOT EXISTS agent_id UUID; 
ALTER TABLE links ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE links ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE links ADD COLUMN IF NOT EXISTS client_preferences JSONB DEFAULT '{}';
ALTER TABLE links ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMPTZ;
ALTER TABLE links ADD COLUMN IF NOT EXISTS deal_probability DECIMAL(3,2) DEFAULT 0.10 
    CHECK (deal_probability >= 0 AND deal_probability <= 1);

-- =============================================================================
-- PHASE 3: CREATE CLIENTS TABLE (PROGRESSIVE PROFILING)
-- =============================================================================

CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic identification
    name TEXT,
    email TEXT,
    phone TEXT,
    
    -- Client lifecycle tracking
    source client_source DEFAULT 'link',
    engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
    temperature client_temperature DEFAULT 'cold',
    
    -- Progressive profiling data
    preferences JSONB DEFAULT '{}',
    behavioral_data JSONB DEFAULT '{}',
    property_interests JSONB DEFAULT '[]',
    budget_range JSONB DEFAULT '{}',
    location_preferences JSONB DEFAULT '[]',
    
    -- Engagement metrics
    total_sessions INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0, -- in seconds
    total_properties_viewed INTEGER DEFAULT 0,
    total_properties_liked INTEGER DEFAULT 0,
    total_links_accessed INTEGER DEFAULT 0,
    
    -- Interaction tracking
    first_interaction TIMESTAMPTZ DEFAULT NOW(),
    last_interaction TIMESTAMPTZ DEFAULT NOW(),
    
    -- Agent relationship
    primary_agent_id UUID,
    assigned_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- Status flags
    is_active BOOLEAN DEFAULT true,
    do_not_contact BOOLEAN DEFAULT false,
    marketing_opt_in BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PHASE 4: CREATE TASKS TABLE (TASK AUTOMATION)
-- =============================================================================

CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    deal_id UUID REFERENCES links(id) ON DELETE CASCADE,
    client_id UUID,
    agent_id UUID,
    
    -- Task definition
    type task_type NOT NULL,
    priority task_priority DEFAULT 'medium',
    title TEXT NOT NULL,
    description TEXT,
    
    -- Task status and scheduling
    status task_status DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Automation tracking
    is_automated BOOLEAN DEFAULT false,
    automation_trigger TEXT, -- JSON describing trigger conditions
    automation_rule_id UUID,
    
    -- Task metadata
    metadata JSONB DEFAULT '{}',
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER,    -- in minutes
    
    -- Follow-up chain
    parent_task_id UUID REFERENCES tasks(id),
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PHASE 5: ENHANCE ACTIVITIES TABLE
-- =============================================================================

-- Add CRM-specific fields to existing activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS client_id UUID;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS engagement_value INTEGER DEFAULT 0;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS session_duration INTEGER DEFAULT 0;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS device_info JSONB DEFAULT '{}';
ALTER TABLE activities ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS referrer_url TEXT;

-- =============================================================================
-- PHASE 6: CREATE ENGAGEMENT SESSIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS engagement_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Session identification
    session_id TEXT UNIQUE NOT NULL,
    
    -- Relationships
    deal_id UUID REFERENCES links(id) ON DELETE CASCADE,
    client_id UUID,
    
    -- Session timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER DEFAULT 0,
    
    -- Engagement metrics
    properties_viewed INTEGER DEFAULT 0,
    properties_liked INTEGER DEFAULT 0,
    properties_disliked INTEGER DEFAULT 0,
    properties_considered INTEGER DEFAULT 0,
    detail_views INTEGER DEFAULT 0,
    completion_rate DECIMAL(3,2) DEFAULT 0 CHECK (completion_rate >= 0 AND completion_rate <= 1),
    engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
    
    -- Session quality indicators
    bounce_rate DECIMAL(3,2) DEFAULT 0,
    average_time_per_property INTEGER DEFAULT 0, -- seconds
    return_session BOOLEAN DEFAULT false,
    
    -- Device and context
    device_type TEXT,
    browser TEXT,
    os TEXT,
    screen_resolution TEXT,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PHASE 7: CREATE PERFORMANCE INDEXES
-- =============================================================================

-- Links table indexes (CRM extensions)
CREATE INDEX IF NOT EXISTS idx_links_deal_status ON links(deal_status) WHERE deal_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_links_deal_stage ON links(deal_stage) WHERE deal_stage IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_links_temperature ON links(temperature) WHERE temperature IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_links_engagement_score ON links(engagement_score) WHERE engagement_score > 0;
CREATE INDEX IF NOT EXISTS idx_links_last_activity ON links(last_activity) WHERE last_activity IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_links_agent_id ON links(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_links_client_id ON links(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_links_follow_up_date ON links(follow_up_date) WHERE follow_up_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_links_deal_value ON links(deal_value) WHERE deal_value > 0;

-- Clients table indexes
CREATE INDEX IF NOT EXISTS idx_clients_temperature ON clients(temperature);
CREATE INDEX IF NOT EXISTS idx_clients_engagement_score ON clients(engagement_score);
CREATE INDEX IF NOT EXISTS idx_clients_last_interaction ON clients(last_interaction);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_primary_agent ON clients(primary_agent_id) WHERE primary_agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_source ON clients(source);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(is_active) WHERE is_active = true;

-- Tasks table indexes
CREATE INDEX IF NOT EXISTS idx_tasks_deal_id ON tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_agent_id ON tasks(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_is_automated ON tasks(is_automated) WHERE is_automated = true;
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task ON tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;

-- Activities table indexes (enhancements)
CREATE INDEX IF NOT EXISTS idx_activities_client_id ON activities(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_engagement_value ON activities(engagement_value) WHERE engagement_value > 0;
CREATE INDEX IF NOT EXISTS idx_activities_session_duration ON activities(session_duration) WHERE session_duration > 0;

-- Engagement sessions indexes
CREATE INDEX IF NOT EXISTS idx_engagement_sessions_deal_id ON engagement_sessions(deal_id);
CREATE INDEX IF NOT EXISTS idx_engagement_sessions_client_id ON engagement_sessions(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_engagement_sessions_session_id ON engagement_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_engagement_sessions_started_at ON engagement_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_engagement_sessions_engagement_score ON engagement_sessions(engagement_score) WHERE engagement_score > 0;

-- =============================================================================
-- PHASE 8: CREATE DATABASE FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at columns automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for clients table
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for tasks table  
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update client last_interaction when activity occurs
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

-- Trigger to update client interaction on activity
DROP TRIGGER IF EXISTS update_client_interaction_on_activity ON activities;
CREATE TRIGGER update_client_interaction_on_activity 
    AFTER INSERT ON activities 
    FOR EACH ROW EXECUTE FUNCTION update_client_last_interaction();

-- Function to update deal last_activity when activity occurs
CREATE OR REPLACE FUNCTION update_deal_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE links 
    SET last_activity = NOW()
    WHERE id = NEW.link_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update deal activity on activity
DROP TRIGGER IF EXISTS update_deal_activity_on_activity ON activities;
CREATE TRIGGER update_deal_activity_on_activity 
    AFTER INSERT ON activities 
    FOR EACH ROW EXECUTE FUNCTION update_deal_last_activity();

-- Function to automatically calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(
    p_client_id UUID,
    p_deal_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    session_completion_score INTEGER := 0;
    property_interaction_score INTEGER := 0;
    behavioral_score INTEGER := 0;
    recency_score INTEGER := 0;
    total_score INTEGER := 0;
    
    -- Session data
    total_sessions INTEGER;
    avg_completion_rate DECIMAL;
    
    -- Property interaction data  
    properties_liked INTEGER;
    properties_considered INTEGER;
    detail_views INTEGER;
    
    -- Behavioral indicators
    return_visits INTEGER;
    avg_session_duration INTEGER;
    like_to_view_ratio DECIMAL;
    
    -- Recency data
    last_activity_age INTERVAL;
BEGIN
    -- Session Completion Score (0-25 points)
    SELECT 
        COUNT(*),
        AVG(completion_rate)
    INTO total_sessions, avg_completion_rate
    FROM engagement_sessions 
    WHERE client_id = p_client_id 
    AND (p_deal_id IS NULL OR deal_id = p_deal_id);
    
    session_completion_score := LEAST(25, 
        CASE 
            WHEN avg_completion_rate >= 0.51 THEN 16 + (avg_completion_rate - 0.51) * 18
            WHEN avg_completion_rate > 0 THEN 5 + avg_completion_rate * 20
            ELSE 0
        END + 
        (total_sessions - 1) * 5
    );
    
    -- Property Interaction Score (0-35 points)
    SELECT 
        COUNT(*) FILTER (WHERE action = 'like'),
        COUNT(*) FILTER (WHERE action = 'consider'),
        COUNT(*) FILTER (WHERE action = 'detail')
    INTO properties_liked, properties_considered, detail_views
    FROM activities
    WHERE client_id = p_client_id
    AND (p_deal_id IS NULL OR link_id = p_deal_id);
    
    property_interaction_score := LEAST(35,
        LEAST(15, properties_liked * 3) +
        LEAST(10, properties_considered * 2) +
        LEAST(10, detail_views * 2)
    );
    
    -- Behavioral Indicators Score (0-25 points)
    return_visits := GREATEST(0, total_sessions - 1);
    
    SELECT AVG(duration_seconds)
    INTO avg_session_duration
    FROM engagement_sessions
    WHERE client_id = p_client_id;
    
    behavioral_score := LEAST(25,
        LEAST(20, return_visits * 10) +
        (CASE WHEN avg_session_duration > 300 THEN 5 ELSE 0 END)
    );
    
    -- Recency Factor Score (0-15 points)
    SELECT NOW() - MAX(last_interaction)
    INTO last_activity_age
    FROM clients 
    WHERE id = p_client_id;
    
    recency_score := CASE 
        WHEN last_activity_age <= INTERVAL '1 day' THEN 15
        WHEN last_activity_age <= INTERVAL '1 week' THEN 10
        WHEN last_activity_age <= INTERVAL '1 month' THEN 5
        ELSE 0
    END;
    
    -- Calculate total score
    total_score := session_completion_score + property_interaction_score + 
                   behavioral_score + recency_score;
    
    RETURN LEAST(100, total_score);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- PHASE 9: ADD FOREIGN KEY CONSTRAINTS
-- =============================================================================

-- Add foreign key constraints after tables are created
DO $$ 
BEGIN
    -- Links to clients relationship
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_links_client_id'
    ) THEN
        ALTER TABLE links ADD CONSTRAINT fk_links_client_id 
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
    END IF;
    
    -- Tasks to clients relationship
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_tasks_client_id'
    ) THEN
        ALTER TABLE tasks ADD CONSTRAINT fk_tasks_client_id 
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
    END IF;
    
    -- Activities to clients relationship  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_activities_client_id'
    ) THEN
        ALTER TABLE activities ADD CONSTRAINT fk_activities_client_id 
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
    END IF;
    
    -- Engagement sessions to clients relationship
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_engagement_sessions_client_id'
    ) THEN
        ALTER TABLE engagement_sessions ADD CONSTRAINT fk_engagement_sessions_client_id 
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
    END IF;
END $$;

-- =============================================================================
-- PHASE 10: ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_sessions ENABLE ROW LEVEL SECURITY;

-- Clients policies - allow public access for now (will be restricted when auth is added)
DROP POLICY IF EXISTS "Clients are publicly readable" ON clients;
CREATE POLICY "Clients are publicly readable" ON clients FOR SELECT USING (true);

DROP POLICY IF EXISTS "Clients can be created" ON clients;
CREATE POLICY "Clients can be created" ON clients FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Clients can be updated" ON clients;
CREATE POLICY "Clients can be updated" ON clients FOR UPDATE USING (true);

-- Tasks policies
DROP POLICY IF EXISTS "Tasks are publicly readable" ON tasks;
CREATE POLICY "Tasks are publicly readable" ON tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tasks can be created" ON tasks;  
CREATE POLICY "Tasks can be created" ON tasks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Tasks can be updated" ON tasks;
CREATE POLICY "Tasks can be updated" ON tasks FOR UPDATE USING (true);

-- Engagement sessions policies
DROP POLICY IF EXISTS "Engagement sessions are publicly readable" ON engagement_sessions;
CREATE POLICY "Engagement sessions are publicly readable" ON engagement_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Engagement sessions can be created" ON engagement_sessions;
CREATE POLICY "Engagement sessions can be created" ON engagement_sessions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Engagement sessions can be updated" ON engagement_sessions;
CREATE POLICY "Engagement sessions can be updated" ON engagement_sessions FOR UPDATE USING (true);

-- =============================================================================
-- PHASE 11: ADD DOCUMENTATION COMMENTS
-- =============================================================================

-- Table comments
COMMENT ON TABLE clients IS 'Client profiles with progressive enhancement from anonymous to full profiles. Supports behavioral tracking and engagement scoring.';
COMMENT ON TABLE tasks IS 'CRM tasks including automated and manual tasks with priority, due dates, and completion tracking.';
COMMENT ON TABLE engagement_sessions IS 'Session-level engagement tracking with completion rates, interaction metrics, and scoring.';

-- Column comments for links table extensions
COMMENT ON COLUMN links.deal_status IS 'Current business status: active, qualified, nurturing, closed-won, closed-lost';
COMMENT ON COLUMN links.deal_stage IS 'Current stage in 7-stage pipeline: created → shared → accessed → engaged → qualified → advanced → closed';
COMMENT ON COLUMN links.engagement_score IS 'Calculated engagement score 0-100 based on client interactions and behavior patterns';
COMMENT ON COLUMN links.temperature IS 'Client temperature classification: hot (80-100), warm (50-79), cold (0-49)';
COMMENT ON COLUMN links.deal_probability IS 'Probability of deal closing (0.0-1.0) based on engagement and stage';

-- Column comments for clients table
COMMENT ON COLUMN clients.behavioral_data IS 'JSON object storing client behavior patterns, preferences, and interaction history';
COMMENT ON COLUMN clients.preferences IS 'JSON object storing client property preferences learned from interactions';
COMMENT ON COLUMN clients.property_interests IS 'Array of property types and features the client has shown interest in';
COMMENT ON COLUMN clients.engagement_score IS 'Real-time engagement score calculated from all client interactions';

-- Column comments for tasks table
COMMENT ON COLUMN tasks.automation_trigger IS 'JSON string describing the conditions that triggered automated task creation';
COMMENT ON COLUMN tasks.metadata IS 'JSON object storing task-specific data and context';
COMMENT ON COLUMN tasks.parent_task_id IS 'Reference to parent task for task chains and follow-up sequences';

-- Migration completion marker
INSERT INTO schema_migrations (version, applied_at) 
VALUES ('20250821_001_crm_foundation', NOW())
ON CONFLICT (version) DO UPDATE SET applied_at = NOW();

-- Create schema_migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    rollback_instructions TEXT
);