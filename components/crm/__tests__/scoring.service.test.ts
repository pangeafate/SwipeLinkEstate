/**
 * Client Engagement Scoring Service Tests
 * Refactored to use shared test infrastructure for consistency and maintainability
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { ScoringService } from '../scoring.service'
import type { SessionData, EngagementMetrics, ClientTemperature } from '../types'
import { SessionDataFactory } from '@/test'

describe('Client Engagement Scoring Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('calculateEngagementScore', () => {
    it('should calculate a perfect score for highly engaged session', async () => {
      // Arrange
      const sessionData = SessionDataFactory.create({
        duration: 1800, // 30 minutes
        totalProperties: 10,
        propertiesViewed: 10, // 100% completion = 25 points
        propertiesLiked: 5, // 5 * 2 = 10 points
        propertiesConsidered: 3, // 3 * 1 = 3 points
        detailViewsOpened: 8, // 8 * 3 = 24 points (capped at 35 total)
        averageTimePerProperty: 180, // 180/30 = 6 points
        isCompleted: true,
        isReturnVisit: true // 10 points + 10 for long session
      })

      // Act
      const result = await ScoringService.calculateEngagementScore(sessionData)

      // Assert
      expect(result.totalScore).toBeGreaterThanOrEqual(80) // Should be hot lead
      expect(result.totalScore).toBeLessThanOrEqual(100)
    })

    it('should calculate low score for minimal engagement', async () => {
      // Arrange
      const sessionData = SessionDataFactory.createLowEngagement({
        duration: 120,
        propertiesViewed: 2,
        averageTimePerProperty: 60
      })

      // Act
      const result = await ScoringService.calculateEngagementScore(sessionData)

      // Assert
      expect(result.totalScore).toBeLessThan(50) // Should be cold lead
      expect(result.totalScore).toBeGreaterThanOrEqual(0)
    })

    it('should return 0 score for no engagement', async () => {
      // Arrange
      const sessionData = SessionDataFactory.createNoEngagement()

      // Act
      const result = await ScoringService.calculateEngagementScore(sessionData)

      // Assert
      expect(result.totalScore).toBe(0)
    })
  })

  describe('getEngagementScoreComponents', () => {
    it('should break down score into component parts', async () => {
      // Arrange
      const sessionData = SessionDataFactory.createMediumEngagement({
        duration: 900,
        propertiesViewed: 8,
        propertiesLiked: 2,
        propertiesConsidered: 1,
        detailViewsOpened: 3,
        averageTimePerProperty: 112,
        isCompleted: true,
        isReturnVisit: false
      })

      // Act
      const result = await ScoringService.getEngagementScoreComponents(sessionData)

      // Assert
      expect(result.sessionCompletion).toBeGreaterThanOrEqual(0)
      expect(result.sessionCompletion).toBeLessThanOrEqual(25)
      
      expect(result.propertyInteraction).toBeGreaterThanOrEqual(0)
      expect(result.propertyInteraction).toBeLessThanOrEqual(35)
      
      expect(result.behavioralIndicators).toBeGreaterThanOrEqual(0)
      expect(result.behavioralIndicators).toBeLessThanOrEqual(25)
      
      expect(result.recencyFactor).toBeGreaterThanOrEqual(0)
      expect(result.recencyFactor).toBeLessThanOrEqual(15)
      
      const componentSum = result.sessionCompletion + 
                          result.propertyInteraction + 
                          result.behavioralIndicators + 
                          result.recencyFactor
      expect(result.totalScore).toBe(componentSum)
    })

    it('should award maximum session completion for 100% viewed', async () => {
      // Arrange
      const sessionData = SessionDataFactory.create({
        propertiesViewed: 10, // 100% completion
        propertiesLiked: 0,
        propertiesConsidered: 0,
        detailViewsOpened: 0,
        isCompleted: true,
        isReturnVisit: false
      })

      // Act
      const result = await ScoringService.getEngagementScoreComponents(sessionData)

      // Assert
      expect(result.sessionCompletion).toBe(25) // Maximum points for completion
    })

    it('should award property interaction points for likes and details', async () => {
      // Arrange
      const sessionData = SessionDataFactory.create({
        propertiesViewed: 5,
        propertiesLiked: 5, // High likes
        propertiesConsidered: 0,
        detailViewsOpened: 5, // High detail views
        averageTimePerProperty: 240,
        isCompleted: false
      })

      // Act
      const result = await ScoringService.getEngagementScoreComponents(sessionData)

      // Assert
      expect(result.propertyInteraction).toBeGreaterThan(20) // Should get high interaction points
    })

    it('should apply recency factor for recent activity', async () => {
      // Arrange
      const sessionData = SessionDataFactory.createRecent({
        totalProperties: 5,
        propertiesViewed: 5,
        propertiesLiked: 1,
        detailViewsOpened: 1,
        averageTimePerProperty: 720,
        isCompleted: true
      })

      // Act
      const result = await ScoringService.getEngagementScoreComponents(sessionData)

      // Assert
      expect(result.recencyFactor).toBe(15) // Maximum recency points for activity within 24 hours
    })

    it('should reduce recency factor for old activity', async () => {
      // Arrange
      const sessionData = SessionDataFactory.createOld({
        duration: 600,
        totalProperties: 5,
        propertiesViewed: 5,
        propertiesLiked: 1,
        detailViewsOpened: 1,
        averageTimePerProperty: 120,
        isCompleted: true
      })

      // Act
      const result = await ScoringService.getEngagementScoreComponents(sessionData)

      // Assert
      expect(result.recencyFactor).toBe(0) // No recency points for old activity
    })
  })

  describe('getClientTemperatureFromScore', () => {
    it('should classify as HOT for scores 80-100', () => {
      // Test boundary conditions
      expect(ScoringService.getClientTemperatureFromScore(100)).toBe('hot')
      expect(ScoringService.getClientTemperatureFromScore(80)).toBe('hot')
      expect(ScoringService.getClientTemperatureFromScore(85)).toBe('hot')
    })

    it('should classify as WARM for scores 50-79', () => {
      expect(ScoringService.getClientTemperatureFromScore(79)).toBe('warm')
      expect(ScoringService.getClientTemperatureFromScore(50)).toBe('warm')
      expect(ScoringService.getClientTemperatureFromScore(65)).toBe('warm')
    })

    it('should classify as COLD for scores 0-49', () => {
      expect(ScoringService.getClientTemperatureFromScore(49)).toBe('cold')
      expect(ScoringService.getClientTemperatureFromScore(0)).toBe('cold')
      expect(ScoringService.getClientTemperatureFromScore(25)).toBe('cold')
    })

    it('should handle edge cases', () => {
      expect(ScoringService.getClientTemperatureFromScore(-10)).toBe('cold')
      expect(ScoringService.getClientTemperatureFromScore(150)).toBe('hot')
    })
  })

  describe('Behavioral Indicators', () => {
    it('should award points for return visits', async () => {
      // Arrange
      const baseConfig = {
        duration: 600,
        propertiesViewed: 5,
        propertiesLiked: 0,
        detailViewsOpened: 0,
        averageTimePerProperty: 120,
        isCompleted: false
      }
      const sessionData = SessionDataFactory.create({ ...baseConfig, isReturnVisit: true })
      const firstVisitData = SessionDataFactory.create({ ...baseConfig, isReturnVisit: false })

      // Act
      const returnScore = await ScoringService.calculateEngagementScore(sessionData)
      const firstScore = await ScoringService.calculateEngagementScore(firstVisitData)

      // Assert
      expect(returnScore.totalScore).toBeGreaterThan(firstScore.totalScore)
    })

    it('should award points for long session duration', async () => {
      // Arrange
      const baseConfig = {
        propertiesViewed: 5,
        propertiesLiked: 0,
        detailViewsOpened: 0,
        averageTimePerProperty: 180,
        isCompleted: false
      }
      const longSession = SessionDataFactory.create({ ...baseConfig, duration: 900 }) // 15 minutes
      const shortSession = SessionDataFactory.create({ ...baseConfig, duration: 120 }) // 2 minutes

      // Act
      const longScore = await ScoringService.calculateEngagementScore(longSession)
      const shortScore = await ScoringService.calculateEngagementScore(shortSession)

      // Assert
      expect(longScore.totalScore).toBeGreaterThan(shortScore.totalScore)
    })

    it('should award points for high like-to-view ratio', async () => {
      // Arrange
      const baseConfig = {
        duration: 600,
        propertiesViewed: 10,
        detailViewsOpened: 0,
        averageTimePerProperty: 60,
        isCompleted: true
      }
      const highLikeRatio = SessionDataFactory.create({ ...baseConfig, propertiesLiked: 3 }) // 30% ratio
      const lowLikeRatio = SessionDataFactory.create({ ...baseConfig, propertiesLiked: 1 }) // 10% ratio

      // Act
      const highScore = await ScoringService.calculateEngagementScore(highLikeRatio)
      const lowScore = await ScoringService.calculateEngagementScore(lowLikeRatio)

      // Assert
      expect(highScore.totalScore).toBeGreaterThan(lowScore.totalScore)
    })
  })

  describe('Edge Cases', () => {
    it('should handle sessions with no end time', async () => {
      // Arrange
      const ongoingSession = SessionDataFactory.create({
        endTime: null, // Still ongoing
        duration: 300,
        propertiesViewed: 3,
        propertiesLiked: 1,
        detailViewsOpened: 1,
        averageTimePerProperty: 100,
        isCompleted: false
      })

      // Act
      const result = await ScoringService.calculateEngagementScore(ongoingSession)

      // Assert
      expect(result.totalScore).toBeGreaterThanOrEqual(0)
      expect(result.totalScore).toBeLessThanOrEqual(100)
    })

    it('should handle sessions with no properties', async () => {
      // Arrange
      const emptySession = SessionDataFactory.create({
        duration: 60,
        totalProperties: 0, // No properties in collection
        propertiesViewed: 0,
        propertiesLiked: 0,
        propertiesConsidered: 0,
        propertiesPassed: 0,
        detailViewsOpened: 0,
        averageTimePerProperty: 0,
        isCompleted: false
      })

      // Act
      const result = await ScoringService.calculateEngagementScore(emptySession)

      // Assert
      expect(result.totalScore).toBe(0)
    })
  })
})