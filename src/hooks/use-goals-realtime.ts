"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { GoalCategory, GoalStatus, GoalType } from "../../types/database"

// Define the goal type based on the Convex database structure
export interface Goal {
  _id: string
  _creationTime: number
  clientId: string
  title: string
  description: string
  category: GoalCategory
  type: GoalType
  targetDate?: number
  status: GoalStatus
  progress: number
  createdBy: string
  assignedTo?: string
  createdAt: number
  updatedAt: number
}

export interface CreateGoalData {
  clientId: string
  title: string
  description: string
  category: GoalCategory
  type: GoalType
  targetDate?: number
  assignedTo?: string
  createdBy: string
}

export interface UpdateGoalData {
  title?: string
  description?: string
  category?: GoalCategory
  type?: GoalType
  targetDate?: number
  status?: GoalStatus
  progress?: number
  assignedTo?: string
}

export function useGoalsRealtime() {
  // Real-time query - automatically updates when data changes
  const goals = useQuery(api.api.getGoals, {}) || []
  
  // Mutations for create, update, delete
  const createGoalMutation = useMutation(api.api.createGoal)
  const updateGoalMutation = useMutation(api.api.updateGoal)
  const deleteGoalMutation = useMutation(api.api.deleteGoal)

  // Create a new goal
  const createGoal = async (goalData: CreateGoalData) => {
    try {
      const result = await createGoalMutation(goalData)
      return result
    } catch (error) {
      console.error('Error creating goal:', error)
      throw error
    }
  }

  // Update an existing goal
  const updateGoal = async (goalId: string, updates: UpdateGoalData) => {
    try {
      // Filter out undefined values and handle assignedTo properly
      const filteredUpdates: Partial<UpdateGoalData> = {}
      
      if (updates.title !== undefined) filteredUpdates.title = updates.title
      if (updates.description !== undefined) filteredUpdates.description = updates.description
      if (updates.category !== undefined) filteredUpdates.category = updates.category
      if (updates.type !== undefined) filteredUpdates.type = updates.type
      if (updates.targetDate !== undefined) filteredUpdates.targetDate = updates.targetDate
      if (updates.status !== undefined) filteredUpdates.status = updates.status
      if (updates.progress !== undefined) filteredUpdates.progress = updates.progress
      
      // Handle assignedTo - only include if it's a valid value
      if (updates.assignedTo !== undefined && updates.assignedTo !== null && updates.assignedTo !== '') {
        // Only include if it looks like a valid Convex ID
        if (typeof updates.assignedTo === 'string' && /^[a-z][a-z0-9]*$/i.test(updates.assignedTo)) {
          filteredUpdates.assignedTo = updates.assignedTo
        }
      }

      const result = await updateGoalMutation({
        goalId: goalId, // Convex will validate the ID format
        updates: filteredUpdates,
      })
      return result
    } catch (error) {
      console.error('Error updating goal:', error)
      throw error
    }
  }

  // Delete a goal
  const deleteGoal = async (goalId: string) => {
    try {
      await deleteGoalMutation({
        goalId: goalId, // Convex will validate the ID format
      })
    } catch (error) {
      console.error('Error deleting goal:', error)
      throw error
    }
  }

  return {
    goals,
    isLoading: goals === undefined, // Convex returns undefined while loading
    error: null, // Convex handles errors automatically
    createGoal,
    updateGoal,
    deleteGoal,
    clearError: () => {}, // Not needed with Convex error handling
    refetch: () => {}, // Not needed with real-time updates
  }
}