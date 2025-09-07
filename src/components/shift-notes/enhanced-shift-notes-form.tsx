"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  IconClock, 
  IconUser, 
  IconCalendar,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconActivity,
  IconTarget,
  IconBrain,
  IconCamera,
  IconPlus,
  IconChevronDown,
  IconChevronRight,
  IconSearch,
  IconFilter,
  IconClockHour3,
  IconUsers
} from "@tabler/icons-react"
import { useShiftNotesRealtime } from "@/hooks/use-shift-notes-realtime"
import { useActivitySchedulesRealtime, useActivitiesRealtime } from "@/hooks/use-activity-schedules-realtime"
import { useGoalsRealtime } from "@/hooks/use-goals-realtime"
import { useUserRealtime } from "@/hooks/use-user-realtime"
import { MediaUpload } from "./media-upload"
import { Id } from "../../../convex/_generated/dataModel"

// Form validation schema
const shiftNoteSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  shiftDate: z.string().min(1, "Shift date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  challenges: z.string().optional(),
  generalNotes: z.string().optional(),
  skillsPracticed: z.array(z.string()),
})

type ShiftNoteFormData = z.infer<typeof shiftNoteSchema>

interface ScheduledActivityItem {
  scheduleId: Id<"activitySchedules">
  activityId: Id<"activities">
  goalId: Id<"goals">
  title: string
  goalTitle: string
  scheduledStartTime: number
  scheduledEndTime: number
  status: "scheduled" | "in_progress" | "completed" | "rescheduled" | "cancelled"
  priority: "high" | "medium" | "low"
  instructions?: string
  estimatedDuration?: number
}

interface ActivityCompletionStatus {
  scheduleId: Id<"activitySchedules">
  completed: boolean
  status: "completed" | "in_progress" | "not_completed"
  notes: string
  difficulty: "easy" | "moderate" | "difficult"
  clientEngagement: "high" | "medium" | "low"
  challengeReason?: string
}

interface EnhancedShiftNotesFormProps {
  initialShiftNoteId?: Id<"shiftNotes">
  clientId?: string
  onClose: () => void
  onShiftNoteCreated?: (shiftNoteId: Id<"shiftNotes">) => void
}

export function EnhancedShiftNotesForm({ 
  initialShiftNoteId, 
  clientId = "js71rnhs3ts703d1thj36n7pc57pahxb", 
  onClose, 
  onShiftNoteCreated 
}: EnhancedShiftNotesFormProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [expandedSections, setExpandedSections] = useState({
    activities: true,
    challenges: false,
    skills: false,
    notes: false,
  })
  const [activityCompletions, setActivityCompletions] = useState<Map<string, ActivityCompletionStatus>>(new Map())
  const [additionalActivityCompletions, setAdditionalActivityCompletions] = useState<Map<Id<"activities">, ActivityCompletionStatus>>(new Map())
  const [selectedGoals, setSelectedGoals] = useState<Set<Id<"goals">>>(new Set())
  const [activitySearchTerm, setActivitySearchTerm] = useState("")
  const [goalSearchTerm, setGoalSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("scheduled")

  // Hook calls
  const { createShiftNote, updateShiftNote, getCurrentShiftNote, isLoading: shiftNotesLoading } = useShiftNotesRealtime()
  const { schedules, getSchedulesForDate, isLoading: schedulesLoading } = useActivitySchedulesRealtime()
  const { activities, isLoading: activitiesLoading } = useActivitiesRealtime()
  const { goals, isLoading: goalsLoading } = useGoalsRealtime()
  const { convexUser, isLoading: userLoading } = useUserRealtime()

  // Form setup
  const form = useForm<ShiftNoteFormData>({
    resolver: zodResolver(shiftNoteSchema),
    defaultValues: {
      clientId,
      shiftDate: selectedDate,
      startTime: "09:00",
      endTime: "",
      summary: "",
      challenges: "",
      generalNotes: "",
      skillsPracticed: [],
    }
  })

  const isLoading = shiftNotesLoading || schedulesLoading || activitiesLoading || goalsLoading || userLoading

  // Get scheduled activities for the selected date
  const scheduledActivities: ScheduledActivityItem[] = useMemo(() => {
    const dateObj = new Date(selectedDate)
    const daySchedules = getSchedulesForDate(dateObj)
    
    return daySchedules
      .filter(schedule => schedule.clientId === clientId && schedule.status !== 'cancelled')
      .map(schedule => {
        const activity = activities.find(a => a._id === schedule.activityId)
        const goal = goals.find(g => g._id === schedule.goalId)
        
        return {
          scheduleId: schedule._id,
          activityId: schedule.activityId,
          goalId: schedule.goalId,
          title: activity?.title || 'Unknown Activity',
          goalTitle: goal?.title || 'Unknown Goal',
          scheduledStartTime: schedule.scheduledStartTime,
          scheduledEndTime: schedule.scheduledEndTime,
          status: schedule.status,
          priority: schedule.priority,
          instructions: activity?.instructions,
          estimatedDuration: activity?.estimatedDuration,
        }
      })
      .sort((a, b) => a.scheduledStartTime - b.scheduledStartTime)
  }, [selectedDate, clientId, schedules, activities, goals, getSchedulesForDate])

  // Get additional activities (not scheduled for today)
  const additionalActivities = useMemo(() => {
    const scheduledActivityIds = new Set(scheduledActivities.map(sa => sa.activityId))
    return activities
      .filter(activity => 
        activity.isActive && 
        !scheduledActivityIds.has(activity._id) &&
        (activitySearchTerm === "" || 
         activity.title.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
         activity.description.toLowerCase().includes(activitySearchTerm.toLowerCase()))
      )
      .map(activity => {
        const goal = goals.find(g => g._id === activity.goalId)
        return {
          ...activity,
          goalTitle: goal?.title || 'Unknown Goal'
        }
      })
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [activities, scheduledActivities, activitySearchTerm, goals])

  // Get filtered goals for selection
  const filteredGoals = useMemo(() => {
    return goals
      .filter(goal => 
        goal.status === 'active' &&
        goal.clientId === clientId &&
        (goalSearchTerm === "" || 
         goal.title.toLowerCase().includes(goalSearchTerm.toLowerCase()) ||
         goal.description.toLowerCase().includes(goalSearchTerm.toLowerCase()))
      )
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [goals, clientId, goalSearchTerm])

  // Handle activity completion toggle
  const handleActivityCompletion = (scheduleId: Id<"activitySchedules">, completed: boolean) => {
    setActivityCompletions(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(scheduleId)
      
      newMap.set(scheduleId, {
        scheduleId,
        completed,
        status: completed ? "completed" : "not_completed",
        notes: existing?.notes || "",
        difficulty: existing?.difficulty || "moderate",
        clientEngagement: existing?.clientEngagement || "medium",
        challengeReason: existing?.challengeReason || "",
      })
      
      return newMap
    })
  }

  // Handle activity completion details
  const handleActivityDetails = (scheduleId: Id<"activitySchedules">, updates: Partial<ActivityCompletionStatus>) => {
    setActivityCompletions(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(scheduleId) || {
        scheduleId,
        completed: false,
        status: "not_completed" as const,
        notes: "",
        difficulty: "moderate" as const,
        clientEngagement: "medium" as const,
      }
      
      newMap.set(scheduleId, { ...existing, ...updates })
      return newMap
    })
  }

  // Handle additional activity completion
  const handleAdditionalActivityCompletion = (activityId: Id<"activities">, completed: boolean) => {
    setAdditionalActivityCompletions(prev => {
      const newMap = new Map(prev)
      if (completed) {
        newMap.set(activityId, {
          scheduleId: activityId, // Using activityId as scheduleId for consistency
          completed: true,
          status: "completed",
          notes: "",
          difficulty: "moderate",
          clientEngagement: "medium",
        })
      } else {
        newMap.delete(activityId)
      }
      return newMap
    })
  }

  // Handle additional activity details
  const handleAdditionalActivityDetails = (activityId: Id<"activities">, updates: Partial<ActivityCompletionStatus>) => {
    setAdditionalActivityCompletions(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(activityId)
      if (existing) {
        newMap.set(activityId, { ...existing, ...updates })
      }
      return newMap
    })
  }

  // Handle goal selection
  const handleGoalSelection = (goalId: Id<"goals">, selected: boolean) => {
    setSelectedGoals(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(goalId)
      } else {
        newSet.delete(goalId)
      }
      return newSet
    })
  }

  // Get completion stats
  const completionStats = useMemo(() => {
    const scheduledTotal = scheduledActivities.length
    const scheduledCompleted = Array.from(activityCompletions.values()).filter(c => c.completed).length
    const scheduledInProgress = Array.from(activityCompletions.values()).filter(c => c.status === "in_progress").length
    
    const additionalCompleted = additionalActivityCompletions.size
    const totalCompleted = scheduledCompleted + additionalCompleted
    
    return { 
      scheduledTotal, 
      scheduledCompleted, 
      scheduledInProgress, 
      scheduledNotStarted: scheduledTotal - scheduledCompleted - scheduledInProgress,
      additionalCompleted,
      totalCompleted,
      selectedGoalsCount: selectedGoals.size
    }
  }, [scheduledActivities.length, activityCompletions, additionalActivityCompletions, selectedGoals])

  // Submit handler
  const onSubmit = async (data: ShiftNoteFormData) => {
    try {
      // Check if we have a valid user
      if (!convexUser?._id) {
        console.error('No authenticated user found')
        return
      }

      const startDateTime = new Date(`${data.shiftDate}T${data.startTime}:00`)
      const endDateTime = data.endTime ? new Date(`${data.shiftDate}T${data.endTime}:00`) : new Date()

      // Create activity completions for completed activities
      const completedActivityIds: Id<"activityCompletions">[] = []
      const goalsCovered = new Set<Id<"goals">>()

      // Process completed scheduled activities
      for (const [scheduleId, completion] of activityCompletions) {
        if (completion.completed) {
          const activity = scheduledActivities.find(a => a.scheduleId === scheduleId)
          if (activity) {
            goalsCovered.add(activity.goalId)
            // In a real implementation, you'd create activity completion records here
            // completedActivityIds.push(await createActivityCompletion(...))
          }
        }
      }

      // Process completed additional activities
      for (const [activityId, completion] of additionalActivityCompletions) {
        const activity = activities.find(a => a._id === activityId)
        if (activity) {
          goalsCovered.add(activity.goalId)
          // In a real implementation, you'd create activity completion records here
          // completedActivityIds.push(await createActivityCompletion(...))
        }
      }

      // Add manually selected goals
      selectedGoals.forEach(goalId => goalsCovered.add(goalId))

      const shiftNoteData = {
        userId: convexUser._id,
        clientId: data.clientId,
        shiftDate: new Date(data.shiftDate).getTime(),
        startTime: startDateTime.getTime(),
        endTime: endDateTime.getTime(),
        summary: data.summary,
        activitiesCompleted: completedActivityIds,
        goalsCovered: Array.from(goalsCovered),
        challenges: data.challenges || undefined,
        skillsPracticed: data.skillsPracticed,
        generalNotes: data.generalNotes || undefined,
      }

      const result = await createShiftNote(shiftNoteData)
      onShiftNoteCreated?.(result._id)
      onClose()
    } catch (error) {
      console.error('Error creating shift note:', error)
    }
  }

  // Section toggle handler
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Format time for display
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shift data...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCalendar className="h-5 w-5" />
            Enhanced Shift Note
          </CardTitle>
          <CardDescription>
            Document your shift with integrated activity tracking and comprehensive notes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="shiftDate">Shift Date</Label>
              <Input
                id="shiftDate"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  form.setValue('shiftDate', e.target.value)
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                {...form.register('startTime')}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                {...form.register('endTime')}
                className="mt-1"
              />
            </div>
          </div>

          {/* Activity Completion Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <IconActivity className="h-4 w-4" />
                Activity Overview
              </h4>
              <div className="flex gap-2 text-sm flex-wrap">
                <Badge variant="default">{completionStats.totalCompleted} Total Completed</Badge>
                <Badge variant="secondary">{completionStats.scheduledInProgress} In Progress</Badge>
                <Badge variant="outline">{completionStats.scheduledNotStarted} Scheduled</Badge>
                {completionStats.additionalCompleted > 0 && (
                  <Badge variant="secondary">+{completionStats.additionalCompleted} Additional</Badge>
                )}
                <Badge variant="outline" className="bg-blue-50">
                  <IconTarget className="h-3 w-3 mr-1" />
                  {completionStats.selectedGoalsCount} Goals Covered
                </Badge>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {scheduledActivities.length} activities scheduled • {additionalActivities.length} additional available
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Activities & Goals Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => toggleSection('activities')}
            >
              {expandedSections.activities ? <IconChevronDown className="h-4 w-4" /> : <IconChevronRight className="h-4 w-4" />}
              <IconCheck className="h-5 w-5" />
              Activities & Goals
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{scheduledActivities.length} scheduled</Badge>
              <Badge variant="secondary">{additionalActivities.length} available</Badge>
            </div>
          </div>
        </CardHeader>
        {expandedSections.activities && (
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="scheduled" className="flex items-center gap-2">
                  <IconClockHour3 className="h-4 w-4" />
                  Scheduled ({scheduledActivities.length})
                </TabsTrigger>
                <TabsTrigger value="additional" className="flex items-center gap-2">
                  <IconPlus className="h-4 w-4" />
                  Additional ({additionalActivities.length})
                </TabsTrigger>
                <TabsTrigger value="goals" className="flex items-center gap-2">
                  <IconTarget className="h-4 w-4" />
                  Goals ({filteredGoals.length})
                </TabsTrigger>
              </TabsList>

              {/* Scheduled Activities Tab */}
              <TabsContent value="scheduled" className="mt-4">
                <div className="space-y-4">
                  {scheduledActivities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <IconActivity className="mx-auto h-8 w-8 mb-2" />
                      <p>No activities scheduled for this date</p>
                    </div>
                  ) : (
                    scheduledActivities.map((activity) => {
                      const completion = activityCompletions.get(activity.scheduleId)
                      const isCompleted = completion?.completed || false
                      
                      return (
                        <div key={activity.scheduleId} className={`border rounded-lg p-4 ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isCompleted}
                                onCheckedChange={(checked) => handleActivityCompletion(activity.scheduleId, checked as boolean)}
                              />
                              <div>
                                <h4 className="font-medium">{activity.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Goal: {activity.goalTitle}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <IconClock className="h-3 w-3" />
                                  {formatTime(activity.scheduledStartTime)} - {formatTime(activity.scheduledEndTime)}
                                  {activity.estimatedDuration && (
                                    <span>({activity.estimatedDuration} min)</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Badge variant={activity.priority === 'high' ? 'destructive' : activity.priority === 'medium' ? 'default' : 'secondary'}>
                              {activity.priority}
                            </Badge>
                          </div>

                          {activity.instructions && (
                            <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                              <strong>Instructions:</strong> {activity.instructions}
                            </div>
                          )}

                          {/* Activity Details (shown when checked) */}
                          {isCompleted && (
                            <div className="mt-3 space-y-3 border-t pt-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-sm">Completion Status</Label>
                                  <Select
                                    value={completion?.status || "completed"}
                                    onValueChange={(value) => handleActivityDetails(activity.scheduleId, { 
                                      status: value as "completed" | "in_progress" | "not_completed" 
                                    })}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="not_completed">Not Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-sm">Difficulty Level</Label>
                                  <Select
                                    value={completion?.difficulty || "moderate"}
                                    onValueChange={(value) => handleActivityDetails(activity.scheduleId, { 
                                      difficulty: value as "easy" | "moderate" | "difficult" 
                                    })}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="easy">Easy</SelectItem>
                                      <SelectItem value="moderate">Moderate</SelectItem>
                                      <SelectItem value="difficult">Difficult</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm">Client Engagement</Label>
                                <Select
                                  value={completion?.clientEngagement || "medium"}
                                  onValueChange={(value) => handleActivityDetails(activity.scheduleId, { 
                                    clientEngagement: value as "high" | "medium" | "low" 
                                  })}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-sm">Activity Notes</Label>
                                <Textarea
                                  placeholder="Notes about this activity..."
                                  value={completion?.notes || ""}
                                  onChange={(e) => handleActivityDetails(activity.scheduleId, { notes: e.target.value })}
                                  className="mt-1"
                                  rows={2}
                                />
                              </div>
                            </div>
                          )}

                          {/* Challenge Documentation for Incomplete Activities */}
                          {completion?.completed === false && (
                            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                              <Label className="text-sm font-medium text-orange-800">Reason for Not Completing</Label>
                              <Textarea
                                placeholder="Explain why this activity wasn't completed..."
                                value={completion?.challengeReason || ""}
                                onChange={(e) => handleActivityDetails(activity.scheduleId, { challengeReason: e.target.value })}
                                className="mt-2"
                                rows={2}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </TabsContent>

              {/* Additional Activities Tab */}
              <TabsContent value="additional" className="mt-4">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search additional activities..."
                      value={activitySearchTerm}
                      onChange={(e) => setActivitySearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {additionalActivities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <IconActivity className="mx-auto h-8 w-8 mb-2" />
                      <p>No additional activities found</p>
                    </div>
                  ) : (
                    additionalActivities.map((activity) => {
                      const completion = additionalActivityCompletions.get(activity._id)
                      const isCompleted = completion?.completed || false
                      
                      return (
                        <div key={activity._id} className={`border rounded-lg p-4 ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isCompleted}
                                onCheckedChange={(checked) => handleAdditionalActivityCompletion(activity._id, checked as boolean)}
                              />
                              <div>
                                <h4 className="font-medium">{activity.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Goal: {activity.goalTitle}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {activity.description}
                                </p>
                                {activity.frequency && (
                                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                    <IconClock className="h-3 w-3" />
                                    {activity.frequency}
                                    {activity.estimatedDuration && (
                                      <span>• {activity.estimatedDuration} min</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {activity.instructions && (
                            <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                              <strong>Instructions:</strong> {activity.instructions}
                            </div>
                          )}

                          {/* Activity Details (shown when checked) */}
                          {isCompleted && (
                            <div className="mt-3 space-y-3 border-t pt-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-sm">Difficulty Level</Label>
                                  <Select
                                    value={completion?.difficulty || "moderate"}
                                    onValueChange={(value) => handleAdditionalActivityDetails(activity._id, { 
                                      difficulty: value as "easy" | "moderate" | "difficult" 
                                    })}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="easy">Easy</SelectItem>
                                      <SelectItem value="moderate">Moderate</SelectItem>
                                      <SelectItem value="difficult">Difficult</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-sm">Client Engagement</Label>
                                  <Select
                                    value={completion?.clientEngagement || "medium"}
                                    onValueChange={(value) => handleAdditionalActivityDetails(activity._id, { 
                                      clientEngagement: value as "high" | "medium" | "low" 
                                    })}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="high">High</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm">Activity Notes</Label>
                                <Textarea
                                  placeholder="Notes about this activity..."
                                  value={completion?.notes || ""}
                                  onChange={(e) => handleAdditionalActivityDetails(activity._id, { notes: e.target.value })}
                                  className="mt-1"
                                  rows={2}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </TabsContent>

              {/* Goals Tab */}
              <TabsContent value="goals" className="mt-4">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search goals..."
                      value={goalSearchTerm}
                      onChange={(e) => setGoalSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {filteredGoals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <IconTarget className="mx-auto h-8 w-8 mb-2" />
                      <p>No goals found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredGoals.map((goal) => {
                        const isSelected = selectedGoals.has(goal._id)
                        
                        return (
                          <div key={goal._id} className={`border rounded-lg p-4 transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => handleGoalSelection(goal._id, checked as boolean)}
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium">{goal.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {goal.description}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span className="capitalize">{goal.category.replace('_', ' ')}</span>
                                    <span className="capitalize">{goal.type.replace('_', ' ')}</span>
                                    {goal.targetDate && (
                                      <span>Due: {new Date(goal.targetDate).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant="outline">{goal.progress}%</Badge>
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${goal.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>

      {/* Shift Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Shift Summary</CardTitle>
          <CardDescription>Provide an overall summary of the shift</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            {...form.register('summary')}
            placeholder="Describe the overall shift, key achievements, client mood, and general observations..."
            rows={4}
            className="resize-none"
          />
          {form.formState.errors.summary && (
            <p className="text-sm text-destructive mt-2">{form.formState.errors.summary.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Challenges & Issues */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => toggleSection('challenges')}
            >
              {expandedSections.challenges ? <IconChevronDown className="h-4 w-4" /> : <IconChevronRight className="h-4 w-4" />}
              <IconAlertTriangle className="h-5 w-5" />
              Challenges & Issues
            </CardTitle>
          </div>
        </CardHeader>
        {expandedSections.challenges && (
          <CardContent>
            <Textarea
              {...form.register('challenges')}
              placeholder="Document any challenges, issues, or unexpected situations that occurred during the shift..."
              rows={3}
              className="resize-none"
            />
          </CardContent>
        )}
      </Card>

      {/* Skills Practiced */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => toggleSection('skills')}
            >
              {expandedSections.skills ? <IconChevronDown className="h-4 w-4" /> : <IconChevronRight className="h-4 w-4" />}
              <IconBrain className="h-5 w-5" />
              Skills Practiced
            </CardTitle>
          </div>
        </CardHeader>
        {expandedSections.skills && (
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Communication', 'Social Skills', 'Motor Skills', 'Independence', 'Problem Solving', 'Self-Care'].map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={skill}
                      checked={form.watch('skillsPracticed')?.includes(skill) || false}
                      onCheckedChange={(checked) => {
                        const current = form.getValues('skillsPracticed') || []
                        if (checked) {
                          form.setValue('skillsPracticed', [...current, skill])
                        } else {
                          form.setValue('skillsPracticed', current.filter(s => s !== skill))
                        }
                      }}
                    />
                    <Label htmlFor={skill} className="text-sm">{skill}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => toggleSection('notes')}
            >
              {expandedSections.notes ? <IconChevronDown className="h-4 w-4" /> : <IconChevronRight className="h-4 w-4" />}
              Additional Notes
            </CardTitle>
          </div>
        </CardHeader>
        {expandedSections.notes && (
          <CardContent>
            <Textarea
              {...form.register('generalNotes')}
              placeholder="Any additional observations, recommendations, or notes for the next shift..."
              rows={3}
              className="resize-none"
            />
          </CardContent>
        )}
      </Card>

      {/* Media Upload */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => toggleSection('notes')}
            >
              <IconCamera className="h-5 w-5" />
              Media & Evidence
            </CardTitle>
          </div>
          <CardDescription>
            Upload photos, videos, or documents to support your shift notes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MediaUpload
            shiftNoteId={undefined} // Will be set after shift note is created
            onMediaUploaded={(mediaId) => {
              console.log('Media uploaded:', mediaId)
            }}
            maxFiles={10}
            maxFileSize={50}
          />
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="secondary">
            Save Draft
          </Button>
          <Button type="submit">
            Submit Shift Note
          </Button>
        </div>
      </div>
    </form>
  )
}