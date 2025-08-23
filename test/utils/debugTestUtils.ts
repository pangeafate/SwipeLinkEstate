/**
 * Debug Test Utilities
 * 
 * Utilities to help diagnose and fix common React testing issues:
 * - State update loops
 * - Memory leaks
 * - Async operation problems
 * - Mock conflicts
 */

import { jest } from '@jest/globals'

// ================================
// REACT STATE LOOP DETECTION
// ================================

/**
 * Detects potential useEffect infinite loops
 */
export const detectStateLoops = {
  /**
   * Warns about unstable dependencies in useEffect
   */
  checkDependencies: (deps: any[], componentName: string = 'Component') => {
    const warnings: string[] = []
    
    deps.forEach((dep, index) => {
      // Check for object dependencies that might be recreated on every render
      if (dep && typeof dep === 'object' && !Array.isArray(dep)) {
        warnings.push(`Dependency ${index} is an object that may cause infinite loops`)
      }
      
      // Check for array dependencies
      if (Array.isArray(dep)) {
        warnings.push(`Dependency ${index} is an array - consider using length or specific elements`)
      }
      
      // Check for function dependencies
      if (typeof dep === 'function') {
        warnings.push(`Dependency ${index} is a function - ensure it's memoized with useCallback`)
      }
    })
    
    if (warnings.length > 0) {
      console.warn(`🔄 Potential infinite loop in ${componentName}:`, warnings)
    }
    
    return warnings
  },

  /**
   * Provides suggestions for fixing dependencies
   */
  suggestFixes: (problematicDeps: string[]): Record<string, string> => {
    const suggestions: Record<string, string> = {}
    
    problematicDeps.forEach(dep => {
      if (dep.includes('object')) {
        suggestions[dep] = 'Use specific object properties or useMemo'
      }
      if (dep.includes('array')) {
        suggestions[dep] = 'Use array.length or specific indices'
      }
      if (dep.includes('function')) {
        suggestions[dep] = 'Wrap in useCallback with proper dependencies'
      }
    })
    
    return suggestions
  }
}

// ================================
// MOCK CONFLICT DETECTION
// ================================

/**
 * Detects and reports mock conflicts
 */
export const mockDiagnostics = {
  /**
   * Tracks mock usage across tests
   */
  mockTracker: new Map<string, { calls: number, lastReset: number }>(),

  /**
   * Records mock usage
   */
  recordMockUsage: (mockName: string) => {
    const current = mockDiagnostics.mockTracker.get(mockName) || { calls: 0, lastReset: 0 }
    current.calls++
    mockDiagnostics.mockTracker.set(mockName, current)
  },

  /**
   * Records mock reset
   */
  recordMockReset: (mockName: string) => {
    const current = mockDiagnostics.mockTracker.get(mockName) || { calls: 0, lastReset: 0 }
    current.lastReset = Date.now()
    current.calls = 0
    mockDiagnostics.mockTracker.set(mockName, current)
  },

  /**
   * Reports potential mock conflicts
   */
  reportConflicts: (): string[] => {
    const conflicts: string[] = []
    
    mockDiagnostics.mockTracker.forEach((data, mockName) => {
      if (data.calls > 100) {
        conflicts.push(`${mockName}: High call count (${data.calls}) - potential memory leak`)
      }
      
      const timeSinceReset = Date.now() - data.lastReset
      if (timeSinceReset > 60000 && data.calls > 10) { // 1 minute
        conflicts.push(`${mockName}: Not reset recently - potential state pollution`)
      }
    })
    
    return conflicts
  },

  /**
   * Clears all tracking data
   */
  clearTracking: () => {
    mockDiagnostics.mockTracker.clear()
  }
}

// ================================
// MEMORY LEAK DETECTION
// ================================

/**
 * Detects potential memory leaks in tests
 */
export const memoryLeakDetector = {
  /**
   * Tracks component mount/unmount
   */
  componentTracker: new Map<string, { mounted: number, unmounted: number }>(),

  /**
   * Records component mount
   */
  recordMount: (componentName: string) => {
    const current = memoryLeakDetector.componentTracker.get(componentName) || { mounted: 0, unmounted: 0 }
    current.mounted++
    memoryLeakDetector.componentTracker.set(componentName, current)
  },

  /**
   * Records component unmount
   */
  recordUnmount: (componentName: string) => {
    const current = memoryLeakDetector.componentTracker.get(componentName) || { mounted: 0, unmounted: 0 }
    current.unmounted++
    memoryLeakDetector.componentTracker.set(componentName, current)
  },

  /**
   * Reports potential memory leaks
   */
  reportLeaks: (): string[] => {
    const leaks: string[] = []
    
    memoryLeakDetector.componentTracker.forEach((data, componentName) => {
      const leakCount = data.mounted - data.unmounted
      if (leakCount > 5) {
        leaks.push(`${componentName}: ${leakCount} components not unmounted`)
      }
    })
    
    return leaks
  },

  /**
   * Clears all tracking data
   */
  clearTracking: () => {
    memoryLeakDetector.componentTracker.clear()
  }
}

// ================================
// ASYNC OPERATION DIAGNOSTICS
// ================================

/**
 * Diagnoses async operation issues
 */
export const asyncDiagnostics = {
  /**
   * Tracks pending promises
   */
  pendingPromises: new Set<Promise<any>>(),

  /**
   * Wraps promises for tracking
   */
  trackPromise: <T>(promise: Promise<T>, label: string = 'unknown'): Promise<T> => {
    const trackedPromise = promise.finally(() => {
      asyncDiagnostics.pendingPromises.delete(trackedPromise)
    })
    
    asyncDiagnostics.pendingPromises.add(trackedPromise)
    
    // Add timeout warning
    setTimeout(() => {
      if (asyncDiagnostics.pendingPromises.has(trackedPromise)) {
        console.warn(`⏰ Promise "${label}" still pending after 5 seconds`)
      }
    }, 5000)
    
    return trackedPromise
  },

  /**
   * Reports pending operations
   */
  reportPending: (): number => {
    const count = asyncDiagnostics.pendingPromises.size
    if (count > 0) {
      console.warn(`⏳ ${count} promises still pending`)
    }
    return count
  },

  /**
   * Waits for all tracked promises to resolve
   */
  waitForAll: async (timeout: number = 10000): Promise<void> => {
    const start = Date.now()
    
    while (asyncDiagnostics.pendingPromises.size > 0) {
      if (Date.now() - start > timeout) {
        throw new Error(`Timeout waiting for ${asyncDiagnostics.pendingPromises.size} promises`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  },

  /**
   * Clears all tracking
   */
  clearTracking: () => {
    asyncDiagnostics.pendingPromises.clear()
  }
}

// ================================
// TEST HEALTH REPORTER
// ================================

/**
 * Comprehensive test health reporter
 */
export class TestHealthReporter {
  private issues: string[] = []
  private suggestions: string[] = []

  /**
   * Run comprehensive health check
   */
  runHealthCheck(): {
    issues: string[],
    suggestions: string[],
    score: number
  } {
    this.issues = []
    this.suggestions = []

    // Check for mock conflicts
    const mockConflicts = mockDiagnostics.reportConflicts()
    this.issues.push(...mockConflicts)
    if (mockConflicts.length > 0) {
      this.suggestions.push('Reset mocks between tests with jest.clearAllMocks()')
    }

    // Check for memory leaks
    const memoryLeaks = memoryLeakDetector.reportLeaks()
    this.issues.push(...memoryLeaks)
    if (memoryLeaks.length > 0) {
      this.suggestions.push('Ensure proper cleanup with render(...).unmount()')
    }

    // Check for pending async operations
    const pendingCount = asyncDiagnostics.reportPending()
    if (pendingCount > 0) {
      this.issues.push(`${pendingCount} async operations still pending`)
      this.suggestions.push('Use await waitFor() or flush promises in tests')
    }

    // Calculate health score
    const totalIssues = this.issues.length
    const score = Math.max(0, 100 - (totalIssues * 10))

    return {
      issues: this.issues,
      suggestions: this.suggestions,
      score
    }
  }

  /**
   * Generate health report
   */
  generateReport(): string {
    const { issues, suggestions, score } = this.runHealthCheck()
    
    let report = `\n🏥 TEST HEALTH REPORT\n`
    report += `===================\n`
    report += `Health Score: ${score}/100\n\n`
    
    if (issues.length === 0) {
      report += `✅ No issues detected - tests are healthy!\n`
    } else {
      report += `❌ Issues Detected (${issues.length}):\n`
      issues.forEach((issue, index) => {
        report += `  ${index + 1}. ${issue}\n`
      })
      
      report += `\n💡 Suggestions:\n`
      suggestions.forEach((suggestion, index) => {
        report += `  ${index + 1}. ${suggestion}\n`
      })
    }
    
    return report
  }

  /**
   * Clear all diagnostic data
   */
  clearAll(): void {
    mockDiagnostics.clearTracking()
    memoryLeakDetector.clearTracking()
    asyncDiagnostics.clearTracking()
    this.issues = []
    this.suggestions = []
  }
}

// ================================
// QUICK FIX GENERATORS
// ================================

/**
 * Generates quick fixes for common issues
 */
export const quickFixes = {
  /**
   * Generates stable useEffect dependency array
   */
  fixUseEffectDeps: (currentDeps: string[]): string => {
    const fixes = currentDeps.map(dep => {
      if (dep.includes('object.')) {
        return dep.replace(/object\./, 'object.property') + ' // Use specific property'
      }
      if (dep.includes('array')) {
        return dep.replace(/array/, 'array.length') + ' // Use array length'
      }
      if (dep.includes('function')) {
        return `useCallback(${dep}, [])` + ' // Memoize function'
      }
      return dep
    })
    
    return `[${fixes.join(', ')}]`
  },

  /**
   * Generates proper test cleanup
   */
  generateCleanup: (): string => {
    return `
beforeEach(() => {
  jest.clearAllMocks()
  cleanup() // From @testing-library/react
})

afterEach(() => {
  // Clear any remaining timers
  jest.clearAllTimers()
  
  // Reset DOM
  document.body.innerHTML = ''
  
  // Clear storage
  localStorage.clear()
  sessionStorage.clear()
})
`
  },

  /**
   * Generates stable mock store
   */
  generateMockStore: (storeName: string): string => {
    return `
const mock${storeName} = createMockStore({
  // State
  currentValue: 'default',
  items: [],
  loading: false
}, {
  // Methods
  setValue: jest.fn(),
  addItem: jest.fn(),
  setLoading: jest.fn()
})

jest.mock('@/stores/${storeName.toLowerCase()}Store', () => ({
  use${storeName}Store: () => mock${storeName}
}))
`
  }
}

export default {
  detectStateLoops,
  mockDiagnostics,
  memoryLeakDetector,
  asyncDiagnostics,
  TestHealthReporter,
  quickFixes
}