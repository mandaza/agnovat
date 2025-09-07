import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { api } from '../../../../../convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'
import { Id } from '../../../../../convex/_generated/dataModel'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const goalId = params.id as Id<"goals">
    const body = await request.json()
    
    const updatedGoal = await convex.mutation(api.api.updateGoal, {
      goalId,
      updates: {
        title: body.title,
        description: body.description,
        category: body.category,
        type: body.type,
        targetDate: body.targetDate,
        assignedTo: body.assignedTo,
        status: body.status,
        progress: body.progress,
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedGoal,
      message: 'Goal updated successfully',
    })
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update goal' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const goalId = params.id as Id<"goals">
    
    await convex.mutation(api.api.deleteGoal, {
      goalId,
    })
    
    return NextResponse.json({
      success: true,
      message: 'Goal deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete goal' },
      { status: 500 }
    )
  }
}
