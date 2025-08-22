-- SwipeLink Estate CRM Development Seed Data
-- File: crm_development_seed.sql
-- Description: Comprehensive seed data for CRM development and testing
-- Author: Database Administrator  
-- Created: 2025-08-21

-- =============================================================================
-- SEED DATA OVERVIEW
-- =============================================================================
-- This script creates realistic test data for CRM development including:
-- - Sample clients with various engagement levels
-- - Deals (extended links) in different stages
-- - Automated and manual tasks
-- - Engagement sessions with realistic metrics
-- - Activities showing client behavior patterns

-- WARNING: This script is for DEVELOPMENT ONLY
-- Do NOT run this in production environments

-- =============================================================================
-- PHASE 1: SEED CLIENT PROFILES
-- =============================================================================

-- Create diverse client profiles representing different engagement levels
INSERT INTO clients (
  id, name, email, phone, source, engagement_score, temperature,
  preferences, behavioral_data, property_interests, budget_range, location_preferences,
  total_sessions, total_time_spent, total_properties_viewed, total_properties_liked,
  primary_agent_id, is_active, marketing_opt_in, created_at, updated_at
) VALUES

-- Hot Lead: High Engagement (80+)
(
  '11111111-1111-1111-1111-111111111111',
  'Sarah Johnson',
  'sarah.johnson@email.com',
  '+1-555-0101',
  'link',
  87,
  'hot',
  '{"budget_max": 1200000, "preferred_bedrooms": 3, "must_have_pool": true, "preferred_area": "South Beach"}',
  '{"avg_session_duration": 420, "properties_per_session": 8, "like_ratio": 0.35, "return_frequency": "daily"}',
  '["luxury_condo", "oceanfront", "pool", "modern"]',
  '{"min": 800000, "max": 1200000, "preferred": 1000000}',
  '["South Beach", "Brickell", "Design District"]',
  5,
  1680,
  40,
  14,
  null,
  true,
  true,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 hours'
),

-- Warm Lead: Medium Engagement (50-79)
(
  '22222222-2222-2222-2222-222222222222',
  'Michael Chen',
  'michael.chen@techcompany.com', 
  '+1-555-0102',
  'referral',
  64,
  'warm',
  '{"budget_max": 800000, "preferred_bedrooms": 2, "work_from_home": true, "pet_friendly": true}',
  '{"avg_session_duration": 280, "properties_per_session": 6, "like_ratio": 0.25, "return_frequency": "weekly"}',
  '["condo", "high_rise", "city_view", "modern"]',
  '{"min": 500000, "max": 800000, "preferred": 650000}',
  '["Brickell", "Downtown", "Coconut Grove"]',
  3,
  840,
  18,
  5,
  null,
  true,
  true,
  NOW() - INTERVAL '1 week',
  NOW() - INTERVAL '1 day'
),

-- Cold Lead: Low Engagement (0-49)
(
  '33333333-3333-3333-3333-333333333333',
  'Emily Rodriguez',
  'emily.r.home@gmail.com',
  '+1-555-0103',
  'marketing',
  23,
  'cold',
  '{"budget_max": 600000, "first_time_buyer": true, "preferred_bedrooms": 2}',
  '{"avg_session_duration": 180, "properties_per_session": 3, "like_ratio": 0.10, "return_frequency": "monthly"}',
  '["starter_home", "condo", "affordable"]',
  '{"min": 400000, "max": 600000, "preferred": 500000}',
  '["Doral", "Aventura", "Kendall"]',
  1,
  180,
  3,
  0,
  null,
  true,
  false,
  NOW() - INTERVAL '2 weeks',
  NOW() - INTERVAL '1 week'
),

-- Qualified Lead: Recently Engaged (65)
(
  '44444444-4444-4444-4444-444444444444',
  'David Williams',
  'dwilliams@finance.com',
  '+1-555-0104',
  'direct',
  65,
  'warm',
  '{"budget_max": 1500000, "luxury_amenities": true, "preferred_bedrooms": 4, "investment_property": true}',
  '{"avg_session_duration": 350, "properties_per_session": 7, "like_ratio": 0.28, "return_frequency": "few_days"}',
  '["luxury_home", "investment", "waterfront", "gated_community"]',
  '{"min": 1000000, "max": 1500000, "preferred": 1250000}',
  '["Key Biscayne", "Coral Gables", "Pinecrest"]',
  2,
  700,
  14,
  4,
  null,
  true,
  true,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '6 hours'
),

-- Anonymous User: Just Starting Journey
(
  '55555555-5555-5555-5555-555555555555',
  null,
  null,
  null,
  'link',
  15,
  'cold',
  '{}',
  '{"avg_session_duration": 120, "properties_per_session": 2, "like_ratio": 0.05, "return_frequency": "never"}',
  '[]',
  '{}',
  '[]',
  1,
  120,
  2,
  0,
  null,
  true,
  true,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
)

ON CONFLICT (id) DO UPDATE SET
  engagement_score = EXCLUDED.engagement_score,
  temperature = EXCLUDED.temperature,
  updated_at = NOW();

-- =============================================================================
-- PHASE 2: SEED DEAL DATA (EXTENDED LINKS)
-- =============================================================================

-- Create sample property links with CRM extensions
-- First, ensure we have some properties to work with
INSERT INTO properties (id, address, price, bedrooms, bathrooms, area_sqft, description, features, status)
VALUES 
  ('prop-001', '123 Ocean Drive, Miami Beach', 950000, 2, 2.0, 1200, 'Stunning oceanfront condo', '["Ocean View", "Balcony", "Pool"]', 'active'),
  ('prop-002', '456 Brickell Ave, Miami', 750000, 2, 2.0, 1100, 'Modern downtown high-rise', '["City View", "Gym", "Concierge"]', 'active'),
  ('prop-003', '789 Collins St, South Beach', 1200000, 3, 2.5, 1600, 'Luxury beachfront penthouse', '["Penthouse", "Ocean View", "Rooftop"]', 'active')
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Create deals (extended links) in various stages
INSERT INTO links (
  id, code, name, property_ids, 
  deal_status, deal_stage, deal_value, client_id, engagement_score, temperature,
  last_activity, agent_id, notes, tags, client_preferences, follow_up_date, deal_probability,
  created_at, expires_at
) VALUES

-- Hot Deal: High Value, Advanced Stage
(
  'deal-001',
  'HOT-BEACH-001',
  'Sarah - Luxury Beach Properties',
  '["prop-001", "prop-003"]',
  'qualified',
  'advanced',
  1075000,
  '11111111-1111-1111-1111-111111111111',
  87,
  'hot',
  NOW() - INTERVAL '2 hours',
  null,
  'Client very interested in oceanfront properties. Has viewed prop-001 multiple times. Scheduling showing for this weekend.',
  '["luxury", "oceanfront", "hot_lead", "high_priority"]',
  '{"preferred_closing": "30_days", "financing_approved": true, "showing_scheduled": true}',
  NOW() + INTERVAL '2 days',
  0.85,
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '30 days'
),

-- Warm Deal: Medium Engagement
(
  'deal-002', 
  'WARM-CITY-002',
  'Michael - Downtown Condos',
  '["prop-002"]',
  'qualified',
  'qualified',
  750000,
  '22222222-2222-2222-2222-222222222222',
  64,
  'warm',
  NOW() - INTERVAL '1 day',
  null,
  'Tech professional looking for downtown condo. Good engagement, needs follow-up.',
  '["downtown", "professional", "moderate_engagement"]',
  '{"work_from_home": true, "move_in_timeline": "flexible"}',
  NOW() + INTERVAL '3 days',
  0.45,
  NOW() - INTERVAL '1 week',
  NOW() + INTERVAL '45 days'
),

-- Cold Deal: Early Stage
(
  'deal-003',
  'COLD-START-003',
  'Emily - First Time Buyer',
  '["prop-002"]',
  'active',
  'accessed',
  750000,
  '33333333-3333-3333-3333-333333333333',
  23,
  'cold',
  NOW() - INTERVAL '1 week',
  null,
  'First time buyer, needs nurturing and education about the process.',
  '["first_time_buyer", "needs_education", "low_engagement"]',
  '{"first_time_buyer": true, "financing_needed": true}',
  NOW() + INTERVAL '1 week',
  0.15,
  NOW() - INTERVAL '2 weeks',
  NOW() + INTERVAL '60 days'
),

-- Recently Created Deal
(
  'deal-004',
  'NEW-LUXURY-004', 
  'David - Investment Properties',
  '["prop-001", "prop-002", "prop-003"]',
  'active',
  'shared',
  975000,
  '44444444-4444-4444-4444-444444444444',
  65,
  'warm',
  NOW() - INTERVAL '6 hours',
  null,
  'Investment client, looking at multiple properties. Good potential for larger deal.',
  '["investment", "multiple_properties", "high_value"]',
  '{"investment_purpose": true, "multiple_units": true}',
  NOW() + INTERVAL '2 days',
  0.55,
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '90 days'
),

-- Anonymous Session Deal
(
  'deal-005',
  'ANON-BROWSE-005',
  'Anonymous Browser Session',
  '["prop-001", "prop-002"]',
  'active',
  'accessed',
  850000,
  '55555555-5555-5555-5555-555555555555',
  15,
  'cold',
  NOW() - INTERVAL '1 day',
  null,
  'Anonymous session, minimal engagement. Needs progressive profiling.',
  '["anonymous", "minimal_engagement", "progressive_profiling_needed"]',
  '{}',
  NOW() + INTERVAL '5 days',
  0.05,
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '30 days'
)

ON CONFLICT (id) DO UPDATE SET
  engagement_score = EXCLUDED.engagement_score,
  temperature = EXCLUDED.temperature,
  last_activity = EXCLUDED.last_activity,
  deal_probability = EXCLUDED.deal_probability;

-- =============================================================================
-- PHASE 3: SEED TASK DATA (AUTOMATED & MANUAL)
-- =============================================================================

-- Create various types of tasks for different scenarios
INSERT INTO tasks (
  id, deal_id, client_id, agent_id, type, priority, title, description,
  status, due_date, is_automated, automation_trigger, metadata,
  estimated_duration, created_at
) VALUES

-- High Priority Hot Lead Tasks
(
  'task-001',
  'deal-001',
  '11111111-1111-1111-1111-111111111111',
  null,
  'call',
  'high',
  'Call hot lead - Sarah Johnson',
  'Client has 87 engagement score and multiple property views. Schedule showing ASAP.',
  'pending',
  NOW() + INTERVAL '2 hours',
  true,
  '{"trigger": "engagement_score > 80", "rule": "immediate_follow_up"}',
  '{"client_temperature": "hot", "properties_of_interest": ["prop-001", "prop-003"], "preferred_contact": "phone"}',
  30,
  NOW() - INTERVAL '1 hour'
),

-- Showing Preparation Task  
(
  'task-002',
  'deal-001',
  '11111111-1111-1111-1111-111111111111',
  null,
  'showing',
  'high',
  'Prepare property showing materials',
  'Prepare showing materials for luxury oceanfront properties. Include comparable sales data.',
  'pending',
  NOW() + INTERVAL '1 day',
  false,
  null,
  '{"properties": ["prop-001", "prop-003"], "materials_needed": ["comps", "floor_plans", "hoa_docs"]}',
  45,
  NOW() - INTERVAL '30 minutes'
),

-- Medium Priority Follow-up
(
  'task-003',
  'deal-002',
  '22222222-2222-2222-2222-222222222222',
  null,
  'email',
  'medium',
  'Follow-up email - Michael Chen',
  '24-hour automated follow-up after link access. Include downtown condo market insights.',
  'pending',
  NOW() + INTERVAL '4 hours',
  true,
  '{"trigger": "24_hours_after_access", "rule": "engagement_follow_up"}',
  '{"last_activity": "property_viewing", "interests": ["downtown", "work_from_home"], "template": "professional_followup"}',
  15,
  NOW() - INTERVAL '2 hours'
),

-- Education Task for First-Time Buyer
(
  'task-004',
  'deal-003',
  '33333333-3333-3333-3333-333333333333',
  null,
  'email',
  'low',
  'Send first-time buyer education materials',
  'Send comprehensive guide about home buying process, financing options, and market insights.',
  'pending',
  NOW() + INTERVAL '2 days',
  true,
  '{"trigger": "first_time_buyer_detected", "rule": "education_sequence"}',
  '{"buyer_type": "first_time", "education_level": "beginner", "materials": ["buying_guide", "financing_101"]}',
  20,
  NOW() - INTERVAL '1 day'
),

-- Investment Property Research
(
  'task-005',
  'deal-004',
  '44444444-4444-4444-4444-444444444444',
  null,
  'document',
  'medium',
  'Prepare investment analysis report',
  'Create detailed investment analysis for multiple properties including ROI calculations and market projections.',
  'pending',
  NOW() + INTERVAL '3 days',
  false,
  null,
  '{"analysis_type": "investment", "properties": ["prop-001", "prop-002", "prop-003"], "metrics": ["roi", "cash_flow", "appreciation"]}',
  90,
  NOW() - INTERVAL '4 hours'
),

-- Progressive Profiling Task
(
  'task-006',
  'deal-005',
  '55555555-5555-5555-5555-555555555555',
  null,
  'email',
  'low',
  'Progressive profiling outreach',
  'Gentle outreach to anonymous user to gather basic contact information and preferences.',
  'pending',
  NOW() + INTERVAL '5 days',
  true,
  '{"trigger": "anonymous_session_detected", "rule": "progressive_profiling"}',
  '{"profile_completeness": 10, "next_step": "contact_info", "approach": "soft_touch"}',
  10,
  NOW() - INTERVAL '6 hours'
),

-- Completed Task Example
(
  'task-007',
  'deal-001',
  '11111111-1111-1111-1111-111111111111',
  null,
  'email',
  'medium',
  'Welcome email sent',
  'Initial welcome email with property links and agent introduction.',
  'completed',
  NOW() - INTERVAL '2 days',
  true,
  '{"trigger": "link_shared", "rule": "immediate_welcome"}',
  '{"template": "welcome_luxury", "personalization": true}',
  10,
  NOW() - INTERVAL '3 days'
)

ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  due_date = EXCLUDED.due_date;

-- =============================================================================
-- PHASE 4: SEED ENGAGEMENT SESSIONS
-- =============================================================================

-- Create realistic engagement sessions showing client behavior
INSERT INTO engagement_sessions (
  id, session_id, deal_id, client_id, started_at, ended_at, duration_seconds,
  properties_viewed, properties_liked, properties_disliked, properties_considered,
  detail_views, completion_rate, engagement_score, bounce_rate,
  average_time_per_property, return_session, device_type, browser, os,
  created_at
) VALUES

-- Hot Lead: Multiple High-Engagement Sessions
(
  'session-001',
  'sess_hot_001_20250821_001', 
  'deal-001',
  '11111111-1111-1111-1111-111111111111',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days' + INTERVAL '7 minutes',
  420,
  8,
  3,
  2,
  2,
  5,
  0.75,
  28,
  0.0,
  52,
  false,
  'desktop',
  'Chrome',
  'macOS',
  NOW() - INTERVAL '3 days'
),

-- Hot Lead: Return Session (Higher Engagement)
(
  'session-002',
  'sess_hot_001_20250821_002',
  'deal-001', 
  '11111111-1111-1111-1111-111111111111',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days' + INTERVAL '9 minutes',
  540,
  6,
  4,
  0,
  3,
  6,
  0.90,
  35,
  0.0,
  90,
  true,
  'desktop',
  'Chrome',
  'macOS',
  NOW() - INTERVAL '2 days'
),

-- Warm Lead: Moderate Engagement
(
  'session-003',
  'sess_warm_002_20250821_001',
  'deal-002',
  '22222222-2222-2222-2222-222222222222',
  NOW() - INTERVAL '1 week',
  NOW() - INTERVAL '1 week' + INTERVAL '4 minutes 40 seconds',
  280,
  6,
  1,
  1,
  2,
  3,
  0.60,
  18,
  0.15,
  47,
  false,
  'mobile',
  'Safari',
  'iOS',
  NOW() - INTERVAL '1 week'
),

-- Cold Lead: Low Engagement Session
(
  'session-004',
  'sess_cold_003_20250821_001',
  'deal-003',
  '33333333-3333-3333-3333-333333333333',
  NOW() - INTERVAL '2 weeks',
  NOW() - INTERVAL '2 weeks' + INTERVAL '3 minutes',
  180,
  3,
  0,
  0,
  0,
  1,
  0.30,
  5,
  0.60,
  60,
  false,
  'mobile',
  'Chrome',
  'Android',
  NOW() - INTERVAL '2 weeks'
),

-- Investment Client: Research-Heavy Session
(
  'session-005',
  'sess_invest_004_20250821_001',
  'deal-004',
  '44444444-4444-4444-4444-444444444444',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days' + INTERVAL '6 minutes',
  360,
  7,
  2,
  1,
  3,
  7,
  0.70,
  25,
  0.0,
  51,
  false,
  'desktop',
  'Chrome',
  'Windows',
  NOW() - INTERVAL '5 days'
),

-- Anonymous Session: Minimal Engagement
(
  'session-006',
  'sess_anon_005_20250821_001',
  'deal-005',
  '55555555-5555-5555-5555-555555555555',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day' + INTERVAL '2 minutes',
  120,
  2,
  0,
  0,
  0,
  0,
  0.20,
  2,
  0.80,
  60,
  false,
  'mobile',
  'Safari',
  'iOS',
  NOW() - INTERVAL '1 day'
)

ON CONFLICT (id) DO UPDATE SET
  engagement_score = EXCLUDED.engagement_score,
  completion_rate = EXCLUDED.completion_rate;

-- =============================================================================
-- PHASE 5: SEED DETAILED ACTIVITIES
-- =============================================================================

-- Create granular activity data showing client interaction patterns
INSERT INTO activities (
  id, link_id, property_id, action, session_id, client_id, 
  engagement_value, session_duration, metadata, created_at
) VALUES

-- Sarah's Activities (Hot Lead)
('activity-001', 'deal-001', 'prop-001', 'view', 'sess_hot_001_20250821_001', '11111111-1111-1111-1111-111111111111', 1, 45, '{"time_spent": 45, "scroll_depth": 0.8}', NOW() - INTERVAL '3 days'),
('activity-002', 'deal-001', 'prop-001', 'like', 'sess_hot_001_20250821_001', '11111111-1111-1111-1111-111111111111', 3, 15, '{"immediate_action": true}', NOW() - INTERVAL '3 days' + INTERVAL '1 minute'),
('activity-003', 'deal-001', 'prop-001', 'detail', 'sess_hot_001_20250821_001', '11111111-1111-1111-1111-111111111111', 2, 90, '{"images_viewed": 8, "floor_plan_viewed": true}', NOW() - INTERVAL '3 days' + INTERVAL '2 minutes'),
('activity-004', 'deal-001', 'prop-003', 'view', 'sess_hot_001_20250821_001', '11111111-1111-1111-1111-111111111111', 1, 60, '{"time_spent": 60, "scroll_depth": 0.9}', NOW() - INTERVAL '3 days' + INTERVAL '4 minutes'),
('activity-005', 'deal-001', 'prop-003', 'like', 'sess_hot_001_20250821_001', '11111111-1111-1111-1111-111111111111', 3, 10, '{"immediate_action": true}', NOW() - INTERVAL '3 days' + INTERVAL '4 minutes 30 seconds'),
('activity-006', 'deal-001', 'prop-003', 'consider', 'sess_hot_001_20250821_001', '11111111-1111-1111-1111-111111111111', 2, 30, '{"comparison_mode": true}', NOW() - INTERVAL '3 days' + INTERVAL '5 minutes'),

-- Sarah's Return Session (Even Higher Engagement)
('activity-007', 'deal-001', 'prop-001', 'view', 'sess_hot_001_20250821_002', '11111111-1111-1111-1111-111111111111', 1, 120, '{"return_visitor": true, "time_spent": 120}', NOW() - INTERVAL '2 days'),
('activity-008', 'deal-001', 'prop-001', 'detail', 'sess_hot_001_20250821_002', '11111111-1111-1111-1111-111111111111', 2, 180, '{"images_viewed": 12, "virtual_tour": true, "floor_plan_downloaded": true}', NOW() - INTERVAL '2 days' + INTERVAL '2 minutes'),
('activity-009', 'deal-001', 'prop-003', 'detail', 'sess_hot_001_20250821_002', '11111111-1111-1111-1111-111111111111', 2, 150, '{"images_viewed": 10, "amenities_focused": true}', NOW() - INTERVAL '2 days' + INTERVAL '5 minutes'),

-- Michael's Activities (Warm Lead)  
('activity-010', 'deal-002', 'prop-002', 'view', 'sess_warm_002_20250821_001', '22222222-2222-2222-2222-222222222222', 1, 80, '{"time_spent": 80, "scroll_depth": 0.6}', NOW() - INTERVAL '1 week'),
('activity-011', 'deal-002', 'prop-002', 'like', 'sess_warm_002_20250821_001', '22222222-2222-2222-2222-222222222222', 3, 15, '{"quick_decision": true}', NOW() - INTERVAL '1 week' + INTERVAL '1 minute 20 seconds'),
('activity-012', 'deal-002', 'prop-002', 'detail', 'sess_warm_002_20250821_001', '22222222-2222-2222-2222-222222222222', 2, 120, '{"images_viewed": 5, "neighborhood_info_viewed": true}', NOW() - INTERVAL '1 week' + INTERVAL '3 minutes'),

-- Emily's Activities (Cold Lead)
('activity-013', 'deal-003', 'prop-002', 'view', 'sess_cold_003_20250821_001', '33333333-3333-3333-3333-333333333333', 1, 90, '{"time_spent": 90, "scroll_depth": 0.4, "hesitation_detected": true}', NOW() - INTERVAL '2 weeks'),
('activity-014', 'deal-003', 'prop-002', 'detail', 'sess_cold_003_20250821_001', '33333333-3333-3333-3333-333333333333', 2, 45, '{"images_viewed": 3, "price_focused": true}', NOW() - INTERVAL '2 weeks' + INTERVAL '2 minutes'),

-- David's Activities (Investment Focus)
('activity-015', 'deal-004', 'prop-001', 'view', 'sess_invest_004_20250821_001', '44444444-4444-4444-4444-444444444444', 1, 75, '{"analytical_viewing": true, "time_spent": 75}', NOW() - INTERVAL '5 days'),
('activity-016', 'deal-004', 'prop-002', 'view', 'sess_invest_004_20250821_001', '44444444-4444-4444-4444-444444444444', 1, 60, '{"comparative_analysis": true}', NOW() - INTERVAL '5 days' + INTERVAL '2 minutes'),
('activity-017', 'deal-004', 'prop-003', 'view', 'sess_invest_004_20250821_001', '44444444-4444-4444-4444-444444444444', 1, 85, '{"investment_metrics_focused": true}', NOW() - INTERVAL '5 days' + INTERVAL '4 minutes'),
('activity-018', 'deal-004', 'prop-001', 'consider', 'sess_invest_004_20250821_001', '44444444-4444-4444-4444-444444444444', 2, 45, '{"roi_calculation": true}', NOW() - INTERVAL '5 days' + INTERVAL '5 minutes'),

-- Anonymous Activities (Minimal Engagement)
('activity-019', 'deal-005', 'prop-001', 'view', 'sess_anon_005_20250821_001', '55555555-5555-5555-5555-555555555555', 1, 60, '{"anonymous_session": true, "quick_browse": true}', NOW() - INTERVAL '1 day'),
('activity-020', 'deal-005', 'prop-002', 'view', 'sess_anon_005_20250821_001', '55555555-5555-5555-5555-555555555555', 1, 45, '{"price_comparison": true}', NOW() - INTERVAL '1 day' + INTERVAL '1 minute')

ON CONFLICT (id) DO UPDATE SET
  engagement_value = EXCLUDED.engagement_value,
  created_at = EXCLUDED.created_at;

-- =============================================================================
-- PHASE 6: UPDATE CALCULATED FIELDS
-- =============================================================================

-- Update client engagement scores based on activities (simulation of real-time calculation)
UPDATE clients SET
  total_sessions = (
    SELECT COUNT(DISTINCT session_id) 
    FROM engagement_sessions 
    WHERE client_id = clients.id
  ),
  total_properties_viewed = (
    SELECT COUNT(DISTINCT property_id)
    FROM activities 
    WHERE client_id = clients.id AND action = 'view'
  ),
  total_properties_liked = (
    SELECT COUNT(*)
    FROM activities 
    WHERE client_id = clients.id AND action = 'like'
  ),
  total_time_spent = (
    SELECT COALESCE(SUM(duration_seconds), 0)
    FROM engagement_sessions
    WHERE client_id = clients.id
  ),
  last_interaction = (
    SELECT MAX(created_at)
    FROM activities
    WHERE client_id = clients.id
  ),
  updated_at = NOW()
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222', 
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);

-- Update deal last_activity based on most recent client activity
UPDATE links SET
  last_activity = (
    SELECT MAX(created_at)
    FROM activities
    WHERE link_id = links.id
  )
WHERE id IN ('deal-001', 'deal-002', 'deal-003', 'deal-004', 'deal-005');

-- =============================================================================
-- SEED DATA SUMMARY
-- =============================================================================

DO $$ 
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'CRM Development Seed Data Applied';
  RAISE NOTICE 'Created at: %', NOW();
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Clients created: 5 (diverse engagement levels)';
  RAISE NOTICE 'Deals created: 5 (various stages and values)';
  RAISE NOTICE 'Tasks created: 7 (automated + manual)';
  RAISE NOTICE 'Sessions created: 6 (realistic behavior patterns)';
  RAISE NOTICE 'Activities created: 20 (detailed interaction tracking)';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Test Scenarios Available:';
  RAISE NOTICE '- Hot Lead: Sarah Johnson (87 score, luxury properties)';
  RAISE NOTICE '- Warm Lead: Michael Chen (64 score, downtown focus)';
  RAISE NOTICE '- Cold Lead: Emily Rodriguez (23 score, first-time buyer)';
  RAISE NOTICE '- Investment Client: David Williams (65 score, multiple properties)';
  RAISE NOTICE '- Anonymous User: Progressive profiling needed';
  RAISE NOTICE '============================================';
END $$;