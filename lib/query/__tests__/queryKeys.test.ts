import { queryKeys } from '../queryKeys'

describe('Query Keys', () => {
  describe('Properties', () => {
    it('should generate correct property keys', () => {
      // ARRANGE & ACT
      const baseKey = queryKeys.properties.all()
      const listKey = queryKeys.properties.list()
      const singlePropertyKey = queryKeys.properties.detail('property-123')
      const multiplePropertiesKey = queryKeys.properties.multiple(['prop-1', 'prop-2'])

      // ASSERT
      expect(baseKey).toEqual(['properties'])
      expect(listKey).toEqual(['properties', 'all'])
      expect(singlePropertyKey).toEqual(['properties', 'detail', 'property-123'])
      expect(multiplePropertiesKey).toEqual(['properties', 'multiple', ['prop-1', 'prop-2']])
    })
  })

  describe('Links', () => {
    it('should generate correct link keys', () => {
      // ARRANGE & ACT
      const baseKey = queryKeys.links.all()
      const listKey = queryKeys.links.list()
      const singleLinkKey = queryKeys.links.detail('link-abc123')
      const agentLinksKey = queryKeys.links.agent('agent-456')

      // ASSERT
      expect(baseKey).toEqual(['links'])
      expect(listKey).toEqual(['links', 'all'])
      expect(singleLinkKey).toEqual(['links', 'detail', 'link-abc123'])
      expect(agentLinksKey).toEqual(['links', 'agent', 'agent-456'])
    })
  })

  describe('Swipe', () => {
    it('should generate correct swipe keys', () => {
      // ARRANGE & ACT
      const sessionKey = queryKeys.swipe.session('session-789')
      const stateKey = queryKeys.swipe.state('session-789')

      // ASSERT
      expect(sessionKey).toEqual(['swipe', 'session', 'session-789'])
      expect(stateKey).toEqual(['swipe', 'state', 'session-789'])
    })
  })

  describe('Analytics', () => {
    it('should generate correct analytics keys', () => {
      // ARRANGE & ACT
      const dashboardKey = queryKeys.analytics.dashboard()
      const propertyMetricsKey = queryKeys.analytics.propertyMetrics('prop-123')
      const swipeAnalyticsKey = queryKeys.analytics.swipeAnalytics('session-456')

      // ASSERT
      expect(dashboardKey).toEqual(['analytics', 'dashboard'])
      expect(propertyMetricsKey).toEqual(['analytics', 'property-metrics', 'prop-123'])
      expect(swipeAnalyticsKey).toEqual(['analytics', 'swipe-analytics', 'session-456'])
    })
  })
})