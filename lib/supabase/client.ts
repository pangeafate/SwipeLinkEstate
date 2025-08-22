import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Validation function for environment variables
function validateEnvironmentVariables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return { supabaseUrl, supabaseAnonKey }
}

// Validate and get environment variables
const { supabaseUrl, supabaseAnonKey } = validateEnvironmentVariables()

// Create the client instance
const supabaseClient = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)

// Export the factory function for services
export function createClient() {
  return supabaseClient
}

// Export the client instance for direct use
export const supabase = supabaseClient
export default supabase