import { PerformanceAnalyzer, measurePerformance } from '../PerformanceAnalyzer'

// Mock the memory cache
jest.mock('@/lib/cache/MemoryCache', () => ({
  globalMemoryCache: {
    getStats: jest.fn(() => ({
      size: 5,
      keys: ['key1', 'key2', 'key3', 'key4', 'key5'],
      totalMemoryEstimate: 1024 * 10 // 10KB
    }))
  }
}))

describe('PerformanceAnalyzer', () => {
  beforeEach(() => {
    // Clear measurements before each test
    PerformanceAnalyzer.clearMeasurements()
    jest.clearAllMocks()
  })

  describe('Basic Measurement Operations', () => {
    it('should start and end measurements correctly', () => {
      // ARRANGE
      const measurementId = 'test-query-1'
      const metadata = { query: 'SELECT * FROM properties' }
      const mockNow = jest.spyOn(Date, 'now')

      // ACT
      mockNow.mockReturnValueOnce(1000) // Start time
      PerformanceAnalyzer.startMeasurement(measurementId, metadata)
      
      mockNow.mockReturnValueOnce(1500) // End time
      const duration = PerformanceAnalyzer.endMeasurement(measurementId)

      // ASSERT
      expect(duration).toBe(500)
      
      const measurement = PerformanceAnalyzer.getMeasurement(measurementId)
      expect(measurement).toEqual({
        duration: 500,
        startTime: 1000,
        endTime: 1500,
        metadata
      })

      mockNow.mockRestore()
    })

    it('should return null for non-existent measurement on end', () => {
      // ACT
      const duration = PerformanceAnalyzer.endMeasurement('non-existent')

      // ASSERT
      expect(duration).toBeNull()
    })

    it('should warn when ending non-existent measurement', () => {
      // ARRANGE
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      // ACT
      PerformanceAnalyzer.endMeasurement('non-existent')

      // ASSERT
      expect(consoleSpy).toHaveBeenCalledWith(
        'Performance measurement with id "non-existent" not found'
      )
      
      consoleSpy.mockRestore()
    })

    it('should return null for measurement that has not ended', () => {
      // ARRANGE
      PerformanceAnalyzer.startMeasurement('incomplete-test')

      // ACT
      const measurement = PerformanceAnalyzer.getMeasurement('incomplete-test')

      // ASSERT
      expect(measurement).toBeNull()
    })

    it('should clear all measurements', () => {
      // ARRANGE
      PerformanceAnalyzer.startMeasurement('test1')
      PerformanceAnalyzer.startMeasurement('test2')

      // ACT
      PerformanceAnalyzer.clearMeasurements()

      // ASSERT
      expect(PerformanceAnalyzer.getAllMeasurements()).toEqual([])
    })
  })

  describe('Multiple Measurements', () => {
    it('should handle multiple measurements and sort by duration', () => {
      // ARRANGE
      const mockNow = jest.spyOn(Date, 'now')
      
      // Fast query
      mockNow.mockReturnValueOnce(1000) // Start
      PerformanceAnalyzer.startMeasurement('fast-query', { type: 'fast' })
      mockNow.mockReturnValueOnce(1100) // End (100ms)
      PerformanceAnalyzer.endMeasurement('fast-query')
      
      // Slow query
      mockNow.mockReturnValueOnce(2000) // Start
      PerformanceAnalyzer.startMeasurement('slow-query', { type: 'slow' })
      mockNow.mockReturnValueOnce(3000) // End (1000ms)
      PerformanceAnalyzer.endMeasurement('slow-query')

      // ACT
      const measurements = PerformanceAnalyzer.getAllMeasurements()

      // ASSERT
      expect(measurements).toHaveLength(2)
      expect(measurements[0].id).toBe('slow-query') // Should be first (longest)
      expect(measurements[0].duration).toBe(1000)
      expect(measurements[1].id).toBe('fast-query')
      expect(measurements[1].duration).toBe(100)
      
      mockNow.mockRestore()
    })
  })

  describe('Cache Performance Analysis', () => {
    it('should analyze cache performance correctly', () => {
      // ARRANGE
      const mockNow = jest.spyOn(Date, 'now')
      
      // Add some measurements
      mockNow.mockReturnValueOnce(1000)
      PerformanceAnalyzer.startMeasurement('query1')
      mockNow.mockReturnValueOnce(1500) // 500ms
      PerformanceAnalyzer.endMeasurement('query1')
      
      mockNow.mockReturnValueOnce(2000)
      PerformanceAnalyzer.startMeasurement('query2')
      mockNow.mockReturnValueOnce(3500) // 1500ms (slow)
      PerformanceAnalyzer.endMeasurement('query2')

      // ACT
      const analysis = PerformanceAnalyzer.analyzeCachePerformance()

      // ASSERT
      expect(analysis.memoryCache).toEqual({
        size: 5,
        keys: ['key1', 'key2', 'key3', 'key4', 'key5'],
        totalMemoryEstimate: 1024 * 10
      })
      expect(analysis.queryPatterns.slowQueries).toHaveLength(1)
      expect(analysis.queryPatterns.slowQueries[0].id).toBe('query2')
      expect(analysis.queryPatterns.averageQueryTime).toBe(1000) // (500 + 1500) / 2

      mockNow.mockRestore()
    })

    it('should handle empty measurements in analysis', () => {
      // ACT
      const analysis = PerformanceAnalyzer.analyzeCachePerformance()

      // ASSERT
      expect(analysis.queryPatterns.slowQueries).toEqual([])
      expect(analysis.queryPatterns.averageQueryTime).toBe(0)
    })
  })

  describe('Report Generation', () => {
    it('should generate comprehensive performance report', () => {
      // ARRANGE
      const mockNow = jest.spyOn(Date, 'now')
      const mockDate = jest.spyOn(global.Date.prototype, 'toISOString')
        .mockReturnValue('2023-01-01T12:00:00.000Z')
      
      // Add measurements
      mockNow.mockReturnValueOnce(1000)
      PerformanceAnalyzer.startMeasurement('fast-query')
      mockNow.mockReturnValueOnce(1200) // 200ms
      PerformanceAnalyzer.endMeasurement('fast-query')
      
      mockNow.mockReturnValueOnce(2000)
      PerformanceAnalyzer.startMeasurement('slow-query')
      mockNow.mockReturnValueOnce(3500) // 1500ms
      PerformanceAnalyzer.endMeasurement('slow-query')

      // ACT
      const report = PerformanceAnalyzer.generateReport()

      // ASSERT
      expect(report.timestamp).toBe('2023-01-01T12:00:00.000Z')
      expect(report.totalMeasurements).toBe(2)
      expect(report.averageQueryTime).toBe(850) // Rounded (200 + 1500) / 2
      expect(report.slowQueries).toBe(1)
      expect(report.cacheEffectiveness).toBe('Active (5 entries, 10KB)')
      expect(report.recommendations).toContain(
        'Found 1 slow queries (>1s). Review and optimize these queries.'
      )
      expect(report.recommendations).toContain(
        'Average query time is high (>500ms). Consider adding indexes or optimizing queries.'
      )

      mockNow.mockRestore()
      mockDate.mockRestore()
    })

    it('should generate report with cache recommendations', () => {
      // ARRANGE
      const { globalMemoryCache } = require('@/lib/cache/MemoryCache')
      globalMemoryCache.getStats.mockReturnValue({
        size: 0,
        keys: [],
        totalMemoryEstimate: 0
      })

      // ACT
      const report = PerformanceAnalyzer.generateReport()

      // ASSERT
      expect(report.cacheEffectiveness).toBe('Not utilized')
      expect(report.recommendations).toContain(
        'Memory cache is not being used. Consider implementing caching for frequently accessed data.'
      )
    })

    it('should warn about high memory usage', () => {
      // ARRANGE
      const { globalMemoryCache } = require('@/lib/cache/MemoryCache')
      globalMemoryCache.getStats.mockReturnValue({
        size: 1000,
        keys: [],
        totalMemoryEstimate: 60 * 1024 * 1024 // 60MB
      })

      // ACT
      const report = PerformanceAnalyzer.generateReport()

      // ASSERT
      expect(report.recommendations).toContain(
        'Memory cache is using significant memory (>50MB). Consider reducing cache size or TTL.'
      )
    })

    it('should log report to console', () => {
      // ARRANGE
      const consoleSpy = {
        group: jest.spyOn(console, 'group').mockImplementation(),
        log: jest.spyOn(console, 'log').mockImplementation(),
        groupEnd: jest.spyOn(console, 'groupEnd').mockImplementation()
      }

      // ACT
      PerformanceAnalyzer.logReport()

      // ASSERT
      expect(consoleSpy.group).toHaveBeenCalledWith('🚀 Performance Analysis Report')
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('📅 Generated:'))
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('📊 Total Measurements:'))
      expect(consoleSpy.groupEnd).toHaveBeenCalled()

      // Restore console
      Object.values(consoleSpy).forEach(spy => spy.mockRestore())
    })
  })

  describe('Performance Decorator Function', () => {
    it('should export measurePerformance decorator function', () => {
      // ACT & ASSERT
      expect(measurePerformance).toBeDefined()
      expect(typeof measurePerformance).toBe('function')
    })

    it('should create decorator that measures performance', () => {
      // ARRANGE
      const decorator = measurePerformance('test-label')
      
      // ACT & ASSERT
      expect(decorator).toBeDefined()
      expect(typeof decorator).toBe('function')
    })
  })

  describe('Development Environment Initialization', () => {
    const originalEnv = process.env.NODE_ENV
    const originalWindow = global.window

    afterEach(() => {
      process.env.NODE_ENV = originalEnv
      global.window = originalWindow
    })

    it('should initialize interval in development with window', () => {
      // ARRANGE
      process.env.NODE_ENV = 'development'
      global.window = {} as any
      const setIntervalSpy = jest.spyOn(global, 'setInterval').mockImplementation()

      // ACT
      // Re-require the module to trigger initialization
      jest.resetModules()
      require('../PerformanceAnalyzer')

      // ASSERT
      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        5 * 60 * 1000 // 5 minutes
      )

      setIntervalSpy.mockRestore()
    })

    it('should not initialize interval in production', () => {
      // ARRANGE
      process.env.NODE_ENV = 'production'
      global.window = {} as any
      const setIntervalSpy = jest.spyOn(global, 'setInterval').mockImplementation()

      // ACT
      jest.resetModules()
      require('../PerformanceAnalyzer')

      // ASSERT
      expect(setIntervalSpy).not.toHaveBeenCalled()

      setIntervalSpy.mockRestore()
    })
  })
})