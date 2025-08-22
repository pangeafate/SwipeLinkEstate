import { NextRequest, NextResponse } from 'next/server'
import { DealService } from '@/components/crm/deal.service'
import { TaskService } from '@/components/crm/task.service'
import type { DealStage } from '@/components/crm/types'

/**
 * CRM Deal Stage Update API Endpoint
 * 
 * PATCH /api/crm/deals/[id]/stage - Update deal stage and trigger automation
 */

// Valid deal stages in progression order
const VALID_STAGES: DealStage[] = [
  'created', 'shared', 'accessed', 'engaged', 'qualified', 'advanced', 'closed'
]

// Define valid stage transitions
const STAGE_TRANSITIONS: Record<DealStage, DealStage[]> = {
  'created': ['shared', 'accessed'], // Can skip to accessed if link clicked directly
  'shared': ['accessed', 'engaged'],
  'accessed': ['engaged', 'qualified'],
  'engaged': ['qualified', 'advanced', 'shared'], // Can regress with confirmation
  'qualified': ['advanced', 'closed', 'engaged'], // Can regress with confirmation
  'advanced': ['closed', 'qualified'], // Can regress with confirmation
  'closed': [] // Terminal state - no transitions allowed
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = params.id
    const body = await request.json()
    
    // Validate required fields
    const { stage, notes, confirmBackward } = body
    
    if (!stage) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Stage is required' 
        },
        { status: 400 }
      )
    }
    
    // Validate stage value
    if (!VALID_STAGES.includes(stage)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid stage value',
          validStages: VALID_STAGES
        },
        { status: 400 }
      )
    }
    
    // Get current deal
    const currentDeal = await DealService.getDealById(dealId)
    if (!currentDeal) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Deal not found' 
        },
        { status: 404 }
      )
    }
    
    const currentStage = currentDeal.dealStage
    
    // Validate stage transition
    const allowedTransitions = STAGE_TRANSITIONS[currentStage]
    const isValidTransition = allowedTransitions.includes(stage)
    const isBackwardTransition = VALID_STAGES.indexOf(stage) < VALID_STAGES.indexOf(currentStage)
    
    // Check if stage transition is valid
    if (!isValidTransition) {
      if (currentStage === 'closed') {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid stage transition',
            message: 'Cannot change stage of closed deals',
            currentStage,
            attemptedStage: stage
          },
          { status: 400 }
        )
      }
      
      // Check for invalid forward jumps
      if (!isBackwardTransition) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid stage transition',
            message: 'Stage progression must follow sequential progression',
            currentStage,
            attemptedStage: stage
          },
          { status: 400 }
        )
      }
    }
    
    // Require confirmation for backward transitions
    if (isBackwardTransition && !confirmBackward) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid stage transition',
          message: 'Backward stage transitions require explicit confirmation',
          currentStage,
          attemptedStage: stage,
          requiresConfirmation: true
        },
        { status: 400 }
      )
    }
    
    // Update deal stage
    const updatedDeal = await DealService.updateDealStage(dealId, stage)
    if (!updatedDeal) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update deal stage' 
        },
        { status: 500 }
      )
    }
    
    // Generate automated tasks based on stage change
    let generatedTasks = []
    try {
      generatedTasks = await TaskService.generateAutomatedTasks(
        dealId,
        'stage-change',
        updatedDeal
      )
    } catch (taskError) {
      console.warn('Failed to generate automated tasks:', taskError)
      // Don't fail the entire request if task generation fails
    }
    
    // Log stage change for audit
    console.log(`Deal ${dealId} stage updated: ${currentStage} → ${stage}`, {
      dealId,
      previousStage: currentStage,
      newStage: stage,
      tasksGenerated: generatedTasks.length,
      notes,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      data: {
        ...updatedDeal,
        lastStageUpdate: new Date().toISOString()
      },
      previousStage: currentStage,
      tasksGenerated: generatedTasks.length,
      generatedTasks: generatedTasks,
      notes: notes || null,
      message: `Deal stage updated from ${currentStage} to ${stage}`
    })
    
  } catch (error) {
    console.error('Error updating deal stage:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update deal stage',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}