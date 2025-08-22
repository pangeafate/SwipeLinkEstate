import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { CRMService } from '@/components/crm/crm.service'

/**
 * CRM Analytics API Endpoint
 * 
 * GET /api/crm/analytics?type=dashboard|pipeline|performance
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'dashboard'
    const agentId = searchParams.get('agentId')
    
    switch (type) {
      case 'dashboard':
        return await handleDashboardAnalytics(agentId)
      
      case 'pipeline':
        return await handlePipelineAnalytics(agentId)
      
      case 'performance':
        return await handlePerformanceAnalytics(agentId)
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid analytics type' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error fetching analytics:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Get dashboard analytics with summary metrics
 */
async function handleDashboardAnalytics(agentId?: string) {
  try {
    const dashboard = await CRMService.getCRMDashboard(agentId || undefined)
    const pipelineHealth = await CRMService.getPipelineHealthReport(agentId || undefined)
    
    return NextResponse.json({
      success: true,
      data: {
        dashboard,
        pipelineHealth
      }
    })
  } catch (error) {
    // Return basic metrics if service fails
    const basicMetrics = await getBasicMetrics(agentId)
    
    return NextResponse.json({
      success: true,
      data: {
        dashboard: {
          summary: basicMetrics,
          pipeline: null,
          recentActivity: null
        },
        pipelineHealth: {
          health: 'unknown',
          metrics: null,
          recommendations: ['Unable to calculate pipeline health']
        }
      }
    })
  }
}

/**
 * Get pipeline-specific analytics
 */
async function handlePipelineAnalytics(agentId?: string) {
  try {
    const pipelineMetrics = await CRMService.getPipelineMetrics(agentId || undefined)
    const conversionRates = await CRMService.getStageConversionRates(agentId || undefined)
    const timeMetrics = await CRMService.getTimeMetrics(agentId || undefined)
    
    return NextResponse.json({
      success: true,
      data: {
        pipelineMetrics,
        conversionRates,
        timeMetrics
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: {
        pipelineMetrics: null,
        conversionRates: null,
        timeMetrics: null,
        error: 'Pipeline analytics temporarily unavailable'
      }
    })
  }
}

/**
 * Get performance analytics
 */
async function handlePerformanceAnalytics(agentId?: string) {
  try {
    const performanceInsights = await CRMService.getPerformanceInsights(agentId || undefined)
    
    return NextResponse.json({
      success: true,
      data: performanceInsights
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: {
        kpis: {},
        trends: {},
        insights: [],
        recommendations: ['Performance analytics temporarily unavailable']
      }
    })
  }
}

/**
 * Get basic metrics directly from database as fallback
 */
async function getBasicMetrics(agentId?: string) {
  try {
    // Build query
    let dealsQuery = supabase
      .from('links')
      .select('*')
    
    if (agentId) {
      dealsQuery = dealsQuery.eq('agent_id', agentId)
    }
    
    const { data: deals } = await dealsQuery
    
    // Get tasks
    let tasksQuery = supabase
      .from('tasks')
      .select('*')
    
    if (agentId) {
      tasksQuery = tasksQuery.eq('agent_id', agentId)
    }
    
    const { data: tasks } = await tasksQuery
    
    // Calculate basic metrics
    const totalDeals = deals?.length || 0
    const activeDeals = deals?.filter(d => d.deal_status === 'active' || d.deal_status === 'qualified').length || 0
    const hotLeads = deals?.filter(d => d.temperature === 'hot').length || 0
    const pendingTasks = tasks?.filter(t => t.status === 'pending').length || 0
    
    // Calculate revenue (mock data for now)
    const totalRevenue = deals?.reduce((sum, deal) => sum + (deal.deal_value || 0), 0) || 0
    
    return {
      totalDeals,
      activeDeals,
      hotLeads,
      pendingTasks,
      thisMonthRevenue: Math.round(totalRevenue * 0.3), // Rough estimate
      totalRevenue
    }
    
  } catch (error) {
    console.error('Error getting basic metrics:', error)
    
    return {
      totalDeals: 0,
      activeDeals: 0,
      hotLeads: 0,
      pendingTasks: 0,
      thisMonthRevenue: 0,
      totalRevenue: 0
    }
  }
}