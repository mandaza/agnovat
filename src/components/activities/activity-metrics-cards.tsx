"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  IconCalendar, 
  IconClock, 
  IconAlertTriangle, 
  IconCircleCheck,
  IconUsers,
  IconTrendingUp
} from "@tabler/icons-react"
import { useActivitySchedulesRealtime } from "@/hooks/use-activity-schedules-realtime"

export function ActivityMetricsCards() {
  const { analytics, schedules, isLoading, getTodaysSchedules, getOverdueSchedules } = useActivitySchedulesRealtime()
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const todaysSchedules = getTodaysSchedules()
  const overdueSchedules = getOverdueSchedules()
  const todayCompleted = todaysSchedules.filter(s => s.status === 'completed').length
  const todayRemaining = todaysSchedules.filter(s => s.status === 'scheduled').length

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Today's Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today&apos;s Activities</CardTitle>
          <IconCalendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.today}</div>
          <p className="text-xs text-muted-foreground">
            {todayCompleted} completed, {todayRemaining} remaining
          </p>
        </CardContent>
      </Card>

      {/* This Week */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <IconClock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.thisWeek}</div>
          <p className="text-xs text-muted-foreground">
            Activities scheduled
          </p>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <IconCircleCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics.total > 0 ? Math.round((analytics.completed / analytics.total) * 100) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            {analytics.completed} of {analytics.total} completed
          </p>
        </CardContent>
      </Card>

      {/* Overdue & High Priority */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Priority & Overdue</CardTitle>
          <IconAlertTriangle className={`h-4 w-4 ${overdueSchedules.length > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{analytics.overdue}</div>
          <p className="text-xs text-muted-foreground">
            {analytics.byPriority.high} high priority tasks
          </p>
        </CardContent>
      </Card>
    </div>
  )
}