
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconPlus, IconAlertTriangle, IconShield, IconEye, IconTrendingUp } from "@tabler/icons-react"

export default function BehaviorPage() {
  return (
    <>
      
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Page Header */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Behavior & Incidents</h1>
                    <p className="text-muted-foreground">
                      Monitor behavior patterns and track incident reports
                    </p>
                  </div>
                  <Button className="flex items-center gap-2">
                    <IconPlus className="h-4 w-4" />
                    Report Incident
                  </Button>
                </div>
              </div>

              {/* Incident Overview Cards */}
              <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
                    <IconAlertTriangle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">47</div>
                    <p className="text-xs text-muted-foreground">
                      +5 this month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                    <IconShield className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">42</div>
                    <p className="text-xs text-muted-foreground">
                      89% resolution rate
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Under Investigation</CardTitle>
                    <IconEye className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">
                      2 high priority
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Behavior Score</CardTitle>
                    <IconTrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8.7</div>
                    <p className="text-xs text-muted-foreground">
                      +0.3 from last week
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 gap-6 px-4 lg:px-6 @xl/main:grid-cols-2">
                {/* Recent Incidents */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Incidents</CardTitle>
                    <CardDescription>
                      Latest reported incidents and their status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">Safety Violation</p>
                            <p className="text-xs text-muted-foreground">Today, 3:45 PM</p>
                          </div>
                        </div>
                        <Badge variant="destructive">High Priority</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">Policy Breach</p>
                            <p className="text-xs text-muted-foreground">Yesterday, 2:30 PM</p>
                          </div>
                        </div>
                        <Badge variant="secondary">Under Review</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-sm">Minor Incident</p>
                            <p className="text-xs text-muted-foreground">2 days ago</p>
                          </div>
                        </div>
                        <Badge variant="outline">Resolved</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Behavior Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Behavior Trends</CardTitle>
                    <CardDescription>
                      Monthly behavior pattern analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <IconTrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Behavior Analytics</h3>
                      <p className="text-muted-foreground mb-4">
                        Track behavior patterns and identify improvement areas.
                      </p>
                      <Button variant="outline">View Analytics</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Incident Management */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Incident Management</CardTitle>
                    <CardDescription>
                      Comprehensive incident tracking and resolution system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <IconAlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Incident Management System</h3>
                      <p className="text-muted-foreground mb-4">
                        Report, track, and resolve incidents with detailed documentation and follow-up.
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline">Documentation</Button>
                        <Button variant="outline">Follow-up</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
    </>
  )
}
