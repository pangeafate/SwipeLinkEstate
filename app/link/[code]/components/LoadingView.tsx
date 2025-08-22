/**
 * Loading View Component
 * Displays loading state while fetching link data
 */

export function LoadingView() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-primary-600 font-medium">Loading property collection...</p>
      </div>
    </div>
  )
}