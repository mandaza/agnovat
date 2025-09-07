"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  IconClock,
  IconUser,
  IconMapPin,
  IconEdit,
  IconX,
  IconCalendarEvent
} from "@tabler/icons-react"
import { useActivitySchedulesRealtime, useActivitiesRealtime } from "@/hooks/use-activity-schedules-realtime"
import { useGoalsRealtime } from "@/hooks/use-goals-realtime"

interface UpcomingActivitiesListProps {
  onEditSchedule?: (scheduleId: string) => void
  onCancelSchedule?: (scheduleId: string) => void
}

export function UpcomingActivitiesList({ onEditSchedule, onCancelSchedule }: UpcomingActivitiesListProps) {
  const { schedules, getUpcomingSchedules, getOverdueSchedules, isLoading: schedulesLoading, cancelSchedule } = useActivitySchedulesRealtime()
  const { activities, isLoading: activitiesLoading } = useActivitiesRealtime()
  const { goals, isLoading: goalsLoading } = useGoalsRealtime()
  
  const upcomingSchedules = getUpcomingSchedules(7) // Next 7 days
  const overdueSchedules = getOverdueSchedules()
  const allRelevantSchedules = [...overdueSchedules, ...upcomingSchedules]
  const isLoading = schedulesLoading || activitiesLoading || goalsLoading


  const getActivityTitle = (activityId: string) => {
    const activity = activities.find(a => a._id === activityId)
    return activity?.title || 'Unknown Activity'
  }

  const getGoalTitle = (goalId: string) => {
    const goal = goals.find(g => g._id === goalId)
    return goal?.title || 'Unknown Goal'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled': return 'outline'
      case 'in_progress': return 'default'
      case 'completed': return 'secondary'
      case 'cancelled': return 'destructive'
      case 'rescheduled': return 'secondary'
      default: return 'outline'
    }
  }

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    let dateStr = ''
    if (date.toDateString() === today.toDateString()) {
      dateStr = 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateStr = 'Tomorrow'
    } else {
      dateStr = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    }
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `${dateStr}, ${timeStr}`
  }

  const handleCancelSchedule = async (scheduleId: string, title: string) => {
    if (window.confirm(`Are you sure you want to cancel "${title}"?`)) {
      try {
        await cancelSchedule(scheduleId, 'Cancelled by user')
      } catch (error) {
        console.error('Failed to cancel schedule:', error)
        alert('Failed to cancel schedule. Please try again.')
      }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Activities</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border animate-pulse">
                <div className="w-2 h-2 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconCalendarEvent className="h-5 w-5" />
          Upcoming Activities
        </CardTitle>
        <CardDescription>
          {allRelevantSchedules.length} scheduled activities ({overdueSchedules.length} overdue, {upcomingSchedules.length} upcoming)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allRelevantSchedules.length === 0 ? (
            <div className="text-center py-8">
              <IconCalendarEvent className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No activities scheduled</p>
            </div>
          ) : (
            allRelevantSchedules.slice(0, 10).map((schedule) => {
              const isOverdue = overdueSchedules.some(overdue => overdue._id === schedule._id)
              return (
              <div key={schedule._id} className={`flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                <div className={`w-2 h-2 ${getPriorityColor(schedule.priority)} rounded-full mt-2 flex-shrink-0`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm truncate">
                        {getActivityTitle(schedule.activityId)}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        Goal: {getGoalTitle(schedule.goalId)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <Badge variant={getStatusBadgeVariant(schedule.status)} className="text-xs">
                        {schedule.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <IconClock className="h-3 w-3" />
                      <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                        {formatDateTime(schedule.scheduledStartTime)}
                        {isOverdue && ' (Overdue)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconUser className="h-3 w-3" />
                      <span>Assigned</span>
                    </div>
                  </div>
                  
                  {schedule.notes && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {schedule.notes}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-1 ml-2">
                  {schedule.status === 'scheduled' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onEditSchedule?.(schedule._id)}
                      >
                        <IconEdit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleCancelSchedule(schedule._id, getActivityTitle(schedule.activityId))}
                      >
                        <IconX className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
            })
          )}
          
          {allRelevantSchedules.length > 10 && (
            <div className="text-center pt-2">
              <Button variant="outline" size="sm">
                View All ({allRelevantSchedules.length - 10} more)
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}