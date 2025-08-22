import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import type { TaskStatus } from '@/components/crm/types'

/**
 * Individual Task API Endpoint
 * 
 * PATCH /api/crm/tasks/[id] - Update task (typically to mark complete)
 * DELETE /api/crm/tasks/[id] - Delete task
 */

type RouteContext = {
  params: {
    id: string
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const taskId = params.id
    const body = await request.json()
    
    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      )
    }
    
    const { status, notes } = body
    
    // Validate status
    const validStatuses: TaskStatus[] = ['pending', 'completed', 'dismissed', 'overdue']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid task status' },
        { status: 400 }
      )
    }
    
    // Build update object
    const updateData: any = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.description = notes
    
    // Set completion timestamp if marking as completed
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }
    
    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
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
      message: 'Task updated successfully'
    })
    
  } catch (error) {
    console.error(`Error updating task ${params.id}:`, error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update task',
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
    const taskId = params.id
    
    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })
    
  } catch (error) {
    console.error(`Error deleting task ${params.id}:`, error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete task',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}