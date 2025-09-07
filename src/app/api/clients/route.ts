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

    // Fetch all clients from Convex
    const clients = await convex.query(api.api.getClients)

    return NextResponse.json({
      success: true,
      data: clients,
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
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
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Client name is required' },
        { status: 400 }
      )
    }

    // Create client via Convex
    const client = await convex.mutation(api.api.createClient, {
      name: body.name,
      dateOfBirth: body.dateOfBirth,
      guardianName: body.guardianName,
      guardianContact: body.guardianContact,
      medicalInfo: body.medicalInfo,
      carePlan: body.carePlan,
      isActive: body.isActive ?? true,
    })

    return NextResponse.json({
      success: true,
      data: client,
      message: 'Client created successfully',
    })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    )
  }
}