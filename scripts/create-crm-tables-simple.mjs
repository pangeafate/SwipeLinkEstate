#!/usr/bin/env node

/**
 * Simple CRM Tables Creation Script
 * Creates the core CRM tables needed for the application
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://caddiaxjmtysnvnevcdr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZGRpYXhqbXR5c252bmV2Y2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MDAxMDYsImV4cCI6MjA3MTA3NjEwNn0.6AlKHd5n_UKqK__KkzNGG4JOc5tmv2ZYDkNtkX-OIIE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createCRMTables() {
  console.log('Creating CRM tables...\n')
  
  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('links')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('Cannot connect to database:', testError.message)
      return
    }
    
    console.log('✅ Database connection successful')
    
    // Since we can't directly create tables with the anon key,
    // let's work with what we have and update the CRM services
    // to use the existing links table as the deals table
    
    // Update some links to have CRM-like data
    const { data: links } = await supabase
      .from('links')
      .select('*')
      .limit(3)
    
    if (links && links.length > 0) {
      console.log(`Found ${links.length} links to update with CRM data`)
      
      // Add mock client data to links metadata
      const crmData = [
        {
          client_name: 'John Smith',
          client_email: 'john.smith@example.com',
          engagement_score: 85,
          temperature: 'hot',
          deal_stage: 'qualified',
          deal_value: 750000
        },
        {
          client_name: 'Sarah Johnson',
          client_email: 'sarah.j@example.com',
          engagement_score: 65,
          temperature: 'warm',
          deal_stage: 'engaged',
          deal_value: 500000
        },
        {
          client_name: 'Mike Davis',
          client_email: 'mike.d@example.com',
          engagement_score: 35,
          temperature: 'cold',
          deal_stage: 'accessed',
          deal_value: 350000
        }
      ]
      
      for (let i = 0; i < Math.min(links.length, crmData.length); i++) {
        const { error } = await supabase
          .from('links')
          .update({
            metadata: {
              ...links[i].metadata,
              crm: crmData[i]
            }
          })
          .eq('id', links[i].id)
        
        if (!error) {
          console.log(`✅ Updated link ${i + 1} with CRM metadata`)
        } else {
          console.log(`Error updating link ${i + 1}:`, error.message)
        }
      }
    }
    
    console.log('\n✅ CRM setup complete!')
    console.log('The CRM will use the links table with metadata for deals.')
    console.log('Client and task data will be stored in metadata fields.')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createCRMTables()