"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { BehaviorStatus, Location } from "../../types/database"
import { useUserRealtime } from "./use-user-realtime"

// Behavior incident type based on Convex schema
export interface BehaviorIncident {
  _id: string
  _creationTime: number
  userId: string
  clientId: string
  dateTime: number
  endTime?: number
  location: Location
  activityBefore?: string
  behaviors: string[]
  customBehaviors?: string
  warningSigns?: {
    present: boolean
    notes?: string
  }
  intensity: 1 | 2 | 3 | 4 | 5
  harmToClient?: {
    occurred: boolean
    description?: string
    extent?: string
  }
  harmToOthers?: {
    occurred: boolean
    description?: string
    extent?: string
  }
  interventions: string[]
  interventionNotes?: string
  supportRequired?: {
    secondPerson: boolean
    explanation?: string
  }
  description: string
  status: BehaviorStatus
  reviewedBy?: string
  reviewedAt?: number
  createdAt: number
  updatedAt: number
}

export interface CreateBehaviorData {
  clientId: string
  dateTime: number
  endTime?: number
  location: Location
  activityBefore?: string
  behaviors: string[]
  customBehaviors?: string
  warningSigns?: {
    present: boolean
    notes?: string
  }
  intensity: 1 | 2 | 3 | 4 | 5
  harmToClient?: {
    occurred: boolean
    description?: string
    extent?: string
  }
  harmToOthers?: {
    occurred: boolean
    description?: string
    extent?: string
  }
  interventions: string[]
  interventionNotes?: string
  supportRequired?: {
    secondPerson: boolean
    explanation?: string
  }
  description: string
}

export interface BehaviorFilters {
  clientId?: string
  userId?: string
  status?: BehaviorStatus
  startDate?: number
  endDate?: number
}

export function useBehaviorsRealtime(filters: BehaviorFilters = {}) {
  const { convexUser } = useUserRealtime()
  
  // Real-time query - automatically updates when data changes
  const behaviors = useQuery(api.api.getBehaviors, {
    clientId: filters.clientId,
    userId: filters.userId as any,
    status: filters.status,
    startDate: filters.startDate,
    endDate: filters.endDate,
  }) || []
  
  // Mutations for create, update, review
  const createBehaviorMutation = useMutation(api.api.createBehavior)
  const updateBehaviorMutation = useMutation(api.api.updateBehavior)
  const reviewBehaviorMutation = useMutation(api.api.reviewBehavior)

  // Create a new behavior incident
  const createBehaviorIncident = async (behaviorData: CreateBehaviorData): Promise<string> => {
    try {
      // Ensure we have a valid Convex user ID
      if (!convexUser?._id) {
        throw new Error('User not found. Please ensure you are logged in.')
      }

      const result = await createBehaviorMutation({
        ...behaviorData,
        userId: convexUser._id
      })
      return result
    } catch (error) {
      console.error('Error creating behavior incident:', error)
      throw error
    }
  }

  // Update an existing behavior incident
  const updateBehaviorIncident = async (behaviorId: string, updates: Partial<CreateBehaviorData>) => {
    try {
      // Filter out undefined values
      const filteredUpdates: Record<string, unknown> = {}
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          filteredUpdates[key] = value
        }
      })

      const result = await updateBehaviorMutation({
        behaviorId: behaviorId as unknown as never, // Convex will validate the ID format
        updates: filteredUpdates,
      })
      return result
    } catch (error) {
      console.error('Error updating behavior incident:', error)
      throw error
    }
  }

  // Review a behavior incident (for practitioners)
  const reviewBehaviorIncident = async (
    behaviorId: string, 
    reviewedBy: string, 
    status: "reviewed" | "archived"
  ) => {
    try {
      await reviewBehaviorMutation({
        behaviorId: behaviorId as unknown as never,
        reviewedBy: reviewedBy as unknown as never,
        status,
      })
    } catch (error) {
      console.error('Error reviewing behavior incident:', error)
      throw error
    }
  }

  // Helper functions for analytics
  const getAnalytics = () => {
    if (!behaviors || behaviors.length === 0) {
      return {
        totalIncidents: 0,
        avgIntensity: 0,
        mostCommonBehaviors: [],
        harmIncidents: 0,
        statusBreakdown: {
          draft: 0,
          submitted: 0,
          reviewed: 0,
          archived: 0,
        }
      }
    }

    const totalIncidents = behaviors.length
    const avgIntensity = behaviors.reduce((sum, b) => sum + b.intensity, 0) / totalIncidents
    
    // Count all behaviors
    const behaviorCounts: Record<string, number> = {}
    behaviors.forEach(incident => {
      incident.behaviors.forEach(behavior => {
        behaviorCounts[behavior] = (behaviorCounts[behavior] || 0) + 1
      })
    })
    
    const mostCommonBehaviors = Object.entries(behaviorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([behavior, count]) => ({ behavior, count }))

    const harmIncidents = behaviors.filter(b => 
      b.harmToClient?.occurred || b.harmToOthers?.occurred
    ).length

    const statusBreakdown = behaviors.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1
      return acc
    }, {} as Record<BehaviorStatus, number>)

    return {
      totalIncidents,
      avgIntensity: Math.round(avgIntensity * 10) / 10,
      mostCommonBehaviors,
      harmIncidents,
      statusBreakdown: {
        draft: statusBreakdown.draft || 0,
        submitted: statusBreakdown.submitted || 0,
        reviewed: statusBreakdown.reviewed || 0,
        archived: statusBreakdown.archived || 0,
      }
    }
  }

  // Get recent incidents (last 30 days)
  const getRecentIncidents = () => {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    return behaviors.filter(b => b.dateTime >= thirtyDaysAgo)
  }

  // Get high-intensity incidents (4-5 intensity)
  const getHighIntensityIncidents = () => {
    return behaviors.filter(b => b.intensity >= 4)
  }

  return {
    behaviors,
    isLoading: behaviors === undefined || convexUser === undefined, // Convex returns undefined while loading
    error: null, // Convex handles errors automatically
    createBehaviorIncident,
    updateBehaviorIncident,
    reviewBehaviorIncident,
    analytics: getAnalytics(),
    recentIncidents: getRecentIncidents(),
    highIntensityIncidents: getHighIntensityIncidents(),
    refetch: () => {}, // Not needed with real-time updates
  }
}

// Hook specifically for behavior checklists and intervention strategies
export function useBehaviorResources() {
  const behaviorChecklist = useQuery(api.api.getBehaviorChecklist, {}) || []
  const interventionStrategies = useQuery(api.api.getInterventionStrategies, {}) || []

  return {
    behaviorChecklist,
    interventionStrategies,
    isLoading: behaviorChecklist === undefined || interventionStrategies === undefined,
  }
}