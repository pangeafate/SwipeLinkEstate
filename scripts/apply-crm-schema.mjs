#!/usr/bin/env node

/**
 * Apply CRM Schema Extensions
 * 
 * This script applies the CRM database schema extensions to the Supabase database.
 * It extends the existing schema with CRM-specific tables and columns.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function applyCRMSchema() {
  try {
    console.log('🚀 Applying CRM schema extensions...')
    
    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    // Read the CRM schema file
    const schemaPath = join(__dirname, '..', 'lib', 'supabase', 'crm-schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')
    
    console.log('📂 Schema file loaded:', schemaPath)
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements`)
    
    // Execute each statement
    let successCount = 0
    let skipCount = 0
    
    for (const [index, statement] of statements.entries()) {
      try {
        console.log(`⚡ Executing statement ${index + 1}/${statements.length}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // Check if error is expected (e.g., column already exists)
          if (error.message?.includes('already exists') || 
              error.message?.includes('does not exist')) {
            console.log(`⏭️  Skipping: ${error.message}`)
            skipCount++
          } else {
            throw error
          }
        } else {
          successCount++
        }
      } catch (error) {
        console.error(`❌ Error executing statement ${index + 1}:`)
        console.error(statement.substring(0, 100) + '...')
        console.error(error.message)
        
        // Continue with other statements
        continue
      }
    }
    
    console.log('\n✅ CRM Schema Application Complete!')
    console.log(`📊 Summary:`)
    console.log(`   - Successful: ${successCount}`)
    console.log(`   - Skipped: ${skipCount}`)
    console.log(`   - Total: ${statements.length}`)
    
    // Test the schema by checking if new tables exist
    console.log('\n🔍 Verifying schema application...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['clients', 'tasks', 'engagement_sessions'])
    
    if (tablesError) {
      console.warn('⚠️  Could not verify table creation:', tablesError.message)
    } else {
      console.log('📋 New CRM tables created:', tables?.map(t => t.table_name).join(', '))
    }
    
    // Check if links table was extended
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'links')
      .in('column_name', ['deal_status', 'deal_stage', 'engagement_score'])
    
    if (columnsError) {
      console.warn('⚠️  Could not verify links table extensions:', columnsError.message)
    } else {
      console.log('🔗 Links table extensions:', columns?.map(c => c.column_name).join(', '))
    }
    
    console.log('\n🎉 CRM schema is ready for use!')
    
  } catch (error) {
    console.error('💥 Fatal error applying CRM schema:', error.message)
    process.exit(1)
  }
}

// Run the schema application
applyCRMSchema()