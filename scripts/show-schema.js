#!/usr/bin/env node

/**
 * Schema Display Script
 * Shows the SQL schema that needs to be run in Supabase
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'lib', 'supabase', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');

console.log('📋 Copy this entire SQL and run it in your Supabase SQL Editor:');
console.log('   https://supabase.com/dashboard/project/caddiaxjmtysnvnevcdr/sql/new');
console.log('');
console.log('================== START SQL ==================');
console.log(schema);
console.log('================== END SQL ==================');
console.log('');
console.log('After running the SQL, verify with:');
console.log('   node scripts/setup-database.js');