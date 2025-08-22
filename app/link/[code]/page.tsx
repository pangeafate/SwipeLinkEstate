/**
 * Link Page - Server Component
 * Handles SSR/ISR data fetching and passes props to client component
 * 
 * Architecture Notes:
 * - Fetches link data at request time (SSR) or build time (ISR)
 * - Generates stable session ID server-side
 * - Passes hydrated data to client component
 * - Handles error states and redirects
 */

import { LinkService } from '@/components/link'
import { notFound } from 'next/navigation'
import ClientLinkView from './ClientLinkView'
import EnhancedClientView from './EnhancedClientView'
import type { LinkWithProperties } from '@/lib/supabase/types'

// Feature flag to enable enhanced view
const USE_ENHANCED_VIEW = process.env.NEXT_PUBLIC_USE_ENHANCED_CAROUSEL === 'true'

interface LinkPageProps {
  params: {
    code: string
  }
}

// Enable ISR with revalidation every hour
export const revalidate = 3600
export const runtime = 'nodejs'

// Generate static params for known links (optional, for SSG)
export async function generateStaticParams() {
  // For now, return empty array to use ISR fallback
  // In production, could pre-generate popular links
  return []
}

/**
 * Server component that fetches link data and renders client view
 */
export default async function LinkPage({ params }: LinkPageProps) {
  const { code } = params
  
  // Validate link code format
  if (!code || typeof code !== 'string' || code.length < 6) {
    notFound()
  }
  
  let linkData: LinkWithProperties | null = null
  let error: string | null = null
  
  try {
    // Fetch link data server-side
    linkData = await LinkService.getLink(code)
    
    if (!linkData) {
      notFound()
    }
    
    // Check if link is expired
    if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
      error = 'This link has expired. Please request a new one from your agent.'
    }
    
    // Note: Link status check removed as current schema doesn't include status field
    // If needed, add status field to links table in future migration
  } catch (err) {
    console.error('Failed to fetch link:', err)
    // Return generic error to avoid exposing internals
    error = 'Unable to load property collection. Please try again later.'
  }
  
  // Generate session ID server-side for consistency
  const sessionId = generateSessionId()
  
  // Use enhanced view if feature flag is enabled
  if (USE_ENHANCED_VIEW && linkData && !error) {
    return (
      <EnhancedClientView
        linkCode={code}
        properties={linkData.properties || []}
        agentInfo={{
          name: linkData.agent?.name || 'Your Agent',
          email: linkData.agent?.email || 'agent@swipelink.com',
          phone: linkData.agent?.phone,
          company: linkData.agent?.company
        }}
        collectionInfo={{
          name: linkData.name || 'Property Collection',
          description: linkData.description,
          createdAt: new Date(linkData.created_at)
        }}
      />
    )
  }
  
  // Fallback to basic view
  return (
    <ClientLinkView
      linkCode={code}
      initialLinkData={linkData}
      initialError={error}
      sessionId={sessionId}
    />
  )
}

/**
 * Generate a unique session ID server-side
 * Uses crypto API for secure random generation
 */
function generateSessionId(): string {
  // In Node.js environment, use crypto module
  if (typeof window === 'undefined') {
    const crypto = require('crypto')
    return crypto.randomUUID()
  }
  // Fallback for edge runtime
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}