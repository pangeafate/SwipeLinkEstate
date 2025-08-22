import { NextRequest, NextResponse } from 'next/server'
import { DealService } from '@/components/crm/deal.service'
import { supabase } from '@/lib/supabase/client'
import type { DealFilters, DealStatus, DealStage } from '@/components/crm/types'

/**
 * CRM Deals API Endpoint
 * 
 * GET /api/crm/deals - List deals with filtering and pagination
 * POST /api/crm/deals - Create new deal (typically from link creation)
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const search = searchParams.get('search') || undefined
    const agentId = searchParams.get('agentId') || undefined
    
    // Parse status filter
    const statusParam = searchParams.get('status')
    const status = statusParam ? statusParam.split(',') as DealStatus[] : undefined
    
    // Parse stage filter
    const stageParam = searchParams.get('stage')
    const stage = stageParam ? stageParam.split(',') as DealStage[] : undefined
    
    // Parse date range
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const dateRange = (startDate && endDate) ? { start: startDate, end: endDate } : undefined
    
    // Parse value range
    const minValue = searchParams.get('minValue')
    const maxValue = searchParams.get('maxValue')
    
    // Build filters object
    const filters: DealFilters = {
      ...(status && { status }),
      ...(stage && { stage }),
      ...(search && { search }),
      ...(agentId && { agentId }),
      ...(dateRange && { dateRange }),
      ...(minValue && { minValue: parseInt(minValue) }),
      ...(maxValue && { maxValue: parseInt(maxValue) })
    }
    
    // Get deals from service
    const result = await DealService.getDeals(filters, page, limit)
    
    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      filters: filters
    })
    
  } catch (error) {
    console.error('Error fetching deals:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch deals',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { linkId, agentId, clientInfo } = body
    
    if (!linkId) {
      return NextResponse.json(
        { success: false, error: 'Link ID is required' },
        { status: 400 }
      )
    }
    
    // Get link data from database
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('*')
      .eq('id', linkId)
      .single()
    
    if (linkError || !link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      )
    }
    
    // Get associated properties
    const propertyIds = Array.isArray(link.property_ids) ? link.property_ids : []
    const { data: properties } = await supabase
      .from('properties')
      .select('*')
      .in('id', propertyIds)
    
    // Create deal from link
    const deal = await DealService.createDealFromLink(
      link,
      properties || [],
      clientInfo
    )
    
    // Update the link record with deal information
    const { error: updateError } = await supabase
      .from('links')
      .update({
        deal_status: deal.dealStatus,
        deal_stage: deal.dealStage,
        deal_value: deal.dealValue,
        engagement_score: deal.engagementScore,
        temperature: deal.clientTemperature,
        agent_id: agentId || 'current-agent', // TODO: Get from auth
        notes: deal.notes,
        tags: deal.tags
      })
      .eq('id', linkId)
    
    if (updateError) {
      console.warn('Failed to update link with deal data:', updateError)
    }
    
    return NextResponse.json({
      success: true,
      data: deal,
      message: 'Deal created successfully'
    })
    
  } catch (error) {
    console.error('Error creating deal:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create deal',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}