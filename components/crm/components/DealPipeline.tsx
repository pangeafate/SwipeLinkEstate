'use client'

import React, { useState, useEffect } from 'react'
import type { Deal, DealFilters, DealStage, DealStatus } from '../types'
import { DealService } from '../deal.service'
import { PipelineStage } from './pipeline/PipelineStage'
import { PipelineFilters } from './pipeline/PipelineFilters'
import { DealModal } from './pipeline/DealModal'

interface DealPipelineProps {
  agentId?: string 
  pipeline?: any
  onRefresh?: () => void
}

const DealPipeline: React.FC<DealPipelineProps> = ({ agentId, pipeline, onRefresh }) => {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<DealFilters>({})
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const stages: DealStage[] = ['created', 'shared', 'accessed', 'engaged', 'qualified', 'advanced', 'closed']

  useEffect(() => {
    loadDeals()
  }, [agentId, filters])

  const loadDeals = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await DealService.getDeals(filters, 1, 100)
      setDeals(response.data)
      
    } catch (err) {
      console.error('Error loading deals:', err)
      setError('Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  const handleStageChange = async (dealId: string, newStage: DealStage) => {
    try {
      const updatedDeal = await DealService.progressDealStage(dealId, newStage)
      if (updatedDeal) {
        setDeals(prev => prev.map(deal => 
          deal.id === dealId ? updatedDeal : deal
        ))
        onRefresh?.()
      }
    } catch (err) {
      console.error('Error updating deal stage:', err)
    }
  }

  const handleStatusChange = async (dealId: string, newStatus: DealStatus) => {
    try {
      const updatedDeal = await DealService.updateDealStatus(dealId, newStatus)
      if (updatedDeal) {
        setDeals(prev => prev.map(deal => 
          deal.id === dealId ? updatedDeal : deal
        ))
        onRefresh?.()
      }
    } catch (err) {
      console.error('Error updating deal status:', err)
    }
  }

  const getDealsByStage = (stage: DealStage) => {
    return deals.filter(deal => deal.dealStage === stage)
  }

  const handleRefresh = () => {
    loadDeals()
    onRefresh?.()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading pipeline...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadDeals}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deal Pipeline</h2>
          <p className="text-gray-600 mt-1">
            Manage your deals through their lifecycle stages
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              showFilters 
                ? 'bg-blue-50 border-blue-300 text-blue-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
          
          <span className="text-sm text-gray-500">
            {deals.length} deals total
          </span>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <PipelineFilters
          filters={filters}
          onFiltersChange={setFilters}
          onRefresh={handleRefresh}
        />
      )}

      {/* Pipeline Stages */}
      <div className="overflow-x-auto">
        <div className="flex space-x-6 pb-4" style={{ minWidth: 'max-content' }}>
          {stages.map(stage => (
            <PipelineStage
              key={stage}
              stage={stage}
              deals={getDealsByStage(stage)}
              onStageChange={handleStageChange}
              onStatusChange={handleStatusChange}
              onDealClick={setSelectedDeal}
            />
          ))}
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
          {stages.map(stage => {
            const stageDeals = getDealsByStage(stage)
            const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.dealValue || 0), 0)
            
            return (
              <div key={stage} className="bg-white rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-900">{stageDeals.length}</div>
                <div className="text-sm text-gray-600 mb-1">
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </div>
                {totalValue > 0 && (
                  <div className="text-xs text-gray-500">
                    ${totalValue.toLocaleString()}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Deal Details Modal */}
      <DealModal
        deal={selectedDeal}
        isOpen={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
      />
    </div>
  )
}

export default DealPipeline