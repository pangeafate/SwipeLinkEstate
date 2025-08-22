'use client'

/**
 * Link Creation Modal Component
 * Modal for creating shareable property links
 * 
 * Architecture Notes:
 * - Uses React Portal for rendering at body level
 * - Manages link creation flow and state
 * - Delegates to sub-components for UI
 */

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Link } from '@/components/link'
import { DetailsView } from './LinkCreationModal/DetailsView'
import { SuccessView } from './LinkCreationModal/SuccessView'

interface LinkCreationModalProps {
  isOpen: boolean
  onClose: () => void
  selectedProperties: Array<{
    id: string
    address: string
    price: number | null
    bedrooms: number | null
    bathrooms: number | null
  }>
  onCreateLink: (properties: string[], name?: string) => Promise<Link>
}

const LinkCreationModal: React.FC<LinkCreationModalProps> = ({
  isOpen,
  onClose,
  selectedProperties,
  onCreateLink
}) => {
  const [step, setStep] = useState<'details' | 'success'>('details')
  const [linkName, setLinkName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createdLink, setCreatedLink] = useState<string | null>(null)

  // Generate smart default name based on properties
  const generateSmartName = () => {
    if (selectedProperties.length === 0) return 'Property Collection'
    
    // Extract common themes from addresses
    const addresses = selectedProperties.map(p => p.address.toLowerCase())
    const commonWords = ['ocean', 'beach', 'downtown', 'waterfront', 'luxury']
    
    for (const word of commonWords) {
      if (addresses.some(addr => addr.includes(word))) {
        return `${word.charAt(0).toUpperCase() + word.slice(1)} Properties Collection`
      }
    }
    
    return `${selectedProperties.length} Property Collection`
  }

  const handleQuickCreate = async () => {
    setIsCreating(true)
    try {
      const smartName = generateSmartName()
      setLinkName(smartName)
      const createdLinkData = await onCreateLink(selectedProperties.map(p => p.id), smartName)
      const realLinkUrl = `${window.location.origin}/link/${createdLinkData.code}`
      setCreatedLink(realLinkUrl)
      
      // Copy real link to clipboard immediately
      await navigator.clipboard.writeText(realLinkUrl)
      
      setStep('success')
    } catch (error) {
      console.error('Error creating link:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleRegularCreate = async () => {
    setIsCreating(true)
    try {
      const createdLinkData = await onCreateLink(
        selectedProperties.map(p => p.id), 
        linkName || undefined
      )
      const realLinkUrl = `${window.location.origin}/link/${createdLinkData.code}`
      setCreatedLink(realLinkUrl)
      setStep('success')
    } catch (error) {
      console.error('Error creating link:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyLink = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink)
      // Show toast notification (implement later)
      console.log('Link copied to clipboard')
    }
  }

  const handleShareViaEmail = () => {
    if (createdLink) {
      const subject = encodeURIComponent('Property Collection')
      const body = encodeURIComponent(`Check out these properties: ${createdLink}`)
      window.open(`mailto:?subject=${subject}&body=${body}`)
    }
  }

  const handleShareViaSMS = () => {
    if (createdLink) {
      const body = encodeURIComponent(`Check out these properties: ${createdLink}`)
      window.open(`sms:?body=${body}`)
    }
  }

  const handleViewLink = () => {
    if (createdLink) {
      window.open(createdLink, '_blank')
    }
  }

  if (!isOpen) return null

  const modalContent = (
    <div 
      data-testid="modal-overlay" 
      className="fixed inset-0 z-50 flex items-center justify-center" 
      onClick={onClose}
    >
      {/* Backdrop with blur effect */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        data-testid="link-creation-modal" 
        className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'details' ? (
          <DetailsView
            selectedProperties={selectedProperties}
            linkName={linkName}
            onLinkNameChange={setLinkName}
            generateSmartName={generateSmartName}
            onClose={onClose}
            onQuickCreate={handleQuickCreate}
            onRegularCreate={handleRegularCreate}
            isCreating={isCreating}
          />
        ) : (
          <SuccessView
            createdLink={createdLink}
            onCopyLink={handleCopyLink}
            onShareViaEmail={handleShareViaEmail}
            onShareViaSMS={handleShareViaSMS}
            onViewLink={handleViewLink}
          />
        )}
      </div>
    </div>
  )

  // Use portal to render modal at body level
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}

export default LinkCreationModal