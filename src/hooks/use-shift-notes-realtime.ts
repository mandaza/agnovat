"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"

// Define the shift note type based on the Convex database structure
export interface ShiftNote {
  _id: Id<"shiftNotes">
  _creationTime: number
  userId: Id<"users">
  clientId: string
  shiftDate: number
  startTime: number
  endTime: number
  summary: string
  activitiesCompleted: Id<"activityCompletions">[]
  goalsCovered: Id<"goals">[]
  challenges?: string
  behaviorIncidentIds?: Id<"behaviors">[]
  skillsPracticed: string[]
  generalNotes?: string
  status: "draft" | "submitted" | "reviewed"
  reviewedBy?: Id<"users">
  reviewedAt?: number
  createdAt: number
  updatedAt: number
}

export interface ShiftNoteFilters {
  userId?: Id<"users">
  clientId?: string
  startDate?: number
  endDate?: number
  status?: "draft" | "submitted" | "reviewed"
}

export interface CreateShiftNoteData {
  userId: Id<"users">
  clientId: string
  shiftDate: number
  startTime: number
  endTime: number
  summary: string
  activitiesCompleted: Id<"activityCompletions">[]
  goalsCovered: Id<"goals">[]
  challenges?: string
  behaviorIncidentIds?: Id<"behaviors">[]
  skillsPracticed: string[]
  generalNotes?: string
  status: "draft" | "submitted" | "reviewed"
}

export interface UpdateShiftNoteData {
  summary?: string
  activitiesCompleted?: Id<"activityCompletions">[]
  goalsCovered?: Id<"goals">[]
  challenges?: string
  behaviorIncidentIds?: Id<"behaviors">[]
  skillsPracticed?: string[]
  generalNotes?: string
  status?: "draft" | "submitted" | "reviewed"
  endTime?: number
}

export function useShiftNotesRealtime(filters: ShiftNoteFilters = {}) {
  // Real-time query - automatically updates when data changes
  const shiftNotes = useQuery(api.api.getShiftNotes, filters) || []
  
  // Mutations for create, update operations
  const createShiftNoteMutation = useMutation(api.api.createShiftNote)
  const updateShiftNoteMutation = useMutation(api.api.updateShiftNote)

  // Create a new shift note
  const createShiftNote = async (shiftNoteData: CreateShiftNoteData) => {
    try {
      const result = await createShiftNoteMutation({
        userId: shiftNoteData.userId,
        clientId: shiftNoteData.clientId,
        shiftDate: shiftNoteData.shiftDate,
        startTime: shiftNoteData.startTime,
        endTime: shiftNoteData.endTime,
        summary: shiftNoteData.summary,
        activitiesCompleted: shiftNoteData.activitiesCompleted,
        goalsCovered: shiftNoteData.goalsCovered,
        challenges: shiftNoteData.challenges,
        behaviorIncidentIds: shiftNoteData.behaviorIncidentIds,
        skillsPracticed: shiftNoteData.skillsPracticed,
        generalNotes: shiftNoteData.generalNotes,
        status: shiftNoteData.status,
      })
      return result
    } catch (error) {
      console.error('Error creating shift note:', error)
      throw error
    }
  }

  // Update an existing shift note
  const updateShiftNote = async (shiftNoteId: Id<"shiftNotes">, updates: UpdateShiftNoteData) => {
    try {
      const result = await updateShiftNoteMutation({
        shiftNoteId,
        updates,
      })
      return result
    } catch (error) {
      console.error('Error updating shift note:', error)
      throw error
    }
  }

  // Get shift notes for a specific date
  const getShiftNotesForDate = (date: Date) => {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    return shiftNotes.filter(note => {
      return note.shiftDate >= startOfDay.getTime() && 
             note.shiftDate <= endOfDay.getTime()
    })
  }

  // Get today's shift notes
  const getTodaysShiftNotes = () => {
    return getShiftNotesForDate(new Date())
  }

  // Get shift notes for a specific user on a specific date
  const getShiftNotesForUserAndDate = (userId: Id<"users">, date: Date) => {
    return getShiftNotesForDate(date).filter(note => 
      note.userId === userId
    )
  }

  // Get current shift note (if any active shift)
  const getCurrentShiftNote = (userId: Id<"users">) => {
    const today = getTodaysShiftNotes()
    return today.find(note => 
      note.userId === userId && 
      note.status === 'draft'
    )
  }

  // Calculate shift analytics
  const analytics = {
    total: shiftNotes.length,
    draft: shiftNotes.filter(s => s.status === 'draft').length,
    submitted: shiftNotes.filter(s => s.status === 'submitted').length,
    reviewed: shiftNotes.filter(s => s.status === 'reviewed').length,
    today: getTodaysShiftNotes().length,
    thisWeek: shiftNotes.filter(note => {
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      return note.shiftDate >= weekAgo
    }).length,
  }

  return {
    shiftNotes,
    isLoading: shiftNotes === undefined,
    error: null,
    analytics,
    createShiftNote,
    updateShiftNote,
    getShiftNotesForDate,
    getTodaysShiftNotes,
    getShiftNotesForUserAndDate,
    getCurrentShiftNote,
  }
}