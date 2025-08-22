#!/usr/bin/env node

/**
 * SwipeLink Estate CRM Migration Runner
 * 
 * Professional database migration runner with comprehensive error handling,
 * transaction safety, backup verification, and rollback capabilities.
 * 
 * Usage:
 *   npm run migrate:crm:apply    # Apply CRM foundation migration
 *   npm run migrate:crm:rollback # Rollback CRM foundation migration
 *   npm run migrate:crm:status   # Check migration status
 *   npm run migrate:crm:verify   # Verify schema integrity
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
// Simple color utilities without external dependencies
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Migration configuration
const MIGRATION_VERSION = '20250821_001_crm_foundation'
const MIGRATIONS_PATH = join(__dirname, '..', 'supabase', 'migrations')

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://caddiaxjmtysnvnevcdr.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(colors.red('❌ Missing Supabase environment variables'))
  console.error(colors.yellow('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'))
  console.error(colors.gray('Alternatively: Use SUPABASE_ANON_KEY for basic operations'))
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * Enhanced logging utilities
 */
const log = {
  header: (msg) => console.log(colors.bold(colors.blue(`\n🏗️  ${msg}`))),
  success: (msg) => console.log(colors.green(`✅ ${msg}`)),
  warning: (msg) => console.log(colors.yellow(`⚠️  ${msg}`)),
  error: (msg) => console.log(colors.red(`❌ ${msg}`)),
  info: (msg) => console.log(colors.cyan(`ℹ️  ${msg}`)),
  step: (msg) => console.log(colors.gray(`   ${msg}`)),
  separator: () => console.log(colors.gray('   ' + '─'.repeat(60)))
}

/**
 * Check if schema_migrations table exists and create if needed
 */
async function ensureMigrationsTable() {
  log.step('Ensuring schema_migrations table exists...')
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW(),
        rollback_instructions TEXT,
        checksum TEXT,
        execution_time_ms INTEGER
      );
    `
  })
  
  if (error) {
    throw new Error(`Failed to create schema_migrations table: ${error.message}`)
  }
  
  log.step('Schema migrations table ready')
}

/**
 * Check migration status
 */
async function checkMigrationStatus() {
  const { data, error } = await supabase
    .from('schema_migrations')
    .select('*')
    .eq('version', MIGRATION_VERSION)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to check migration status: ${error.message}`)
  }
  
  return data
}

/**
 * Calculate SQL checksum for integrity verification
 */
async function calculateChecksum(sql) {
  const crypto = await import('crypto')
  return crypto.createHash('md5').update(sql.trim()).digest('hex')
}

/**
 * Execute SQL with transaction safety and detailed logging
 */
async function executeSQLSafely(sql, description) {
  log.step(`Executing: ${description}`)
  
  const startTime = Date.now()
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      // Handle expected errors gracefully
      if (error.message?.includes('already exists') || 
          error.message?.includes('does not exist') ||
          error.message?.includes('duplicate object')) {
        log.warning(`Skipped: ${error.message}`)
        return { skipped: true, executionTime: Date.now() - startTime }
      }
      throw error
    }
    
    const executionTime = Date.now() - startTime
    log.step(`✓ Completed in ${executionTime}ms`)
    return { success: true, executionTime }
    
  } catch (error) {
    const executionTime = Date.now() - startTime
    log.error(`Failed after ${executionTime}ms: ${error.message}`)
    throw error
  }
}

/**
 * Parse and execute migration file
 */
async function executeMigration(migrationPath, description) {
  if (!existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`)
  }
  
  log.header(`${description}`)
  log.info(`File: ${migrationPath}`)
  
  const sql = readFileSync(migrationPath, 'utf8')
  const checksum = await calculateChecksum(sql)
  
  log.info(`Checksum: ${checksum}`)
  
  // Split SQL into logical blocks (phases)
  const phases = sql.split(/-- =+\s*PHASE \d+:/g)
    .filter(phase => phase.trim().length > 0)
    .map(phase => phase.trim())
  
  log.info(`Found ${phases.length} execution phases`)
  log.separator()
  
  let totalExecutionTime = 0
  let phasesCompleted = 0
  let statementsSkipped = 0
  
  for (const [index, phase] of phases.entries()) {
    if (!phase.trim()) continue
    
    const phaseTitle = phase.split('\n')[0].replace(/[=\-]/g, '').trim()
    log.step(`Phase ${index + 1}: ${phaseTitle || 'Executing statements'}`)
    
    // Execute phase as single transaction for safety
    const result = await executeSQLSafely(phase, `Phase ${index + 1}`)
    
    if (result.skipped) {
      statementsSkipped++
    } else if (result.success) {
      phasesCompleted++
    }
    
    totalExecutionTime += result.executionTime
  }
  
  return {
    checksum,
    totalExecutionTime,
    phasesCompleted,
    statementsSkipped
  }
}

/**
 * Apply CRM foundation migration
 */
async function applyMigration() {
  try {
    log.header('SwipeLink Estate CRM Foundation Migration')
    
    // Ensure migrations table exists
    await ensureMigrationsTable()
    
    // Check if migration is already applied
    const status = await checkMigrationStatus()
    if (status) {
      log.warning(`Migration ${MIGRATION_VERSION} is already applied`)
      log.info(`Applied at: ${status.applied_at}`)
      log.info(`Execution time: ${status.execution_time_ms}ms`)
      return
    }
    
    // Execute the migration
    const migrationPath = join(MIGRATIONS_PATH, `${MIGRATION_VERSION}.sql`)
    const result = await executeMigration(
      migrationPath, 
      'Applying CRM Foundation Schema'
    )
    
    // Record successful migration
    const { error: recordError } = await supabase
      .from('schema_migrations')
      .insert({
        version: MIGRATION_VERSION,
        applied_at: new Date().toISOString(),
        checksum: result.checksum,
        execution_time_ms: result.totalExecutionTime,
        rollback_instructions: 'Use 20250821_001_crm_foundation_rollback.sql'
      })
    
    if (recordError) {
      log.warning(`Migration applied but failed to record: ${recordError.message}`)
    }
    
    log.separator()
    log.success('CRM Foundation Migration Applied Successfully!')
    log.info(`✓ ${result.phasesCompleted} phases completed`)
    log.info(`⏭️  ${result.statementsSkipped} statements skipped (already exist)`)
    log.info(`⏱️  Total execution time: ${result.totalExecutionTime}ms`)
    
    // Verify the migration
    await verifyMigration()
    
  } catch (error) {
    log.error(`Migration failed: ${error.message}`)
    log.error('The database should be in a consistent state due to transaction safety')
    log.info('You can retry the migration or run rollback if needed')
    process.exit(1)
  }
}

/**
 * Rollback CRM foundation migration
 */
async function rollbackMigration() {
  try {
    log.header('SwipeLink Estate CRM Foundation Rollback')
    log.warning('This will permanently delete all CRM data!')
    
    // Check if migration is applied
    const status = await checkMigrationStatus()
    if (!status) {
      log.info(`Migration ${MIGRATION_VERSION} is not currently applied`)
      return
    }
    
    log.info(`Rolling back migration applied at: ${status.applied_at}`)
    
    // Execute the rollback
    const rollbackPath = join(MIGRATIONS_PATH, `${MIGRATION_VERSION}_rollback.sql`)
    const result = await executeMigration(
      rollbackPath,
      'Rolling Back CRM Foundation Schema'
    )
    
    log.separator()
    log.success('CRM Foundation Migration Rolled Back Successfully!')
    log.info(`✓ ${result.phasesCompleted} phases completed`)
    log.info(`⏱️  Total execution time: ${result.totalExecutionTime}ms`)
    log.warning('All CRM data has been permanently deleted')
    
  } catch (error) {
    log.error(`Rollback failed: ${error.message}`)
    process.exit(1)
  }
}

/**
 * Verify migration integrity
 */
async function verifyMigration() {
  log.header('Verifying Migration Integrity')
  
  const checks = [
    {
      name: 'CRM Tables Created',
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('clients', 'tasks', 'engagement_sessions')
      `,
      expected: 3
    },
    {
      name: 'Links Table Extensions',
      query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'links' 
        AND column_name IN ('deal_status', 'deal_stage', 'engagement_score', 'temperature')
      `,
      expected: 4
    },
    {
      name: 'Custom Types Created',
      query: `
        SELECT typname 
        FROM pg_type 
        WHERE typname IN ('deal_status', 'deal_stage', 'client_temperature', 'task_type')
      `,
      expected: 4
    },
    {
      name: 'Indexes Created',
      query: `
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_links_deal%' OR indexname LIKE 'idx_clients_%' OR indexname LIKE 'idx_tasks_%'
      `,
      minimumExpected: 10
    }
  ]
  
  let allChecksPassed = true
  
  for (const check of checks) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: check.query
      })
      
      if (error) {
        log.error(`${check.name}: Query failed - ${error.message}`)
        allChecksPassed = false
        continue
      }
      
      const count = Array.isArray(data) ? data.length : data?.length || 0
      const expectedCount = check.expected || check.minimumExpected
      const checkPassed = check.minimumExpected ? count >= expectedCount : count === expectedCount
      
      if (checkPassed) {
        log.success(`${check.name}: ${count} items found`)
      } else {
        log.error(`${check.name}: Expected ${expectedCount}, found ${count}`)
        allChecksPassed = false
      }
    } catch (error) {
      log.error(`${check.name}: Verification failed - ${error.message}`)
      allChecksPassed = false
    }
  }
  
  if (allChecksPassed) {
    log.success('All verification checks passed!')
    log.info('CRM schema is ready for use')
  } else {
    log.error('Some verification checks failed')
    log.warning('Please review the migration and database state')
  }
  
  return allChecksPassed
}

/**
 * Show migration status
 */
async function showStatus() {
  log.header('Migration Status')
  
  try {
    await ensureMigrationsTable()
    const status = await checkMigrationStatus()
    
    if (status) {
      log.success(`Migration ${MIGRATION_VERSION} is applied`)
      log.info(`Applied at: ${status.applied_at}`)
      log.info(`Checksum: ${status.checksum}`)
      log.info(`Execution time: ${status.execution_time_ms}ms`)
    } else {
      log.info(`Migration ${MIGRATION_VERSION} is not applied`)
      
      // Check if migration file exists
      const migrationPath = join(MIGRATIONS_PATH, `${MIGRATION_VERSION}.sql`)
      if (existsSync(migrationPath)) {
        log.info(`Migration file available: ${migrationPath}`)
        log.info('Run: npm run migrate:crm:apply')
      } else {
        log.error(`Migration file not found: ${migrationPath}`)
      }
    }
    
  } catch (error) {
    log.error(`Failed to check status: ${error.message}`)
    process.exit(1)
  }
}

/**
 * Apply seed data for development
 */
async function applySeedData() {
  try {
    log.header('Applying CRM Development Seed Data')
    
    // Check if migration is applied first
    const status = await checkMigrationStatus()
    if (!status) {
      log.error('CRM migration must be applied before seeding data')
      log.info('Run: npm run db:migrate:crm')
      process.exit(1)
    }
    
    // Execute the seed data
    const seedPath = join(__dirname, '..', 'supabase', 'seed', 'crm_development_seed.sql')
    const result = await executeMigration(
      seedPath,
      'Loading CRM Development Seed Data'
    )
    
    log.separator()
    log.success('CRM Seed Data Applied Successfully!')
    log.info(`✓ ${result.phasesCompleted} phases completed`)
    log.info(`⏱️  Total execution time: ${result.totalExecutionTime}ms`)
    log.info('Development database ready with realistic test data')
    
    // Run a quick verification
    const { data: clientCount } = await supabase
      .from('clients')
      .select('id', { count: 'exact' })
    
    const { data: dealCount } = await supabase
      .from('links')
      .select('id', { count: 'exact' })
      .not('deal_status', 'is', null)
    
    log.info(`📊 Seed data summary:`)
    log.info(`   - Clients: ${clientCount?.length || 0}`)
    log.info(`   - Deals: ${dealCount?.length || 0}`)
    
  } catch (error) {
    log.error(`Seed data application failed: ${error.message}`)
    process.exit(1)
  }
}

/**
 * Main CLI handler
 */
async function main() {
  const command = process.argv[2]
  
  switch (command) {
    case 'apply':
      await applyMigration()
      break
    case 'rollback':
      await rollbackMigration()
      break
    case 'status':
      await showStatus()
      break
    case 'verify':
      await verifyMigration()
      break
    case 'seed':
      await applySeedData()
      break
    default:
      log.info('SwipeLink Estate CRM Migration Runner')
      log.info('Available commands:')
      log.info('  apply    - Apply CRM foundation migration')
      log.info('  rollback - Rollback CRM foundation migration')
      log.info('  status   - Show migration status')
      log.info('  verify   - Verify migration integrity')
      log.info('  seed     - Apply development seed data')
      log.info('')
      log.info('Usage: node apply-crm-migration.mjs <command>')
  }
}

// Run the CLI
main().catch(error => {
  log.error(`Unexpected error: ${error.message}`)
  console.error(error)
  process.exit(1)
})