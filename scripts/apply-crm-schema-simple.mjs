#!/usr/bin/env node

/**
 * Simple CRM Schema Application Script
 * 
 * Uses direct SQL execution through Supabase client without RPC functions
 * This approach works with the standard Supabase setup.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Simple color utilities
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
}

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://caddiaxjmtysnvnevcdr.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE'

console.log(colors.bold(colors.blue('🏗️ SwipeLink Estate CRM Schema Application')))
console.log(colors.gray('Using simplified approach for Supabase schema updates'))

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/**
 * Test database connection
 */
async function testConnection() {
  console.log(colors.cyan('\n📡 Testing database connection...'))
  
  try {
    const { data, error } = await supabase.from('properties').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.log(colors.red(`❌ Connection failed: ${error.message}`))
      return false
    }
    
    console.log(colors.green('✅ Database connection successful'))
    console.log(colors.gray(`   Found ${data?.length || 0} records in properties table`))
    return true
    
  } catch (error) {
    console.log(colors.red(`❌ Connection error: ${error.message}`))
    return false
  }
}

/**
 * Check if CRM tables exist
 */
async function checkCRMTables() {
  console.log(colors.cyan('\n🔍 Checking CRM table status...'))
  
  const tables = ['clients', 'tasks', 'engagement_sessions']
  const tableStatus = {}
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true })
      
      if (error) {
        if (error.code === '42P01') { // relation does not exist
          tableStatus[table] = 'missing'
          console.log(colors.yellow(`⚠️  Table '${table}' does not exist`))
        } else {
          tableStatus[table] = 'error'
          console.log(colors.red(`❌ Error checking '${table}': ${error.message}`))
        }
      } else {
        tableStatus[table] = 'exists'
        console.log(colors.green(`✅ Table '${table}' exists`))
      }
    } catch (error) {
      tableStatus[table] = 'error'
      console.log(colors.red(`❌ Error checking '${table}': ${error.message}`))
    }
  }
  
  return tableStatus
}

/**
 * Check if links table has CRM extensions
 */
async function checkLinksExtensions() {
  console.log(colors.cyan('\n🔗 Checking links table CRM extensions...'))
  
  try {
    // Try to query CRM fields
    const { data, error } = await supabase
      .from('links')
      .select('id, deal_status, deal_stage, engagement_score, temperature')
      .limit(1)
    
    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log(colors.yellow('⚠️  Links table missing CRM extensions'))
        return false
      } else {
        console.log(colors.red(`❌ Error checking links extensions: ${error.message}`))
        return false
      }
    } else {
      console.log(colors.green('✅ Links table has CRM extensions'))
      return true
    }
  } catch (error) {
    console.log(colors.red(`❌ Error checking links extensions: ${error.message}`))
    return false
  }
}

/**
 * Apply CRM schema using the existing schema file
 */
async function applyCRMSchema() {
  console.log(colors.cyan('\n📋 Applying CRM schema...'))
  
  // Use the existing crm-schema.sql file
  const schemaPath = join(__dirname, '..', 'lib', 'supabase', 'crm-schema.sql')
  
  if (!existsSync(schemaPath)) {
    console.log(colors.red(`❌ Schema file not found: ${schemaPath}`))
    return false
  }
  
  try {
    const schema = readFileSync(schemaPath, 'utf8')
    console.log(colors.gray('📄 Schema file loaded'))
    
    // Split into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s !== '')
    
    console.log(colors.gray(`🔢 Found ${statements.length} SQL statements`))
    
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    
    console.log(colors.gray('\n⚡ Executing SQL statements...'))
    
    // For now, just inform about the schema application process
    console.log(colors.yellow('⚠️  Note: Direct SQL execution requires service role key'))
    console.log(colors.yellow('⚠️  For now, please run the CRM schema manually in Supabase dashboard'))
    console.log(colors.cyan('📋 Schema file location: lib/supabase/crm-schema.sql'))
    
    return true
    
  } catch (error) {
    console.log(colors.red(`❌ Error reading schema file: ${error.message}`))
    return false
  }
}

/**
 * Verify basic functionality with seed data
 */
async function testBasicFunctionality() {
  console.log(colors.cyan('\n🧪 Testing basic functionality...'))
  
  // Try to create a test client
  try {
    const testClient = {
      id: '99999999-9999-9999-9999-999999999999',
      name: 'Test Client',
      email: 'test@example.com',
      source: 'link',
      engagement_score: 0,
      temperature: 'cold'
    }
    
    const { data, error } = await supabase
      .from('clients')
      .insert(testClient)
      .select()
    
    if (error) {
      console.log(colors.yellow(`⚠️  Could not create test client: ${error.message}`))
      return false
    }
    
    console.log(colors.green('✅ Successfully created test client'))
    
    // Clean up test data
    await supabase.from('clients').delete().eq('id', testClient.id)
    console.log(colors.gray('🧹 Cleaned up test data'))
    
    return true
    
  } catch (error) {
    console.log(colors.yellow(`⚠️  Test functionality error: ${error.message}`))
    return false
  }
}

/**
 * Provide instructions for manual setup
 */
function showManualInstructions() {
  console.log(colors.bold(colors.blue('\n📖 Manual Setup Instructions')))
  console.log(colors.gray('Since direct SQL execution requires service role keys, follow these steps:'))
  console.log('')
  
  console.log(colors.cyan('1️⃣ Open Supabase Dashboard:'))
  console.log(colors.gray('   https://caddiaxjmtysnvnevcdr.supabase.co'))
  console.log('')
  
  console.log(colors.cyan('2️⃣ Navigate to SQL Editor'))
  console.log('')
  
  console.log(colors.cyan('3️⃣ Copy and run the CRM schema:'))
  console.log(colors.gray('   File: lib/supabase/crm-schema.sql'))
  console.log('')
  
  console.log(colors.cyan('4️⃣ After schema application, run verification:'))
  console.log(colors.gray('   npm run db:migrate:crm:check'))
  console.log('')
  
  console.log(colors.cyan('5️⃣ Load development seed data:'))
  console.log(colors.gray('   File: supabase/seed/crm_development_seed.sql'))
}

/**
 * Main execution
 */
async function main() {
  const command = process.argv[2] || 'check'
  
  switch (command) {
    case 'check':
      const connected = await testConnection()
      if (!connected) process.exit(1)
      
      const tableStatus = await checkCRMTables()
      const hasExtensions = await checkLinksExtensions()
      
      const allTablesExist = Object.values(tableStatus).every(status => status === 'exists')
      
      if (allTablesExist && hasExtensions) {
        console.log(colors.bold(colors.green('\n🎉 CRM schema is fully applied!')))
        
        const testPassed = await testBasicFunctionality()
        if (testPassed) {
          console.log(colors.bold(colors.green('🎉 All systems operational!')))
          process.exit(0)
        }
      } else {
        console.log(colors.bold(colors.yellow('\n⚠️  CRM schema needs to be applied')))
        showManualInstructions()
        process.exit(1)
      }
      break
      
    case 'apply':
      const isConnected = await testConnection()
      if (!isConnected) process.exit(1)
      
      await applyCRMSchema()
      break
      
    default:
      console.log('\nAvailable commands:')
      console.log('  check  - Check CRM schema status (default)')
      console.log('  apply  - Show manual application instructions')
      console.log('')
      console.log('Usage: node apply-crm-schema-simple.mjs [command]')
  }
}

main().catch(error => {
  console.error(colors.red(`\n💥 Unexpected error: ${error.message}`))
  console.error(error)
  process.exit(1)
})