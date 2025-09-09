"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  IconAlertTriangle, 
  IconShield, 
  IconEye, 
  IconTrendingUp 
} from "@tabler/icons-react"
import { BehaviorIncidentForm } from "@/components/behaviors/behavior-incident-form"
import { BehaviorIncidentsTable } from "@/components/behaviors/behavior-incidents-table"
import { useBehaviorsRealtime } from "@/hooks/use-behaviors-realtime"
import { RoleGuard } from "@/components/role-guard"

export default function BehaviorsPage() {
  const { analytics, recentIncidents, isLoading } = useBehaviorsRealtime()

  // Calculate additional metrics
  const recentHighIntensity = recentIncidents.filter(incident => incident.intensity >= 4).length
  const reviewPendingCount = analytics.statusBreakdown.submitted

  return (
    <RoleGuard requiredRole="support_worker">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Page Header */}
            <div className="px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Behavior Tracking</h1>
                  <p className="text-muted-foreground">
                    Monitor, document, and analyze behavior incidents
                  </p>
                </div>
                <BehaviorIncidentForm />
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
                  <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : analytics.totalIncidents}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.totalIncidents > 0 ? "All time" : "No incidents yet"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Intensity</CardTitle>
                  <IconShield className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : analytics.avgIntensity}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Out of 5 scale
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <IconEye className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : reviewPendingCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {reviewPendingCount > 0 ? "Awaiting practitioner review" : "All reviewed"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Harm Incidents</CardTitle>
                  <IconAlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : analytics.harmIncidents}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.harmIncidents > 0 ? "Requiring attention" : "No harm reported"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Trends</CardTitle>
                  <IconTrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : recentIncidents.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last 30 days
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Common Behaviors Quick Stats */}
            {!isLoading && analytics.mostCommonBehaviors.length > 0 && (
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Most Common Behaviors</CardTitle>
                    <CardDescription>
                      Top behaviors observed across all incidents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {analytics.mostCommonBehaviors.map(({ behavior, count }) => (
                        <div key={behavior} className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold">{count}</div>
                          <div className="text-xs text-muted-foreground">{behavior}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* High Intensity Alert */}
            {!isLoading && recentHighIntensity > 0 && (
              <div className="px-4 lg:px-6">
                <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-orange-800 dark:text-orange-200">
                      <IconAlertTriangle className="h-5 w-5" />
                      High Intensity Alert
                    </CardTitle>
                    <CardDescription className="text-orange-700 dark:text-orange-300">
                      {recentHighIntensity} high-intensity incidents (Level 4-5) occurred in the last 30 days
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            )}

            {/* Main Content Area */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Behavior Incidents</CardTitle>
                  <CardDescription>
                    All recorded behavior incidents with detailed tracking and analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BehaviorIncidentsTable />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}