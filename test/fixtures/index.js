/**
 * Test Fixtures - Main Export
 * 
 * This file exports all fixture data for easy importing.
 * 
 * Usage:
 * import { properties, links, analytics } from '@/test/fixtures'
 * import fixtures from '@/test/fixtures'
 */

import propertiesData from './properties.json'
import linksData from './links.json'
import analyticsData from './analytics.json'
import dealsData from './deals.json'
import clientsData from './clients.json'
import tasksData from './tasks.json'
import activitiesData from './activities.json'

// Export individual fixture collections
export const properties = propertiesData
export const links = linksData
export const analytics = analyticsData
export const deals = dealsData
export const clients = clientsData
export const tasks = tasksData
export const activities = activitiesData

// Convenience accessors for specific fixture types
export const fixtures = {
  properties: propertiesData,
  links: linksData,
  analytics: analyticsData,
  deals: dealsData,
  clients: clientsData,
  tasks: tasksData,
  activities: activitiesData,
  
  // Filtered collections - Properties & Links
  activeProperties: propertiesData.filter(p => p.status === 'active'),
  inactiveProperties: propertiesData.filter(p => p.status === 'inactive'),
  expiredLinks: linksData.filter(l => l.expires_at && new Date(l.expires_at) < new Date()),
  permanentLinks: linksData.filter(l => !l.expires_at),
  
  // Filtered collections - CRM Deals
  activeDeals: dealsData.filter(d => d.dealStatus === 'active'),
  qualifiedDeals: dealsData.filter(d => d.dealStatus === 'qualified'),
  closedWonDeals: dealsData.filter(d => d.dealStatus === 'closed-won'),
  closedLostDeals: dealsData.filter(d => d.dealStatus === 'closed-lost'),
  hotDeals: dealsData.filter(d => d.clientTemperature === 'hot'),
  warmDeals: dealsData.filter(d => d.clientTemperature === 'warm'),
  coldDeals: dealsData.filter(d => d.clientTemperature === 'cold'),
  
  // Filtered collections - CRM Clients
  activeClients: clientsData.filter(c => c.status === 'active'),
  highEngagementClients: clientsData.filter(c => c.engagementScore >= 70),
  lowProfileClients: clientsData.filter(c => c.profileCompleteness < 50),
  highProfileClients: clientsData.filter(c => c.profileCompleteness >= 80),
  
  // Filtered collections - CRM Tasks
  pendingTasks: tasksData.filter(t => t.status === 'pending'),
  completedTasks: tasksData.filter(t => t.status === 'completed'),
  highPriorityTasks: tasksData.filter(t => t.priority === 'high'),
  automatedTasks: tasksData.filter(t => t.isAutomated === true),
  overdueTasks: tasksData.filter(t => t.status === 'pending' && new Date(t.dueDate) < new Date()),
  
  // Filtered collections - CRM Activities
  propertyInteractions: activitiesData.filter(a => a.category === 'property_interaction'),
  communicationActivities: activitiesData.filter(a => a.category === 'communication'),
  engagementActivities: activitiesData.filter(a => a.category === 'engagement'),
  milestoneActivities: activitiesData.filter(a => a.category === 'milestone'),
  
  // Property type collections
  houses: propertiesData.filter(p => p.property_type === 'house'),
  apartments: propertiesData.filter(p => p.property_type === 'apartment'),
  condos: propertiesData.filter(p => p.property_type === 'condo'),
  townhouses: propertiesData.filter(p => p.property_type === 'townhouse'),
  
  // Price range collections
  budgetProperties: propertiesData.filter(p => p.price <= 300000),
  midRangeProperties: propertiesData.filter(p => p.price > 300000 && p.price <= 600000),
  luxuryProperties: propertiesData.filter(p => p.price > 600000),
  
  // Analytics collections
  dashboardAnalytics: analyticsData.dashboardAnalytics,
  linkAnalytics: analyticsData.linkAnalytics,
  propertyAnalytics: analyticsData.propertyAnalytics,
  sessionData: analyticsData.sessionData,
  aggregatedMetrics: analyticsData.aggregatedMetrics,
  
  // Chart data for testing
  chartData: analyticsData.chartData
}

// Helper functions for working with fixtures
export const fixtureHelpers = {
  /**
   * Get a property by ID
   * @param {string} id - Property ID
   * @returns {Object|undefined} Property object
   */
  getPropertyById(id) {
    return propertiesData.find(p => p.id === id)
  },

  /**
   * Get a link by code
   * @param {string} code - Link code
   * @returns {Object|undefined} Link object
   */
  getLinkByCode(code) {
    return linksData.find(l => l.code === code)
  },

  /**
   * Get properties by IDs
   * @param {string[]} ids - Array of property IDs
   * @returns {Object[]} Array of property objects
   */
  getPropertiesByIds(ids) {
    return propertiesData.filter(p => ids.includes(p.id))
  },

  /**
   * Get properties for a link
   * @param {string} linkCode - Link code
   * @returns {Object[]} Array of property objects
   */
  getPropertiesForLink(linkCode) {
    const link = this.getLinkByCode(linkCode)
    if (!link) return []
    return this.getPropertiesByIds(link.property_ids)
  },

  /**
   * Get a random property
   * @param {Object} filters - Optional filters
   * @returns {Object} Random property object
   */
  getRandomProperty(filters = {}) {
    let filteredProperties = propertiesData
    
    if (filters.status) {
      filteredProperties = filteredProperties.filter(p => p.status === filters.status)
    }
    if (filters.property_type) {
      filteredProperties = filteredProperties.filter(p => p.property_type === filters.property_type)
    }
    if (filters.minPrice) {
      filteredProperties = filteredProperties.filter(p => p.price >= filters.minPrice)
    }
    if (filters.maxPrice) {
      filteredProperties = filteredProperties.filter(p => p.price <= filters.maxPrice)
    }
    
    const randomIndex = Math.floor(Math.random() * filteredProperties.length)
    return filteredProperties[randomIndex]
  },

  /**
   * Get multiple random properties
   * @param {number} count - Number of properties to return
   * @param {Object} filters - Optional filters
   * @returns {Object[]} Array of random property objects
   */
  getRandomProperties(count = 3, filters = {}) {
    const properties = []
    const used = new Set()
    
    while (properties.length < count && used.size < propertiesData.length) {
      const property = this.getRandomProperty(filters)
      if (property && !used.has(property.id)) {
        properties.push(property)
        used.add(property.id)
      }
    }
    
    return properties
  },

  /**
   * Get a subset of properties for testing
   * @param {number} count - Number of properties to return
   * @param {number} startIndex - Starting index (default: 0)
   * @returns {Object[]} Array of property objects
   */
  getPropertiesSubset(count = 5, startIndex = 0) {
    return propertiesData.slice(startIndex, startIndex + count)
  },

  /**
   * Get analytics data for a specific link
   * @param {string} linkCode - Link code
   * @returns {Object|undefined} Analytics object
   */
  getAnalyticsForLink(linkCode) {
    return analyticsData.linkAnalytics[linkCode]
  },

  /**
   * Get analytics data for a specific property
   * @param {string} propertyId - Property ID
   * @returns {Object|undefined} Analytics object
   */
  getAnalyticsForProperty(propertyId) {
    return analyticsData.propertyAnalytics[propertyId]
  },

  /**
   * Get a deal by ID
   * @param {string} id - Deal ID
   * @returns {Object|undefined} Deal object
   */
  getDealById(id) {
    return dealsData.find(d => d.id === id)
  },

  /**
   * Get a client by ID
   * @param {string} id - Client ID
   * @returns {Object|undefined} Client object
   */
  getClientById(id) {
    return clientsData.find(c => c.id === id)
  },

  /**
   * Get a task by ID
   * @param {string} id - Task ID
   * @returns {Object|undefined} Task object
   */
  getTaskById(id) {
    return tasksData.find(t => t.id === id)
  },

  /**
   * Get deals by agent ID
   * @param {string} agentId - Agent ID
   * @returns {Object[]} Array of deal objects
   */
  getDealsByAgent(agentId) {
    return dealsData.filter(d => d.agentId === agentId)
  },

  /**
   * Get clients by agent ID
   * @param {string} agentId - Agent ID
   * @returns {Object[]} Array of client objects
   */
  getClientsByAgent(agentId) {
    return clientsData.filter(c => c.assignedAgent === agentId)
  },

  /**
   * Get tasks by deal ID
   * @param {string} dealId - Deal ID
   * @returns {Object[]} Array of task objects
   */
  getTasksByDeal(dealId) {
    return tasksData.filter(t => t.dealId === dealId)
  },

  /**
   * Get activities by client ID
   * @param {string} clientId - Client ID
   * @returns {Object[]} Array of activity objects
   */
  getActivitiesByClient(clientId) {
    return activitiesData.filter(a => a.clientId === clientId)
  },

  /**
   * Get activities by deal ID
   * @param {string} dealId - Deal ID
   * @returns {Object[]} Array of activity objects
   */
  getActivitiesByDeal(dealId) {
    return activitiesData.filter(a => a.dealId === dealId)
  },

  /**
   * Get activities by session ID
   * @param {string} sessionId - Session ID
   * @returns {Object[]} Array of activity objects
   */
  getActivitiesBySession(sessionId) {
    return activitiesData.filter(a => a.sessionId === sessionId)
  },

  /**
   * Get complete deal with related data
   * @param {string} dealId - Deal ID
   * @returns {Object} Complete deal object with client, tasks, and activities
   */
  getCompleteDeal(dealId) {
    const deal = this.getDealById(dealId)
    if (!deal) return null

    return {
      deal,
      client: this.getClientById(deal.clientId),
      tasks: this.getTasksByDeal(dealId),
      activities: this.getActivitiesByDeal(dealId),
      properties: this.getPropertiesByIds(deal.propertyIds)
    }
  },

  /**
   * Get deals by temperature and stage for pipeline testing
   * @param {string} temperature - 'hot', 'warm', or 'cold'
   * @param {string} stage - Deal stage
   * @returns {Object[]} Array of matching deals
   */
  getDealsByTemperatureAndStage(temperature, stage) {
    return dealsData.filter(d => 
      d.clientTemperature === temperature && 
      d.dealStage === stage
    )
  },

  /**
   * Get overdue tasks for testing task automation
   * @returns {Object[]} Array of overdue task objects
   */
  getOverdueTasks() {
    const now = new Date()
    return tasksData.filter(t => 
      t.status === 'pending' && 
      new Date(t.dueDate) < now
    )
  },

  /**
   * Get high-value deals for testing performance metrics
   * @param {number} minValue - Minimum deal value
   * @returns {Object[]} Array of high-value deals
   */
  getHighValueDeals(minValue = 30000) {
    return dealsData.filter(d => d.dealValue >= minValue)
  },

  /**
   * Create a modified copy of fixture data
   * @param {Object} data - Original data
   * @param {Object} modifications - Modifications to apply
   * @returns {Object} Modified copy of data
   */
  modifyFixture(data, modifications) {
    return { ...data, ...modifications }
  },

  /**
   * Create multiple modified copies of fixture data
   * @param {Object} data - Original data
   * @param {Object[]} modificationsArray - Array of modifications
   * @returns {Object[]} Array of modified copies
   */
  modifyFixtures(data, modificationsArray) {
    return modificationsArray.map(modifications => 
      this.modifyFixture(data, modifications)
    )
  }
}

// Default export
export default {
  properties,
  links,
  analytics,
  deals,
  clients,
  tasks,
  activities,
  fixtures,
  helpers: fixtureHelpers,
  
  // Convenience methods - Original
  getProperty: fixtureHelpers.getPropertyById,
  getLink: fixtureHelpers.getLinkByCode,
  getRandomProperty: fixtureHelpers.getRandomProperty.bind(fixtureHelpers),
  getPropertiesSubset: fixtureHelpers.getPropertiesSubset,
  
  // Convenience methods - CRM
  getDeal: fixtureHelpers.getDealById,
  getClient: fixtureHelpers.getClientById,
  getTask: fixtureHelpers.getTaskById,
  getCompleteDeal: fixtureHelpers.getCompleteDeal.bind(fixtureHelpers),
  getDealsByAgent: fixtureHelpers.getDealsByAgent,
  getOverdueTasks: fixtureHelpers.getOverdueTasks
}