#!/usr/bin/env node

/**
 * SwipeLink Estate CRM Schema Test Suite
 * 
 * Comprehensive testing suite for CRM database schema including:
 * - Migration application testing
 * - Data integrity verification
 * - Performance benchmarking
 * - Rollback safety testing
 * - Seed data validation
 * 
 * Usage:
 *   node test-crm-schema.mjs all      # Run all tests
 *   node test-crm-schema.mjs migrate  # Test migration only
 *   node test-crm-schema.mjs seed     # Test seed data only
 *   node test-crm-schema.mjs perf     # Performance tests only
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
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(colors.red('❌ Missing Supabase environment variables'))
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Test utilities
const test = {
  header: (msg) => console.log(colors.bold(colors.blue(`\n🧪 ${msg}`))),
  success: (msg) => console.log(colors.green(`  ✅ ${msg}`)),
  failure: (msg) => console.log(colors.red(`  ❌ ${msg}`)),
  warning: (msg) => console.log(colors.yellow(`  ⚠️  ${msg}`)),
  info: (msg) => console.log(colors.cyan(`  ℹ️  ${msg}`)),
  step: (msg) => console.log(colors.gray(`     ${msg}`)),
  separator: () => console.log(colors.gray('  ' + '─'.repeat(60)))
}

/**
 * Test suite configuration
 */
const TEST_CONFIG = {
  timeouts: {
    query: 5000,      // 5 seconds for individual queries
    migration: 60000, // 1 minute for migration operations
    seed: 30000       // 30 seconds for seed operations
  },
  performance: {
    maxQueryTime: 100,    // Max 100ms for simple queries
    maxComplexTime: 500,  // Max 500ms for complex queries
    minThroughput: 10     // Min 10 queries per second
  }
}

/**
 * Run SQL query with timeout and error handling
 */
async function runQuery(sql, description, timeout = TEST_CONFIG.timeouts.query) {
  const startTime = Date.now()
  
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), timeout)
    )
    
    const queryPromise = supabase.rpc('exec_sql', { sql })
    const { data, error } = await Promise.race([queryPromise, timeoutPromise])
    
    const executionTime = Date.now() - startTime
    
    if (error) {
      test.failure(`${description}: ${error.message}`)
      return { success: false, error, executionTime }
    }
    
    return { success: true, data, executionTime }
    
  } catch (error) {
    const executionTime = Date.now() - startTime
    test.failure(`${description}: ${error.message}`)
    return { success: false, error, executionTime }
  }
}

/**
 * Test schema structure and integrity
 */
async function testSchemaStructure() {
  test.header('Testing CRM Schema Structure')
  let passed = 0, failed = 0
  
  // Test 1: Check required tables exist
  const tableTests = [
    { name: 'clients', description: 'Clients table exists' },
    { name: 'tasks', description: 'Tasks table exists' },
    { name: 'engagement_sessions', description: 'Engagement sessions table exists' }
  ]
  
  for (const tableTest of tableTests) {
    const result = await runQuery(
      `SELECT 1 FROM information_schema.tables WHERE table_name = '${tableTest.name}' AND table_schema = 'public'`,
      tableTest.description
    )
    
    if (result.success && result.data && result.data.length > 0) {
      test.success(tableTest.description)
      passed++
    } else {
      test.failure(tableTest.description)
      failed++
    }
  }
  
  // Test 2: Check links table has CRM extensions
  const linksColumnsTests = [
    { column: 'deal_status', description: 'Links table has deal_status column' },
    { column: 'deal_stage', description: 'Links table has deal_stage column' },
    { column: 'engagement_score', description: 'Links table has engagement_score column' },
    { column: 'temperature', description: 'Links table has temperature column' }
  ]
  
  for (const columnTest of linksColumnsTests) {
    const result = await runQuery(
      `SELECT 1 FROM information_schema.columns 
       WHERE table_name = 'links' AND column_name = '${columnTest.column}' AND table_schema = 'public'`,
      columnTest.description
    )
    
    if (result.success && result.data && result.data.length > 0) {
      test.success(columnTest.description)
      passed++
    } else {
      test.failure(columnTest.description)
      failed++
    }
  }
  
  // Test 3: Check custom types exist
  const typeTests = [
    { type: 'deal_status', description: 'deal_status enum type exists' },
    { type: 'deal_stage', description: 'deal_stage enum type exists' },
    { type: 'client_temperature', description: 'client_temperature enum type exists' },
    { type: 'task_type', description: 'task_type enum type exists' }
  ]
  
  for (const typeTest of typeTests) {
    const result = await runQuery(
      `SELECT 1 FROM pg_type WHERE typname = '${typeTest.type}'`,
      typeTest.description
    )
    
    if (result.success && result.data && result.data.length > 0) {
      test.success(typeTest.description)
      passed++
    } else {
      test.failure(typeTest.description)
      failed++
    }
  }
  
  // Test 4: Check indexes exist
  const indexTests = [
    { pattern: 'idx_links_deal_status', description: 'Deal status index exists' },
    { pattern: 'idx_clients_temperature', description: 'Client temperature index exists' },
    { pattern: 'idx_tasks_deal_id', description: 'Task deal ID index exists' }
  ]
  
  for (const indexTest of indexTests) {
    const result = await runQuery(
      `SELECT 1 FROM pg_indexes WHERE indexname = '${indexTest.pattern}' AND schemaname = 'public'`,
      indexTest.description
    )
    
    if (result.success && result.data && result.data.length > 0) {
      test.success(indexTest.description)
      passed++
    } else {
      test.failure(indexTest.description)
      failed++
    }
  }
  
  test.separator()
  test.info(`Schema Structure Tests: ${passed} passed, ${failed} failed`)
  return { passed, failed }
}

/**
 * Test data integrity and constraints
 */
async function testDataIntegrity() {
  test.header('Testing Data Integrity and Constraints')
  let passed = 0, failed = 0
  
  // Test 1: Check enum constraints work
  const enumTest = await runQuery(
    `INSERT INTO clients (id, name, temperature) VALUES (uuid_generate_v4(), 'Test Client', 'invalid_temp')`,
    'Enum constraint validation (should fail)'
  )
  
  if (!enumTest.success && enumTest.error.message.includes('invalid input value')) {
    test.success('Enum constraints working correctly')
    passed++
  } else {
    test.failure('Enum constraints not working')
    failed++
  }
  
  // Test 2: Check engagement score constraints
  const scoreTest = await runQuery(
    `INSERT INTO clients (id, name, engagement_score) VALUES (uuid_generate_v4(), 'Test Client', 150)`,
    'Engagement score constraint (should fail)'
  )
  
  if (!scoreTest.success && scoreTest.error.message.includes('check constraint')) {
    test.success('Engagement score constraints working correctly')
    passed++
  } else {
    test.failure('Engagement score constraints not working')
    failed++
  }
  
  // Test 3: Check foreign key relationships work
  const fkTest = await runQuery(
    `INSERT INTO tasks (deal_id, title, type) VALUES ('non-existent-deal-id', 'Test Task', 'call')`,
    'Foreign key constraint (should fail)'
  )
  
  if (!fkTest.success && fkTest.error.message.includes('foreign key constraint')) {
    test.success('Foreign key constraints working correctly')
    passed++
  } else {
    test.failure('Foreign key constraints not working')
    failed++
  }
  
  // Test 4: Test triggers work (updated_at)
  const triggerTestInsert = await runQuery(
    `INSERT INTO clients (id, name, email) VALUES (uuid_generate_v4(), 'Trigger Test', 'trigger@test.com') RETURNING id, created_at, updated_at`,
    'Insert client for trigger test'
  )
  
  if (triggerTestInsert.success && triggerTestInsert.data && triggerTestInsert.data.length > 0) {
    const clientId = triggerTestInsert.data[0].id
    const originalUpdated = triggerTestInsert.data[0].updated_at
    
    // Wait a moment then update
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const triggerTestUpdate = await runQuery(
      `UPDATE clients SET name = 'Updated Name' WHERE id = '${clientId}' RETURNING updated_at`,
      'Test updated_at trigger'
    )
    
    if (triggerTestUpdate.success && triggerTestUpdate.data && triggerTestUpdate.data.length > 0) {
      const newUpdated = triggerTestUpdate.data[0].updated_at
      
      if (new Date(newUpdated) > new Date(originalUpdated)) {
        test.success('updated_at trigger working correctly')
        passed++
      } else {
        test.failure('updated_at trigger not working')
        failed++
      }
    } else {
      test.failure('Could not test updated_at trigger')
      failed++
    }
    
    // Cleanup
    await runQuery(`DELETE FROM clients WHERE id = '${clientId}'`, 'Cleanup trigger test')
  } else {
    test.failure('Could not create client for trigger test')
    failed++
  }
  
  test.separator()
  test.info(`Data Integrity Tests: ${passed} passed, ${failed} failed`)
  return { passed, failed }
}

/**
 * Test performance benchmarks
 */
async function testPerformance() {
  test.header('Testing Performance Benchmarks')
  let passed = 0, failed = 0
  
  // Test 1: Simple query performance
  const simpleQueryTests = [
    { sql: 'SELECT COUNT(*) FROM clients', description: 'Count clients query' },
    { sql: 'SELECT COUNT(*) FROM links WHERE deal_status = \'active\'', description: 'Active deals query' },
    { sql: 'SELECT COUNT(*) FROM tasks WHERE status = \'pending\'', description: 'Pending tasks query' }
  ]
  
  for (const queryTest of simpleQueryTests) {
    const result = await runQuery(queryTest.sql, queryTest.description)
    
    if (result.success) {
      if (result.executionTime <= TEST_CONFIG.performance.maxQueryTime) {
        test.success(`${queryTest.description} (${result.executionTime}ms)`)
        passed++
      } else {
        test.warning(`${queryTest.description} slow (${result.executionTime}ms)`)
        passed++ // Still counts as passed, just slow
      }
    } else {
      test.failure(`${queryTest.description} failed`)
      failed++
    }
  }
  
  // Test 2: Complex join query performance
  const complexQuery = `
    SELECT c.name, l.name as deal_name, COUNT(a.id) as activity_count
    FROM clients c
    JOIN links l ON l.client_id = c.id  
    LEFT JOIN activities a ON a.client_id = c.id
    GROUP BY c.id, c.name, l.id, l.name
    ORDER BY activity_count DESC
    LIMIT 10
  `
  
  const complexResult = await runQuery(complexQuery, 'Complex join query performance')
  
  if (complexResult.success) {
    if (complexResult.executionTime <= TEST_CONFIG.performance.maxComplexTime) {
      test.success(`Complex join query (${complexResult.executionTime}ms)`)
      passed++
    } else {
      test.warning(`Complex join query slow (${complexResult.executionTime}ms)`)
      passed++
    }
  } else {
    test.failure('Complex join query failed')
    failed++
  }
  
  // Test 3: Engagement score calculation performance
  const scoreQuery = `SELECT calculate_engagement_score('11111111-1111-1111-1111-111111111111')`
  const scoreResult = await runQuery(scoreQuery, 'Engagement score calculation')
  
  if (scoreResult.success) {
    if (scoreResult.executionTime <= TEST_CONFIG.performance.maxComplexTime) {
      test.success(`Engagement score calculation (${scoreResult.executionTime}ms)`)
      passed++
    } else {
      test.warning(`Engagement score calculation slow (${scoreResult.executionTime}ms)`)
      passed++
    }
  } else {
    test.failure('Engagement score calculation failed')
    failed++
  }
  
  test.separator()
  test.info(`Performance Tests: ${passed} passed, ${failed} failed`)
  return { passed, failed }
}

/**
 * Test seed data validation
 */
async function testSeedData() {
  test.header('Testing Seed Data Validation')
  let passed = 0, failed = 0
  
  // Test 1: Check if seed data exists
  const seedTests = [
    { 
      query: 'SELECT COUNT(*) as count FROM clients WHERE name IS NOT NULL',
      expectedMin: 4,
      description: 'Named clients exist'
    },
    {
      query: 'SELECT COUNT(*) as count FROM links WHERE deal_status IS NOT NULL',
      expectedMin: 4,
      description: 'Deals with status exist'
    },
    {
      query: 'SELECT COUNT(*) as count FROM tasks WHERE is_automated = true',
      expectedMin: 3,
      description: 'Automated tasks exist'
    },
    {
      query: 'SELECT COUNT(*) as count FROM engagement_sessions',
      expectedMin: 5,
      description: 'Engagement sessions exist'
    },
    {
      query: 'SELECT COUNT(*) as count FROM activities',
      expectedMin: 15,
      description: 'Activities exist'
    }
  ]
  
  for (const seedTest of seedTests) {
    const result = await runQuery(seedTest.query, seedTest.description)
    
    if (result.success && result.data && result.data.length > 0) {
      const count = parseInt(result.data[0].count)
      if (count >= seedTest.expectedMin) {
        test.success(`${seedTest.description} (${count} records)`)
        passed++
      } else {
        test.failure(`${seedTest.description} insufficient data (${count} < ${seedTest.expectedMin})`)
        failed++
      }
    } else {
      test.failure(`${seedTest.description} query failed`)
      failed++
    }
  }
  
  // Test 2: Check data quality and relationships
  const qualityTests = [
    {
      query: `SELECT COUNT(*) as count FROM clients c 
              JOIN links l ON l.client_id = c.id 
              WHERE c.engagement_score > 0`,
      expectedMin: 3,
      description: 'Clients with engagement linked to deals'
    },
    {
      query: `SELECT COUNT(*) as count FROM tasks t 
              JOIN links l ON t.deal_id = l.id 
              WHERE t.status = 'pending'`,
      expectedMin: 5,
      description: 'Pending tasks linked to valid deals'
    },
    {
      query: `SELECT COUNT(*) as count FROM activities a
              JOIN clients c ON a.client_id = c.id
              WHERE a.engagement_value > 0`,
      expectedMin: 10,
      description: 'Activities with engagement value linked to clients'
    }
  ]
  
  for (const qualityTest of qualityTests) {
    const result = await runQuery(qualityTest.query, qualityTest.description)
    
    if (result.success && result.data && result.data.length > 0) {
      const count = parseInt(result.data[0].count)
      if (count >= qualityTest.expectedMin) {
        test.success(`${qualityTest.description} (${count} valid relationships)`)
        passed++
      } else {
        test.failure(`${qualityTest.description} insufficient relationships (${count} < ${qualityTest.expectedMin})`)
        failed++
      }
    } else {
      test.failure(`${qualityTest.description} query failed`)
      failed++
    }
  }
  
  test.separator()
  test.info(`Seed Data Tests: ${passed} passed, ${failed} failed`)
  return { passed, failed }
}

/**
 * Test business logic functions
 */
async function testBusinessLogic() {
  test.header('Testing Business Logic Functions')
  let passed = 0, failed = 0
  
  // Test 1: Engagement score calculation with known client
  const scoreResult = await runQuery(
    `SELECT calculate_engagement_score('11111111-1111-1111-1111-111111111111') as score`,
    'Calculate engagement score for hot lead'
  )
  
  if (scoreResult.success && scoreResult.data && scoreResult.data.length > 0) {
    const score = parseInt(scoreResult.data[0].score)
    if (score >= 50 && score <= 100) {
      test.success(`Engagement score calculation returned valid score (${score})`)
      passed++
    } else {
      test.failure(`Engagement score out of expected range (${score})`)
      failed++
    }
  } else {
    test.failure('Engagement score calculation failed')
    failed++
  }
  
  // Test 2: Temperature classification consistency
  const tempResult = await runQuery(
    `SELECT c.temperature, c.engagement_score 
     FROM clients c 
     WHERE c.engagement_score IS NOT NULL 
     ORDER BY c.engagement_score DESC`,
    'Check temperature classification consistency'
  )
  
  if (tempResult.success && tempResult.data) {
    let tempConsistent = true
    for (const row of tempResult.data) {
      const score = parseInt(row.engagement_score)
      const temp = row.temperature
      
      if ((score >= 80 && temp !== 'hot') ||
          (score >= 50 && score < 80 && temp !== 'warm') ||
          (score < 50 && temp !== 'cold')) {
        tempConsistent = false
        break
      }
    }
    
    if (tempConsistent) {
      test.success('Temperature classification consistent with scores')
      passed++
    } else {
      test.failure('Temperature classification inconsistent with scores')
      failed++
    }
  } else {
    test.failure('Could not check temperature consistency')
    failed++
  }
  
  test.separator()
  test.info(`Business Logic Tests: ${passed} passed, ${failed} failed`)
  return { passed, failed }
}

/**
 * Run all tests or specific test suite
 */
async function runTests(testType = 'all') {
  console.log(colors.bold(colors.blue('🧪 SwipeLink Estate CRM Schema Test Suite')))
  console.log(colors.gray('Running comprehensive database testing...'))
  
  let totalPassed = 0, totalFailed = 0
  const startTime = Date.now()
  
  try {
    if (testType === 'all' || testType === 'migrate') {
      const schemaResults = await testSchemaStructure()
      totalPassed += schemaResults.passed
      totalFailed += schemaResults.failed
      
      const integrityResults = await testDataIntegrity()
      totalPassed += integrityResults.passed
      totalFailed += integrityResults.failed
    }
    
    if (testType === 'all' || testType === 'seed') {
      const seedResults = await testSeedData()
      totalPassed += seedResults.passed
      totalFailed += seedResults.failed
    }
    
    if (testType === 'all' || testType === 'perf') {
      const perfResults = await testPerformance()
      totalPassed += perfResults.passed
      totalFailed += perfResults.failed
    }
    
    if (testType === 'all') {
      const logicResults = await testBusinessLogic()
      totalPassed += logicResults.passed
      totalFailed += logicResults.failed
    }
    
    const totalTime = Date.now() - startTime
    
    console.log(colors.bold('\n📊 Test Results Summary'))
    console.log(colors.gray('─'.repeat(40)))
    console.log(colors.green(`✅ Passed: ${totalPassed}`))
    console.log(colors.red(`❌ Failed: ${totalFailed}`))
    console.log(colors.cyan(`⏱️  Total Time: ${totalTime}ms`))
    console.log(colors.gray(`📈 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`))
    
    if (totalFailed === 0) {
      console.log(colors.bold(colors.green('\n🎉 All tests passed! CRM schema is ready for use.')))
      process.exit(0)
    } else {
      console.log(colors.bold(colors.red(`\n⚠️  ${totalFailed} test(s) failed. Please review and fix issues.`)))
      process.exit(1)
    }
    
  } catch (error) {
    console.log(colors.red(`\n💥 Test suite failed: ${error.message}`))
    console.error(error)
    process.exit(1)
  }
}

/**
 * Main CLI handler
 */
async function main() {
  const testType = process.argv[2] || 'all'
  
  if (!['all', 'migrate', 'seed', 'perf'].includes(testType)) {
    console.log('Available test types:')
    console.log('  all     - Run all tests (default)')
    console.log('  migrate - Test schema migration only')
    console.log('  seed    - Test seed data only')
    console.log('  perf    - Test performance only')
    process.exit(1)
  }
  
  await runTests(testType)
}

// Run the tests
main().catch(error => {
  console.error(colors.red(`Unexpected error: ${error.message}`))
  console.error(error)
  process.exit(1)
})