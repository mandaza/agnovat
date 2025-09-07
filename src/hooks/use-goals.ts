import { useState, useEffect } from 'react'
import { GoalCategory, GoalStatus, GoalType } from '../../types/database'

// Define the goal type based on the actual Convex database structure
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

// Use Next.js API routes since Convex hooks aren't working due to type generation issues
export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch goals from Next.js API route
  const fetchGoals = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/goals')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setGoals(result.data || [])
        } else {
          throw new Error(result.error || 'Failed to fetch goals')
        }
      } else {
        throw new Error('Failed to fetch goals')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch goals'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Create goal function
  const createGoal = async (goalData: Omit<Goal, '_id' | '_creationTime' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Refresh the goals list to show the new goal
          await fetchGoals()
          return 'success'
        } else {
          throw new Error(result.error || 'Failed to create goal')
        }
      } else {
        throw new Error('Failed to create goal')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create goal'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Update goal function
  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Refresh the goals list to show the updated goal
          await fetchGoals()
        } else {
          throw new Error(result.error || 'Failed to update goal')
        }
      } else {
        const errorResponse = await response.json()
        throw new Error(errorResponse.error || 'Failed to update goal')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update goal'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete goal function
  const deleteGoal = async (goalId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Refresh the goals list to show the deleted goal is gone
          await fetchGoals()
        } else {
          throw new Error(result.error || 'Failed to delete goal')
        }
      } else {
        const errorResponse = await response.json()
        throw new Error(errorResponse.error || 'Failed to delete goal')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete goal'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Clear error function
  const clearError = () => setError(null)

  // Load goals on mount
  useEffect(() => {
    fetchGoals()
  }, [])

  return {
    goals,
    isLoading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    clearError,
    refetch: fetchGoals,
  }
}
