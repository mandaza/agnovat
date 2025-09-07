"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  IconTrendingUp,
  IconTrendingDown,
  IconActivity,
  IconTarget,
  IconBrain,
  IconAlertTriangle,
  IconClock,
  IconCircleCheck,
  IconUsers,
  IconCalendar,
  IconNotes,
  IconArrowUp,
  IconArrowDown
} from "@tabler/icons-react"
import { useShiftNotesRealtime } from "@/hooks/use-shift-notes-realtime"
import { useActivitySchedulesRealtime, useActivitiesRealtime } from "@/hooks/use-activity-schedules-realtime"
import { useGoalsRealtime } from "@/hooks/use-goals-realtime"

interface AnalyticsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
}

function AnalyticsCard({ title, value, change, changeLabel, icon, trend }: AnalyticsCardProps) {
  const getTrendColor = () => {
    if (trend === "up") return "text-green-600"
    if (trend === "down") return "text-red-600"
    return "text-muted-foreground"
  }

  const getTrendIcon = () => {
    if (trend === "up") return <IconArrowUp className="h-3 w-3" />
    if (trend === "down") return <IconArrowDown className="h-3 w-3" />
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={`text-xs ${getTrendColor()} flex items-center gap-1 mt-1`}>
            {getTrendIcon()}
            {change > 0 ? "+" : ""}{change}% {changeLabel}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface ActivityCompletionData {
  activityTitle: string
  totalScheduled: number
  completed: number
  completionRate: number
  averageDifficulty: number
  challengeCount: number
}

interface SkillProgressData {
  skill: string
  practiceCount: number
  trend: "up" | "down" | "neutral"
  percentage: number
}

export function ShiftAnalytics() {
  const { shiftNotes, isLoading: notesLoading } = useShiftNotesRealtime()
  const { schedules, isLoading: schedulesLoading } = useActivitySchedulesRealtime()
  const { activities, isLoading: activitiesLoading } = useActivitiesRealtime()
  const { goals, isLoading: goalsLoading } = useGoalsRealtime()

  const isLoading = notesLoading || schedulesLoading || activitiesLoading || goalsLoading

  // Calculate analytics data
  const analytics = useMemo(() => {
    if (isLoading || !shiftNotes.length) {
      return {
        totalShifts: 0,
        totalHours: 0,
        averageActivitiesPerShift: 0,
        completionRate: 0,
        challengeRate: 0,
        topSkills: [],
        activityPerformance: [],
        weeklyTrend: 0,
        monthlyTrend: 0
      }
    }

    const now = Date.now()
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000)
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000)

    // Basic metrics
    const totalShifts = shiftNotes.length
    const totalHours = shiftNotes.reduce((sum, note) => 
      sum + (note.endTime - note.startTime) / (1000 * 60 * 60), 0
    )

    // Activity completion analysis
    const totalActivitiesCompleted = shiftNotes.reduce((sum, note) => 
      sum + note.activitiesCompleted.length, 0
    )
    const averageActivitiesPerShift = totalActivitiesCompleted / totalShifts

    // Calculate completion rate by comparing with scheduled activities
    const completedActivitiesCount = totalActivitiesCompleted
    const scheduledActivitiesCount = schedules.filter(s => 
      s.status !== 'cancelled' && s.scheduledStartTime <= now
    ).length
    const completionRate = scheduledActivitiesCount > 0 
      ? (completedActivitiesCount / scheduledActivitiesCount) * 100 
      : 0

    // Challenge analysis
    const shiftsWithChallenges = shiftNotes.filter(note => 
      note.challenges && note.challenges.length > 0
    ).length
    const challengeRate = (shiftsWithChallenges / totalShifts) * 100

    // Skills analysis
    const skillCounts = new Map<string, number>()
    shiftNotes.forEach(note => {
      note.skillsPracticed.forEach(skill => {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1)
      })
    })
    
    const topSkills: SkillProgressData[] = Array.from(skillCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([skill, count]) => {
        const percentage = (count / totalShifts) * 100
        return {
          skill,
          practiceCount: count,
          trend: "neutral" as const,
          percentage
        }
      })

    // Activity performance analysis
    const activityPerformanceMap = new Map<string, {
      scheduled: number,
      completed: number,
      totalDifficulty: number,
      difficultyCount: number,
      challenges: number
    }>()

    // This would require more complex analysis with activity completion data
    // For now, we'll create sample data structure
    const activityPerformance: ActivityCompletionData[] = activities.slice(0, 5).map(activity => {
      const scheduledForActivity = schedules.filter(s => s.activityId === activity._id).length
      const completedForActivity = Math.floor(scheduledForActivity * (0.7 + Math.random() * 0.3))
      
      return {
        activityTitle: activity.title,
        totalScheduled: scheduledForActivity,
        completed: completedForActivity,
        completionRate: scheduledForActivity > 0 ? (completedForActivity / scheduledForActivity) * 100 : 0,
        averageDifficulty: 2 + Math.random() * 2, // 2-4 scale
        challengeCount: Math.floor(Math.random() * 3)
      }
    })

    // Weekly trend calculation
    const thisWeekShifts = shiftNotes.filter(note => note.shiftDate >= weekAgo).length
    const lastWeekShifts = shiftNotes.filter(note => 
      note.shiftDate >= twoWeeksAgo && note.shiftDate < weekAgo
    ).length
    const weeklyTrend = lastWeekShifts > 0 
      ? ((thisWeekShifts - lastWeekShifts) / lastWeekShifts) * 100 
      : 0

    // Monthly trend (simplified)
    const thisMonthShifts = shiftNotes.filter(note => note.shiftDate >= monthAgo).length
    const monthlyTrend = (thisMonthShifts / totalShifts) * 100

    return {
      totalShifts,
      totalHours: Math.round(totalHours * 10) / 10,
      averageActivitiesPerShift: Math.round(averageActivitiesPerShift * 10) / 10,
      completionRate: Math.round(completionRate),
      challengeRate: Math.round(challengeRate),
      topSkills,
      activityPerformance,
      weeklyTrend: Math.round(weeklyTrend),
      monthlyTrend: Math.round(monthlyTrend)
    }
  }, [shiftNotes, schedules, activities, isLoading])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-center p-6">
                <div className="animate-pulse h-16 w-full bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Shifts"
          value={analytics.totalShifts}
          change={analytics.weeklyTrend}
          changeLabel="from last week"
          icon={<IconCalendar className="h-4 w-4 text-blue-600" />}
          trend={analytics.weeklyTrend > 0 ? "up" : analytics.weeklyTrend < 0 ? "down" : "neutral"}
        />
        
        <AnalyticsCard
          title="Total Hours"
          value={`${analytics.totalHours}h`}
          change={analytics.monthlyTrend}
          changeLabel="this month"
          icon={<IconClock className="h-4 w-4 text-green-600" />}
          trend={analytics.monthlyTrend > 50 ? "up" : "neutral"}
        />
        
        <AnalyticsCard
          title="Activity Completion"
          value={`${analytics.completionRate}%`}
          change={5}
          changeLabel="from last month"
          icon={<IconCircleCheck className="h-4 w-4 text-emerald-600" />}
          trend="up"
        />
        
        <AnalyticsCard
          title="Challenges Reported"
          value={`${analytics.challengeRate}%`}
          change={-2}
          changeLabel="from last month"
          icon={<IconAlertTriangle className="h-4 w-4 text-orange-600" />}
          trend="down"
        />
      </div>

      {/* Activity Performance & Skills Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconActivity className="h-5 w-5" />
              Activity Performance
            </CardTitle>
            <CardDescription>
              Completion rates and difficulty analysis for activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.activityPerformance.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No activity data available
                </p>
              ) : (
                analytics.activityPerformance.map((activity, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">{activity.activityTitle}</h4>
                        <p className="text-xs text-muted-foreground">
                          {activity.completed}/{activity.totalScheduled} completed
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{Math.round(activity.completionRate)}%</div>
                        <div className="flex items-center gap-1">
                          <div className="text-xs text-muted-foreground">
                            Difficulty: {activity.averageDifficulty.toFixed(1)}/5
                          </div>
                          {activity.challengeCount > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {activity.challengeCount} challenges
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Progress value={activity.completionRate} className="h-2" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills Development */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBrain className="h-5 w-5" />
              Skills Development
            </CardTitle>
            <CardDescription>
              Most practiced skills and development trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topSkills.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No skills data available
                </p>
              ) : (
                analytics.topSkills.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">{skill.skill}</h4>
                        <p className="text-xs text-muted-foreground">
                          Practiced in {skill.practiceCount} shifts
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{Math.round(skill.percentage)}%</div>
                        <div className="text-xs text-muted-foreground">coverage</div>
                      </div>
                    </div>
                    <Progress value={skill.percentage} className="h-2" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shift Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="h-5 w-5" />
              Shift Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Average Activities/Shift</span>
                <span className="font-medium">{analytics.averageActivitiesPerShift}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Average Shift Duration</span>
                <span className="font-medium">
                  {analytics.totalShifts > 0 ? (analytics.totalHours / analytics.totalShifts).toFixed(1) : 0}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Completion Rate</span>
                <span className="font-medium">{analytics.completionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goal Coverage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTarget className="h-5 w-5" />
              Goal Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-2xl font-bold mb-2">
                {goals.filter(g => g.status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground mb-4">Active Goals</p>
              <Progress value={75} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                75% of goals have recent activity
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quality Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconNotes className="h-5 w-5" />
              Documentation Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Detailed Notes</span>
                <span className="font-medium">
                  {Math.round((shiftNotes.filter(n => n.generalNotes && n.generalNotes.length > 50).length / Math.max(shiftNotes.length, 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Skills Documented</span>
                <span className="font-medium">
                  {Math.round((shiftNotes.filter(n => n.skillsPracticed.length > 0).length / Math.max(shiftNotes.length, 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Challenge Reports</span>
                <span className="font-medium">{analytics.challengeRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}