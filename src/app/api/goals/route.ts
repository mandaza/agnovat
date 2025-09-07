import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { api } from '../../../../convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const goals = await convex.query(api.api.getGoals, {})
    return NextResponse.json({
      success: true,
      data: goals,
    })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch goals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const goal = await convex.mutation(api.api.createGoal, {
      clientId: body.clientId,
      title: body.title,
      description: body.description,
      category: body.category,
      type: body.type,
      targetDate: body.targetDate,
      assignedTo: body.assignedTo,
      createdBy: body.createdBy,
    })
    
    return NextResponse.json({
      success: true,
      data: goal,
      message: 'Goal created successfully',
    })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create goal' },
      { status: 500 }
    )
  }
}
