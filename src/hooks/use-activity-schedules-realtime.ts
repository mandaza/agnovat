"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"
import { 
  ActivityScheduleStatus, 
  SchedulePriority, 
  RecurringFrequency,
  CreateActivityScheduleData 
} from "../../types/database"

// Define the activity schedule type based on the Convex database structure
export interface ActivitySchedule {
  _id: string
  _creationTime: number
  activityId: string
  goalId: string
  clientId: string
  scheduledDate: number
  scheduledStartTime: number
  scheduledEndTime: number
  assignedTo: string
  status: ActivityScheduleStatus
  priority: SchedulePriority
  notes?: string
  completionId?: string
  rescheduledFrom?: string
  recurringPattern?: {
    frequency: RecurringFrequency
    interval: number
    endDate?: number
    daysOfWeek?: number[]
  }
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface ActivityScheduleFilters {
  activityId?: Id<"activities">
  goalId?: Id<"goals">
  clientId?: string
  assignedTo?: Id<"users">
  status?: ActivityScheduleStatus
  priority?: SchedulePriority
  startDate?: number
  endDate?: number
  scheduledDate?: number
}

export interface UpdateActivityScheduleData {
  scheduledDate?: number
  scheduledStartTime?: number
  scheduledEndTime?: number
  assignedTo?: Id<"users">
  priority?: SchedulePriority
  status?: ActivityScheduleStatus
  notes?: string
}

export interface RescheduleActivityData {
  newScheduledDate: number
  newScheduledStartTime: number
  newScheduledEndTime: number
  newAssignedTo?: Id<"users">
  rescheduleReason?: string
}

export function useActivitySchedulesRealtime(filters: ActivityScheduleFilters = {}) {
  // Real-time query - automatically updates when data changes
  const schedules = useQuery(api.api.getActivitySchedules, filters) || []
  
  // Mutations for create, update, delete operations
  const createScheduleMutation = useMutation(api.api.createActivitySchedule)
  const updateScheduleMutation = useMutation(api.api.updateActivitySchedule)
  const rescheduleMutation = useMutation(api.api.rescheduleActivity)
  const cancelScheduleMutation = useMutation(api.api.cancelActivitySchedule)

  // Create a new activity schedule
  const createSchedule = async (scheduleData: CreateActivityScheduleData) => {
    try {
      const result = await createScheduleMutation({
        activityId: scheduleData.activityId as any,
        goalId: scheduleData.goalId as any,
        clientId: scheduleData.clientId,
        scheduledDate: scheduleData.scheduledDate,
        scheduledStartTime: scheduleData.scheduledStartTime,
        scheduledEndTime: scheduleData.scheduledEndTime,
        assignedTo: scheduleData.assignedTo as any,
        priority: scheduleData.priority,
        notes: scheduleData.notes,
        recurringPattern: scheduleData.recurringPattern,
        createdBy: scheduleData.createdBy as any,
      })
      return result
    } catch (error) {
      console.error('Error creating activity schedule:', error)
      throw error
    }
  }

  // Update an existing activity schedule
  const updateSchedule = async (scheduleId: string, updates: UpdateActivityScheduleData) => {
    try {
      // Filter out undefined values
      const filteredUpdates: Partial<UpdateActivityScheduleData> = {}
      
      if (updates.scheduledDate !== undefined) filteredUpdates.scheduledDate = updates.scheduledDate
      if (updates.scheduledStartTime !== undefined) filteredUpdates.scheduledStartTime = updates.scheduledStartTime
      if (updates.scheduledEndTime !== undefined) filteredUpdates.scheduledEndTime = updates.scheduledEndTime
      if (updates.priority !== undefined) filteredUpdates.priority = updates.priority
      if (updates.status !== undefined) filteredUpdates.status = updates.status
      if (updates.notes !== undefined) filteredUpdates.notes = updates.notes
      
      // Handle assignedTo - only include if it's a valid value
      if (updates.assignedTo && typeof updates.assignedTo === 'string') {
        filteredUpdates.assignedTo = updates.assignedTo
      }

      const result = await updateScheduleMutation({
        scheduleId: scheduleId as any,
        updates: filteredUpdates,
      })
      return result
    } catch (error) {
      console.error('Error updating activity schedule:', error)
      throw error
    }
  }

  // Reschedule an activity to a new time
  const rescheduleActivity = async (scheduleId: string, rescheduleData: RescheduleActivityData) => {
    try {
      const result = await rescheduleMutation({
        originalScheduleId: scheduleId as any,
        newScheduledDate: rescheduleData.newScheduledDate,
        newScheduledStartTime: rescheduleData.newScheduledStartTime,
        newScheduledEndTime: rescheduleData.newScheduledEndTime,
        newAssignedTo: rescheduleData.newAssignedTo as any,
        rescheduleReason: rescheduleData.rescheduleReason,
      })
      return result
    } catch (error) {
      console.error('Error rescheduling activity:', error)
      throw error
    }
  }

  // Cancel an activity schedule
  const cancelSchedule = async (scheduleId: string, cancellationReason?: string) => {
    try {
      const result = await cancelScheduleMutation({
        scheduleId: scheduleId as any,
        cancellationReason,
      })
      return result
    } catch (error) {
      console.error('Error cancelling activity schedule:', error)
      throw error
    }
  }

  // Get schedules for a specific date
  const getSchedulesForDate = (date: Date) => {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    return schedules.filter(schedule => {
      return schedule.scheduledStartTime >= startOfDay.getTime() && 
             schedule.scheduledStartTime <= endOfDay.getTime() &&
             schedule.status !== 'cancelled'
    })
  }

  // Get schedules for today
  const getTodaysSchedules = () => {
    return getSchedulesForDate(new Date())
  }

  // Get schedules for a specific user on a specific date
  const getSchedulesForUserAndDate = (userId: string, date: Date) => {
    return getSchedulesForDate(date).filter(schedule => 
      schedule.assignedTo === userId && schedule.status !== 'cancelled'
    )
  }

  // Get upcoming schedules (next 7 days)
  const getUpcomingSchedules = (days: number = 7) => {
    const now = Date.now()
    const futureDate = now + (days * 24 * 60 * 60 * 1000)
    
    return schedules
      .filter(schedule => 
        schedule.scheduledStartTime >= now && 
        schedule.scheduledStartTime <= futureDate &&
        schedule.status !== 'cancelled' &&
        schedule.status !== 'rescheduled'
      )
      .sort((a, b) => a.scheduledStartTime - b.scheduledStartTime)
  }

  // Get overdue schedules
  const getOverdueSchedules = () => {
    const now = Date.now()
    
    return schedules.filter(schedule => 
      schedule.scheduledEndTime < now &&
      schedule.status === 'scheduled'
    )
  }

  // Calculate schedule analytics
  const analytics = {
    total: schedules.length,
    scheduled: schedules.filter(s => s.status === 'scheduled').length,
    completed: schedules.filter(s => s.status === 'completed').length,
    cancelled: schedules.filter(s => s.status === 'cancelled').length,
    rescheduled: schedules.filter(s => s.status === 'rescheduled').length,
    overdue: getOverdueSchedules().length,
    today: getTodaysSchedules().length,
    thisWeek: getUpcomingSchedules(7).length,
    byPriority: {
      high: schedules.filter(s => s.priority === 'high' && s.status !== 'cancelled').length,
      medium: schedules.filter(s => s.priority === 'medium' && s.status !== 'cancelled').length,
      low: schedules.filter(s => s.priority === 'low' && s.status !== 'cancelled').length,
    }
  }

  return {
    schedules,
    isLoading: schedules === undefined,
    error: null,
    analytics,
    createSchedule,
    updateSchedule,
    rescheduleActivity,
    cancelSchedule,
    getSchedulesForDate,
    getTodaysSchedules,
    getSchedulesForUserAndDate,
    getUpcomingSchedules,
    getOverdueSchedules,
  }
}

// Hook for activities (existing activities that can be scheduled)
export function useActivitiesRealtime(filters: { goalId?: string; frequency?: string } = {}) {
  const activities = useQuery(api.api.getActivities, filters as any) || []
  
  // Mutations for activity management
  const createActivityMutation = useMutation(api.api.createActivity)
  const updateActivityMutation = useMutation(api.api.updateActivity)
  const deleteActivityMutation = useMutation(api.api.deleteActivity)
  const deactivateActivityMutation = useMutation(api.api.deactivateActivity)
  
  // Create a new activity
  const createActivity = async (activityData: {
    goalId: string
    title: string
    description: string
    frequency: "daily" | "weekly" | "monthly" | "as_needed"
    estimatedDuration?: number
    instructions?: string
    materials?: string[]
  }) => {
    try {
      const result = await createActivityMutation({
        goalId: activityData.goalId as any,
        title: activityData.title,
        description: activityData.description,
        frequency: activityData.frequency as any,
        estimatedDuration: activityData.estimatedDuration,
        instructions: activityData.instructions,
        materials: activityData.materials,
      })
      return result
    } catch (error) {
      console.error('Error creating activity:', error)
      throw error
    }
  }

  // Update an existing activity
  const updateActivity = async (activityId: string, updates: {
    goalId?: string
    title?: string
    description?: string
    frequency?: "daily" | "weekly" | "monthly" | "as_needed"
    estimatedDuration?: number
    instructions?: string
    materials?: string[]
    isActive?: boolean
  }) => {
    try {
      const result = await updateActivityMutation({
        activityId: activityId as any,
        updates: {
          goalId: updates.goalId as any,
          title: updates.title,
          description: updates.description,
          frequency: updates.frequency as any,
          estimatedDuration: updates.estimatedDuration,
          instructions: updates.instructions,
          materials: updates.materials,
          isActive: updates.isActive,
        },
      })
      return result
    } catch (error) {
      console.error('Error updating activity:', error)
      throw error
    }
  }

  // Delete an activity
  const deleteActivity = async (activityId: string) => {
    try {
      const result = await deleteActivityMutation({
        activityId: activityId as any,
      })
      return result
    } catch (error) {
      console.error('Error deleting activity:', error)
      throw error
    }
  }

  // Deactivate an activity (safer than deletion)
  const deactivateActivity = async (activityId: string) => {
    try {
      const result = await deactivateActivityMutation({
        activityId: activityId as any,
      })
      return result
    } catch (error) {
      console.error('Error deactivating activity:', error)
      throw error
    }
  }
  
  return {
    activities,
    isLoading: activities === undefined,
    error: null,
    createActivity,
    updateActivity,
    deleteActivity,
    deactivateActivity,
  }
}