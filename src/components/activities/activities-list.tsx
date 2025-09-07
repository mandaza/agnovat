"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  IconSearch,
  IconEdit,
  IconTrash,
  IconEye,
  IconClock,
  IconRepeat,
  IconList,
  IconChevronDown,
  IconFilter,
  IconTarget,
  IconCalendar
} from "@tabler/icons-react"
import { useActivitiesRealtime } from "@/hooks/use-activity-schedules-realtime"
import { useGoalsRealtime } from "@/hooks/use-goals-realtime"
import { ActivityForm } from "./activity-form"

interface Activity {
  _id: string
  goalId: string
  title: string
  description: string
  frequency: "daily" | "weekly" | "monthly" | "as_needed"
  estimatedDuration?: number
  instructions?: string
  materials?: string[]
  isActive: boolean
  createdAt: number
  updatedAt: number
}

interface ActivitiesListProps {
  onActivitySelected?: (activityId: string) => void
  onScheduleActivity?: (activityId: string) => void
  showActions?: boolean
}

export function ActivitiesList({ 
  onActivitySelected, 
  onScheduleActivity,
  showActions = true 
}: ActivitiesListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGoal, setSelectedGoal] = useState<string>("all")
  const [selectedFrequency, setSelectedFrequency] = useState<string>("all")
  const [showInactive, setShowInactive] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { activities, isLoading, deleteActivity, deactivateActivity } = useActivitiesRealtime()
  const { goals, isLoading: goalsLoading } = useGoalsRealtime()

  // Filter activities
  const filteredActivities = activities.filter((activity: Activity) => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGoal = selectedGoal === "all" || activity.goalId === selectedGoal
    const matchesFrequency = selectedFrequency === "all" || activity.frequency === selectedFrequency
    const matchesActiveStatus = showInactive || activity.isActive

    return matchesSearch && matchesGoal && matchesFrequency && matchesActiveStatus
  })

  // Group activities by goal
  const activitiesByGoal = filteredActivities.reduce((acc: Record<string, Activity[]>, activity) => {
    const goal = goals.find(g => g._id === activity.goalId)
    const goalTitle = goal ? goal.title : 'Unknown Goal'
    
    if (!acc[goalTitle]) {
      acc[goalTitle] = []
    }
    acc[goalTitle].push(activity)
    return acc
  }, {})

  const getGoalInfo = (goalId: string) => {
    return goals.find(g => g._id === goalId)
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-red-100 text-red-800 border-red-200'
      case 'weekly': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'monthly': return 'bg-green-100 text-green-800 border-green-200'
      case 'as_needed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity)
    setIsEditDialogOpen(true)
  }

  const handleView = (activity: Activity) => {
    setViewingActivity(activity)
    setIsViewDialogOpen(true)
  }

  const handleDeleteClick = (activity: Activity) => {
    setDeletingActivity(activity)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async (activityId: string) => {
    try {
      await deleteActivity(activityId)
      setIsDeleteDialogOpen(false)
      setDeletingActivity(null)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to delete activity: ${message}`)
    }
  }

  const handleDeactivate = async (activityId: string) => {
    try {
      await deactivateActivity(activityId)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to deactivate activity: ${message}`)
    }
  }

  const closeEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingActivity(null)
  }

  if (isLoading || goalsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading activities...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Filter Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Goal</label>
              <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Goals</SelectItem>
                  {goals.map((goal) => (
                    <SelectItem key={goal._id} value={goal._id}>
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Frequency</label>
              <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frequencies</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="as_needed">As Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={showInactive ? "all" : "active"} onValueChange={(value) => setShowInactive(value === "all")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="all">All Activities</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities grouped by Goal */}
      <div className="space-y-6">
        {Object.entries(activitiesByGoal).map(([goalTitle, goalActivities]) => {
          const goalInfo = getGoalInfo(goalActivities[0]?.goalId)
          
          return (
            <Card key={goalTitle}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <IconTarget className="h-5 w-5" />
                      {goalTitle}
                    </CardTitle>
                    <CardDescription>
                      {goalInfo && (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {goalInfo.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {goalInfo.progress}% complete
                          </span>
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {goalActivities.length} activities
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {goalActivities.map((activity) => (
                    <Card key={activity._id} className={`cursor-pointer transition-colors hover:bg-accent/50 ${!activity.isActive ? 'opacity-50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm leading-tight">{activity.title}</h4>
                            {!activity.isActive && (
                              <Badge variant="secondary" className="text-xs">Inactive</Badge>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {activity.description}
                          </p>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={`text-xs ${getFrequencyColor(activity.frequency)}`}>
                              <IconRepeat className="h-3 w-3 mr-1" />
                              {activity.frequency}
                            </Badge>
                            
                            {activity.estimatedDuration && (
                              <Badge variant="outline" className="text-xs">
                                <IconClock className="h-3 w-3 mr-1" />
                                {activity.estimatedDuration}min
                              </Badge>
                            )}

                            {activity.materials && activity.materials.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <IconList className="h-3 w-3 mr-1" />
                                {activity.materials.length} items
                              </Badge>
                            )}
                          </div>

                          {showActions && (
                            <div className="flex items-center gap-1 pt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(activity)}
                                className="h-8 w-8 p-0"
                              >
                                <IconEye className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(activity)}
                                className="h-8 w-8 p-0"
                              >
                                <IconEdit className="h-3 w-3" />
                              </Button>

                              {onScheduleActivity && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onScheduleActivity(activity._id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <IconCalendar className="h-3 w-3" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => activity.isActive ? handleDeleteClick(activity) : handleDelete(activity._id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <IconTrash className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredActivities.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-3">
                <IconTarget className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No activities found</h3>
                <p className="text-muted-foreground">
                  {activities.length === 0 
                    ? "No activities have been created yet."
                    : "No activities match your current filters."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Activity Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          {editingActivity && (
            <ActivityForm
              editingActivity={editingActivity}
              onClose={closeEditDialog}
              onActivityUpdated={closeEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Activity Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
          </DialogHeader>
          {viewingActivity && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{viewingActivity.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Goal: {getGoalInfo(viewingActivity.goalId)?.title || 'Unknown Goal'}
                </p>
              </div>
              
              <div>
                <label className="font-medium text-sm">Description</label>
                <p className="text-sm text-muted-foreground mt-1">{viewingActivity.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-sm">Frequency</label>
                  <Badge variant="outline" className={`mt-1 ${getFrequencyColor(viewingActivity.frequency)}`}>
                    {viewingActivity.frequency}
                  </Badge>
                </div>
                {viewingActivity.estimatedDuration && (
                  <div>
                    <label className="font-medium text-sm">Duration</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {viewingActivity.estimatedDuration} minutes
                    </p>
                  </div>
                )}
              </div>

              {viewingActivity.instructions && (
                <div>
                  <label className="font-medium text-sm">Instructions</label>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                    {viewingActivity.instructions}
                  </p>
                </div>
              )}

              {viewingActivity.materials && viewingActivity.materials.length > 0 && (
                <div>
                  <label className="font-medium text-sm">Materials Required</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewingActivity.materials.map((material, index) => (
                      <Badge key={index} variant="secondary">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Activity Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Delete Activity</DialogTitle>
          </DialogHeader>
          {deletingActivity && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete &quot;{deletingActivity.title}&quot;? This action cannot be undone.
                Consider deactivating instead to preserve historical data.
              </p>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleDeactivate(deletingActivity._id)
                    setIsDeleteDialogOpen(false)
                    setDeletingActivity(null)
                  }}
                >
                  Deactivate Instead
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(deletingActivity._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}