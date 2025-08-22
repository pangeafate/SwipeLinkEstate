/**
 * Test environment variable validation in Supabase client
 * This covers the validation function that was showing 0% coverage
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

describe('Supabase Client Environment Validation', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env }
    // Clear the module cache to force re-evaluation
    jest.resetModules()
  })

  afterEach(() => {
    // Restore original env
    process.env = originalEnv
  })

  it('should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    // ARRANGE - Remove the URL
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

    // Mock createClient to capture the error
    jest.doMock('@supabase/supabase-js', () => ({
      createClient: jest.fn()
    }))

    // ACT & ASSERT
    expect(() => {
      require('../client')
    }).toThrow('Missing Supabase environment variables')
  })

  it('should throw error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
    // ARRANGE - Remove the key
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Mock createClient
    jest.doMock('@supabase/supabase-js', () => ({
      createClient: jest.fn()
    }))

    // ACT & ASSERT
    expect(() => {
      require('../client')
    }).toThrow('Missing Supabase environment variables')
  })

  it('should throw error when both environment variables are missing', () => {
    // ARRANGE - Remove both
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Mock createClient
    jest.doMock('@supabase/supabase-js', () => ({
      createClient: jest.fn()
    }))

    // ACT & ASSERT
    expect(() => {
      require('../client')
    }).toThrow('Missing Supabase environment variables')
  })

  it('should successfully validate and create client with valid env vars', () => {
    // ARRANGE - Set valid env vars
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    // Mock createClient to return a mock client
    const mockClient = {
      from: jest.fn(),
      auth: {},
      storage: {}
    }

    jest.doMock('@supabase/supabase-js', () => ({
      createClient: jest.fn().mockReturnValue(mockClient)
    }))

    // ACT & ASSERT - Should not throw
    expect(() => {
      const client = require('../client')
      expect(client.supabase).toBeDefined()
      expect(client.createClient).toBeDefined()
      expect(typeof client.createClient).toBe('function')
    }).not.toThrow()
  })

  it('should validate environment variables before creating client', () => {
    // ARRANGE
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const createClientMock = jest.fn()
    jest.doMock('@supabase/supabase-js', () => ({
      createClient: createClientMock
    }))

    // ACT
    require('../client')

    // ASSERT - createClient should be called with the validated env vars
    expect(createClientMock).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    )
  })
})