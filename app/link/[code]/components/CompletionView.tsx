/**
 * Completion View Component
 * Displays summary after user completes property review
 */

import type { BucketType } from '@/components/client/types'

interface CompletionViewProps {
  linkName: string
  buckets: Record<string, BucketType>
  onBrowseAgain: () => void
}

export function CompletionView({ linkName, buckets, onBrowseAgain }: CompletionViewProps) {
  const lovedCount = Object.values(buckets).filter(b => b === 'love').length
  const maybeCount = Object.values(buckets).filter(b => b === 'maybe').length
  const passedCount = Object.values(buckets).filter(b => b === 'pass').length
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="text-2xl font-bold text-gray-900">
              SwipeLink Estate
            </a>
            <div className="text-sm text-gray-500">
              Property Collection
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Thanks for browsing!
            </h1>
            <p className="text-gray-600 mb-8">
              You've finished reviewing {linkName || 'this property collection'}. 
              Here's a summary of your choices:
            </p>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="text-3xl mb-2">❤️</div>
                <div className="text-2xl font-bold text-green-600">
                  {lovedCount}
                </div>
                <div className="text-sm text-gray-600">Loved</div>
              </div>
              <div className="text-center p-6 bg-yellow-50 rounded-xl">
                <div className="text-3xl mb-2">🤔</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {maybeCount}
                </div>
                <div className="text-sm text-gray-600">Considering</div>
              </div>
              <div className="text-center p-6 bg-red-50 rounded-xl">
                <div className="text-3xl mb-2">❌</div>
                <div className="text-2xl font-bold text-red-600">
                  {passedCount}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                Your preferences have been saved. An agent will follow up with you soon 
                about the properties you liked and are considering.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onBrowseAgain}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Browse Again
                </button>
                <a
                  href="/"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Explore More Properties
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}