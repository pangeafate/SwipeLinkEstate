/**
 * Properties Page Header Component
 * Reusable header with navigation
 */

import Link from 'next/link'

export function PropertiesHeader() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            SwipeLink Estate
          </Link>
          <nav className="flex space-x-4">
            <Link 
              href="/" 
              className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            <Link 
              href="/properties" 
              className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Browse
            </Link>
            <Link 
              href="/dashboard" 
              className="text-gray-500 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Agent Portal
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}