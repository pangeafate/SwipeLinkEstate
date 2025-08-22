/**
 * Test Mocks - Main Export
 * 
 * This file exports all mock implementations for easy importing.
 * 
 * Usage:
 * import { SupabaseMockFactory, MockImage, mockModules } from '@/test/mocks'
 * import mocks from '@/test/mocks'
 */

// Supabase Mock Factory
export {
  SupabaseMockFactory,
  mockSupabaseSuccess,
  mockSupabaseError,
  mockSupabaseProperties,
  mockSupabaseLinks,
  mockSupabaseActivities,
  testScenarios
} from './supabase.js'

// Next.js Navigation Mocks
export {
  createMockRouter,
  createUseRouterMock,
  createUsePathnameMock,
  createUseSearchParamsMock,
  createUseParamsMock,
  mockNextNavigation,
  clearNavigationMocks,
  expectNavigation,
  NavigationSimulator,
  mockNextImage
} from './nextNavigation.js'

// Component Mocks
export {
  // Next.js mocks
  MockImage,
  MockLink,
  MockHead,
  
  // Chart mocks
  MockChart,
  MockLine,
  MockBar,
  MockPie,
  MockDoughnut,
  MockResponsiveContainer,
  MockLineChart,
  MockBarChart,
  MockXAxis,
  MockYAxis,
  MockCartesianGrid,
  MockTooltip,
  MockLegend,
  
  // Animation mocks
  MockMotionDiv,
  MockAnimatePresence,
  MockSpring,
  MockTransition,
  
  // UI mocks
  MockModal,
  MockToast,
  MockDropdown,
  MockDatePicker,
  MockFileUpload,
  MockRichTextEditor,
  
  // Layout mocks
  MockGrid,
  MockGridItem,
  MockFlex,
  
  // Loading mocks
  MockSpinner,
  MockSkeleton,
  
  // Data display mocks
  MockTable,
  MockPagination,
  
  // Factory and utilities
  MockComponentFactory,
  mockModules
} from './components.js'

// Re-export defaults
export { default as supabaseMockFactory } from './supabase.js'
export { default as componentMocks } from './components.js'

// Composite default export
export default {
  // Supabase
  SupabaseMockFactory: require('./supabase.js').SupabaseMockFactory,
  mockSupabaseSuccess: require('./supabase.js').mockSupabaseSuccess,
  mockSupabaseError: require('./supabase.js').mockSupabaseError,
  mockSupabaseProperties: require('./supabase.js').mockSupabaseProperties,
  testScenarios: require('./supabase.js').testScenarios,

  // Next.js Navigation
  mockNextNavigation: require('./nextNavigation.js').mockNextNavigation,
  createMockRouter: require('./nextNavigation.js').createMockRouter,
  clearNavigationMocks: require('./nextNavigation.js').clearNavigationMocks,
  expectNavigation: require('./nextNavigation.js').expectNavigation,

  // Components
  MockImage: require('./components.js').MockImage,
  MockLink: require('./components.js').MockLink,
  MockChart: require('./components.js').MockChart,
  MockModal: require('./components.js').MockModal,
  MockComponentFactory: require('./components.js').MockComponentFactory,
  mockModules: require('./components.js').mockModules
}