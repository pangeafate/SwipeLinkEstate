import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { ScoringService } from '@/components/crm/scoring.service'
import type { TaskType, TaskPriority, TaskStatus } from '@/components/crm/types'

/**
 * CRM Tasks API Endpoint
 * 
 * GET /api/crm/tasks - List tasks with filtering
 * POST /api/crm/tasks - Create new task (manual or automated)
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Parse query parameters
    const agentId = searchParams.get('agentId')
    const dealId = searchParams.get('dealId')
    const status = searchParams.get('status') as TaskStatus
    const priority = searchParams.get('priority') as TaskPriority
    const isAutomated = searchParams.get('automated')
    const limit = parseInt(searchParams.get('limit') ?? '50')
    
    // Build query
    let query = supabase
      .from('tasks')
      .select(`
        *,
        deals:links!tasks_deal_id_fkey(id, name, deal_stage),
        clients(id, name, email, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    // Apply filters
    if (agentId) query = query.eq('agent_id', agentId)
    if (dealId) query = query.eq('deal_id', dealId)
    if (status) query = query.eq('status', status)
    if (priority) query = query.eq('priority', priority)
    if (isAutomated !== null) query = query.eq('is_automated', isAutomated === 'true')
    
    const { data: tasks, error } = await query
    
    if (error) throw error
    
    // Group tasks by status for dashboard
    const tasksByStatus = {
      pending: tasks?.filter(t => t.status === 'pending') || [],
      completed: tasks?.filter(t => t.status === 'completed') || [],
      overdue: tasks?.filter(t => {
        if (t.status !== 'pending' || !t.due_date) return false
        return new Date(t.due_date) < new Date()
      }) || []
    }
    
    return NextResponse.json({
      success: true,
      data: {
        tasks: tasks || [],
        tasksByStatus,
        totalTasks: tasks?.length || 0,
        pendingTasks: tasksByStatus.pending.length,
        overdueTasks: tasksByStatus.overdue.length
      }
    })
    
  } catch (error) {
    console.error('Error fetching tasks:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tasks',
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
    const { 
      type, 
      title, 
      dealId, 
      agentId = 'current-agent', // TODO: Get from auth
      priority = 'medium',
      description,
      dueDate,
      clientId,
      isAutomated = false,
      automationTrigger
    } = body
    
    if (!type || !title) {
      return NextResponse.json(
        { success: false, error: 'Task type and title are required' },
        { status: 400 }
      )
    }
    
    // Validate task type
    const validTypes: TaskType[] = ['call', 'email', 'showing', 'follow-up', 'meeting', 'document']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid task type' },
        { status: 400 }
      )
    }
    
    // Create task
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        type,
        title,
        description,
        deal_id: dealId,
        client_id: clientId,
        agent_id: agentId,
        priority,
        due_date: dueDate,
        is_automated: isAutomated,
        automation_trigger: automationTrigger ? JSON.stringify(automationTrigger) : null
      })
      .select(`
        *,
        deals:links!tasks_deal_id_fkey(id, name, deal_stage),
        clients(id, name, email, phone)
      `)
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task created successfully'
    })
    
  } catch (error) {
    console.error('Error creating task:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create task',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}