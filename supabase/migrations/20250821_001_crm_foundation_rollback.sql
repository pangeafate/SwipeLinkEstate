-- SwipeLink Estate CRM Foundation Rollback Migration
-- Migration: 20250821_001_crm_foundation_rollback
-- Description: Safely rolls back the CRM foundation schema changes
-- Author: Database Administrator
-- Created: 2025-08-21
-- Rolls back: 20250821_001_crm_foundation.sql

-- CRITICAL WARNING: This rollback will permanently delete CRM data
-- Ensure you have backups before running this rollback migration

-- =============================================================================
-- PHASE 1: DROP TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Drop triggers first to avoid constraint violations
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_client_interaction_on_activity ON activities;
DROP TRIGGER IF EXISTS update_deal_activity_on_activity ON activities;

-- Drop custom functions
DROP FUNCTION IF EXISTS calculate_engagement_score(UUID, UUID);
DROP FUNCTION IF EXISTS update_client_last_interaction();
DROP FUNCTION IF EXISTS update_deal_last_activity();

-- Keep the generic update_updated_at_column function as it may be used elsewhere

-- =============================================================================
-- PHASE 2: DROP FOREIGN KEY CONSTRAINTS
-- =============================================================================

-- Drop foreign key constraints to avoid dependency issues during table drops
ALTER TABLE links DROP CONSTRAINT IF EXISTS fk_links_client_id;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS fk_tasks_client_id;
ALTER TABLE activities DROP CONSTRAINT IF EXISTS fk_activities_client_id;
ALTER TABLE engagement_sessions DROP CONSTRAINT IF EXISTS fk_engagement_sessions_client_id;

-- =============================================================================
-- PHASE 3: DROP INDEXES
-- =============================================================================

-- Drop indexes for links table CRM extensions
DROP INDEX IF EXISTS idx_links_deal_status;
DROP INDEX IF EXISTS idx_links_deal_stage;
DROP INDEX IF EXISTS idx_links_temperature;
DROP INDEX IF EXISTS idx_links_engagement_score;
DROP INDEX IF EXISTS idx_links_last_activity;
DROP INDEX IF EXISTS idx_links_agent_id;
DROP INDEX IF EXISTS idx_links_client_id;
DROP INDEX IF EXISTS idx_links_follow_up_date;
DROP INDEX IF EXISTS idx_links_deal_value;

-- Drop indexes for clients table
DROP INDEX IF EXISTS idx_clients_temperature;
DROP INDEX IF EXISTS idx_clients_engagement_score;
DROP INDEX IF EXISTS idx_clients_last_interaction;
DROP INDEX IF EXISTS idx_clients_email;
DROP INDEX IF EXISTS idx_clients_phone;
DROP INDEX IF EXISTS idx_clients_primary_agent;
DROP INDEX IF EXISTS idx_clients_source;
DROP INDEX IF EXISTS idx_clients_active;

-- Drop indexes for tasks table
DROP INDEX IF EXISTS idx_tasks_deal_id;
DROP INDEX IF EXISTS idx_tasks_client_id;
DROP INDEX IF EXISTS idx_tasks_agent_id;
DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_priority;
DROP INDEX IF EXISTS idx_tasks_due_date;
DROP INDEX IF EXISTS idx_tasks_is_automated;
DROP INDEX IF EXISTS idx_tasks_type;
DROP INDEX IF EXISTS idx_tasks_parent_task;

-- Drop indexes for activities table enhancements
DROP INDEX IF EXISTS idx_activities_client_id;
DROP INDEX IF EXISTS idx_activities_engagement_value;
DROP INDEX IF EXISTS idx_activities_session_duration;

-- Drop indexes for engagement sessions
DROP INDEX IF EXISTS idx_engagement_sessions_deal_id;
DROP INDEX IF EXISTS idx_engagement_sessions_client_id;
DROP INDEX IF EXISTS idx_engagement_sessions_session_id;
DROP INDEX IF EXISTS idx_engagement_sessions_started_at;
DROP INDEX IF EXISTS idx_engagement_sessions_engagement_score;

-- =============================================================================
-- PHASE 4: DROP RLS POLICIES
-- =============================================================================

-- Drop RLS policies for new tables
DROP POLICY IF EXISTS "Clients are publicly readable" ON clients;
DROP POLICY IF EXISTS "Clients can be created" ON clients;
DROP POLICY IF EXISTS "Clients can be updated" ON clients;

DROP POLICY IF EXISTS "Tasks are publicly readable" ON tasks;
DROP POLICY IF EXISTS "Tasks can be created" ON tasks;
DROP POLICY IF EXISTS "Tasks can be updated" ON tasks;

DROP POLICY IF EXISTS "Engagement sessions are publicly readable" ON engagement_sessions;
DROP POLICY IF EXISTS "Engagement sessions can be created" ON engagement_sessions;
DROP POLICY IF EXISTS "Engagement sessions can be updated" ON engagement_sessions;

-- =============================================================================
-- PHASE 5: REMOVE COLUMNS FROM EXISTING TABLES
-- =============================================================================

-- Remove CRM extensions from links table
-- WARNING: This will permanently delete all CRM data in the links table
ALTER TABLE links DROP COLUMN IF EXISTS deal_status;
ALTER TABLE links DROP COLUMN IF EXISTS deal_stage;
ALTER TABLE links DROP COLUMN IF EXISTS deal_value;
ALTER TABLE links DROP COLUMN IF EXISTS client_id;
ALTER TABLE links DROP COLUMN IF EXISTS engagement_score;
ALTER TABLE links DROP COLUMN IF EXISTS temperature;
ALTER TABLE links DROP COLUMN IF EXISTS last_activity;
ALTER TABLE links DROP COLUMN IF EXISTS agent_id;
ALTER TABLE links DROP COLUMN IF EXISTS notes;
ALTER TABLE links DROP COLUMN IF EXISTS tags;
ALTER TABLE links DROP COLUMN IF EXISTS client_preferences;
ALTER TABLE links DROP COLUMN IF EXISTS follow_up_date;
ALTER TABLE links DROP COLUMN IF EXISTS deal_probability;

-- Remove CRM extensions from activities table
-- WARNING: This will permanently delete engagement data in activities table
ALTER TABLE activities DROP COLUMN IF EXISTS client_id;
ALTER TABLE activities DROP COLUMN IF EXISTS engagement_value;
ALTER TABLE activities DROP COLUMN IF EXISTS session_duration;
ALTER TABLE activities DROP COLUMN IF EXISTS device_info;
ALTER TABLE activities DROP COLUMN IF EXISTS user_agent;
ALTER TABLE activities DROP COLUMN IF EXISTS ip_address;
ALTER TABLE activities DROP COLUMN IF EXISTS referrer_url;

-- =============================================================================
-- PHASE 6: DROP NEW TABLES
-- =============================================================================

-- WARNING: These operations will permanently delete all data in these tables
-- Ensure you have proper backups before proceeding

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS engagement_sessions;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS clients;

-- =============================================================================
-- PHASE 7: DROP CUSTOM TYPES
-- =============================================================================

-- Drop custom enums (only if not used by other parts of the system)
-- Note: PostgreSQL will prevent dropping types if they're still in use

DO $$ 
BEGIN
    DROP TYPE IF EXISTS deal_status;
EXCEPTION
    WHEN dependent_objects_still_exist THEN
        RAISE NOTICE 'Cannot drop deal_status type: still in use by other objects';
END $$;

DO $$ 
BEGIN
    DROP TYPE IF EXISTS deal_stage;
EXCEPTION
    WHEN dependent_objects_still_exist THEN
        RAISE NOTICE 'Cannot drop deal_stage type: still in use by other objects';
END $$;

DO $$ 
BEGIN
    DROP TYPE IF EXISTS client_temperature;
EXCEPTION
    WHEN dependent_objects_still_exist THEN
        RAISE NOTICE 'Cannot drop client_temperature type: still in use by other objects';
END $$;

DO $$ 
BEGIN
    DROP TYPE IF EXISTS task_type;
EXCEPTION
    WHEN dependent_objects_still_exist THEN
        RAISE NOTICE 'Cannot drop task_type type: still in use by other objects';
END $$;

DO $$ 
BEGIN
    DROP TYPE IF EXISTS task_priority;
EXCEPTION
    WHEN dependent_objects_still_exist THEN
        RAISE NOTICE 'Cannot drop task_priority type: still in use by other objects';
END $$;

DO $$ 
BEGIN
    DROP TYPE IF EXISTS task_status;
EXCEPTION
    WHEN dependent_objects_still_exist THEN
        RAISE NOTICE 'Cannot drop task_status type: still in use by other objects';
END $$;

DO $$ 
BEGIN
    DROP TYPE IF EXISTS client_source;
EXCEPTION
    WHEN dependent_objects_still_exist THEN
        RAISE NOTICE 'Cannot drop client_source type: still in use by other objects';
END $$;

-- =============================================================================
-- PHASE 8: CLEANUP SCHEMA MIGRATIONS RECORD
-- =============================================================================

-- Remove the migration record
DELETE FROM schema_migrations WHERE version = '20250821_001_crm_foundation';

-- =============================================================================
-- ROLLBACK COMPLETION LOG
-- =============================================================================

-- Log the rollback completion
DO $$ 
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'CRM Foundation Rollback Completed';
    RAISE NOTICE 'Migration: 20250821_001_crm_foundation';
    RAISE NOTICE 'Rollback executed at: %', NOW();
    RAISE NOTICE '============================================';
    RAISE NOTICE 'WARNING: All CRM data has been permanently deleted';
    RAISE NOTICE 'Tables dropped: clients, tasks, engagement_sessions';
    RAISE NOTICE 'Links table CRM columns removed';
    RAISE NOTICE 'Activities table CRM columns removed';
    RAISE NOTICE 'All CRM-related indexes and constraints dropped';
    RAISE NOTICE 'All CRM-related functions and triggers dropped';
    RAISE NOTICE '============================================';
END $$;