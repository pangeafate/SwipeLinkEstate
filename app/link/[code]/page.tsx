'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { LinkService } from '@/components/link'
import { PropertyCard } from '@/components/property'
import type { LinkWithProperties } from '@/lib/supabase/types'

export default function ClientLinkPage() {
  const params = useParams()
  const linkCode = params.code as string
  
  const [linkData, setLinkData] = useState<LinkWithProperties | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLink = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await LinkService.getLink(linkCode)
        setLinkData(data)
      } catch (err) {
        setError('Link not found or expired. Please check the link code and try again.')
      } finally {
        setLoading(false)
      }
    }

    if (linkCode) {
      loadLink()
    }
  }, [linkCode])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Loading property collection...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <a href="/" className="btn-primary inline-block">
              Return to Homepage
            </a>
          </div>
        </div>
      </div>
    )
  }

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
        {/* Collection Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {linkData?.name || 'Property Collection'}
          </h1>
          <p className="text-gray-600">
            {linkData?.properties.length} {linkData?.properties.length === 1 ? 'property' : 'properties'} curated for you
          </p>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>Link Code: {linkCode}</span>
          </div>
        </div>

        {/* Properties Grid */}
        {linkData?.properties && linkData.properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {linkData.properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={(property) => {
                  // In the future, this could open a property detail modal or navigate to detail page
                  console.log('Property clicked:', property.id)
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m-2 0H5" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Available</h3>
            <p className="text-gray-600">This property collection is currently empty.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            Interested in these properties? Contact your agent for more information.
          </p>
          <div className="mt-4">
            <a href="/" className="text-primary-600 hover:text-primary-700 font-medium">
              Discover More Properties →
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}