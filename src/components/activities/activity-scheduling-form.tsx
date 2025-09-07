"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { 
  IconCalendarEvent,
  IconClock,
  IconUser,
  IconAlertTriangle,
  IconRepeat,
  IconPlus
} from "@tabler/icons-react"
import { useActivitySchedulesRealtime, useActivitiesRealtime } from "@/hooks/use-activity-schedules-realtime"
import { useGoalsRealtime } from "@/hooks/use-goals-realtime"
import { useClientsRealtime } from "@/hooks/use-clients-realtime"
import { useUsersRealtime } from "@/hooks/use-users-realtime"
// import { CreateActivityScheduleData, SchedulePriority, RecurringFrequency } from "../../types/database"

const scheduleFormSchema = z.object({
  activityId: z.string().min(1, "Please select an activity"),
  goalId: z.string().min(1, "Goal is required"),
  clientId: z.string().min(1, "Please select a client"),
  scheduledDate: z.string().min(1, "Please select a date"),
  scheduledStartTime: z.string().min(1, "Please select start time"),
  scheduledEndTime: z.string().min(1, "Please select end time"),
  assignedTo: z.string().min(1, "Please assign to a support worker"),
  priority: z.enum(["high", "medium", "low"] as const),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.object({
    frequency: z.enum(["daily", "weekly", "monthly"] as const),
    interval: z.number().min(1).max(12),
    endDate: z.string().optional(),
    daysOfWeek: z.array(z.number()).optional(),
  }).optional(),
})

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>

interface ActivitySchedulingFormProps {
  onClose?: () => void
  onScheduleCreated?: (scheduleId: string) => void
  defaultValues?: Partial<ScheduleFormValues>
}

export function ActivitySchedulingForm({ 
  onClose, 
  onScheduleCreated, 
  defaultValues 
}: ActivitySchedulingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecurring, setIsRecurring] = useState(defaultValues?.isRecurring || false)
  
  const { createSchedule } = useActivitySchedulesRealtime()
  const { activities, isLoading: activitiesLoading } = useActivitiesRealtime()
  const { goals, isLoading: goalsLoading } = useGoalsRealtime()
  const { clients, isLoading: clientsLoading } = useClientsRealtime()
  const { users, isLoading: usersLoading } = useUsersRealtime("support_worker")
  
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      priority: "medium",
      ...defaultValues,
      scheduledDate: defaultValues?.scheduledDate || new Date().toISOString().split('T')[0],
      isRecurring: isRecurring,
    },
  })

  // Watch form values for dynamic updates
  const watchedGoalId = form.watch("goalId")
  const watchedActivityId = form.watch("activityId")

  // Filter activities by selected goal
  const filteredActivities = watchedGoalId 
    ? activities.filter(activity => activity.goalId === watchedGoalId)
    : activities

  // Get activity details for duration estimation
  const selectedActivity = activities.find(a => a._id === watchedActivityId)

  // Auto-populate goal when activity is selected
  const handleActivityChange = (activityId: string) => {
    const activity = activities.find(a => a._id === activityId)
    if (activity) {
      form.setValue("goalId", activity.goalId)
      
      // Set default duration if available
      if (activity.estimatedDuration) {
        const startTime = form.getValues("scheduledStartTime")
        if (startTime) {
          const [hours, minutes] = startTime.split(':').map(Number)
          const endTime = new Date()
          endTime.setHours(hours, minutes + activity.estimatedDuration, 0, 0)
          form.setValue("scheduledEndTime", endTime.toTimeString().slice(0, 5))
        }
      }
    }
  }

  const onSubmit = async (data: ScheduleFormValues) => {
    setIsSubmitting(true)
    
    try {
      // Convert date and time strings to timestamps
      const scheduleDate = new Date(data.scheduledDate)
      const [startHours, startMinutes] = data.scheduledStartTime.split(':').map(Number)
      const [endHours, endMinutes] = data.scheduledEndTime.split(':').map(Number)
      
      const scheduledStartTime = new Date(scheduleDate)
      scheduledStartTime.setHours(startHours, startMinutes, 0, 0)
      
      const scheduledEndTime = new Date(scheduleDate)
      scheduledEndTime.setHours(endHours, endMinutes, 0, 0)

      // Validate end time is after start time
      if (scheduledEndTime <= scheduledStartTime) {
        form.setError("scheduledEndTime", {
          message: "End time must be after start time"
        })
        return
      }

      const scheduleData: any = {
        activityId: data.activityId,
        goalId: data.goalId,
        clientId: data.clientId,
        scheduledDate: scheduleDate.getTime(),
        scheduledStartTime: scheduledStartTime.getTime(),
        scheduledEndTime: scheduledEndTime.getTime(),
        assignedTo: data.assignedTo,
        priority: data.priority,
        notes: data.notes,
        createdBy: users.length > 0 ? users[0]._id : "j574pzzgd9sj26yxk1jet1arnn7padhj", // Use first user or fallback
        recurringPattern: isRecurring && data.recurringPattern ? {
          frequency: data.recurringPattern.frequency,
          interval: data.recurringPattern.interval,
          endDate: data.recurringPattern.endDate ? new Date(data.recurringPattern.endDate).getTime() : undefined,
          daysOfWeek: data.recurringPattern.daysOfWeek,
        } : undefined,
      }

      const scheduleId = await createSchedule(scheduleData)
      
      // Success feedback
      alert(`Activity scheduled successfully! ${isRecurring ? 'Recurring schedule created.' : ''}`)
      
      onScheduleCreated?.(scheduleId)
      onClose?.()
      
    } catch (error: unknown) {
      console.error('Failed to create schedule:', error)
      
      // Handle specific error types
      const message = error instanceof Error ? error.message : ''
      if (message.includes('conflict')) {
        form.setError("scheduledStartTime", {
          message: "Schedule conflict detected. Please choose a different time."
        })
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        alert(`Failed to create schedule: ${errorMessage}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = activitiesLoading || goalsLoading || clientsLoading || usersLoading

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCalendarEvent className="h-5 w-5" />
          Schedule Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Client Selection */}
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Goal and Activity Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="goalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {goals.map((goal) => (
                          <SelectItem key={goal._id} value={goal._id}>
                            <div>
                              <div className="font-medium">{goal.title}</div>
                              <div className="text-xs text-muted-foreground">{goal.category}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value)
                        handleActivityChange(value)
                      }} 
                      value={field.value} 
                      disabled={isLoading || !watchedGoalId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={watchedGoalId ? "Select activity" : "Select goal first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredActivities.map((activity) => (
                          <SelectItem key={activity._id} value={activity._id}>
                            <div>
                              <div className="font-medium">{activity.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {activity.frequency} • {activity.estimatedDuration}min
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledEndTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Activity Duration Helper */}
            {selectedActivity?.estimatedDuration && (
              <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                <IconClock className="h-4 w-4 inline mr-1" />
                Estimated duration: {selectedActivity.estimatedDuration} minutes
              </div>
            )}

            {/* Assignment and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select support worker" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">
                          <Badge variant="destructive" className="mr-2">High</Badge>
                          Urgent
                        </SelectItem>
                        <SelectItem value="medium">
                          <Badge variant="default" className="mr-2">Medium</Badge>
                          Standard
                        </SelectItem>
                        <SelectItem value="low">
                          <Badge variant="secondary" className="mr-2">Low</Badge>
                          When convenient
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any special instructions or notes for this scheduled activity..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recurring Schedule Section */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => setIsRecurring(checked === true)}
                />
                <Label htmlFor="recurring" className="flex items-center gap-2">
                  <IconRepeat className="h-4 w-4" />
                  Make this a recurring schedule
                </Label>
              </div>

              {isRecurring && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="recurringPattern.frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recurringPattern.interval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Every</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="12"
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormDescription>
                            Every N {form.watch("recurringPattern.frequency") || "days"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recurringPattern.endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            When to stop recurring
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Schedule Activity"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}