/**
 * Simple test for Supabase client to achieve code coverage
 */

// Set up environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
    auth: jest.fn(),
    storage: jest.fn()
  }))
}))

describe('Supabase Client Coverage', () => {
  it('should import and use client module', async () => {
    // ARRANGE & ACT
    const clientModule = await import('../client')
    
    // ASSERT
    expect(clientModule).toBeDefined()
    expect(clientModule.supabase).toBeDefined()
    expect(clientModule.createClient).toBeDefined()
    expect(typeof clientModule.createClient).toBe('function')
  })

  it('should create client instance', async () => {
    // ARRANGE
    const clientModule = await import('../client')
    
    // ACT
    const client = clientModule.createClient()
    
    // ASSERT
    expect(client).toBeDefined()
  })

  it('should export default client', async () => {
    // ARRANGE & ACT
    const defaultClient = await import('../client')
    
    // ASSERT
    expect(defaultClient.default).toBeDefined()
    expect(defaultClient.supabase).toBe(defaultClient.default)
  })
})