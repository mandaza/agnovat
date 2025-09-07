"use client"

import { useState, useCallback, useMemo } from "react"
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar"
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
import "./calendar-styles.css"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  IconChevronLeft, 
  IconChevronRight, 
  IconCalendarMonth,
  IconCalendarWeek,
  IconCalendar,
  IconFilter
} from "@tabler/icons-react"
import { useActivitySchedulesRealtime, useActivitiesRealtime } from "@/hooks/use-activity-schedules-realtime"
import { useGoalsRealtime } from "@/hooks/use-goals-realtime"
import type { ActivitySchedule } from "@/hooks/use-activity-schedules-realtime"

// Setup the localizer for react-big-calendar
const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// Create drag and drop calendar
const DnDCalendar = withDragAndDrop(Calendar)

// Calendar event interface
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: ActivitySchedule
}

interface ActivityCalendarViewProps {
  onEditSchedule?: (scheduleId: string) => void
  onSelectSchedule?: (scheduleId: string) => void
}

export function ActivityCalendarView({ onEditSchedule, onSelectSchedule }: ActivityCalendarViewProps) {
  const [currentView, setCurrentView] = useState<View>(Views.MONTH)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [selectedWorker, setSelectedWorker] = useState<string>("all")

  const { schedules, rescheduleActivity, isLoading: schedulesLoading } = useActivitySchedulesRealtime()
  const { activities, isLoading: activitiesLoading } = useActivitiesRealtime()
  const { goals, isLoading: goalsLoading } = useGoalsRealtime()

  const isLoading = schedulesLoading || activitiesLoading || goalsLoading

  // Get activity and goal titles
  const getActivityTitle = (activityId: string) => {
    const activity = activities.find(a => a._id === activityId)
    return activity?.title || 'Unknown Activity'
  }

  const getGoalTitle = (goalId: string) => {
    const goal = goals.find(g => g._id === goalId)
    return goal?.title || 'Unknown Goal'
  }

  // Filter schedules based on selected filters
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      // Filter out cancelled and rescheduled schedules
      if (schedule.status === 'cancelled' || schedule.status === 'rescheduled') {
        return false
      }

      // Filter by client
      if (selectedClient !== "all" && schedule.clientId !== selectedClient) {
        return false
      }

      // Filter by worker
      if (selectedWorker !== "all" && schedule.assignedTo !== selectedWorker) {
        return false
      }

      return true
    })
  }, [schedules, selectedClient, selectedWorker])

  // Convert schedules to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return filteredSchedules.map(schedule => ({
      id: schedule._id,
      title: getActivityTitle(schedule.activityId),
      start: new Date(schedule.scheduledStartTime),
      end: new Date(schedule.scheduledEndTime),
      resource: schedule,
    }))
  }, [filteredSchedules, getActivityTitle])

  // Get unique clients and workers for filtering
  const uniqueClients = useMemo(() => {
    const clients = [...new Set(schedules.map(s => s.clientId))]
    return clients.filter(Boolean)
  }, [schedules])

  const uniqueWorkers = useMemo(() => {
    const workers = [...new Set(schedules.map(s => s.assignedTo))]
    return workers.filter(Boolean)
  }, [schedules])

  // Handle event selection
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    onSelectSchedule?.(event.id)
  }, [onSelectSchedule])

  // Handle event double click for editing
  const handleDoubleClickEvent = useCallback((event: CalendarEvent) => {
    onEditSchedule?.(event.id)
  }, [onEditSchedule])

  // Handle drag and drop rescheduling
  const handleEventDrop = useCallback(async (args: { event: CalendarEvent; start: Date; end: Date }) => {
    const { event, start, end } = args
    
    try {
      await rescheduleActivity(event.id, {
        newScheduledDate: start.getTime(),
        newScheduledStartTime: start.getTime(),
        newScheduledEndTime: end.getTime(),
        rescheduleReason: 'Rescheduled via calendar drag-and-drop'
      })
    } catch (error) {
      console.error('Failed to reschedule activity:', error)
      // Could show error toast here
    }
  }, [rescheduleActivity])

  // Handle resizing events
  const handleEventResize = useCallback(async (args: { event: CalendarEvent; start: Date; end: Date }) => {
    const { event, start, end } = args
    
    try {
      await rescheduleActivity(event.id, {
        newScheduledDate: start.getTime(),
        newScheduledStartTime: start.getTime(),
        newScheduledEndTime: end.getTime(),
        rescheduleReason: 'Duration adjusted via calendar resize'
      })
    } catch (error) {
      console.error('Failed to resize activity:', error)
      // Could show error toast here
    }
  }, [rescheduleActivity])

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const schedule = event.resource
    const isOverdue = schedule.scheduledEndTime < Date.now() && schedule.status === 'scheduled'
    
    return (
      <div className="rbc-event-content">
        <div className="text-xs font-medium truncate">{event.title}</div>
        <div className="flex items-center gap-1 mt-1">
          <Badge 
            variant={schedule.status === 'completed' ? 'secondary' : 'outline'} 
            className="text-xs px-1"
          >
            {schedule.status}
          </Badge>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs px-1">
              Overdue
            </Badge>
          )}
        </div>
      </div>
    )
  }

  // Navigation handlers
  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate)
  }

  const handleViewChange = (newView: View) => {
    setCurrentView(newView)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* View Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={currentView === Views.MONTH ? "default" : "outline"}
            size="sm"
            onClick={() => handleViewChange(Views.MONTH)}
          >
            <IconCalendarMonth className="h-4 w-4 mr-2" />
            Month
          </Button>
          <Button
            variant={currentView === Views.WEEK ? "default" : "outline"}
            size="sm"
            onClick={() => handleViewChange(Views.WEEK)}
          >
            <IconCalendarWeek className="h-4 w-4 mr-2" />
            Week
          </Button>
          <Button
            variant={currentView === Views.DAY ? "default" : "outline"}
            size="sm"
            onClick={() => handleViewChange(Views.DAY)}
          >
            <IconCalendar className="h-4 w-4 mr-2" />
            Day
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <IconFilter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {uniqueClients.map(clientId => (
                <SelectItem key={clientId} value={clientId}>
                  {clientId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedWorker} onValueChange={setSelectedWorker}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Worker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workers</SelectItem>
              {uniqueWorkers.map(workerId => (
                <SelectItem key={workerId} value={workerId}>
                  {workerId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar */}
      <div className="h-96 min-h-[600px]">
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={currentView}
          onView={handleViewChange}
          date={currentDate}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
          onDoubleClickEvent={handleDoubleClickEvent}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          resizable
          draggableAccessor={() => true}
          components={{
            event: EventComponent,
          }}
          eventPropGetter={(event) => {
            const schedule = event.resource
            const isOverdue = schedule.scheduledEndTime < Date.now() && schedule.status === 'scheduled'
            
            return {
              className: `${isOverdue ? 'overdue-event' : ''} ${schedule.priority}-priority`,
              style: {
                backgroundColor: isOverdue ? '#fef2f2' : 
                  schedule.priority === 'high' ? '#fee2e2' :
                  schedule.priority === 'medium' ? '#fef3c7' : 
                  '#f0f9ff',
                borderColor: isOverdue ? '#dc2626' :
                  schedule.priority === 'high' ? '#dc2626' :
                  schedule.priority === 'medium' ? '#d97706' : 
                  '#3b82f6',
                color: '#1f2937',
              },
            }
          }}
          popup
          showMultiDayTimes
          scrollToTime={new Date(1970, 1, 1, 8)}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-sm text-muted-foreground">High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span className="text-sm text-muted-foreground">Medium Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
          <span className="text-sm text-muted-foreground">Low Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-200 border border-red-600 rounded"></div>
          <span className="text-sm text-muted-foreground">Overdue</span>
        </div>
      </div>
    </div>
  )
}