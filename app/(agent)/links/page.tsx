'use client'

import Link from 'next/link'
import { AgentNavigation } from '@/components/shared/AgentNavigation'
import { useState } from 'react'
import { LinkCreator } from '@/components/link'
import { useLinksQuery } from '@/lib/query/useLinksQuery'
import type { Link as LinkType } from '@/components/link'

export default function LinksPage() {
  const [showCreator, setShowCreator] = useState(false)
  const [createdLinks, setCreatedLinks] = useState<LinkType[]>([])
  
  // Fetch existing links from database
  const { data: existingLinks = [], refetch: refetchLinks } = useLinksQuery()

  const handleLinkCreated = async (link: LinkType) => {
    setCreatedLinks(prev => [link, ...prev])
    setShowCreator(false)
    // Refetch to get updated links from database
    await refetchLinks()
    // Clear local created links since they're now in existingLinks from database
    setCreatedLinks([])
  }

  const handleCancel = () => {
    setShowCreator(false)
  }

  const copyLinkToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/link/${code}`)
      // You could add a toast notification here
      alert('Link copied to clipboard!')
    } catch (err) {
      alert('Failed to copy link')
    }
  }

  if (showCreator) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LinkCreator 
          onLinkCreated={handleLinkCreated}
          onCancel={handleCancel}
        />
      </div>
    )
  }

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
              <span className="ml-4 text-sm text-gray-500">Links Management</span>
            </div>
            <AgentNavigation />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Links Management</h1>
            <p className="text-gray-600 mt-2">
              Create and manage shareable property collections for your clients
            </p>
          </div>
          <button
            onClick={() => setShowCreator(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            Create New Link
          </button>
        </div>

        {/* Links List */}
        {(existingLinks.length > 0 || createdLinks.length > 0) ? (
          <div className="grid gap-4">
            {/* Show new links first, then existing links */}
            {[...createdLinks, ...existingLinks].map(link => (
              <div key={link.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {link.name || 'Untitled Collection'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Code: {link.code} • {link.property_ids ? JSON.parse(link.property_ids as string).length : 0} properties
                    </p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(link.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyLinkToClipboard(link.code)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Copy Link
                    </button>
                    <a
                      href={`/link/${link.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Preview
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No links created yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first property collection link to share with clients
            </p>
            <button
              onClick={() => setShowCreator(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Create Your First Link
            </button>
            </div>
        )}
      </main>
    </div>
  )
}