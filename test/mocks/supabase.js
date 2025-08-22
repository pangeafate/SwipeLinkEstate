/**
 * Comprehensive Supabase Mock Factory
 * 
 * This factory provides different mock scenarios for Supabase client testing.
 * It consolidates the 5+ different mocking patterns scattered across test files
 * and provides a consistent API for all test cases.
 */

// Default mock responses for different scenarios
const DEFAULT_RESPONSES = {
  success: { data: [], error: null },
  error: { data: null, error: { message: 'Test error', details: null, hint: null } },
  single: { data: null, error: null },
  empty: { data: [], error: null }
}

/**
 * Creates a chainable query builder mock with method chaining support
 * @param {Object} response - The response to return
 * @param {Object} options - Additional options for query behavior
 */
function createQueryBuilder(response, options = {}) {
  const { enableChaining = true, customMethods = {} } = options
  
  const baseBuilder = {
    select: jest.fn(),
    eq: jest.fn(),
    neq: jest.fn(),
    gt: jest.fn(),
    gte: jest.fn(),
    lt: jest.fn(),
    lte: jest.fn(),
    like: jest.fn(),
    ilike: jest.fn(),
    is: jest.fn(),
    in: jest.fn(),
    contains: jest.fn(),
    containedBy: jest.fn(),
    rangeGt: jest.fn(),
    rangeGte: jest.fn(),
    rangeLt: jest.fn(),
    rangeLte: jest.fn(),
    rangeAdjacent: jest.fn(),
    overlaps: jest.fn(),
    textSearch: jest.fn(),
    match: jest.fn(),
    not: jest.fn(),
    or: jest.fn(),
    filter: jest.fn(),
    order: jest.fn(),
    limit: jest.fn(),
    range: jest.fn(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
    csv: jest.fn(),
    geojson: jest.fn(),
    explain: jest.fn(),
    insert: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    ...customMethods
  }

  if (enableChaining) {
    // Configure method chaining - each method returns the builder itself or a promise
    Object.keys(baseBuilder).forEach(method => {
      if (['single', 'maybeSingle', 'csv', 'geojson'].includes(method)) {
        // Terminal methods return promises
        baseBuilder[method].mockResolvedValue(response)
      } else {
        // Chainable methods return the builder
        baseBuilder[method].mockReturnValue(baseBuilder)
      }
    })
    
    // Override specific terminal methods if response is provided
    baseBuilder.order.mockReturnValue({
      ...baseBuilder,
      then: jest.fn((callback) => callback(response))
    })
  }

  // Add promise-like behavior for direct awaiting
  baseBuilder.then = jest.fn((callback) => callback(response))
  
  return baseBuilder
}

/**
 * Creates a mock for different table operations
 * @param {string} tableName - The table name (properties, links, activities, sessions)
 * @param {Object} scenario - The mock scenario configuration
 */
function createTableMock(tableName, scenario = {}) {
  const {
    selectResponse = DEFAULT_RESPONSES.success,
    insertResponse = { data: { id: 'test-id' }, error: null },
    updateResponse = { data: { id: 'test-id' }, error: null },
    deleteResponse = { data: [], error: null },
    upsertResponse = { data: { id: 'test-id' }, error: null },
    customBehavior = {}
  } = scenario

  const queryBuilder = createQueryBuilder(selectResponse, {
    customMethods: {
      insert: jest.fn(() => createQueryBuilder(insertResponse)),
      update: jest.fn(() => createQueryBuilder(updateResponse)),
      delete: jest.fn(() => createQueryBuilder(deleteResponse)),
      upsert: jest.fn(() => createQueryBuilder(upsertResponse)),
      ...customBehavior
    }
  })

  return queryBuilder
}

/**
 * Creates a storage mock for file operations
 * @param {Object} scenario - The storage mock scenario
 */
function createStorageMock(scenario = {}) {
  const {
    uploadResponse = { data: { path: 'test/path.jpg' }, error: null },
    removeResponse = { data: null, error: null },
    downloadResponse = { data: new Blob(), error: null },
    listResponse = { data: [], error: null }
  } = scenario

  return {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue(uploadResponse),
      remove: jest.fn().mockResolvedValue(removeResponse),
      download: jest.fn().mockResolvedValue(downloadResponse),
      list: jest.fn().mockResolvedValue(listResponse),
      createSignedUrl: jest.fn().mockResolvedValue({
        data: { signedUrl: 'https://example.com/signed-url' },
        error: null
      }),
      createSignedUrls: jest.fn().mockResolvedValue({
        data: [{ signedUrl: 'https://example.com/signed-url' }],
        error: null
      }),
      getPublicUrl: jest.fn(() => ({
        data: { publicUrl: 'https://example.com/public-url' }
      }))
    }))
  }
}

/**
 * Creates a real-time subscription mock for live updates
 * @param {Object} scenario - The subscription mock scenario
 */
function createRealtimeMock(scenario = {}) {
  const {
    channelName = 'test-channel',
    events = [],
    error = null
  } = scenario

  // Mock subscription object
  const mockSubscription = {
    unsubscribe: jest.fn().mockResolvedValue({ error: null })
  }

  // Mock channel object
  const mockChannel = {
    on: jest.fn(function(event, callback) {
      // Store the callback for later triggering
      this._callbacks = this._callbacks || {}
      this._callbacks[event] = callback
      return this
    }),
    subscribe: jest.fn(function(callback) {
      if (callback) {
        callback('SUBSCRIBED', null)
      }
      return mockSubscription
    }),
    send: jest.fn().mockResolvedValue({ error: null }),
    unsubscribe: jest.fn().mockResolvedValue({ error: null }),
    
    // Helper method for triggering events in tests
    _trigger: function(event, payload) {
      if (this._callbacks && this._callbacks[event]) {
        this._callbacks[event](payload)
      }
    }
  }

  return {
    channel: jest.fn(() => mockChannel),
    getChannels: jest.fn(() => [mockChannel]),
    removeChannel: jest.fn().mockResolvedValue({ error: null }),
    removeAllChannels: jest.fn().mockResolvedValue({ error: null }),
    disconnect: jest.fn()
  }
}

/**
 * Creates CRM-specific real-time subscription mocks
 * @param {Object} config - Configuration for CRM subscriptions
 */
function createCRMRealtimeMock(config = {}) {
  const {
    dealUpdates = [],
    taskUpdates = [],
    activityUpdates = [],
    clientUpdates = []
  } = config

  const realtimeMock = createRealtimeMock()
  const originalChannel = realtimeMock.channel

  // Override channel creation to provide CRM-specific channels
  realtimeMock.channel = jest.fn((channelName) => {
    const channel = originalChannel()
    
    // Add CRM-specific helper methods
    channel._triggerDealUpdate = function(deal) {
      this._trigger('postgres_changes', {
        eventType: 'UPDATE',
        schema: 'public', 
        table: 'deals',
        new: deal,
        old: {}
      })
    }

    channel._triggerTaskUpdate = function(task) {
      this._trigger('postgres_changes', {
        eventType: task.status === 'completed' ? 'UPDATE' : 'INSERT',
        schema: 'public',
        table: 'tasks', 
        new: task,
        old: {}
      })
    }

    channel._triggerActivityInsert = function(activity) {
      this._trigger('postgres_changes', {
        eventType: 'INSERT',
        schema: 'public',
        table: 'activities',
        new: activity,
        old: {}
      })
    }

    channel._triggerClientUpdate = function(client) {
      this._trigger('postgres_changes', {
        eventType: 'UPDATE', 
        schema: 'public',
        table: 'clients',
        new: client,
        old: {}
      })
    }

    return channel
  })

  return realtimeMock
}

/**
 * Supabase Mock Factory - Main factory class
 */
export class SupabaseMockFactory {
  /**
   * Creates a success scenario mock
   * @param {Object} data - The data to return
   * @param {Object} tableScenarios - Custom scenarios for specific tables
   */
  static createSuccessMock(data = [], tableScenarios = {}) {
    return {
      from: jest.fn((tableName) => {
        const scenario = tableScenarios[tableName] || { selectResponse: { data, error: null } }
        return createTableMock(tableName, scenario)
      }),
      storage: createStorageMock(),
      realtime: createRealtimeMock(),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
        signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null })
      }
    }
  }

  /**
   * Creates an error scenario mock
   * @param {string|Object} error - The error message or error object
   * @param {Object} tableScenarios - Custom scenarios for specific tables
   */
  static createErrorMock(error = 'Test error', tableScenarios = {}) {
    const errorObject = typeof error === 'string' ? { message: error } : error

    return {
      from: jest.fn((tableName) => {
        const scenario = tableScenarios[tableName] || { 
          selectResponse: { data: null, error: errorObject } 
        }
        return createTableMock(tableName, scenario)
      }),
      storage: createStorageMock({
        uploadResponse: { data: null, error: errorObject },
        removeResponse: { data: null, error: errorObject }
      }),
      realtime: createRealtimeMock({ error: errorObject }),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: null, error: errorObject }),
        getSession: jest.fn().mockResolvedValue({ data: null, error: errorObject }),
        signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: errorObject }),
        signOut: jest.fn().mockResolvedValue({ error: errorObject })
      }
    }
  }

  /**
   * Creates a mixed scenario mock (some succeed, some fail)
   * @param {Object} scenarios - Table-specific scenarios
   */
  static createMixedMock(scenarios = {}) {
    return {
      from: jest.fn((tableName) => {
        const scenario = scenarios[tableName] || { selectResponse: DEFAULT_RESPONSES.success }
        return createTableMock(tableName, scenario)
      }),
      storage: createStorageMock(scenarios.storage || {}),
      auth: {
        getUser: jest.fn().mockResolvedValue(
          scenarios.auth?.getUser || { data: { user: null }, error: null }
        ),
        getSession: jest.fn().mockResolvedValue(
          scenarios.auth?.getSession || { data: { session: null }, error: null }
        ),
        signInWithPassword: jest.fn().mockResolvedValue(
          scenarios.auth?.signIn || { data: null, error: null }
        ),
        signOut: jest.fn().mockResolvedValue(scenarios.auth?.signOut || { error: null })
      }
    }
  }

  /**
   * Creates a properties-specific mock with common property operations
   * @param {Array} properties - Array of property objects
   * @param {Object} options - Additional options
   */
  static createPropertiesMock(properties = [], options = {}) {
    const { includeInactive = false, error = null } = options
    
    const filteredProperties = includeInactive 
      ? properties 
      : properties.filter(p => p.status === 'active')

    return this.createSuccessMock(filteredProperties, {
      properties: {
        selectResponse: { data: filteredProperties, error },
        insertResponse: { data: properties[0] || { id: 'new-property-id' }, error },
        updateResponse: { data: properties[0] || { id: 'updated-property-id' }, error },
        deleteResponse: { data: [], error }
      }
    })
  }

  /**
   * Creates a links-specific mock with common link operations
   * @param {Array} links - Array of link objects
   * @param {Object} options - Additional options
   */
  static createLinksMock(links = [], options = {}) {
    const { error = null } = options

    return this.createSuccessMock(links, {
      links: {
        selectResponse: { data: links, error },
        insertResponse: { data: links[0] || { id: 'new-link-id', code: 'test-code' }, error },
        updateResponse: { data: links[0] || { id: 'updated-link-id' }, error },
        deleteResponse: { data: [], error }
      }
    })
  }

  /**
   * Creates an activities-specific mock for analytics
   * @param {Array} activities - Array of activity objects
   * @param {Object} options - Additional options
   */
  static createActivitiesMock(activities = [], options = {}) {
    const { error = null } = options

    return this.createSuccessMock(activities, {
      activities: {
        selectResponse: { data: activities, error },
        insertResponse: { data: { id: 'new-activity-id' }, error }
      }
    })
  }

  /**
   * Creates a CRM deals-specific mock with common deal operations
   * @param {Array} deals - Array of deal objects
   * @param {Object} options - Additional options
   */
  static createDealsMock(deals = [], options = {}) {
    const { error = null, includeInactive = false } = options
    
    const filteredDeals = includeInactive 
      ? deals 
      : deals.filter(d => d.dealStatus !== 'closed-lost')

    return this.createSuccessMock(filteredDeals, {
      deals: {
        selectResponse: { data: filteredDeals, error },
        insertResponse: { data: deals[0] || { id: 'new-deal-id' }, error },
        updateResponse: { data: deals[0] || { id: 'updated-deal-id' }, error },
        deleteResponse: { data: [], error }
      }
    })
  }

  /**
   * Creates a CRM clients-specific mock with progressive profiling
   * @param {Array} clients - Array of client objects
   * @param {Object} options - Additional options
   */
  static createClientsMock(clients = [], options = {}) {
    const { error = null, includeInactive = false } = options
    
    const filteredClients = includeInactive 
      ? clients 
      : clients.filter(c => c.status === 'active')

    return this.createSuccessMock(filteredClients, {
      clients: {
        selectResponse: { data: filteredClients, error },
        insertResponse: { data: clients[0] || { id: 'new-client-id' }, error },
        updateResponse: { data: clients[0] || { id: 'updated-client-id' }, error },
        deleteResponse: { data: [], error }
      }
    })
  }

  /**
   * Creates a CRM tasks-specific mock with task automation
   * @param {Array} tasks - Array of task objects
   * @param {Object} options - Additional options
   */
  static createTasksMock(tasks = [], options = {}) {
    const { error = null, includeDismissed = false } = options
    
    const filteredTasks = includeDismissed 
      ? tasks 
      : tasks.filter(t => t.status !== 'dismissed')

    return this.createSuccessMock(filteredTasks, {
      tasks: {
        selectResponse: { data: filteredTasks, error },
        insertResponse: { data: tasks[0] || { id: 'new-task-id' }, error },
        updateResponse: { data: tasks[0] || { id: 'updated-task-id' }, error },
        deleteResponse: { data: [], error }
      }
    })
  }

  /**
   * Creates a comprehensive CRM mock with all CRM tables
   * @param {Object} crmData - CRM data object
   * @param {Object} options - Additional options
   */
  static createCRMMock(crmData = {}, options = {}) {
    const {
      deals = [],
      clients = [],
      tasks = [],
      activities = [],
      error = null
    } = crmData

    return this.createCustomMock({
      tables: {
        deals: {
          selectResponse: { data: deals, error },
          insertResponse: { data: deals[0] || { id: 'new-deal-id' }, error },
          updateResponse: { data: deals[0] || { id: 'updated-deal-id' }, error }
        },
        clients: {
          selectResponse: { data: clients, error },
          insertResponse: { data: clients[0] || { id: 'new-client-id' }, error },
          updateResponse: { data: clients[0] || { id: 'updated-client-id' }, error }
        },
        tasks: {
          selectResponse: { data: tasks, error },
          insertResponse: { data: tasks[0] || { id: 'new-task-id' }, error },
          updateResponse: { data: tasks[0] || { id: 'updated-task-id' }, error }
        },
        activities: {
          selectResponse: { data: activities, error },
          insertResponse: { data: activities[0] || { id: 'new-activity-id' }, error }
        }
      }
    })
  }

  /**
   * Creates a complex query mock for CRM operations with filtering, sorting, and joins
   * @param {Object} config - Complex query configuration
   */
  static createComplexCRMQueryMock(config = {}) {
    const {
      table,
      filters = {},
      sorts = {},
      joins = {},
      data = [],
      error = null
    } = config

    // Create a sophisticated query builder that handles complex CRM queries
    const complexQueryBuilder = createQueryBuilder({ data, error }, {
      customMethods: {
        // CRM-specific filtering methods
        eq: jest.fn(function(column, value) {
          // Filter data based on column/value for testing
          const filteredData = data.filter(item => item[column] === value)
          return createQueryBuilder({ data: filteredData, error })
        }),
        
        in: jest.fn(function(column, values) {
          // Filter data for 'in' queries (e.g., dealStatus in ['active', 'qualified'])
          const filteredData = data.filter(item => values.includes(item[column]))
          return createQueryBuilder({ data: filteredData, error })
        }),
        
        gte: jest.fn(function(column, value) {
          // Filter for greater than or equal (e.g., engagementScore >= 70)
          const filteredData = data.filter(item => item[column] >= value)
          return createQueryBuilder({ data: filteredData, error })
        }),
        
        order: jest.fn(function(column, options = {}) {
          // Sort data by column
          const { ascending = true } = options
          const sortedData = [...data].sort((a, b) => {
            const aVal = a[column]
            const bVal = b[column]
            if (aVal < bVal) return ascending ? -1 : 1
            if (aVal > bVal) return ascending ? 1 : -1
            return 0
          })
          return createQueryBuilder({ data: sortedData, error })
        }),

        // Join simulation for CRM relationships
        select: jest.fn(function(columns) {
          // Simulate select with joins for CRM data
          if (typeof columns === 'string' && columns.includes('clients(')) {
            // Simulate deal with client join
            const enrichedData = data.map(deal => ({
              ...deal,
              client: { id: deal.clientId, name: `Client ${deal.clientId}` }
            }))
            return createQueryBuilder({ data: enrichedData, error })
          }
          return createQueryBuilder({ data, error })
        }),

        // Range queries for pagination
        range: jest.fn(function(from, to) {
          const paginatedData = data.slice(from, to + 1)
          return Promise.resolve({ 
            data: paginatedData, 
            count: data.length,
            error 
          })
        })
      }
    })

    return {
      from: jest.fn(() => complexQueryBuilder)
    }
  }

  /**
   * Creates a CRM mock with real-time subscription support
   * @param {Object} crmData - CRM data object
   * @param {Object} realtimeConfig - Real-time configuration
   */
  static createCRMWithRealtimeMock(crmData = {}, realtimeConfig = {}) {
    const {
      deals = [],
      clients = [],
      tasks = [],
      activities = [],
      error = null
    } = crmData

    return {
      from: jest.fn((tableName) => {
        const tableData = {
          deals: deals,
          clients: clients, 
          tasks: tasks,
          activities: activities
        }[tableName] || []

        const scenario = { selectResponse: { data: tableData, error } }
        return createTableMock(tableName, scenario)
      }),
      storage: createStorageMock(),
      realtime: createCRMRealtimeMock(realtimeConfig),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
        getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
        signInWithPassword: jest.fn().mockResolvedValue({ data: null, error: null }),
        signOut: jest.fn().mockResolvedValue({ error: null })
      }
    }
  }

  /**
   * Creates a custom mock with full control over all operations
   * @param {Object} config - Full configuration object
   */
  static createCustomMock(config = {}) {
    const {
      tables = {},
      storage = {},
      auth = {},
      defaultResponse = DEFAULT_RESPONSES.success
    } = config

    return {
      from: jest.fn((tableName) => {
        const scenario = tables[tableName] || { selectResponse: defaultResponse }
        return createTableMock(tableName, scenario)
      }),
      storage: createStorageMock(storage),
      auth: {
        getUser: jest.fn().mockResolvedValue(
          auth.getUser || { data: { user: null }, error: null }
        ),
        getSession: jest.fn().mockResolvedValue(
          auth.getSession || { data: { session: null }, error: null }
        ),
        signInWithPassword: jest.fn().mockResolvedValue(
          auth.signIn || { data: null, error: null }
        ),
        signOut: jest.fn().mockResolvedValue(auth.signOut || { error: null })
      }
    }
  }
}

/**
 * Convenience functions for common scenarios
 */

// Quick success mock
export const mockSupabaseSuccess = (data) => SupabaseMockFactory.createSuccessMock(data)

// Quick error mock
export const mockSupabaseError = (error) => SupabaseMockFactory.createErrorMock(error)

// Quick properties mock
export const mockSupabaseProperties = (properties, options) => 
  SupabaseMockFactory.createPropertiesMock(properties, options)

// Quick links mock
export const mockSupabaseLinks = (links, options) => 
  SupabaseMockFactory.createLinksMock(links, options)

// Quick activities mock for analytics
export const mockSupabaseActivities = (activities, options) => 
  SupabaseMockFactory.createActivitiesMock(activities, options)

// Quick CRM mocks
export const mockSupabaseDeals = (deals, options) => 
  SupabaseMockFactory.createDealsMock(deals, options)

export const mockSupabaseClients = (clients, options) => 
  SupabaseMockFactory.createClientsMock(clients, options)

export const mockSupabaseTasks = (tasks, options) => 
  SupabaseMockFactory.createTasksMock(tasks, options)

export const mockSupabaseCRM = (crmData, options) => 
  SupabaseMockFactory.createCRMMock(crmData, options)

export const mockSupabaseComplexCRMQuery = (config) => 
  SupabaseMockFactory.createComplexCRMQueryMock(config)

export const mockSupabaseCRMWithRealtime = (crmData, realtimeConfig) => 
  SupabaseMockFactory.createCRMWithRealtimeMock(crmData, realtimeConfig)

/**
 * Test utilities for specific scenarios
 */
export const testScenarios = {
  // Empty database
  emptyDatabase: () => SupabaseMockFactory.createSuccessMock([]),
  
  // Network error
  networkError: () => SupabaseMockFactory.createErrorMock('Network error'),
  
  // Permission denied
  permissionDenied: () => SupabaseMockFactory.createErrorMock('Permission denied'),
  
  // Rate limited
  rateLimited: () => SupabaseMockFactory.createErrorMock('Too many requests'),
  
  // Database unavailable
  databaseUnavailable: () => SupabaseMockFactory.createErrorMock('Database unavailable')
}

/**
 * CRM-specific test scenarios for common testing patterns
 */
export const crmTestScenarios = {
  // Empty CRM state - new agent starting fresh
  emptyCRM: () => SupabaseMockFactory.createCRMMock({
    deals: [],
    clients: [],
    tasks: [],
    activities: []
  }),

  // High engagement scenario - hot leads with active tasks
  highEngagement: () => {
    const { deals, clients, tasks, activities } = require('../fixtures/index.js')
    return SupabaseMockFactory.createCRMMock({
      deals: deals.fixtures.hotDeals.slice(0, 3),
      clients: deals.fixtures.highEngagementClients.slice(0, 3),
      tasks: deals.fixtures.highPriorityTasks.slice(0, 5),
      activities: deals.fixtures.engagementActivities.slice(0, 15)
    })
  },

  // Pipeline stress test - many deals at different stages
  fullPipeline: () => {
    const { deals, clients, tasks, activities } = require('../fixtures/index.js')
    return SupabaseMockFactory.createCRMMock({
      deals: deals.deals.slice(0, 10), // First 10 deals
      clients: deals.clients.slice(0, 8),
      tasks: deals.tasks.slice(0, 15),
      activities: deals.activities.slice(0, 30)
    })
  },

  // Task automation scenario - focus on automated tasks
  taskAutomation: () => {
    const { tasks, deals, clients } = require('../fixtures/index.js')
    return SupabaseMockFactory.createCRMMock({
      deals: deals.fixtures.warmDeals.slice(0, 3),
      clients: deals.clients.slice(0, 3),
      tasks: deals.fixtures.automatedTasks.concat(deals.fixtures.overdueTasks),
      activities: []
    })
  },

  // Engagement tracking scenario - focus on activities and scoring
  engagementTracking: () => {
    const { activities, deals, clients } = require('../fixtures/index.js')
    return SupabaseMockFactory.createCRMMock({
      deals: deals.deals.slice(0, 5),
      clients: deals.clients.slice(0, 5),
      tasks: [],
      activities: deals.fixtures.propertyInteractions.concat(
        deals.fixtures.communicationActivities
      )
    })
  },

  // Real-time updates scenario - with subscription mocking
  realTimeUpdates: () => {
    const { deals, clients, tasks, activities } = require('../fixtures/index.js')
    return SupabaseMockFactory.createCRMWithRealtimeMock(
      {
        deals: deals.deals.slice(0, 5),
        clients: deals.clients.slice(0, 5),
        tasks: deals.tasks.slice(0, 8),
        activities: deals.activities.slice(0, 20)
      },
      {
        dealUpdates: deals.deals.slice(0, 2),
        taskUpdates: deals.tasks.slice(0, 3),
        activityUpdates: deals.activities.slice(0, 5),
        clientUpdates: deals.clients.slice(0, 2)
      }
    )
  },

  // Complex query scenario - for testing advanced filtering
  complexQueries: (data = []) => SupabaseMockFactory.createComplexCRMQueryMock({
    table: 'deals',
    data: data.length ? data : require('../fixtures/index.js').deals.deals,
    filters: {
      dealStatus: ['active', 'qualified'],
      engagementScore: { gte: 50 },
      clientTemperature: ['hot', 'warm']
    },
    sorts: {
      engagementScore: { ascending: false },
      lastActivityAt: { ascending: false }
    }
  }),

  // Error scenarios for CRM operations
  crmErrors: {
    // Deal creation fails
    dealCreationError: () => SupabaseMockFactory.createCRMMock({}, {
      deals: { 
        insertResponse: { data: null, error: { message: 'Failed to create deal' } }
      }
    }),

    // Task update fails
    taskUpdateError: () => SupabaseMockFactory.createCRMMock({}, {
      tasks: { 
        updateResponse: { data: null, error: { message: 'Failed to update task' } }
      }
    }),

    // Real-time connection error
    realtimeConnectionError: () => SupabaseMockFactory.createCRMWithRealtimeMock({}, {
      error: { message: 'Real-time connection failed' }
    })
  },

  // Performance testing scenarios
  performance: {
    // Large dataset for performance testing
    largeDataset: () => {
      // Generate large amounts of test data
      const { PropertyFactory, DealFactory, ClientFactory, TaskFactory, ActivityFactory } = require('../utils/mockData.js')
      return SupabaseMockFactory.createCRMMock({
        deals: DealFactory.createMany(100),
        clients: ClientFactory.createMany(80),
        tasks: TaskFactory.createMany(200),
        activities: ActivityFactory.createMany(500)
      })
    },

    // Slow query simulation
    slowQueries: (data = []) => {
      const mock = SupabaseMockFactory.createComplexCRMQueryMock({
        table: 'deals',
        data: data.length ? data : require('../fixtures/index.js').deals.deals
      })
      
      // Override methods to simulate slow responses
      const originalFrom = mock.from
      mock.from = jest.fn((tableName) => {
        const queryBuilder = originalFrom(tableName)
        
        // Add delay to simulate slow queries
        Object.keys(queryBuilder).forEach(method => {
          if (typeof queryBuilder[method] === 'function') {
            const originalMethod = queryBuilder[method]
            queryBuilder[method] = jest.fn((...args) => {
              return new Promise(resolve => {
                setTimeout(() => resolve(originalMethod(...args)), 100)
              })
            })
          }
        })
        
        return queryBuilder
      })
      
      return mock
    }
  }
}

// Default export for easy importing
export default SupabaseMockFactory