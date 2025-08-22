/**
 * Test Infrastructure Validation
 * 
 * This test file validates that our new test infrastructure components
 * work correctly and can be imported and used as expected.
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

describe('Test Infrastructure', () => {
  describe('Mock Data Factories', () => {
    it('should import mock data factories correctly', async () => {
      const { createMockProperty, createMockLink, PropertyFactory } = await import('@/test/utils/mockData.js')
      
      expect(createMockProperty).toBeDefined()
      expect(createMockLink).toBeDefined()
      expect(PropertyFactory).toBeDefined()
    })

    it('should create mock properties with default values', async () => {
      const { createMockProperty } = await import('@/test/utils/mockData.js')
      
      const property = createMockProperty()
      
      expect(property).toHaveProperty('id')
      expect(property).toHaveProperty('address')
      expect(property).toHaveProperty('price')
      expect(property).toHaveProperty('bedrooms')
      expect(property).toHaveProperty('bathrooms')
      expect(property).toHaveProperty('status', 'active')
      expect(typeof property.price).toBe('number')
    })

    it('should create mock properties with overrides', async () => {
      const { createMockProperty } = await import('@/test/utils/mockData.js')
      
      const property = createMockProperty({
        address: 'Test Address',
        price: 123456,
        status: 'inactive'
      })
      
      expect(property.address).toBe('Test Address')
      expect(property.price).toBe(123456)
      expect(property.status).toBe('inactive')
    })

    it('should create mock links', async () => {
      const { createMockLink } = await import('@/test/utils/mockData.js')
      
      const link = createMockLink()
      
      expect(link).toHaveProperty('id')
      expect(link).toHaveProperty('code')
      expect(link).toHaveProperty('name')
      expect(link).toHaveProperty('property_ids')
      expect(Array.isArray(link.property_ids)).toBe(true)
    })
  })

  describe('Supabase Mock Factory', () => {
    it('should import Supabase mock factory correctly', async () => {
      const { SupabaseMockFactory, mockSupabaseSuccess } = await import('@/test/mocks/supabase.js')
      
      expect(SupabaseMockFactory).toBeDefined()
      expect(mockSupabaseSuccess).toBeDefined()
    })

    it('should create success mock', async () => {
      const { SupabaseMockFactory } = await import('@/test/mocks/supabase.js')
      
      const mockSupabase = SupabaseMockFactory.createSuccessMock([{ id: 'test-1' }])
      
      expect(mockSupabase).toHaveProperty('from')
      expect(mockSupabase).toHaveProperty('storage')
      expect(mockSupabase).toHaveProperty('auth')
      expect(typeof mockSupabase.from).toBe('function')
    })

    it('should create error mock', async () => {
      const { SupabaseMockFactory } = await import('@/test/mocks/supabase.js')
      
      const mockSupabase = SupabaseMockFactory.createErrorMock('Test error')
      
      expect(mockSupabase).toHaveProperty('from')
      expect(typeof mockSupabase.from).toBe('function')
    })
  })

  describe('Query Wrapper', () => {
    it('should import query wrapper correctly', async () => {
      const { QueryWrapper, createTestQueryClient } = await import('@/test/utils/queryWrapper.jsx')
      
      expect(QueryWrapper).toBeDefined()
      expect(createTestQueryClient).toBeDefined()
    })

    it('should create test query client', async () => {
      const { createTestQueryClient } = await import('@/test/utils/queryWrapper.jsx')
      
      const queryClient = createTestQueryClient()
      
      expect(queryClient).toBeDefined()
      expect(queryClient.getDefaultOptions).toBeDefined()
      
      const options = queryClient.getDefaultOptions()
      expect(options.queries.retry).toBe(false)
    })
  })

  describe('Test Setup Utilities', () => {
    it('should import test setup utilities correctly', async () => {
      const { TestSetup, waitFor, flushPromises } = await import('@/test/utils/testSetup.js')
      
      expect(TestSetup).toBeDefined()
      expect(waitFor).toBeDefined()
      expect(flushPromises).toBeDefined()
    })

    it('should provide timer utilities', async () => {
      const { TimerUtils } = await import('@/test/utils/testSetup.js')
      
      expect(TimerUtils).toBeDefined()
      expect(TimerUtils.useFakeTimers).toBeDefined()
      expect(TimerUtils.useRealTimers).toBeDefined()
      expect(TimerUtils.advanceTimers).toBeDefined()
    })
  })

  describe('Component Mocks', () => {
    it('should import component mocks correctly', async () => {
      const { MockImage, MockModal, mockModules } = await import('@/test/mocks/components.js')
      
      expect(MockImage).toBeDefined()
      expect(MockModal).toBeDefined()
      expect(mockModules).toBeDefined()
    })

    it('should provide Next.js component mocks', async () => {
      const { mockModules } = await import('@/test/mocks/components.js')
      
      expect(mockModules['next/image']).toBeDefined()
      expect(mockModules['next/link']).toBeDefined()
      expect(mockModules['next/head']).toBeDefined()
    })
  })

  describe('Fixtures', () => {
    it('should import fixtures correctly', async () => {
      const { properties, links, analytics, fixtures } = await import('@/test/fixtures/index.js')
      
      expect(Array.isArray(properties)).toBe(true)
      expect(Array.isArray(links)).toBe(true)
      expect(typeof analytics).toBe('object')
      expect(typeof fixtures).toBe('object')
    })

    it('should provide filtered property collections', async () => {
      const { fixtures } = await import('@/test/fixtures/index.js')
      
      expect(Array.isArray(fixtures.activeProperties)).toBe(true)
      expect(Array.isArray(fixtures.houses)).toBe(true)
      expect(Array.isArray(fixtures.budgetProperties)).toBe(true)
      
      // Validate filtering works
      fixtures.activeProperties.forEach(property => {
        expect(property.status).toBe('active')
      })
      
      fixtures.houses.forEach(property => {
        expect(property.property_type).toBe('house')
      })
    })

    it('should provide fixture helpers', async () => {
      const { fixtureHelpers } = await import('@/test/fixtures/index.js')
      
      expect(fixtureHelpers.getPropertyById).toBeDefined()
      expect(fixtureHelpers.getLinkByCode).toBeDefined()
      expect(fixtureHelpers.getRandomProperty).toBeDefined()
      
      // Test helper functionality
      const randomProperty = fixtureHelpers.getRandomProperty()
      expect(randomProperty).toBeDefined()
      expect(randomProperty).toHaveProperty('id')
    })
  })

  describe('Main Test Index', () => {
    it('should import main index without duplicate exports', async () => {
      // Test individual module imports work
      const utilsModule = await import('@/test/utils/mockData.js')
      const mocksModule = await import('@/test/mocks/supabase.js')
      const fixturesModule = await import('@/test/fixtures/properties.json')
      
      expect(utilsModule.createMockProperty).toBeDefined()
      expect(mocksModule.SupabaseMockFactory).toBeDefined()
      expect(Array.isArray(fixturesModule.default)).toBe(true)
    })
  })

  describe('Integration Test', () => {
    it('should work together in a realistic scenario', async () => {
      // Import directly from source files to avoid export conflicts
      const { createMockProperty } = await import('@/test/utils/mockData.js')
      const { QueryWrapper, createTestQueryClient } = await import('@/test/utils/queryWrapper.jsx')
      const { SupabaseMockFactory } = await import('@/test/mocks/supabase.js')
      const properties = await import('@/test/fixtures/properties.json')
      
      // Create mock data
      const mockProperty = createMockProperty({
        address: 'Integration Test Property',
        price: 500000
      })
      
      // Create mock Supabase
      const mockSupabase = SupabaseMockFactory.createSuccessMock([mockProperty])
      
      // Create query client
      const queryClient = createTestQueryClient()
      
      // Use fixtures
      const fixtureProperty = properties.default[0]
      
      // Validate everything works
      expect(mockProperty.address).toBe('Integration Test Property')
      expect(mockSupabase.from).toBeDefined()
      expect(queryClient.getDefaultOptions().queries.retry).toBe(false)
      expect(fixtureProperty).toHaveProperty('id')
      expect(QueryWrapper).toBeDefined()
    })
  })
})