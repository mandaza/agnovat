
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { IconPlus, IconCalendar } from "@tabler/icons-react"
import { ActivityMetricsCards } from "@/components/activities/activity-metrics-cards"
import { UpcomingActivitiesList } from "@/components/activities/upcoming-activities-list"
import { ActivitySchedulingForm } from "@/components/activities/activity-scheduling-form"
import { ActivityForm } from "@/components/activities/activity-form"
import { ActivitiesList } from "@/components/activities/activities-list"
import { ActivityCalendarView } from "@/components/activities/activity-calendar-view"

export default function Activities() {
  const [isSchedulingFormOpen, setIsSchedulingFormOpen] = useState(false)
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false)
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)

  const handleScheduleCreated = (scheduleId: string) => {
    setIsSchedulingFormOpen(false)
    // Could show success toast here
  }

  const handleActivityCreated = (activityId: string) => {
    setIsActivityFormOpen(false)
    // Could show success toast here
  }

  const handleEditSchedule = (scheduleId: string) => {
    setEditingScheduleId(scheduleId)
    setIsSchedulingFormOpen(true)
  }

  const handleScheduleActivity = (activityId: string) => {
    // Auto-fill the activity when opening schedule form
    setIsSchedulingFormOpen(true)
  }

  const handleCloseScheduleForm = () => {
    setIsSchedulingFormOpen(false)
    setEditingScheduleId(null)
  }

  const handleCloseActivityForm = () => {
    setIsActivityFormOpen(false)
  }

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Page Header */}
            <div className="px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Activities & Schedules</h1>
                  <p className="text-muted-foreground">
                    Plan, schedule, and manage daily activities and events
                  </p>
                </div>
                <Dialog open={isSchedulingFormOpen} onOpenChange={setIsSchedulingFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <IconPlus className="h-4 w-4" />
                      Schedule Activity
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingScheduleId ? "Edit Schedule" : "Schedule New Activity"}
                      </DialogTitle>
                    </DialogHeader>
                    <ActivitySchedulingForm
                      onClose={handleCloseScheduleForm}
                      onScheduleCreated={handleScheduleCreated}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Real-time Activity Overview Cards */}
            <ActivityMetricsCards />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-6 px-4 lg:px-6 @xl/main:grid-cols-3">
              {/* Interactive Calendar View */}
              <Card className="@xl/main:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconCalendar className="h-5 w-5" />
                    Calendar View
                  </CardTitle>
                  <CardDescription>
                    Interactive calendar with drag-and-drop scheduling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityCalendarView
                    onEditSchedule={handleEditSchedule}
                    onSelectSchedule={(scheduleId) => {
                      // Could implement a schedule details view here
                      console.log('Selected schedule:', scheduleId)
                    }}
                  />
                </CardContent>
              </Card>

              {/* Real-time Upcoming Activities */}
              <UpcomingActivitiesList
                onEditSchedule={handleEditSchedule}
              />
            </div>

            {/* Activity Management Section */}
            <div className="px-4 lg:px-6 space-y-6">
              {/* Action Bar */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Activity Templates</CardTitle>
                      <CardDescription>
                        Create and manage reusable activity templates linked to goals
                      </CardDescription>
                    </div>
                    <Dialog open={isActivityFormOpen} onOpenChange={setIsActivityFormOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <IconPlus className="h-4 w-4" />
                          Create Activity
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create New Activity</DialogTitle>
                        </DialogHeader>
                        <ActivityForm
                          onClose={handleCloseActivityForm}
                          onActivityCreated={handleActivityCreated}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
              </Card>

              {/* Activities List */}
              <ActivitiesList
                onScheduleActivity={handleScheduleActivity}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
