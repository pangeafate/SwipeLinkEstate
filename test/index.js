/**
 * Test Infrastructure - Main Export
 * 
 * This is the main entry point for all test utilities, mocks, and fixtures.
 * It provides a unified interface for importing test infrastructure components.
 * 
 * Usage Examples:
 * 
 * // Import specific utilities
 * import { createMockProperty, QueryWrapper, SupabaseMockFactory } from '@/test'
 * 
 * // Import entire test infrastructure
 * import testInfrastructure from '@/test'
 * const { utils, mocks, fixtures } = testInfrastructure
 * 
 * // Import specific modules
 * import { utils, mocks } from '@/test'
 */

// Utils
export * from './utils/index.js'
export { default as utils } from './utils/index.js'

// Mocks
export * from './mocks/index.js'
export { default as mocks } from './mocks/index.js'

// Fixtures
export * from './fixtures/index.js'
export { default as fixtures } from './fixtures/index.js'

// Most commonly used exports for convenience
export {
  // Mock Data Factories
  createMockProperty,
  createMockLink,
  createMockAnalytics,
  createMockSession,
  createMockSessionData,
  createMockUser,
  createMockDeal,
  createMockTask,
  createMockClient,
  createMockActivity,
  PropertyFactory,
  LinkFactory,
  AnalyticsFactory,
  SessionDataFactory,
  DealFactory,
  TaskFactory,
  ClientFactory,
  ActivityFactory,
  
  // Query Utilities
  QueryWrapper,
  createTestQueryClient,
  createQueryWrapper,
  
  // Test Setup
  TestSetup,
  setupTest,
  waitFor,
  flushPromises,
  
  // Supabase Mocks
  SupabaseMockFactory,
  mockSupabaseSuccess,
  mockSupabaseError,
  
  // Component Mocks
  MockImage,
  MockModal,
  MockChart
} from './utils/index.js'

export {
  // Fixtures
  properties,
  links,
  analytics,
  deals,
  clients,
  tasks,
  activities
} from './fixtures/index.js'

// Default export with organized structure
export default {
  // Utilities
  utils: require('./utils/index.js').default,
  
  // Mocks
  mocks: require('./mocks/index.js').default,
  
  // Fixtures
  fixtures: require('./fixtures/index.js').default,
  
  // Quick access to most commonly used items
  common: {
    // Data factories
    createMockProperty: require('./utils/index.js').createMockProperty,
    createMockLink: require('./utils/index.js').createMockLink,
    createMockAnalytics: require('./utils/index.js').createMockAnalytics,
    createMockSessionData: require('./utils/index.js').createMockSessionData,
    createMockDeal: require('./utils/index.js').createMockDeal,
    createMockTask: require('./utils/index.js').createMockTask,
    createMockClient: require('./utils/index.js').createMockClient,
    createMockActivity: require('./utils/index.js').createMockActivity,
    
    // Query utilities
    QueryWrapper: require('./utils/index.js').QueryWrapper,
    createTestQueryClient: require('./utils/index.js').createTestQueryClient,
    setupTest: require('./utils/index.js').setupTest,
    
    // Supabase mocks
    SupabaseMockFactory: require('./mocks/index.js').SupabaseMockFactory,
    mockSupabaseSuccess: require('./mocks/index.js').mockSupabaseSuccess,
    
    // Fixtures
    properties: require('./fixtures/index.js').properties,
    links: require('./fixtures/index.js').links,
    deals: require('./fixtures/index.js').deals,
    clients: require('./fixtures/index.js').clients,
    tasks: require('./fixtures/index.js').tasks,
    activities: require('./fixtures/index.js').activities,
    
    // Helpers
    waitFor: require('./utils/index.js').waitFor,
    flushPromises: require('./utils/index.js').flushPromises
  }
}