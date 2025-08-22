// Mock the Supabase client before any imports
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  })),
  auth: {
    signIn: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn()
  },
  storage: {
    from: jest.fn()
  }
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}))

// Set up environment variables before importing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

import { createClient, supabase } from '../client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

describe('Supabase Client', () => {
  describe('Client Creation', () => {
    it('should create client successfully with valid environment variables', () => {
      // ACT
      const client = createClient()

      // ASSERT
      expect(client).toBeDefined()
      expect(client).toBe(mockSupabaseClient)
      expect(typeof client.from).toBe('function')
      expect(typeof client.auth).toBe('object')
      expect(typeof client.storage).toBe('object')
    })

    it('should export supabase client instance', () => {
      // ASSERT
      expect(supabase).toBeDefined()
      expect(supabase).toBe(mockSupabaseClient)
      expect(typeof supabase.from).toBe('function')
    })

    it('should return same client instance from factory function', () => {
      // ACT
      const client1 = createClient()
      const client2 = createClient()

      // ASSERT
      expect(client1).toBe(client2)
      expect(client1).toBe(supabase)
    })

    it('should call createClient with correct parameters', () => {
      // ARRANGE
      const mockCreate = createSupabaseClient as jest.MockedFunction<typeof createSupabaseClient>

      // ACT
      createClient()

      // ASSERT
      expect(mockCreate).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key'
      )
    })
  })

  describe('Client Methods', () => {
    it('should have database query methods', () => {
      // ACT
      const client = createClient()

      // ASSERT
      expect(client.from).toBeDefined()
      expect(typeof client.from).toBe('function')
      
      // Test that from() returns query builder
      const queryBuilder = client.from('test_table')
      expect(queryBuilder.select).toBeDefined()
      expect(queryBuilder.insert).toBeDefined()
      expect(queryBuilder.update).toBeDefined()
      expect(queryBuilder.delete).toBeDefined()
    })

    it('should have auth methods', () => {
      // ACT
      const client = createClient()

      // ASSERT
      expect(client.auth).toBeDefined()
      expect(client.auth.signIn).toBeDefined()
      expect(client.auth.signOut).toBeDefined()
      expect(client.auth.getSession).toBeDefined()
    })

    it('should have storage methods', () => {
      // ACT
      const client = createClient()

      // ASSERT
      expect(client.storage).toBeDefined()
      expect(client.storage.from).toBeDefined()
    })
  })

  describe('Environment Configuration', () => {
    it('should use environment variables for configuration', () => {
      // ARRANGE
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co')
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon-key')

      // ACT
      const client = createClient()

      // ASSERT
      expect(client).toBeDefined()
      
      // Verify createClient was called with env vars
      expect(createSupabaseClient).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    })
  })
})