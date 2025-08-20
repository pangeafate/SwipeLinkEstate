'use client'

import React from 'react'
import PropertySelector from './PropertySelector'
import LinkCustomizer from './LinkCustomizer'
import LinkShareForm from './LinkShareForm'
import { useLinkCreatorState } from './hooks/useLinkCreatorState'
import type { Link } from '../types'

interface LinkCreatorProps {
  onLinkCreated: (link: Link) => void
  onCancel: () => void
}

const LinkCreator: React.FC<LinkCreatorProps> = ({ onLinkCreated, onCancel }) => {
  const state = useLinkCreatorState({ onLinkCreated })

  const renderStep = () => {
    switch (state.step) {
      case 'properties':
        return (
          <PropertySelector
            properties={state.properties}
            selectedPropertyIds={state.selectedPropertyIds}
            loading={state.loading}
            error={state.error}
            onPropertySelect={state.handlePropertySelect}
            onNext={state.handleNext}
            onCancel={onCancel}
          />
        )
      case 'details':
        return (
          <LinkCustomizer
            properties={state.properties}
            selectedPropertyIds={state.selectedPropertyIds}
            linkName={state.linkName}
            loading={state.loading}
            error={state.error}
            onLinkNameChange={state.setLinkName}
            onBack={state.handleBack}
            onCreateLink={state.handleCreateLink}
          />
        )
      case 'success':
        return (
          <LinkShareForm
            createdLink={state.createdLink}
            selectedPropertyCount={state.selectedPropertyIds.length}
            copySuccess={state.copySuccess}
            onCopyLink={state.handleCopyLink}
            onCreateAnother={state.handleCreateAnother}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {renderStep()}
      </div>
    </div>
  )
}

export default LinkCreator