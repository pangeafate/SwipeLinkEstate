// test/index.d.ts - TypeScript declarations for test infrastructure

// Mock Property types
export interface MockProperty {
  id: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  type: string
  status: string
  description: string
  features: string[]
  images: string[]
  agent_id: string
  created_at: string
  updated_at: string
}

// Mock Link types
export interface MockLink {
  id: string
  code: string
  name: string
  property_ids: string[]
  agent_id: string
  created_at: string
  expires_at: string | null
  view_count: number
}

// Mock Activity types
export interface MockActivity {
  id: string
  type: string
  property_id: string
  link_id: string
  session_id: string
  timestamp: string
  metadata: Record<string, any>
}

// Factory functions
export function createMockProperty(overrides?: Partial<MockProperty>): MockProperty
export function createMockLink(overrides?: Partial<MockLink>): MockLink
export function createMockActivity(overrides?: Partial<MockActivity>): MockActivity

// Supabase Mock Factory
export class SupabaseMockFactory {
  static createSuccessMock(data: any): any
  static createErrorMock(message?: string, code?: string): any
  static createComplexQueryMock(config: {
    table: string
    chains?: string[]
    data: any
    error?: any
  }): any
  static createRealtimeMock(callback: Function): any
  static createStorageMock(config?: any): any
  static createAuthMock(config?: any): any
  static createPaginationMock(allData: any[], pageSize?: number): any
}

// Test setup utilities
export function setupTest(): {
  getQueryClient: () => any
  getWrapper: () => React.ComponentType
}

export function waitForAsync(ms?: number): Promise<void>
export function flushPromises(): Promise<void>
export function mockFetchResponse(data: any, options?: any): any
export function mockFetchError(message?: string): Error

// Constants
export const TEST_TIMEOUTS: {
  unit: number
  integration: number
  e2e: number
}

export const TEST_IDS: {
  propertyCard: string
  linkModal: string
  dashboard: string
  carousel: string
  analyticsChart: string
}

// Default export
declare const testUtils: {
  factories: any
  create: any
  utils: any
  supabase: any
  constants: any
  presets: any
}

export default testUtils