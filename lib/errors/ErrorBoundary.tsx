'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { globalMemoryCache } from '@/lib/cache/MemoryCache'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'component' | 'feature'
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId?: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || 'unknown-error'
    
    // Log error details
    console.group(`🚨 Error Boundary Caught Error [${errorId}]`)
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Component Stack:', errorInfo.componentStack)
    console.groupEnd()

    // Store error in state for display
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error to analytics/monitoring service (placeholder)
    this.logErrorToService(error, errorInfo, errorId)
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo, errorId: string) {
    // Cache error for debugging
    globalMemoryCache.set(`error-${errorId}`, {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      level: this.props.level || 'component',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    }, 30 * 60 * 1000) // Keep for 30 minutes

    // In production, this would send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, or custom analytics
      console.log('Would send to error tracking service:', {
        errorId,
        message: error.message,
        level: this.props.level
      })
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI based on error level
      const level = this.props.level || 'component'
      
      return (
        <div className={`error-boundary error-boundary--${level}`}>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-auto my-8">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Something went wrong
                </h3>
              </div>
            </div>
            
            <div className="text-sm text-red-700 mb-4">
              {level === 'page' && 'The page encountered an error and cannot be displayed.'}
              {level === 'feature' && 'This feature is temporarily unavailable.'}
              {level === 'component' && 'A component error occurred.'}
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4">
                <summary className="text-sm text-red-600 cursor-pointer font-medium">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 text-xs text-red-600 font-mono bg-red-100 p-2 rounded overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Message:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex space-x-3">
              <button
                onClick={this.handleRetry}
                className="text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="text-sm bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Refresh Page
              </button>
            </div>
            
            {this.state.errorId && (
              <div className="mt-4 text-xs text-gray-500">
                Error ID: {this.state.errorId}
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Specialized error boundaries for different contexts
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="page">{children}</ErrorBoundary>
)

export const FeatureErrorBoundary: React.FC<{ children: ReactNode; featureName: string }> = ({ 
  children, 
  featureName 
}) => (
  <ErrorBoundary 
    level="feature"
    onError={(error) => {
      console.error(`Feature error in ${featureName}:`, error)
    }}
    fallback={
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              {featureName} Temporarily Unavailable
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              We're experiencing issues with this feature. Please try again later.
            </div>
          </div>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
)

export const ComponentErrorBoundary: React.FC<{ children: ReactNode; componentName?: string }> = ({ 
  children, 
  componentName 
}) => (
  <ErrorBoundary 
    level="component"
    onError={(error) => {
      console.error(`Component error${componentName ? ` in ${componentName}` : ''}:`, error)
    }}
  >
    {children}
  </ErrorBoundary>
)