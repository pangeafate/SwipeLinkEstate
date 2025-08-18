import Link from 'next/link'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                SwipeLink Estate
              </Link>
              <span className="ml-4 text-sm text-gray-500">Analytics Dashboard</span>
            </div>
            <nav className="flex space-x-4">
              <Link 
                href="/agent/dashboard" 
                className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Properties
              </Link>
              <Link 
                href="/agent/links" 
                className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Links
              </Link>
              <Link 
                href="/agent/analytics" 
                className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Analytics
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
          <p className="text-gray-600 mb-8">
            Track property engagement and client interactions in real-time
          </p>
          <div className="text-gray-500">
            🚧 Analytics features are coming soon! 🚧
          </div>
        </div>
      </main>
    </div>
  )
}