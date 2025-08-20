import { useState, useEffect } from 'react'
import { PropertyService } from '../../../property'
import { LinkService } from '../../link.service'
import type { Property } from '@/lib/supabase/types'
import type { Link } from '../../types'

export type Step = 'properties' | 'details' | 'success'

export interface UseLinkCreatorStateProps {
  onLinkCreated: (link: Link) => void
}

export interface LinkCreatorState {
  // Navigation
  step: Step
  setStep: (step: Step) => void
  
  // Data
  properties: Property[]
  selectedPropertyIds: string[]
  setSelectedPropertyIds: (ids: string[] | ((prev: string[]) => string[])) => void
  linkName: string
  setLinkName: (name: string) => void
  createdLink: Link | null
  setCreatedLink: (link: Link | null) => void
  
  // UI State
  loading: boolean
  setLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  copySuccess: boolean
  setCopySuccess: (success: boolean) => void
  
  // Actions
  handlePropertySelect: (property: Property) => void
  handleNext: () => void
  handleBack: () => void
  handleCreateLink: () => Promise<void>
  handleCopyLink: () => Promise<void>
  handleCreateAnother: () => void
}

export const useLinkCreatorState = ({ onLinkCreated }: UseLinkCreatorStateProps): LinkCreatorState => {
  const [step, setStep] = useState<Step>('properties')
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([])
  const [linkName, setLinkName] = useState('')
  const [createdLink, setCreatedLink] = useState<Link | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  // Load properties on mount
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true)
        const props = await PropertyService.getAllProperties()
        setProperties(props)
      } catch (err) {
        setError('Error loading properties. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  const handlePropertySelect = (property: Property) => {
    setSelectedPropertyIds(prev => 
      prev.includes(property.id)
        ? prev.filter(id => id !== property.id)
        : [...prev, property.id]
    )
  }

  const handleNext = () => {
    setStep('details')
  }

  const handleBack = () => {
    setStep('properties')
  }

  const handleCreateLink = async () => {
    try {
      setLoading(true)
      setError(null)
      const link = await LinkService.createLink(
        selectedPropertyIds,
        linkName || undefined
      )
      setCreatedLink(link)
      setStep('success')
      onLinkCreated(link)
    } catch (err) {
      setError('Failed to create link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (createdLink) {
      try {
        await LinkService.copyLinkUrl(createdLink.code)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (err) {
        setError('Failed to copy link')
      }
    }
  }

  const handleCreateAnother = () => {
    setStep('properties')
    setSelectedPropertyIds([])
    setLinkName('')
    setCreatedLink(null)
    setError(null)
    setCopySuccess(false)
  }

  return {
    // Navigation
    step,
    setStep,
    
    // Data
    properties,
    selectedPropertyIds,
    setSelectedPropertyIds,
    linkName,
    setLinkName,
    createdLink,
    setCreatedLink,
    
    // UI State
    loading,
    setLoading,
    error,
    setError,
    copySuccess,
    setCopySuccess,
    
    // Actions
    handlePropertySelect,
    handleNext,
    handleBack,
    handleCreateLink,
    handleCopyLink,
    handleCreateAnother
  }
}