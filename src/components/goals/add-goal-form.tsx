"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { IconPlus } from "@tabler/icons-react"
import { GoalCategory, GoalType } from "../../../types/database"
import { useGoalsRealtime } from "../../hooks/use-goals-realtime"

interface AddGoalFormProps {
  onGoalAdded?: () => void
}

export function AddGoalForm({ onGoalAdded }: AddGoalFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as GoalCategory,
    type: "" as GoalType,
    targetDate: "",
    assignedTo: "",
  })

  // Use the real-time goals hook
  const { createGoal } = useGoalsRealtime()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.category || !formData.type) {
      // In a real app, you'd show a toast notification here
      console.error("Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)
    
    try {
      // Call the create function from the hook
      await createGoal({
        clientId: "js71rnhs3ts703d1thj36n7pc57pahxb", // Real client ID from database
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        targetDate: formData.targetDate ? new Date(formData.targetDate).getTime() : undefined,
        assignedTo: formData.assignedTo || undefined,
        createdBy: "j574pzzgd9sj26yxk1jet1arnn7padhj", // Real user ID from database
      })
      
      console.log("Goal created successfully!")
      
      // Reset form and close dialog
      setFormData({
        title: "",
        description: "",
        category: "" as GoalCategory,
        type: "" as GoalType,
        targetDate: "",
        assignedTo: "",
      })
      setOpen(false)
      
      // No need to notify parent - data updates automatically
      
    } catch (error) {
      console.error("Error creating goal:", error)
      // In a real app, you'd show an error toast here
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const goalCategories: { value: GoalCategory; label: string }[] = [
    { value: "communication", label: "Communication" },
    { value: "social_skills", label: "Social Skills" },
    { value: "motor_skills", label: "Motor Skills" },
    { value: "independent_living", label: "Independent Living" },
    { value: "cognitive", label: "Cognitive" },
    { value: "emotional_regulation", label: "Emotional Regulation" },
    { value: "other", label: "Other" },
  ]

  const goalTypes: { value: GoalType; label: string }[] = [
    { value: "short_term", label: "Short Term" },
    { value: "long_term", label: "Long Term" },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <IconPlus className="h-4 w-4" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
          <DialogDescription>
            Set a new developmental goal for the client. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Improve Communication Skills"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {goalCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Goal Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {goalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("targetDate", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Input
              id="assignedTo"
              value={formData.assignedTo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("assignedTo", e.target.value)}
              placeholder="Support worker name (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
              placeholder="Describe the goal in detail, including what success looks like..."
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
