#!/usr/bin/env node

/**
 * Apply Database Schema Script
 * Applies the updated schema directly to Supabase using the API
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://caddiaxjmtysnvnevcdr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchema() {
  console.log('🚀 Applying Database Schema to Supabase');
  console.log('======================================');
  
  try {
    // Read the updated schema
    const schemaPath = path.join(__dirname, '..', 'lib', 'supabase', 'schema-updated.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    console.log('📄 Schema loaded from:', schemaPath);
    console.log('📊 Schema size:', Math.round(schema.length / 1024), 'KB');
    console.log('');
    
    // Note: We can't execute DDL directly via the Supabase client
    // This needs to be done via the SQL editor in the dashboard
    console.log('⚠️  Important: Raw SQL execution requires dashboard access');
    console.log('');
    console.log('📋 Manual Setup Required:');
    console.log('========================');
    console.log('');
    console.log('1. Go to Supabase SQL Editor:');
    console.log(`   https://supabase.com/dashboard/project/caddiaxjmtysnvnevcdr/sql/new`);
    console.log('');
    console.log('2. Copy this schema and paste it there:');
    console.log('');
    console.log('='.repeat(50));
    console.log(schema);
    console.log('='.repeat(50));
    console.log('');
    console.log('3. Click "Run" to execute the schema');
    console.log('');
    console.log('4. Verify with: node scripts/setup-database.js');
    
  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
    process.exit(1);
  }
}

// Run the schema application
applySchema();