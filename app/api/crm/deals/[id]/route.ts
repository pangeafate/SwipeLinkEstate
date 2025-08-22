import { NextRequest, NextResponse } from 'next/server'
import { DealService } from '@/components/crm/deal.service'
import { supabase } from '@/lib/supabase/client'
import type { DealStatus, DealStage } from '@/components/crm/types'

/**
 * Individual Deal API Endpoint
 * 
 * GET /api/crm/deals/[id] - Get deal by ID
 * PATCH /api/crm/deals/[id] - Update deal (stage, status, notes, etc.)
 * DELETE /api/crm/deals/[id] - Soft delete deal
 */

type RouteContext = {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const dealId = params.id
    
    if (!dealId) {
      return NextResponse.json(
        { success: false, error: 'Deal ID is required' },
        { status: 400 }
      )
    }
    
    const deal = await DealService.getDealById(dealId)
    
    if (!deal) {
      return NextResponse.json(
        { success: false, error: 'Deal not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: deal
    })
    
  } catch (error) {
    console.error(`Error fetching deal ${params.id}:`, error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch deal',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const dealId = params.id
    const body = await request.json()
    
    if (!dealId) {
      return NextResponse.json(
        { success: false, error: 'Deal ID is required' },
        { status: 400 }
      )
    }
    
    // Extract update fields
    const { 
      dealStage, 
      dealStatus, 
      notes, 
      tags, 
      nextFollowUp,
      clientName,
      clientEmail,
      clientPhone 
    } = body
    
    // Validate stage and status if provided
    const validStages = ['created', 'shared', 'accessed', 'engaged', 'qualified', 'advanced', 'closed']
    const validStatuses = ['active', 'qualified', 'nurturing', 'closed-won', 'closed-lost']
    
    if (dealStage && !validStages.includes(dealStage)) {
      return NextResponse.json(
        { success: false, error: 'Invalid deal stage' },
        { status: 400 }
      )
    }
    
    if (dealStatus && !validStatuses.includes(dealStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid deal status' },
        { status: 400 }
      )
    }
    
    // Build update object
    const updateData: any = {}
    
    if (dealStage !== undefined) updateData.deal_stage = dealStage
    if (dealStatus !== undefined) updateData.deal_status = dealStatus
    if (notes !== undefined) updateData.notes = notes
    if (tags !== undefined) updateData.tags = JSON.stringify(tags)
    
    // Update the links table (which serves as our deals table)
    const { data, error } = await supabase
      .from('links')
      .update(updateData)
      .eq('id', dealId)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    // If we have client information, create or update client record
    if (clientName || clientEmail || clientPhone) {
      await updateClientRecord(dealId, {
        name: clientName,
        email: clientEmail,
        phone: clientPhone
      })
    }
    
    // Use service methods for complex updates
    let updatedDeal
    
    if (dealStage) {
      updatedDeal = await DealService.progressDealStage(dealId, dealStage as DealStage)
    } else if (dealStatus) {
      updatedDeal = await DealService.updateDealStatus(dealId, dealStatus as DealStatus)
    } else {
      updatedDeal = await DealService.getDealById(dealId)
    }
    
    return NextResponse.json({
      success: true,
      data: updatedDeal,
      message: 'Deal updated successfully'
    })
    
  } catch (error) {
    console.error(`Error updating deal ${params.id}:`, error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update deal',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const dealId = params.id
    
    if (!dealId) {
      return NextResponse.json(
        { success: false, error: 'Deal ID is required' },
        { status: 400 }
      )
    }
    
    // Soft delete by updating status to closed-lost
    const { data, error } = await supabase
      .from('links')
      .update({ 
        deal_status: 'closed-lost',
        notes: 'Deal deleted by user'
      })
      .eq('id', dealId)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({
      success: true,
      message: 'Deal deleted successfully'
    })
    
  } catch (error) {
    console.error(`Error deleting deal ${params.id}:`, error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete deal',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Helper function to create or update client record
 */
async function updateClientRecord(dealId: string, clientData: {
  name?: string
  email?: string
  phone?: string
}) {
  try {
    // Check if client already exists
    const { data: existingClients } = await supabase
      .from('clients')
      .select('*')
      .or(`email.eq.${clientData.email},phone.eq.${clientData.phone}`)
    
    let clientId: string
    
    if (existingClients && existingClients.length > 0) {
      // Update existing client
      const client = existingClients[0]
      clientId = client.id
      
      const updateData: any = {}
      if (clientData.name && !client.name) updateData.name = clientData.name
      if (clientData.email && !client.email) updateData.email = clientData.email
      if (clientData.phone && !client.phone) updateData.phone = clientData.phone
      
      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('clients')
          .update(updateData)
          .eq('id', clientId)
      }
    } else {
      // Create new client
      const { data: newClient } = await supabase
        .from('clients')
        .insert({
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          source: 'link'
        })
        .select()
        .single()
      
      clientId = newClient?.id
    }
    
    // Link client to deal
    if (clientId) {
      await supabase
        .from('links')
        .update({ client_id: clientId })
        .eq('id', dealId)
    }
    
  } catch (error) {
    console.error('Error updating client record:', error)
    // Don't throw - this is a secondary operation
  }
}