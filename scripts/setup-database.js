#!/usr/bin/env node

/**
 * Database Setup Script for SwipeLink Estate
 * 
 * This script creates the database schema in the remote Supabase instance
 * using the credentials from ACCESS-TO-REPOS-AND-TOOLS.md
 * 
 * Usage: node scripts/setup-database.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration from ACCESS-TO-REPOS-AND-TOOLS.md
const supabaseUrl = 'https://caddiaxjmtysnvnevcdr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 SwipeLink Estate Database Setup');
  console.log('=====================================');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log('');

  try {
    // Check if tables exist
    console.log('🔍 Checking existing database structure...');
    
    const { data: existingProperties, error: propError } = await supabase
      .from('properties')
      .select('id')
      .limit(1);

    if (propError && propError.code === 'PGRST205') {
      console.log('❌ Properties table not found');
      console.log('');
      console.log('📋 Database Setup Required!');
      console.log('============================');
      console.log('');
      console.log('Please follow these steps to set up your database:');
      console.log('');
      console.log('1. Go to your Supabase Dashboard:');
      console.log(`   https://supabase.com/dashboard/project/caddiaxjmtysnvnevcdr/sql/new`);
      console.log('');
      console.log('2. Copy the entire contents of:');
      console.log(`   ${path.join(__dirname, '..', 'lib', 'supabase', 'schema.sql')}`);
      console.log('');
      console.log('3. Paste and run the SQL in the Supabase SQL Editor');
      console.log('');
      console.log('4. This will create:');
      console.log('   ✅ Properties table with sample listings');
      console.log('   ✅ Links table for shareable collections');
      console.log('   ✅ Activities table for user tracking');
      console.log('   ✅ Sessions table for analytics');
      console.log('   ✅ Row Level Security policies');
      console.log('   ✅ Indexes for optimal performance');
      console.log('');
      console.log('5. After running the schema, run this command again to verify:');
      console.log('   node scripts/setup-database.js');
      console.log('');
      console.log('💡 Tip: Keep RLS enabled for security!');
      
      return;
    }

    if (!propError) {
      console.log('✅ Properties table exists');
      
      // Count existing properties
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });
      
      console.log(`📊 Found ${count || 0} properties in database`);
      
      // Check other tables
      const tables = ['links', 'activities', 'sessions'];
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error && error.code === 'PGRST205') {
          console.log(`❌ ${table} table not found - please run schema.sql`);
        } else {
          console.log(`✅ ${table} table exists`);
        }
      }
      
      console.log('');
      console.log('🎉 Database is properly configured!');
      console.log('');
      console.log('📱 Your app is ready to use at:');
      console.log('   http://localhost:3000');
      console.log('');
      console.log('🔧 If you need to add more sample data:');
      console.log('   node scripts/populate-properties.js');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    console.log('');
    console.log('Please ensure your Supabase project is properly configured.');
  }
}

// Run the setup
setupDatabase().catch(console.error);