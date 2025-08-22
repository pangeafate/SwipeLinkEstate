/**
 * Mock Data Factories
 * 
 * This file provides factory functions for creating consistent mock data
 * across all tests. It replaces the 15+ duplicated property objects and
 * other mock data scattered throughout the test files.
 */

/**
 * Generates a unique ID for mock data
 * @param {string} prefix - Prefix for the ID (e.g., 'prop', 'link', 'user')
 * @returns {string} Unique ID
 */
function generateId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generates a random number within a range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Picks a random element from an array
 * @param {Array} array - Array to pick from
 * @returns {*} Random element
 */
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Property Factory
 * Creates mock property objects with realistic data
 */
export const PropertyFactory = {
  // Default property data
  defaults: {
    bedrooms: 3,
    bathrooms: 2,
    area_sqft: 1500,
    property_type: 'house',
    status: 'active',
    description: 'A beautiful property in a great location.',
    features: ['parking', 'garden'],
    images: ['/images/sample-1.jpg'],
    cover_image: '/images/sample-1.jpg',
  },

  // Address templates for realistic addresses
  addressTemplates: [
    '123 Main St',
    '456 Oak Ave',
    '789 Pine Rd',
    '321 Elm Dr',
    '654 Cedar Ln',
    '987 Maple Way',
    '147 Birch Blvd',
    '258 Willow Ct',
    '369 Spruce St',
    '741 Aspen Ave'
  ],

  // Property types
  propertyTypes: ['house', 'apartment', 'condo', 'townhouse'],

  // Feature options
  featureOptions: [
    'parking', 'garage', 'pool', 'garden', 'balcony', 'fireplace',
    'air_conditioning', 'heating', 'hardwood_floors', 'updated_kitchen',
    'walk_in_closet', 'laundry_room', 'basement', 'deck', 'patio'
  ],

  /**
   * Creates a single mock property
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object} Mock property object
   */
  create(overrides = {}) {
    const id = overrides.id || generateId('prop')
    const now = new Date().toISOString()
    
    return {
      id,
      address: overrides.address || randomChoice(this.addressTemplates),
      price: overrides.price || randomBetween(200000, 1000000),
      bedrooms: overrides.bedrooms || randomBetween(1, 5),
      bathrooms: overrides.bathrooms || randomBetween(1, 4),
      area_sqft: overrides.area_sqft || randomBetween(800, 3000),
      property_type: overrides.property_type || randomChoice(this.propertyTypes),
      status: overrides.status || 'active',
      description: overrides.description || this.defaults.description,
      features: overrides.features || this.generateRandomFeatures(),
      cover_image: overrides.cover_image || this.defaults.cover_image,
      images: overrides.images || [this.defaults.cover_image],
      created_at: overrides.created_at || now,
      updated_at: overrides.updated_at || now,
      ...overrides
    }
  },

  /**
   * Creates multiple mock properties
   * @param {number} count - Number of properties to create
   * @param {Object} baseOverrides - Base overrides for all properties
   * @returns {Array} Array of mock property objects
   */
  createMany(count = 3, baseOverrides = {}) {
    return Array.from({ length: count }, (_, index) => 
      this.create({ 
        ...baseOverrides, 
        id: baseOverrides.id || generateId('prop'),
        address: baseOverrides.address || this.addressTemplates[index % this.addressTemplates.length]
      })
    )
  },

  /**
   * Creates a property with specific characteristics
   * @param {string} type - Type of property ('luxury', 'budget', 'family', etc.)
   * @returns {Object} Mock property object
   */
  createByType(type) {
    const typeConfigs = {
      luxury: {
        price: randomBetween(800000, 2000000),
        bedrooms: randomBetween(4, 6),
        bathrooms: randomBetween(3, 5),
        area_sqft: randomBetween(2500, 5000),
        features: ['pool', 'garage', 'fireplace', 'walk_in_closet', 'deck'],
        property_type: 'house'
      },
      budget: {
        price: randomBetween(150000, 300000),
        bedrooms: randomBetween(1, 2),
        bathrooms: 1,
        area_sqft: randomBetween(600, 1000),
        features: ['parking'],
        property_type: 'apartment'
      },
      family: {
        price: randomBetween(400000, 700000),
        bedrooms: randomBetween(3, 4),
        bathrooms: randomBetween(2, 3),
        area_sqft: randomBetween(1500, 2500),
        features: ['garage', 'garden', 'laundry_room'],
        property_type: 'house'
      }
    }

    return this.create(typeConfigs[type] || {})
  },

  /**
   * Generates random features for a property
   * @param {number} count - Number of features (default: 2-4)
   * @returns {Array} Array of feature strings
   */
  generateRandomFeatures(count) {
    const featureCount = count || randomBetween(2, 4)
    const shuffled = [...this.featureOptions].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, featureCount)
  }
}

/**
 * Link Factory
 * Creates mock link objects for property sharing
 */
export const LinkFactory = {
  defaults: {
    name: 'My Property Selection',
    expires_at: null,
  },

  /**
   * Creates a single mock link
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object} Mock link object
   */
  create(overrides = {}) {
    const id = overrides.id || generateId('link')
    const code = overrides.code || generateId('code').replace('code-', '')
    const now = new Date().toISOString()
    
    return {
      id,
      code,
      name: overrides.name || this.defaults.name,
      property_ids: overrides.property_ids || [generateId('prop'), generateId('prop')],
      created_at: overrides.created_at || now,
      expires_at: overrides.expires_at || this.defaults.expires_at,
      ...overrides
    }
  },

  /**
   * Creates multiple mock links
   * @param {number} count - Number of links to create
   * @param {Object} baseOverrides - Base overrides for all links
   * @returns {Array} Array of mock link objects
   */
  createMany(count = 3, baseOverrides = {}) {
    return Array.from({ length: count }, () => this.create(baseOverrides))
  },

  /**
   * Creates a link with specific property IDs
   * @param {Array} propertyIds - Array of property IDs
   * @param {Object} overrides - Additional overrides
   * @returns {Object} Mock link object
   */
  createWithProperties(propertyIds, overrides = {}) {
    return this.create({
      property_ids: propertyIds,
      ...overrides
    })
  }
}

/**
 * Analytics Factory
 * Creates mock analytics and activity data
 */
export const AnalyticsFactory = {
  /**
   * Creates mock dashboard analytics
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object} Mock dashboard analytics object
   */
  createDashboardAnalytics(overrides = {}) {
    return {
      properties: {
        total: overrides.propertiesTotal || randomBetween(10, 50),
        active: overrides.propertiesActive || randomBetween(8, 45)
      },
      links: {
        total: overrides.linksTotal || randomBetween(5, 25),
        active: overrides.linksActive || randomBetween(3, 20)
      },
      sessions: {
        total: overrides.sessionsTotal || randomBetween(100, 500),
        avgDuration: overrides.avgDuration || randomBetween(180, 600)
      },
      views: {
        total: overrides.viewsTotal || randomBetween(500, 2000)
      },
      recentActivity: overrides.recentActivity || this.createRecentActivity(5),
      ...overrides
    }
  },

  /**
   * Creates mock link analytics
   * @param {string} linkCode - Link code
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object} Mock link analytics object
   */
  createLinkAnalytics(linkCode, overrides = {}) {
    const totalViews = overrides.totalViews || randomBetween(20, 100)
    const uniqueViews = overrides.uniqueViews || Math.floor(totalViews * 0.7)
    
    return {
      linkCode,
      totalViews,
      uniqueViews,
      sessions: overrides.sessions || Math.floor(uniqueViews * 0.8),
      avgSessionDuration: overrides.avgSessionDuration || randomBetween(120, 300),
      viewsByDay: overrides.viewsByDay || this.createViewsByDay(7),
      deviceTypes: overrides.deviceTypes || {
        mobile: Math.floor(totalViews * 0.6),
        desktop: Math.floor(totalViews * 0.4)
      },
      locations: overrides.locations || {
        'US': Math.floor(totalViews * 0.7),
        'CA': Math.floor(totalViews * 0.2),
        'UK': Math.floor(totalViews * 0.1)
      },
      ...overrides
    }
  },

  /**
   * Creates mock property analytics
   * @param {string} propertyId - Property ID
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object} Mock property analytics object
   */
  createPropertyAnalytics(propertyId, overrides = {}) {
    const totalViews = overrides.totalViews || randomBetween(30, 150)
    const likes = overrides.likes || randomBetween(5, 40)
    
    return {
      propertyId,
      totalViews,
      uniqueViews: overrides.uniqueViews || Math.floor(totalViews * 0.8),
      likes,
      dislikes: overrides.dislikes || randomBetween(0, 10),
      viewsByDay: overrides.viewsByDay || this.createViewsByDay(7),
      avgTimeViewed: overrides.avgTimeViewed || randomBetween(30, 120),
      conversionRate: overrides.conversionRate || likes / totalViews,
      ...overrides
    }
  },

  /**
   * Creates mock recent activity data
   * @param {number} count - Number of activities
   * @returns {Array} Array of activity objects
   */
  createRecentActivity(count = 5) {
    const activityTypes = ['property_view', 'property_like', 'property_dislike', 'link_view', 'session_start']
    
    return Array.from({ length: count }, () => ({
      id: generateId('activity'),
      type: randomChoice(activityTypes),
      propertyId: generateId('prop'),
      linkId: generateId('link'),
      sessionId: generateId('session'),
      timestamp: new Date(Date.now() - randomBetween(0, 86400000)).toISOString(), // Last 24 hours
      metadata: {}
    }))
  },

  /**
   * Creates mock views by day data
   * @param {number} days - Number of days
   * @returns {Array} Array of daily view objects
   */
  createViewsByDay(days = 7) {
    return Array.from({ length: days }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - index))
      
      return {
        date: date.toISOString().split('T')[0],
        views: randomBetween(1, 20)
      }
    })
  }
}

/**
 * Session Factory
 * Creates mock session data
 */
export const SessionFactory = {
  /**
   * Creates a single mock session
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object} Mock session object
   */
  create(overrides = {}) {
    const id = overrides.id || generateId('session')
    const startTime = overrides.startTime || new Date(Date.now() - randomBetween(0, 3600000))
    const duration = overrides.duration || randomBetween(60, 600)
    
    return {
      id,
      linkId: overrides.linkId || generateId('link'),
      startTime: startTime.toISOString(),
      endTime: overrides.endTime || new Date(startTime.getTime() + duration * 1000).toISOString(),
      duration,
      viewedProperties: overrides.viewedProperties || [generateId('prop'), generateId('prop')],
      likedProperties: overrides.likedProperties || [generateId('prop')],
      dislikedProperties: overrides.dislikedProperties || [],
      deviceType: overrides.deviceType || randomChoice(['mobile', 'desktop', 'tablet']),
      browser: overrides.browser || randomChoice(['Chrome', 'Safari', 'Firefox', 'Edge']),
      location: overrides.location || randomChoice(['US', 'CA', 'UK', 'AU']),
      ...overrides
    }
  },

  /**
   * Creates multiple mock sessions
   * @param {number} count - Number of sessions to create
   * @param {Object} baseOverrides - Base overrides for all sessions
   * @returns {Array} Array of mock session objects
   */
  createMany(count = 3, baseOverrides = {}) {
    return Array.from({ length: count }, () => this.create(baseOverrides))
  }
}

/**
 * SessionData Factory for CRM Scoring Tests
 * Creates mock SessionData objects for engagement scoring
 */
export const SessionDataFactory = {
  defaults: {
    totalProperties: 10,
    propertiesViewed: 5,
    propertiesLiked: 1,
    propertiesConsidered: 0,
    propertiesPassed: 4,
    detailViewsOpened: 1,
    averageTimePerProperty: 120,
    isCompleted: false,
    isReturnVisit: false
  },

  /**
   * Creates a single mock SessionData object
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object} Mock SessionData object
   */
  create(overrides = {}) {
    const sessionId = overrides.sessionId || generateId('session')
    const linkId = overrides.linkId || generateId('link')
    const startTime = overrides.startTime || '2024-01-20T10:00:00Z'
    const duration = overrides.duration || randomBetween(120, 1800)
    const endTime = overrides.endTime !== undefined ? overrides.endTime : 
      (duration > 0 ? new Date(new Date(startTime).getTime() + duration * 1000).toISOString() : null)
    
    return {
      sessionId,
      linkId,
      startTime,
      endTime,
      duration,
      totalProperties: overrides.totalProperties || this.defaults.totalProperties,
      propertiesViewed: overrides.propertiesViewed || this.defaults.propertiesViewed,
      propertiesLiked: overrides.propertiesLiked || this.defaults.propertiesLiked,
      propertiesConsidered: overrides.propertiesConsidered || this.defaults.propertiesConsidered,
      propertiesPassed: overrides.propertiesPassed || this.defaults.propertiesPassed,
      detailViewsOpened: overrides.detailViewsOpened || this.defaults.detailViewsOpened,
      averageTimePerProperty: overrides.averageTimePerProperty || this.defaults.averageTimePerProperty,
      isCompleted: overrides.isCompleted !== undefined ? overrides.isCompleted : this.defaults.isCompleted,
      isReturnVisit: overrides.isReturnVisit !== undefined ? overrides.isReturnVisit : this.defaults.isReturnVisit,
      ...overrides
    }
  },

  /**
   * Creates a high engagement session (likely to be 'hot')
   * @param {Object} overrides - Additional overrides
   * @returns {Object} High engagement SessionData
   */
  createHighEngagement(overrides = {}) {
    return this.create({
      duration: randomBetween(1200, 1800), // 20-30 minutes
      totalProperties: 10,
      propertiesViewed: 10, // Viewed all
      propertiesLiked: randomBetween(3, 5),
      propertiesConsidered: randomBetween(2, 4),
      propertiesPassed: randomBetween(3, 5),
      detailViewsOpened: randomBetween(4, 8),
      averageTimePerProperty: randomBetween(120, 240),
      isCompleted: true,
      isReturnVisit: true,
      ...overrides
    })
  },

  /**
   * Creates a medium engagement session (likely to be 'warm')
   * @param {Object} overrides - Additional overrides
   * @returns {Object} Medium engagement SessionData
   */
  createMediumEngagement(overrides = {}) {
    return this.create({
      duration: randomBetween(600, 1200), // 10-20 minutes
      totalProperties: 10,
      propertiesViewed: randomBetween(5, 8),
      propertiesLiked: randomBetween(1, 2),
      propertiesConsidered: randomBetween(0, 1),
      propertiesPassed: randomBetween(3, 6),
      detailViewsOpened: randomBetween(1, 3),
      averageTimePerProperty: randomBetween(75, 150),
      isCompleted: randomChoice([true, false]),
      isReturnVisit: randomChoice([true, false]),
      ...overrides
    })
  },

  /**
   * Creates a low engagement session (likely to be 'cold')
   * @param {Object} overrides - Additional overrides
   * @returns {Object} Low engagement SessionData
   */
  createLowEngagement(overrides = {}) {
    return this.create({
      duration: randomBetween(60, 300), // 1-5 minutes
      totalProperties: 10,
      propertiesViewed: randomBetween(1, 3),
      propertiesLiked: 0,
      propertiesConsidered: 0,
      propertiesPassed: randomBetween(1, 3),
      detailViewsOpened: 0,
      averageTimePerProperty: randomBetween(30, 90),
      isCompleted: false,
      isReturnVisit: false,
      ...overrides
    })
  },

  /**
   * Creates a session with no engagement (score should be 0)
   * @param {Object} overrides - Additional overrides
   * @returns {Object} No engagement SessionData
   */
  createNoEngagement(overrides = {}) {
    return this.create({
      duration: 0,
      endTime: null,
      totalProperties: 10,
      propertiesViewed: 0,
      propertiesLiked: 0,
      propertiesConsidered: 0,
      propertiesPassed: 0,
      detailViewsOpened: 0,
      averageTimePerProperty: 0,
      isCompleted: false,
      isReturnVisit: false,
      ...overrides
    })
  },

  /**
   * Creates a recent session (for recency factor testing)
   * @param {Object} overrides - Additional overrides
   * @returns {Object} Recent SessionData
   */
  createRecent(overrides = {}) {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    return this.create({
      startTime: oneHourAgo.toISOString(),
      endTime: now.toISOString(),
      duration: 3600,
      ...overrides
    })
  },

  /**
   * Creates an old session (for recency factor testing)
   * @param {Object} overrides - Additional overrides
   * @returns {Object} Old SessionData
   */
  createOld(overrides = {}) {
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
    
    return this.create({
      startTime: twoMonthsAgo.toISOString(),
      endTime: twoMonthsAgo.toISOString(),
      ...overrides
    })
  }
}

/**
 * Client Factory
 * Creates mock client objects for CRM testing with progressive profiling
 */
export const ClientFactory = {
  defaults: {
    status: 'active',
    source: 'link',
    profileCompleteness: 30,
    tags: []
  },

  /**
   * Creates a single mock client
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object} Mock client object
   */
  create(overrides = {}) {
    const id = overrides.id || generateId('client')
    const firstName = overrides.firstName || randomChoice(['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma'])
    const lastName = overrides.lastName || randomChoice(['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson'])
    const email = overrides.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
    const now = new Date().toISOString()
    
    return {
      id,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email,
      phone: overrides.phone || `+1${randomBetween(1000000000, 9999999999)}`,
      
      // Progressive Profiling Fields
      source: overrides.source || this.defaults.source,
      profileCompleteness: overrides.profileCompleteness || this.defaults.profileCompleteness,
      
      // Demographics (progressive)
      age: overrides.age || null,
      occupation: overrides.occupation || null,
      income: overrides.income || null,
      familySize: overrides.familySize || null,
      
      // Preferences (gathered over time)
      preferredPropertyTypes: overrides.preferredPropertyTypes || [],
      budgetRange: overrides.budgetRange || null,
      preferredLocations: overrides.preferredLocations || [],
      mustHaveFeatures: overrides.mustHaveFeatures || [],
      
      // Engagement Data
      engagementScore: overrides.engagementScore || randomBetween(0, 100),
      lastActivity: overrides.lastActivity || now,
      sessionCount: overrides.sessionCount || randomBetween(1, 10),
      
      // CRM Fields
      status: overrides.status || this.defaults.status,
      tags: overrides.tags || this.defaults.tags,
      notes: overrides.notes || null,
      assignedAgent: overrides.assignedAgent || generateId('agent'),
      
      // Timestamps
      createdAt: overrides.createdAt || now,
      updatedAt: overrides.updatedAt || now,
      
      ...overrides
    }
  },

  /**
   * Creates multiple mock clients
   * @param {number} count - Number of clients to create
   * @param {Object} baseOverrides - Base overrides for all clients
   * @returns {Array} Array of mock client objects
   */
  createMany(count = 3, baseOverrides = {}) {
    return Array.from({ length: count }, () => this.create(baseOverrides))
  },

  /**
   * Creates a client with specific profile completeness
   * @param {string} level - 'low', 'medium', or 'high'
   * @param {Object} overrides - Additional overrides
   * @returns {Object} Mock client object
   */
  createByProfileLevel(level, overrides = {}) {
    const levelConfigs = {
      low: {
        profileCompleteness: randomBetween(10, 30),
        age: null,
        occupation: null,
        income: null,
        preferredPropertyTypes: [],
        budgetRange: null
      },
      medium: {
        profileCompleteness: randomBetween(40, 70),
        age: randomBetween(25, 65),
        occupation: randomChoice(['Teacher', 'Engineer', 'Manager', 'Consultant']),
        preferredPropertyTypes: [randomChoice(['house', 'apartment', 'condo'])],
        budgetRange: { min: 300000, max: 600000 }
      },
      high: {
        profileCompleteness: randomBetween(80, 100),
        age: randomBetween(25, 65),
        occupation: randomChoice(['Doctor', 'Lawyer', 'Executive', 'Architect']),
        income: randomBetween(80000, 200000),
        familySize: randomBetween(1, 4),
        preferredPropertyTypes: ['house', 'condo'],
        budgetRange: { min: 400000, max: 800000 },
        preferredLocations: ['Downtown', 'Suburbs'],
        mustHaveFeatures: ['parking', 'garden']
      }
    }

    return this.create({
      ...levelConfigs[level],
      ...overrides
    })
  }
}

/**
 * Activity Factory
 * Creates mock activity objects for engagement tracking
 */
export const ActivityFactory = {
  defaults: {
    category: 'property_interaction',
    value: 0
  },

  activityTypes: [
    'property_view', 'property_like', 'property_dislike', 'property_consider',
    'detail_view', 'session_start', 'session_complete', 'link_access',
    'email_open', 'email_click', 'phone_call', 'meeting_scheduled'
  ],

  categories: [
    'property_interaction', 'communication', 'engagement', 'milestone'
  ],

  /**
   * Creates a single mock activity
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object} Mock activity object
   */
  create(overrides = {}) {
    const id = overrides.id || generateId('activity')
    const now = new Date().toISOString()
    const type = overrides.type || randomChoice(this.activityTypes)
    
    return {
      id,
      type,
      category: overrides.category || this.getCategoryForType(type),
      
      // References
      clientId: overrides.clientId || generateId('client'),
      dealId: overrides.dealId || generateId('deal'),
      linkId: overrides.linkId || null,
      propertyId: overrides.propertyId || null,
      sessionId: overrides.sessionId || null,
      
      // Activity Details
      value: overrides.value || this.getValueForType(type),
      duration: overrides.duration || null,
      
      // Context
      metadata: overrides.metadata || {},
      source: overrides.source || 'web',
      deviceType: overrides.deviceType || randomChoice(['mobile', 'desktop', 'tablet']),
      
      // Timestamps
      createdAt: overrides.createdAt || now,
      
      ...overrides
    }
  },

  /**
   * Creates multiple mock activities
   * @param {number} count - Number of activities to create
   * @param {Object} baseOverrides - Base overrides for all activities
   * @returns {Array} Array of mock activity objects
   */
  createMany(count = 5, baseOverrides = {}) {
    return Array.from({ length: count }, () => this.create(baseOverrides))
  },

  /**
   * Creates activities for a specific session
   * @param {string} sessionId - Session ID
   * @param {Object} overrides - Additional overrides
   * @returns {Array} Array of session-specific activities
   */
  createForSession(sessionId, overrides = {}) {
    const activities = []
    const clientId = overrides.clientId || generateId('client')
    const dealId = overrides.dealId || generateId('deal')
    
    // Session start
    activities.push(this.create({
      type: 'session_start',
      sessionId,
      clientId,
      dealId,
      ...overrides
    }))
    
    // Property interactions
    const interactionCount = randomBetween(3, 8)
    for (let i = 0; i < interactionCount; i++) {
      activities.push(this.create({
        type: randomChoice(['property_view', 'property_like', 'property_dislike']),
        sessionId,
        clientId,
        dealId,
        propertyId: generateId('prop'),
        ...overrides
      }))
    }
    
    return activities
  },

  /**
   * Gets the category for an activity type
   * @param {string} type - Activity type
   * @returns {string} Category
   */
  getCategoryForType(type) {
    const categoryMap = {
      property_view: 'property_interaction',
      property_like: 'property_interaction',
      property_dislike: 'property_interaction',
      property_consider: 'property_interaction',
      detail_view: 'property_interaction',
      session_start: 'engagement',
      session_complete: 'engagement',
      link_access: 'engagement',
      email_open: 'communication',
      email_click: 'communication',
      phone_call: 'communication',
      meeting_scheduled: 'milestone'
    }
    return categoryMap[type] || this.defaults.category
  },

  /**
   * Gets the scoring value for an activity type
   * @param {string} type - Activity type
   * @returns {number} Point value
   */
  getValueForType(type) {
    const valueMap = {
      property_view: 1,
      property_like: 3,
      property_dislike: 1,
      property_consider: 2,
      detail_view: 2,
      session_start: 5,
      session_complete: 10,
      link_access: 5,
      email_open: 2,
      email_click: 5,
      phone_call: 15,
      meeting_scheduled: 25
    }
    return valueMap[type] || this.defaults.value
  }
}

/**
 * Deal Factory
 * Creates mock deal objects for CRM testing
 */
export const DealFactory = {
  defaults: {
    dealStatus: 'active',
    dealStage: 'created',
    clientTemperature: 'cold',
    engagementScore: 50,
    sessionCount: 1,
    totalTimeSpent: 300,
    propertyCount: 2,
    tags: []
  },

  /**
   * Creates a single mock deal
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object} Mock deal object
   */
  create(overrides = {}) {
    const id = overrides.id || generateId('deal')
    const linkId = overrides.linkId || generateId('link')
    const agentId = overrides.agentId || generateId('agent')
    const now = new Date().toISOString()
    
    return {
      id,
      linkId,
      agentId,
      dealName: overrides.dealName || 'Property Collection',
      dealStatus: overrides.dealStatus || this.defaults.dealStatus,
      dealStage: overrides.dealStage || this.defaults.dealStage,
      dealValue: overrides.dealValue || randomBetween(10000, 50000),
      
      // Client Information
      clientId: overrides.clientId || null,
      clientName: overrides.clientName || randomChoice(['John Doe', 'Jane Smith', 'Bob Johnson']),
      clientEmail: overrides.clientEmail || `client${randomBetween(1, 999)}@example.com`,
      clientPhone: overrides.clientPhone || `+1${randomBetween(1000000000, 9999999999)}`,
      clientTemperature: overrides.clientTemperature || this.defaults.clientTemperature,
      
      // Property Portfolio
      propertyIds: overrides.propertyIds || [generateId('prop'), generateId('prop')],
      propertyCount: overrides.propertyCount || this.defaults.propertyCount,
      
      // Timestamps
      createdAt: overrides.createdAt || now,
      updatedAt: overrides.updatedAt || now,
      lastActivityAt: overrides.lastActivityAt || now,
      
      // Engagement Metrics
      engagementScore: overrides.engagementScore || this.defaults.engagementScore,
      sessionCount: overrides.sessionCount || this.defaults.sessionCount,
      totalTimeSpent: overrides.totalTimeSpent || this.defaults.totalTimeSpent,
      
      // CRM Specific
      nextFollowUp: overrides.nextFollowUp || null,
      notes: overrides.notes || null,
      tags: overrides.tags || this.defaults.tags,
      
      ...overrides
    }
  },

  /**
   * Creates multiple mock deals
   * @param {number} count - Number of deals to create
   * @param {Object} baseOverrides - Base overrides for all deals
   * @returns {Array} Array of mock deal objects
   */
  createMany(count = 3, baseOverrides = {}) {
    return Array.from({ length: count }, () => this.create(baseOverrides))
  },

  /**
   * Creates a deal with specific temperature
   * @param {string} temperature - 'hot', 'warm', or 'cold'
   * @param {Object} overrides - Additional overrides
   * @returns {Object} Mock deal object
   */
  createByTemperature(temperature, overrides = {}) {
    const temperatureConfigs = {
      hot: {
        clientTemperature: 'hot',
        engagementScore: randomBetween(75, 95),
        dealStage: randomChoice(['engaged', 'qualified', 'advanced']),
        sessionCount: randomBetween(3, 8),
        totalTimeSpent: randomBetween(900, 1800)
      },
      warm: {
        clientTemperature: 'warm',
        engagementScore: randomBetween(50, 74),
        dealStage: randomChoice(['accessed', 'engaged']),
        sessionCount: randomBetween(2, 4),
        totalTimeSpent: randomBetween(300, 900)
      },
      cold: {
        clientTemperature: 'cold',
        engagementScore: randomBetween(0, 49),
        dealStage: randomChoice(['created', 'shared', 'accessed']),
        sessionCount: randomBetween(1, 2),
        totalTimeSpent: randomBetween(60, 300)
      }
    }

    return this.create({
      ...temperatureConfigs[temperature],
      ...overrides
    })
  }
}

/**
 * Task Factory
 * Creates mock task objects for CRM testing
 */
export const TaskFactory = {
  defaults: {
    type: 'call',
    priority: 'medium',
    status: 'pending',
    isAutomated: true,
    triggerType: 'engagement'
  },

  taskTypes: ['call', 'email', 'showing', 'follow-up', 'meeting', 'contract', 'closing'],
  priorities: ['high', 'medium', 'low'],
  statuses: ['pending', 'completed', 'dismissed'],
  triggerTypes: ['engagement', 'time-based', 'milestone', 'manual'],

  /**
   * Creates a single mock task
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object} Mock task object
   */
  create(overrides = {}) {
    const id = overrides.id || generateId('task')
    const dealId = overrides.dealId || generateId('deal')
    const agentId = overrides.agentId || generateId('agent')
    const now = new Date().toISOString()
    
    return {
      id,
      dealId,
      agentId,
      
      // Task Details
      title: overrides.title || 'Follow up with client',
      description: overrides.description || 'Contact the client to discuss their interest',
      type: overrides.type || randomChoice(this.taskTypes),
      priority: overrides.priority || randomChoice(this.priorities),
      status: overrides.status || this.defaults.status,
      
      // Automation
      isAutomated: overrides.isAutomated !== undefined ? overrides.isAutomated : this.defaults.isAutomated,
      triggerType: overrides.triggerType || randomChoice(this.triggerTypes),
      
      // Scheduling
      dueDate: overrides.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      reminderDate: overrides.reminderDate || null,
      
      // Timestamps
      createdAt: overrides.createdAt || now,
      completedAt: overrides.completedAt || null,
      
      // Additional Context
      clientId: overrides.clientId || null,
      propertyIds: overrides.propertyIds || [],
      notes: overrides.notes || null,
      
      ...overrides
    }
  },

  /**
   * Creates multiple mock tasks
   * @param {number} count - Number of tasks to create
   * @param {Object} baseOverrides - Base overrides for all tasks
   * @returns {Array} Array of mock task objects
   */
  createMany(count = 3, baseOverrides = {}) {
    return Array.from({ length: count }, () => this.create(baseOverrides))
  },

  /**
   * Creates a task with specific priority
   * @param {string} priority - 'high', 'medium', or 'low'
   * @param {Object} overrides - Additional overrides
   * @returns {Object} Mock task object
   */
  createByPriority(priority, overrides = {}) {
    const priorityConfigs = {
      high: {
        priority: 'high',
        type: 'call',
        title: 'Urgent: Hot Lead Follow-up',
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
      },
      medium: {
        priority: 'medium',
        type: randomChoice(['call', 'email']),
        title: 'Check-in with client',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1 day
      },
      low: {
        priority: 'low',
        type: 'email',
        title: 'Re-engagement email',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week
      }
    }

    return this.create({
      ...priorityConfigs[priority],
      ...overrides
    })
  },

  /**
   * Creates an overdue task
   * @param {Object} overrides - Additional overrides
   * @returns {Object} Mock overdue task object
   */
  createOverdue(overrides = {}) {
    return this.create({
      status: 'pending',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      ...overrides
    })
  },

  /**
   * Creates a completed task
   * @param {Object} overrides - Additional overrides
   * @returns {Object} Mock completed task object
   */
  createCompleted(overrides = {}) {
    const completedAt = overrides.completedAt || new Date().toISOString()
    return this.create({
      status: 'completed',
      completedAt,
      ...overrides
    })
  }
}

/**
 * User/Agent Factory
 * Creates mock user and agent data
 */
export const UserFactory = {
  defaults: {
    role: 'agent',
    status: 'active',
  },

  /**
   * Creates a single mock user
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object} Mock user object
   */
  create(overrides = {}) {
    const id = overrides.id || generateId('user')
    const firstName = overrides.firstName || randomChoice(['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma'])
    const lastName = overrides.lastName || randomChoice(['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson'])
    const email = overrides.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
    
    return {
      id,
      email,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      role: overrides.role || this.defaults.role,
      status: overrides.status || this.defaults.status,
      phone: overrides.phone || `+1${randomBetween(1000000000, 9999999999)}`,
      agency: overrides.agency || 'Test Realty Inc.',
      license: overrides.license || `LIC${randomBetween(100000, 999999)}`,
      createdAt: overrides.createdAt || new Date().toISOString(),
      updatedAt: overrides.updatedAt || new Date().toISOString(),
      ...overrides
    }
  },

  /**
   * Creates an agent-specific user
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object} Mock agent object
   */
  createAgent(overrides = {}) {
    return this.create({
      role: 'agent',
      agency: 'Premium Realty',
      license: `AGT${randomBetween(100000, 999999)}`,
      ...overrides
    })
  },

  /**
   * Creates an admin user
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object} Mock admin object
   */
  createAdmin(overrides = {}) {
    return this.create({
      role: 'admin',
      agency: 'SwipeLink Estate',
      ...overrides
    })
  }
}

/**
 * Form Data Factory
 * Creates mock form data for testing form components
 */
export const FormFactory = {
  /**
   * Creates mock property form data
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object} Mock property form data
   */
  createPropertyForm(overrides = {}) {
    return {
      address: overrides.address || '123 Test Street',
      price: overrides.price || 500000,
      bedrooms: overrides.bedrooms || 3,
      bathrooms: overrides.bathrooms || 2,
      area_sqft: overrides.area_sqft || 1500,
      property_type: overrides.property_type || 'house',
      description: overrides.description || 'A beautiful test property',
      features: overrides.features || ['parking', 'garden'],
      images: overrides.images || [],
      ...overrides
    }
  },

  /**
   * Creates mock link creation form data
   * @param {Object} overrides - Properties to override defaults
   * @returns {Object} Mock link form data
   */
  createLinkForm(overrides = {}) {
    return {
      name: overrides.name || 'My Property Collection',
      selectedProperties: overrides.selectedProperties || [generateId('prop'), generateId('prop')],
      expiresAt: overrides.expiresAt || null,
      ...overrides
    }
  }
}

/**
 * Error Factory
 * Creates mock error objects for error testing
 */
export const ErrorFactory = {
  /**
   * Creates a generic error
   * @param {string} message - Error message
   * @param {Object} overrides - Additional properties
   * @returns {Error} Mock error object
   */
  create(message = 'Test error', overrides = {}) {
    const error = new Error(message)
    Object.assign(error, overrides)
    return error
  },

  /**
   * Creates a Supabase-style error
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @returns {Object} Mock Supabase error
   */
  createSupabaseError(message = 'Database error', code = 'GENERIC_ERROR') {
    return {
      message,
      details: null,
      hint: null,
      code
    }
  },

  /**
   * Creates a validation error
   * @param {Array} fields - Array of field names with errors
   * @returns {Object} Mock validation error
   */
  createValidationError(fields = ['address']) {
    const errors = {}
    fields.forEach(field => {
      errors[field] = `${field} is required`
    })
    
    return {
      name: 'ValidationError',
      message: 'Validation failed',
      errors
    }
  }
}

// Convenience functions for quick mock creation
export const createMockProperty = (overrides) => PropertyFactory.create(overrides)
export const createMockLink = (overrides) => LinkFactory.create(overrides)
export const createMockAnalytics = (overrides) => AnalyticsFactory.createDashboardAnalytics(overrides)
export const createMockSession = (overrides) => SessionFactory.create(overrides)
export const createMockSessionData = (overrides) => SessionDataFactory.create(overrides)
export const createMockUser = (overrides) => UserFactory.create(overrides)
export const createMockDeal = (overrides) => DealFactory.create(overrides)
export const createMockTask = (overrides) => TaskFactory.create(overrides)
export const createMockClient = (overrides) => ClientFactory.create(overrides)
export const createMockActivity = (overrides) => ActivityFactory.create(overrides)

// Preset collections for common test scenarios
export const presets = {
  // Small collection for unit tests
  small: {
    properties: PropertyFactory.createMany(2),
    links: LinkFactory.createMany(1),
    users: [UserFactory.createAgent()],
    deals: DealFactory.createMany(1),
    clients: ClientFactory.createMany(1),
    tasks: TaskFactory.createMany(2),
    activities: ActivityFactory.createMany(5)
  },
  
  // Medium collection for integration tests
  medium: {
    properties: PropertyFactory.createMany(5),
    links: LinkFactory.createMany(3),
    users: [UserFactory.createAgent(), UserFactory.createAgent()],
    deals: DealFactory.createMany(3),
    clients: ClientFactory.createMany(3),
    tasks: TaskFactory.createMany(8),
    activities: ActivityFactory.createMany(15)
  },
  
  // Large collection for stress tests
  large: {
    properties: PropertyFactory.createMany(20),
    links: LinkFactory.createMany(10),
    users: [UserFactory.createAgent(), UserFactory.createAgent(), UserFactory.createAdmin()],
    deals: DealFactory.createMany(15),
    clients: ClientFactory.createMany(10),
    tasks: TaskFactory.createMany(30),
    activities: ActivityFactory.createMany(100)
  },

  // CRM-specific collections
  crm: {
    // Hot leads scenario
    hotLeads: {
      deals: [
        DealFactory.createByTemperature('hot'),
        DealFactory.createByTemperature('hot'),
        DealFactory.createByTemperature('hot')
      ],
      clients: [
        ClientFactory.createByProfileLevel('high'),
        ClientFactory.createByProfileLevel('high'),
        ClientFactory.createByProfileLevel('medium')
      ],
      tasks: [
        TaskFactory.createByPriority('high'),
        TaskFactory.createByPriority('high')
      ]
    },

    // Cold leads scenario
    coldLeads: {
      deals: [
        DealFactory.createByTemperature('cold'),
        DealFactory.createByTemperature('cold'),
        DealFactory.createByTemperature('cold')
      ],
      clients: [
        ClientFactory.createByProfileLevel('low'),
        ClientFactory.createByProfileLevel('low'),
        ClientFactory.createByProfileLevel('medium')
      ],
      tasks: [
        TaskFactory.createByPriority('low'),
        TaskFactory.createByPriority('medium')
      ]
    },

    // Mixed pipeline scenario
    mixedPipeline: {
      deals: [
        DealFactory.createByTemperature('hot'),
        DealFactory.createByTemperature('warm'),
        DealFactory.createByTemperature('warm'),
        DealFactory.createByTemperature('cold'),
        DealFactory.createByTemperature('cold')
      ],
      clients: ClientFactory.createMany(5),
      tasks: [
        TaskFactory.createByPriority('high'),
        TaskFactory.createByPriority('medium'),
        TaskFactory.createByPriority('medium'),
        TaskFactory.createByPriority('low'),
        TaskFactory.createOverdue()
      ]
    }
  }
}

export default {
  PropertyFactory,
  LinkFactory,
  AnalyticsFactory,
  SessionFactory,
  SessionDataFactory,
  UserFactory,
  DealFactory,
  TaskFactory,
  ClientFactory,
  ActivityFactory,
  FormFactory,
  ErrorFactory,
  presets,
  createMockProperty,
  createMockLink,
  createMockAnalytics,
  createMockSession,
  createMockSessionData,
  createMockUser,
  createMockDeal,
  createMockTask,
  createMockClient,
  createMockActivity
}