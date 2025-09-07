"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  IconTarget,
  IconClock,
  IconList,
  IconPlus,
  IconX
} from "@tabler/icons-react"
import { useGoalsRealtime } from "@/hooks/use-goals-realtime"
import { useActivitiesRealtime } from "@/hooks/use-activity-schedules-realtime"

const activityFormSchema = z.object({
  goalId: z.string().min(1, "Please select a goal"),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  frequency: z.enum(["daily", "weekly", "monthly", "as_needed"] as const),
  estimatedDuration: z.number().min(1, "Duration must be at least 1 minute").max(480, "Duration must be less than 8 hours").optional(),
  instructions: z.string().max(1000, "Instructions must be less than 1000 characters").optional(),
  materials: z.array(z.string()).optional(),
})

type ActivityFormValues = z.infer<typeof activityFormSchema>

interface ActivityFormProps {
  onClose?: () => void
  onActivityCreated?: (activityId: string) => void
  onActivityUpdated?: (activityId: string) => void
  editingActivity?: {
    _id: string
    goalId: string
    title: string
    description: string
    frequency: "daily" | "weekly" | "monthly" | "as_needed"
    estimatedDuration?: number
    instructions?: string
    materials?: string[]
  }
  defaultGoalId?: string
}

export function ActivityForm({ 
  onClose, 
  onActivityCreated,
  onActivityUpdated,
  editingActivity,
  defaultGoalId
}: ActivityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newMaterial, setNewMaterial] = useState("")
  
  const { goals, isLoading: goalsLoading } = useGoalsRealtime()
  const { createActivity, updateActivity } = useActivitiesRealtime()
  
  const isEditMode = !!editingActivity
  
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: editingActivity ? {
      goalId: editingActivity.goalId,
      title: editingActivity.title,
      description: editingActivity.description,
      frequency: editingActivity.frequency,
      estimatedDuration: editingActivity.estimatedDuration,
      instructions: editingActivity.instructions,
      materials: editingActivity.materials || [],
    } : {
      goalId: defaultGoalId || "",
      frequency: "weekly",
      materials: [],
    },
  })

  // Watch materials for dynamic updates
  const watchedMaterials = form.watch("materials") || []
  const watchedGoalId = form.watch("goalId")

  // Get selected goal info
  const selectedGoal = goals.find(g => g._id === watchedGoalId)

  const addMaterial = () => {
    if (newMaterial.trim()) {
      const currentMaterials = form.getValues("materials") || []
      form.setValue("materials", [...currentMaterials, newMaterial.trim()])
      setNewMaterial("")
    }
  }

  const removeMaterial = (index: number) => {
    const currentMaterials = form.getValues("materials") || []
    form.setValue("materials", currentMaterials.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ActivityFormValues) => {
    setIsSubmitting(true)
    
    try {
      if (isEditMode && editingActivity) {
        await updateActivity(editingActivity._id, {
          goalId: data.goalId,
          title: data.title,
          description: data.description,
          frequency: data.frequency,
          estimatedDuration: data.estimatedDuration,
          instructions: data.instructions,
          materials: data.materials,
        })
        onActivityUpdated?.(editingActivity._id)
      } else {
        const activityId = await createActivity({
          goalId: data.goalId,
          title: data.title,
          description: data.description,
          frequency: data.frequency,
          estimatedDuration: data.estimatedDuration,
          instructions: data.instructions,
          materials: data.materials,
        })
        onActivityCreated?.(activityId)
      }
      
      onClose?.()
      
    } catch (error: any) {
      console.error('Failed to save activity:', error)
      alert(`Failed to ${isEditMode ? 'update' : 'create'} activity: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconTarget className="h-5 w-5" />
          {isEditMode ? 'Edit Activity' : 'Create New Activity'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Goal Selection */}
            <FormField
              control={form.control}
              name="goalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={goalsLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal for this activity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {goals.filter(g => g.status === "active").map((goal) => (
                        <SelectItem key={goal._id} value={goal._id}>
                          <div>
                            <div className="font-medium">{goal.title}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                {goal.category}
                              </Badge>
                              {goal.progress}% complete
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedGoal && (
                    <FormDescription>
                      {selectedGoal.description}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title and Frequency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Daily Conversation Practice"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="as_needed">As Needed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this activity involves and its purpose..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estimated Duration */}
            <FormField
              control={form.control}
              name="estimatedDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="1"
                      max="480"
                      placeholder="30"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    <IconClock className="h-4 w-4 inline mr-1" />
                    How long does this activity typically take?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Instructions */}
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Step-by-step instructions for support workers..."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed guidance on how to conduct this activity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Materials */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Materials Required (Optional)</label>
              
              {/* Add Material Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Picture cards, Communication board"
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addMaterial()
                    }
                  }}
                />
                <Button type="button" onClick={addMaterial} size="sm">
                  <IconPlus className="h-4 w-4" />
                </Button>
              </div>

              {/* Materials List */}
              {watchedMaterials.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <IconList className="h-4 w-4" />
                    Materials needed:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {watchedMaterials.map((material, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {material}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeMaterial(index)}
                        >
                          <IconX className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
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
                {isSubmitting 
                  ? (isEditMode ? "Updating..." : "Creating...") 
                  : (isEditMode ? "Update Activity" : "Create Activity")
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}