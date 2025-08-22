import { useState, useEffect } from 'react'
import type { Deal, DealFilters, DealStatus, DealStage } from '../types'
import { DealService } from '../deal.service'

/**
 * useDeals - React Hook for Deal Management
 * 
 * Provides deal data with filtering, pagination, and CRUD operations.
 */
export const useDeals = (
  initialFilters: DealFilters = {},
  pageSize: number = 20
) => {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<DealFilters>(initialFilters)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 0
  })

  const loadDeals = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await DealService.getDeals(filters, page, pageSize)
      setDeals(response.data)
      setPagination(response.pagination)
      
    } catch (err) {
      console.error('Error loading deals:', err)
      setError(err instanceof Error ? err.message : 'Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  const updateDealStage = async (dealId: string, newStage: DealStage) => {
    try {
      const updatedDeal = await DealService.progressDealStage(dealId, newStage)
      if (updatedDeal) {
        setDeals(prev => prev.map(deal =>
          deal.id === dealId ? updatedDeal : deal
        ))
        return updatedDeal
      }
    } catch (err) {
      console.error('Error updating deal stage:', err)
      throw err
    }
  }

  const updateDealStatus = async (dealId: string, newStatus: DealStatus) => {
    try {
      const updatedDeal = await DealService.updateDealStatus(dealId, newStatus)
      if (updatedDeal) {
        setDeals(prev => prev.map(deal =>
          deal.id === dealId ? updatedDeal : deal
        ))
        return updatedDeal
      }
    } catch (err) {
      console.error('Error updating deal status:', err)
      throw err
    }
  }

  const refresh = () => {
    loadDeals(pagination.page)
  }

  const nextPage = () => {
    if (pagination.page < pagination.totalPages) {
      loadDeals(pagination.page + 1)
    }
  }

  const prevPage = () => {
    if (pagination.page > 1) {
      loadDeals(pagination.page - 1)
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      loadDeals(page)
    }
  }

  const updateFilters = (newFilters: DealFilters) => {
    setFilters(newFilters)
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  useEffect(() => {
    loadDeals(1)
  }, [filters])

  return {
    deals,
    loading,
    error,
    filters,
    pagination,
    updateDealStage,
    updateDealStatus,
    updateFilters,
    refresh,
    nextPage,
    prevPage,
    goToPage
  }
}

/**
 * useDeal - Hook for Single Deal Management
 */
export const useDeal = (dealId: string) => {
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDeal = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const dealData = await DealService.getDealById(dealId)
      setDeal(dealData)
      
    } catch (err) {
      console.error('Error loading deal:', err)
      setError(err instanceof Error ? err.message : 'Failed to load deal')
    } finally {
      setLoading(false)
    }
  }

  const updateStage = async (newStage: DealStage) => {
    if (!deal) return null

    try {
      const updatedDeal = await DealService.progressDealStage(deal.id, newStage)
      if (updatedDeal) {
        setDeal(updatedDeal)
      }
      return updatedDeal
    } catch (err) {
      console.error('Error updating deal stage:', err)
      throw err
    }
  }

  const updateStatus = async (newStatus: DealStatus) => {
    if (!deal) return null

    try {
      const updatedDeal = await DealService.updateDealStatus(deal.id, newStatus)
      if (updatedDeal) {
        setDeal(updatedDeal)
      }
      return updatedDeal
    } catch (err) {
      console.error('Error updating deal status:', err)
      throw err
    }
  }

  useEffect(() => {
    if (dealId) {
      loadDeal()
    }
  }, [dealId])

  return {
    deal,
    loading,
    error,
    updateStage,
    updateStatus,
    refresh: loadDeal
  }
}

/**
 * useHotLeads - Hook for Hot Leads
 */
export const useHotLeads = (agentId?: string) => {
  const [hotLeads, setHotLeads] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadHotLeads = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const leads = await DealService.getDeals(
        { 
          temperature: ['hot'],
          ...(agentId && { agentId })
        },
        1,
        10
      )
      
      // Sort by engagement score descending
      const sortedLeads = leads.data.sort((a, b) => b.engagementScore - a.engagementScore)
      setHotLeads(sortedLeads)
      
    } catch (err) {
      console.error('Error loading hot leads:', err)
      setError(err instanceof Error ? err.message : 'Failed to load hot leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHotLeads()
  }, [agentId])

  return {
    hotLeads,
    loading,
    error,
    refresh: loadHotLeads
  }
}

/**
 * useDealsByStage - Hook for Pipeline Management
 */
export const useDealsByStage = (agentId?: string) => {
  const [dealsByStage, setDealsByStage] = useState<Record<DealStage, Deal[]>>({} as any)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDealsByStage = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await DealService.getDeals(
        { ...(agentId && { agentId }) },
        1,
        100
      )
      
      // Group deals by stage
      const grouped = response.data.reduce((acc, deal) => {
        if (!acc[deal.dealStage]) {
          acc[deal.dealStage] = []
        }
        acc[deal.dealStage].push(deal)
        return acc
      }, {} as Record<DealStage, Deal[]>)
      
      setDealsByStage(grouped)
      
    } catch (err) {
      console.error('Error loading deals by stage:', err)
      setError(err instanceof Error ? err.message : 'Failed to load pipeline')
    } finally {
      setLoading(false)
    }
  }

  const moveDeal = async (dealId: string, fromStage: DealStage, toStage: DealStage) => {
    try {
      const updatedDeal = await DealService.progressDealStage(dealId, toStage)
      if (updatedDeal) {
        setDealsByStage(prev => ({
          ...prev,
          [fromStage]: prev[fromStage]?.filter(deal => deal.id !== dealId) || [],
          [toStage]: [...(prev[toStage] || []), updatedDeal]
        }))
      }
      return updatedDeal
    } catch (err) {
      console.error('Error moving deal:', err)
      throw err
    }
  }

  useEffect(() => {
    loadDealsByStage()
  }, [agentId])

  return {
    dealsByStage,
    loading,
    error,
    moveDeal,
    refresh: loadDealsByStage
  }
}