/**
 * Test Utils - Main Export
 * 
 * This file exports all test utilities for easy importing.
 * Import specific utilities or use the default export for everything.
 * 
 * Usage:
 * import { createMockProperty, QueryWrapper, TestSetup } from '@/test/utils'
 * import testUtils from '@/test/utils'
 */

// Mock Data Factories
export {
  PropertyFactory,
  LinkFactory,
  AnalyticsFactory,
  SessionFactory,
  SessionDataFactory,
  UserFactory,
  DealFactory,
  TaskFactory,
  FormFactory,
  ErrorFactory,
  createMockProperty,
  createMockLink,
  createMockAnalytics,
  createMockSession,
  createMockSessionData,
  createMockUser,
  createMockDeal,
  createMockTask,
  presets
} from './mockData.js'

// React Query Wrapper
export {
  QueryWrapper,
  createTestQueryClient,
  createQueryWrapper,
  withQueryClient,
  waitForQueriesToSettle,
  clearQueryCache,
  mockQueries,
  setQueriesLoading,
  queryConfigs
} from './queryWrapper.jsx'

// Test Setup Utilities
export {
  TestSetup,
  TimerUtils,
  DOMUtils,
  NetworkUtils,
  FormUtils,
  A11yUtils,
  PerformanceUtils,
  TestPatterns,
  waitFor,
  waitForNextUpdate,
  flushPromises,
  setupTest,
  mockSupabase
} from './testSetup.js'

// Re-export default objects for convenience
export { default as mockDataFactories } from './mockData.js'
export { default as queryWrapperDefault } from './queryWrapper.jsx'
export { default as testSetup } from './testSetup.js'

// Composite default export
export default {
  // Mock Data
  PropertyFactory: require('./mockData.js').PropertyFactory,
  LinkFactory: require('./mockData.js').LinkFactory,
  AnalyticsFactory: require('./mockData.js').AnalyticsFactory,
  SessionFactory: require('./mockData.js').SessionFactory,
  SessionDataFactory: require('./mockData.js').SessionDataFactory,
  UserFactory: require('./mockData.js').UserFactory,
  DealFactory: require('./mockData.js').DealFactory,
  TaskFactory: require('./mockData.js').TaskFactory,
  FormFactory: require('./mockData.js').FormFactory,
  ErrorFactory: require('./mockData.js').ErrorFactory,
  createMockProperty: require('./mockData.js').createMockProperty,
  createMockLink: require('./mockData.js').createMockLink,
  createMockAnalytics: require('./mockData.js').createMockAnalytics,
  createMockSession: require('./mockData.js').createMockSession,
  createMockSessionData: require('./mockData.js').createMockSessionData,
  createMockUser: require('./mockData.js').createMockUser,
  createMockDeal: require('./mockData.js').createMockDeal,
  createMockTask: require('./mockData.js').createMockTask,
  presets: require('./mockData.js').presets,

  // Query Utilities
  QueryWrapper: require('./queryWrapper.jsx').QueryWrapper,
  createTestQueryClient: require('./queryWrapper.jsx').createTestQueryClient,
  createQueryWrapper: require('./queryWrapper.jsx').createQueryWrapper,
  withQueryClient: require('./queryWrapper.jsx').withQueryClient,
  queryConfigs: require('./queryWrapper.jsx').queryConfigs,

  // Test Setup
  TestSetup: require('./testSetup.js').TestSetup,
  setupTest: require('./testSetup.js').setupTest,
  mockSupabase: require('./testSetup.js').mockSupabase,
  TimerUtils: require('./testSetup.js').TimerUtils,
  DOMUtils: require('./testSetup.js').DOMUtils,
  NetworkUtils: require('./testSetup.js').NetworkUtils,
  FormUtils: require('./testSetup.js').FormUtils,
  TestPatterns: require('./testSetup.js').TestPatterns,
  waitFor: require('./testSetup.js').waitFor,
  flushPromises: require('./testSetup.js').flushPromises
}