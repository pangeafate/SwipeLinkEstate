import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { ScoringService } from '@/components/crm/scoring.service'
import type { SessionData, EngagementMetrics } from '@/components/crm/types'

/**
 * CRM Engagement Tracking API Endpoint
 * 
 * POST /api/crm/engagement/score - Calculate engagement score for session data
 * POST /api/crm/engagement/update - Update engagement score for a deal
 * POST /api/crm/engagement/session - Track new engagement session
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, sessionData, dealId, clientId } = body
    
    switch (action) {
      case 'score':
        return await handleScoreCalculation(sessionData)
      
      case 'update':
        return await handleEngagementUpdate(dealId, sessionData, clientId)
      
      case 'session':
        return await handleSessionTracking(sessionData, dealId, clientId)
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: score, update, or session' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error processing engagement request:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process engagement request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Calculate engagement score from session data
 */
async function handleScoreCalculation(sessionData: SessionData) {
  if (!sessionData) {
    return NextResponse.json(
      { success: false, error: 'Session data is required' },
      { status: 400 }
    )
  }
  
  const metrics = await ScoringService.calculateEngagementScore(sessionData)
  const temperature = ScoringService.getClientTemperature(metrics.totalScore)
  const insights = ScoringService.generateEngagementInsights(metrics)
  
  return NextResponse.json({
    success: true,
    data: {
      metrics,
      temperature,
      insights
    }
  })
}

/**
 * Update engagement score for a deal
 */
async function handleEngagementUpdate(dealId: string, sessionData: SessionData, clientId?: string) {
  if (!dealId || !sessionData) {
    return NextResponse.json(
      { success: false, error: 'Deal ID and session data are required' },
      { status: 400 }
    )
  }
  
  // Calculate new engagement score
  const metrics = await ScoringService.calculateEngagementScore(sessionData)
  const temperature = ScoringService.getClientTemperature(metrics.totalScore)
  
  // Update deal record
  const { data: deal, error: dealError } = await supabase
    .from('links')
    .update({
      engagement_score: metrics.totalScore,
      temperature: temperature,
      last_activity: new Date().toISOString()
    })
    .eq('id', dealId)
    .select()
    .single()
  
  if (dealError) throw dealError
  
  // Update client record if provided
  if (clientId) {
    await supabase
      .from('clients')
      .update({
        engagement_score: metrics.totalScore,
        temperature: temperature,
        last_interaction: new Date().toISOString()
      })
      .eq('id', clientId)
  }
  
  // Generate automated tasks based on engagement level
  await generateAutomatedTasks(dealId, metrics.totalScore, temperature, clientId)
  
  return NextResponse.json({
    success: true,
    data: {
      deal,
      metrics,
      temperature,
      message: 'Engagement updated successfully'
    }
  })
}

/**
 * Track new engagement session
 */
async function handleSessionTracking(sessionData: SessionData, dealId?: string, clientId?: string) {
  if (!sessionData) {
    return NextResponse.json(
      { success: false, error: 'Session data is required' },
      { status: 400 }
    )
  }
  
  // Calculate metrics
  const metrics = await ScoringService.calculateEngagementScore(sessionData)
  const temperature = ScoringService.getClientTemperature(metrics.totalScore)
  
  // Create engagement session record
  const { data: engagementSession, error: sessionError } = await supabase
    .from('engagement_sessions')
    .insert({
      session_id: sessionData.sessionId,
      deal_id: dealId,
      client_id: clientId,
      started_at: sessionData.startTime,
      ended_at: sessionData.endTime,
      duration_seconds: sessionData.duration,
      properties_viewed: sessionData.propertiesViewed,
      properties_liked: sessionData.propertiesLiked,
      properties_considered: sessionData.propertiesConsidered,
      completion_rate: sessionData.totalProperties > 0 ? 
        sessionData.propertiesViewed / sessionData.totalProperties : 0,
      engagement_score: metrics.totalScore
    })
    .select()
    .single()
  
  if (sessionError) throw sessionError
  
  // Update deal and client if provided
  if (dealId) {
    await handleEngagementUpdate(dealId, sessionData, clientId)
  }
  
  return NextResponse.json({
    success: true,
    data: {
      session: engagementSession,
      metrics,
      temperature,
      message: 'Session tracked successfully'
    }
  })
}

/**
 * Generate automated tasks based on engagement level
 */
async function generateAutomatedTasks(
  dealId: string, 
  engagementScore: number, 
  temperature: string,
  clientId?: string
) {
  try {
    const tasks = []
    
    // Hot lead (80+ score): Immediate follow-up
    if (engagementScore >= 80) {
      tasks.push({
        deal_id: dealId,
        client_id: clientId,
        type: 'call',
        priority: 'high',
        title: '🔥 Hot Lead: Call immediately',
        description: `High engagement score (${engagementScore}/100) detected. Client shows strong interest.`,
        due_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        is_automated: true,
        automation_trigger: JSON.stringify({
          trigger: 'high_engagement',
          score: engagementScore,
          threshold: 80
        })
      })
    }
    
    // Warm lead (50-79 score): Schedule follow-up
    else if (engagementScore >= 50) {
      tasks.push({
        deal_id: dealId,
        client_id: clientId,
        type: 'follow-up',
        priority: 'medium',
        title: '🌡️ Warm Lead: Follow up within 48 hours',
        description: `Moderate engagement score (${engagementScore}/100). Client showed interest.`,
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        is_automated: true,
        automation_trigger: JSON.stringify({
          trigger: 'medium_engagement',
          score: engagementScore,
          threshold: 50
        })
      })
    }
    
    // Cold lead: Add to nurture campaign
    else if (engagementScore > 0) {
      tasks.push({
        deal_id: dealId,
        client_id: clientId,
        type: 'email',
        priority: 'low',
        title: '❄️ Cold Lead: Add to nurture campaign',
        description: `Low engagement score (${engagementScore}/100). Consider nurture sequence.`,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        is_automated: true,
        automation_trigger: JSON.stringify({
          trigger: 'low_engagement',
          score: engagementScore,
          threshold: 0
        })
      })
    }
    
    // Create tasks in database
    if (tasks.length > 0) {
      await supabase
        .from('tasks')
        .insert(tasks)
    }
    
  } catch (error) {
    console.error('Error generating automated tasks:', error)
    // Don't throw - this is a secondary operation
  }
}