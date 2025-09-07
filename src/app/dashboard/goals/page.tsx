"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconTarget, IconCircleCheck, IconClock, IconAlertCircle, IconEyePause } from "@tabler/icons-react"
import { AddGoalForm } from "@/components/goals/add-goal-form"
import { GoalsTable } from "@/components/goals/goals-table"
import { useGoalsRealtime } from "@/hooks/use-goals-realtime"

export default function GoalsPage() {
  const { goals, isLoading } = useGoalsRealtime()
  
  // Calculate overview statistics from real-time data
  const totalGoals = goals.length
  const completedGoals = goals.filter(goal => goal.status === "completed").length
  const activeGoals = goals.filter(goal => goal.status === "active").length
  const pausedGoals = goals.filter(goal => goal.status === "paused").length
  const overdueGoals = goals.filter(goal => {
    if (!goal.targetDate || goal.status === "completed") return false
    return new Date(goal.targetDate) < new Date()
  }).length

  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  // No need for callback handlers with real-time updates

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Page Header */}
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Goals Management</h1>
                <p className="text-muted-foreground">
                  Set, track, and manage developmental goals for clients
                </p>
              </div>
              <AddGoalForm />
            </div>
          </div>

          {/* Goals Overview Cards */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                <IconTarget className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : totalGoals}
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalGoals > 0 ? `${totalGoals} total goals` : "No goals set"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <IconClock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : activeGoals}
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeGoals > 0 ? `${activeGoals} active goals` : "No active goals"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <IconCircleCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : completedGoals}
                </div>
                <p className="text-xs text-muted-foreground">
                  {completionRate}% completion rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paused</CardTitle>
                <IconEyePause className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : pausedGoals}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pausedGoals > 0 ? `${pausedGoals} paused goals` : "No paused goals"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <IconAlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : overdueGoals}
                </div>
                <p className="text-xs text-muted-foreground">
                  {overdueGoals > 0 ? "Needs attention" : "All on track"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Goals Overview</CardTitle>
                <CardDescription>
                  Manage and track progress on all developmental goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoalsTable />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
