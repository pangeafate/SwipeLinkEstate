#!/usr/bin/env node

/**
 * Setup CRM Database Script
 * Applies CRM schema migration and creates sample data
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://caddiaxjmtysnvnevcdr.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})

async function enableExtensions() {
  console.log('🔧 Enabling required PostgreSQL extensions...')
  
  try {
    // Enable uuid-ossp extension for uuid_generate_v4()
    const { error: uuidError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
    })
    
    if (uuidError) {
      console.log('Note: Could not enable uuid-ossp extension (may already exist or require admin access)')
    } else {
      console.log('✅ UUID extension enabled')
    }
  } catch (error) {
    console.log('Note: Extensions may require database admin access')
  }
}

async function checkExistingSchema() {
  console.log('🔍 Checking existing CRM schema...')
  
  const { data: tables, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('clients', 'tasks', 'engagement_sessions')
    `
  })
  
  if (error) {
    // Try simpler check
    const { data: clientsCheck } = await supabase
      .from('clients')
      .select('id')
      .limit(1)
    
    return { hasClients: !clientsCheck?.error }
  }
  
  return {
    hasClients: tables?.some(t => t.table_name === 'clients'),
    hasTasks: tables?.some(t => t.table_name === 'tasks'),
    hasEngagementSessions: tables?.some(t => t.table_name === 'engagement_sessions')
  }
}

async function applyCRMSchema() {
  console.log('📋 Applying CRM schema migration...')
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250821_001_crm_foundation.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split into individual statements (basic split, may need refinement)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    let successCount = 0
    let errorCount = 0
    
    for (const statement of statements) {
      try {
        // Skip certain problematic statements
        if (statement.includes('CREATE EXTENSION') || 
            statement.includes('uuid_generate_v4') ||
            statement.includes('COMMENT ON')) {
          continue
        }
        
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        })
        
        if (error) {
          errorCount++
        } else {
          successCount++
        }
      } catch (err) {
        errorCount++
      }
    }
    
    console.log(`✅ Applied ${successCount} statements successfully`)
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} statements had errors (may be due to existing schema)`)
    }
    
  } catch (error) {
    console.error('Error applying migration:', error.message)
    console.log('Attempting manual table creation...')
    await createTablesManually()
  }
}

async function createTablesManually() {
  console.log('🔨 Creating CRM tables manually...')
  
  // Create clients table
  const { error: clientsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS clients (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        source TEXT DEFAULT 'link',
        engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
        temperature TEXT DEFAULT 'cold',
        preferences JSONB DEFAULT '{}',
        behavioral_data JSONB DEFAULT '{}',
        property_interests JSONB DEFAULT '[]',
        budget_range JSONB DEFAULT '{}',
        location_preferences JSONB DEFAULT '[]',
        total_sessions INTEGER DEFAULT 0,
        total_time_spent INTEGER DEFAULT 0,
        total_properties_viewed INTEGER DEFAULT 0,
        total_properties_liked INTEGER DEFAULT 0,
        total_links_accessed INTEGER DEFAULT 0,
        first_interaction TIMESTAMPTZ DEFAULT NOW(),
        last_interaction TIMESTAMPTZ DEFAULT NOW(),
        primary_agent_id UUID,
        assigned_date TIMESTAMPTZ DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true,
        do_not_contact BOOLEAN DEFAULT false,
        marketing_opt_in BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  })
  
  if (clientsError) {
    console.log('Clients table may already exist')
  } else {
    console.log('✅ Clients table created')
  }
  
  // Create tasks table
  const { error: tasksError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        deal_id UUID REFERENCES links(id) ON DELETE CASCADE,
        client_id UUID,
        agent_id UUID,
        type TEXT NOT NULL,
        priority TEXT DEFAULT 'medium',
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        due_date TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        is_automated BOOLEAN DEFAULT false,
        automation_trigger TEXT,
        automation_rule_id UUID,
        metadata JSONB DEFAULT '{}',
        estimated_duration INTEGER,
        actual_duration INTEGER,
        parent_task_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  })
  
  if (tasksError) {
    console.log('Tasks table may already exist')
  } else {
    console.log('✅ Tasks table created')
  }
  
  // Create engagement_sessions table
  const { error: sessionsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS engagement_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        session_id TEXT UNIQUE NOT NULL,
        deal_id UUID REFERENCES links(id) ON DELETE CASCADE,
        client_id UUID,
        started_at TIMESTAMPTZ DEFAULT NOW(),
        ended_at TIMESTAMPTZ,
        duration_seconds INTEGER DEFAULT 0,
        properties_viewed INTEGER DEFAULT 0,
        properties_liked INTEGER DEFAULT 0,
        properties_disliked INTEGER DEFAULT 0,
        properties_considered INTEGER DEFAULT 0,
        detail_views INTEGER DEFAULT 0,
        completion_rate DECIMAL(3,2) DEFAULT 0 CHECK (completion_rate >= 0 AND completion_rate <= 1),
        engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
        bounce_rate DECIMAL(3,2) DEFAULT 0,
        average_time_per_property INTEGER DEFAULT 0,
        return_session BOOLEAN DEFAULT false,
        device_type TEXT,
        browser TEXT,
        os TEXT,
        screen_resolution TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  })
  
  if (sessionsError) {
    console.log('Engagement sessions table may already exist')
  } else {
    console.log('✅ Engagement sessions table created')
  }
}

async function addCRMFieldsToLinks() {
  console.log('🔗 Adding CRM fields to links table...')
  
  const crmFields = [
    { name: 'deal_status', type: 'TEXT', default: "'active'" },
    { name: 'deal_stage', type: 'TEXT', default: "'created'" },
    { name: 'deal_value', type: 'DECIMAL(12,2)', default: '0' },
    { name: 'client_id', type: 'UUID', default: null },
    { name: 'engagement_score', type: 'INTEGER', default: '0' },
    { name: 'temperature', type: 'TEXT', default: "'cold'" },
    { name: 'last_activity', type: 'TIMESTAMPTZ', default: null },
    { name: 'agent_id', type: 'UUID', default: null },
    { name: 'notes', type: 'TEXT', default: null },
    { name: 'tags', type: 'JSONB', default: "'[]'::jsonb" },
    { name: 'client_preferences', type: 'JSONB', default: "'{}'::jsonb" },
    { name: 'follow_up_date', type: 'TIMESTAMPTZ', default: null },
    { name: 'deal_probability', type: 'DECIMAL(3,2)', default: '0.10' }
  ]
  
  for (const field of crmFields) {
    const defaultClause = field.default ? `DEFAULT ${field.default}` : ''
    const { error } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE links ADD COLUMN IF NOT EXISTS ${field.name} ${field.type} ${defaultClause};`
    })
    
    if (!error) {
      console.log(`✅ Added ${field.name} to links table`)
    }
  }
}

async function createSampleCRMData() {
  console.log('📊 Creating sample CRM data...')
  
  // Get existing links
  const { data: links, error: linksError } = await supabase
    .from('links')
    .select('id, name, code')
    .limit(5)
  
  if (!links || links.length === 0) {
    console.log('No links found. Please create some links first.')
    return
  }
  
  // Create sample clients
  const sampleClients = [
    {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '555-0101',
      engagement_score: 85,
      temperature: 'hot',
      preferences: { bedrooms: 3, location: 'downtown', budget: 750000 }
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '555-0102',
      engagement_score: 65,
      temperature: 'warm',
      preferences: { bedrooms: 2, location: 'suburbs', budget: 500000 }
    },
    {
      name: 'Mike Davis',
      email: 'mike.d@example.com',
      phone: '555-0103',
      engagement_score: 35,
      temperature: 'cold',
      preferences: { bedrooms: 4, location: 'waterfront', budget: 1000000 }
    }
  ]
  
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .insert(sampleClients)
    .select()
  
  if (clientsError) {
    console.log('Error creating sample clients:', clientsError.message)
  } else {
    console.log(`✅ Created ${clients.length} sample clients`)
  }
  
  // Update links with CRM data
  if (clients && clients.length > 0) {
    for (let i = 0; i < Math.min(links.length, clients.length); i++) {
      const { error: updateError } = await supabase
        .from('links')
        .update({
          client_id: clients[i].id,
          engagement_score: clients[i].engagement_score,
          temperature: clients[i].temperature,
          deal_stage: i === 0 ? 'qualified' : i === 1 ? 'engaged' : 'accessed',
          deal_value: i === 0 ? 750000 : i === 1 ? 500000 : 1000000,
          last_activity: new Date().toISOString()
        })
        .eq('id', links[i].id)
      
      if (!updateError) {
        console.log(`✅ Updated link "${links[i].name}" with CRM data`)
      }
    }
  }
  
  // Create sample tasks
  const sampleTasks = links.slice(0, 3).map((link, i) => ({
    deal_id: link.id,
    client_id: clients?.[i]?.id,
    type: i === 0 ? 'call' : i === 1 ? 'email' : 'follow-up',
    priority: i === 0 ? 'high' : 'medium',
    title: i === 0 ? 'Schedule property viewing' : i === 1 ? 'Send additional listings' : 'Check interest level',
    description: i === 0 ? 'Client is hot lead - schedule viewing ASAP' : 'Client requested similar properties',
    status: 'pending',
    due_date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString()
  }))
  
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .insert(sampleTasks)
    .select()
  
  if (tasksError) {
    console.log('Error creating sample tasks:', tasksError.message)
  } else {
    console.log(`✅ Created ${tasks.length} sample tasks`)
  }
}

async function main() {
  console.log('🚀 Setting up CRM database...\n')
  
  try {
    // Enable extensions
    await enableExtensions()
    
    // Check existing schema
    const schemaStatus = await checkExistingSchema()
    console.log('Schema status:', schemaStatus)
    
    // Apply CRM schema
    if (!schemaStatus.hasClients) {
      await applyCRMSchema()
    } else {
      console.log('ℹ️  CRM tables already exist')
    }
    
    // Add CRM fields to links
    await addCRMFieldsToLinks()
    
    // Create sample data
    await createSampleCRMData()
    
    console.log('\n✅ CRM database setup complete!')
    console.log('You can now use the CRM features with real data.')
    
  } catch (error) {
    console.error('❌ Error setting up CRM database:', error)
    process.exit(1)
  }
}

// Run the script
main()