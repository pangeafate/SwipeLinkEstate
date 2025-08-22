/**
 * Performance monitoring and analysis utilities
 * Used to track and optimize database queries and caching effectiveness
 */
import { globalMemoryCache } from '@/lib/cache/MemoryCache'

export class PerformanceAnalyzer {
  private static measurements: Map<string, {
    startTime: number
    endTime?: number
    duration?: number
    metadata?: any
  }> = new Map()

  /**
   * Start measuring a performance metric
   */
  static startMeasurement(id: string, metadata?: any): void {
    this.measurements.set(id, {
      startTime: Date.now(),
      metadata
    })
  }

  /**
   * End a performance measurement
   */
  static endMeasurement(id: string): number | null {
    const measurement = this.measurements.get(id)
    if (!measurement) {
      console.warn(`Performance measurement with id "${id}" not found`)
      return null
    }

    const endTime = Date.now()
    const duration = endTime - measurement.startTime

    this.measurements.set(id, {
      ...measurement,
      endTime,
      duration
    })

    return duration
  }

  /**
   * Get measurement results
   */
  static getMeasurement(id: string): {
    duration: number
    startTime: number
    endTime: number
    metadata?: any
  } | null {
    const measurement = this.measurements.get(id)
    if (!measurement || !measurement.duration) {
      return null
    }

    return {
      duration: measurement.duration,
      startTime: measurement.startTime,
      endTime: measurement.endTime!,
      metadata: measurement.metadata
    }
  }

  /**
   * Get all measurements
   */
  static getAllMeasurements(): Array<{
    id: string
    duration: number
    startTime: number
    endTime: number
    metadata?: any
  }> {
    const results = []
    for (const [id, measurement] of this.measurements.entries()) {
      if (measurement.duration) {
        results.push({
          id,
          duration: measurement.duration,
          startTime: measurement.startTime,
          endTime: measurement.endTime!,
          metadata: measurement.metadata
        })
      }
    }
    return results.sort((a, b) => b.duration - a.duration) // Sort by duration desc
  }

  /**
   * Clear all measurements
   */
  static clearMeasurements(): void {
    this.measurements.clear()
  }

  /**
   * Analyze cache performance
   */
  static analyzeCachePerformance(): {
    memoryCache: {
      size: number
      keys: string[]
      totalMemoryEstimate: number
    }
    queryPatterns: {
      slowQueries: Array<{
        id: string
        duration: number
        metadata?: any
      }>
      averageQueryTime: number
    }
  } {
    const memoryCacheStats = globalMemoryCache.getStats()
    const measurements = this.getAllMeasurements()
    
    // Identify slow queries (> 1 second)
    const slowQueries = measurements
      .filter(m => m.duration > 1000)
      .map(m => ({
        id: m.id,
        duration: m.duration,
        metadata: m.metadata
      }))

    // Calculate average query time
    const totalDuration = measurements.reduce((sum, m) => sum + m.duration, 0)
    const averageQueryTime = measurements.length > 0 ? totalDuration / measurements.length : 0

    return {
      memoryCache: memoryCacheStats,
      queryPatterns: {
        slowQueries,
        averageQueryTime
      }
    }
  }

  /**
   * Generate performance report
   */
  static generateReport(): {
    timestamp: string
    totalMeasurements: number
    averageQueryTime: number
    slowQueries: number
    cacheEffectiveness: string
    recommendations: string[]
  } {
    const analysis = this.analyzeCachePerformance()
    const measurements = this.getAllMeasurements()
    
    const recommendations: string[] = []

    // Generate recommendations based on analysis
    if (analysis.queryPatterns.averageQueryTime > 500) {
      recommendations.push('Average query time is high (>500ms). Consider adding indexes or optimizing queries.')
    }

    if (analysis.queryPatterns.slowQueries.length > 0) {
      recommendations.push(`Found ${analysis.queryPatterns.slowQueries.length} slow queries (>1s). Review and optimize these queries.`)
    }

    if (analysis.memoryCache.size === 0) {
      recommendations.push('Memory cache is not being used. Consider implementing caching for frequently accessed data.')
    }

    if (analysis.memoryCache.totalMemoryEstimate > 50 * 1024 * 1024) { // 50MB
      recommendations.push('Memory cache is using significant memory (>50MB). Consider reducing cache size or TTL.')
    }

    const cacheEffectiveness = analysis.memoryCache.size > 0 
      ? `Active (${analysis.memoryCache.size} entries, ${Math.round(analysis.memoryCache.totalMemoryEstimate / 1024)}KB)`
      : 'Not utilized'

    return {
      timestamp: new Date().toISOString(),
      totalMeasurements: measurements.length,
      averageQueryTime: Math.round(analysis.queryPatterns.averageQueryTime),
      slowQueries: analysis.queryPatterns.slowQueries.length,
      cacheEffectiveness,
      recommendations
    }
  }

  /**
   * Log performance report to console
   */
  static logReport(): void {
    const report = this.generateReport()
    
    console.group('🚀 Performance Analysis Report')
    console.log(`📅 Generated: ${report.timestamp}`)
    console.log(`📊 Total Measurements: ${report.totalMeasurements}`)
    console.log(`⏱️ Average Query Time: ${report.averageQueryTime}ms`)
    console.log(`🐌 Slow Queries: ${report.slowQueries}`)
    console.log(`💾 Cache Effectiveness: ${report.cacheEffectiveness}`)
    
    if (report.recommendations.length > 0) {
      console.group('💡 Recommendations:')
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`)
      })
      console.groupEnd()
    }
    
    console.groupEnd()
  }
}

/**
 * Performance decorator for measuring function execution time
 */
export function measurePerformance(label?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    const measurementLabel = label || `${target.constructor.name}.${propertyName}`

    descriptor.value = async function (...args: any[]) {
      const measurementId = `${measurementLabel}-${Date.now()}`
      
      PerformanceAnalyzer.startMeasurement(measurementId, {
        method: measurementLabel,
        args: args.length,
        timestamp: new Date().toISOString()
      })

      try {
        const result = await method.apply(this, args)
        const duration = PerformanceAnalyzer.endMeasurement(measurementId)
        
        if (duration && duration > 1000) {
          console.warn(`⚠️ Slow query detected: ${measurementLabel} took ${duration}ms`)
        }
        
        return result
      } catch (error) {
        PerformanceAnalyzer.endMeasurement(measurementId)
        throw error
      }
    }

    return descriptor
  }
}

// Initialize performance monitoring in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Log performance report every 5 minutes
  setInterval(() => {
    const report = PerformanceAnalyzer.generateReport()
    if (report.totalMeasurements > 0) {
      PerformanceAnalyzer.logReport()
      PerformanceAnalyzer.clearMeasurements() // Clear to avoid memory buildup
    }
  }, 5 * 60 * 1000)
}