"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IconSearch, IconFilter, IconEdit, IconTrash, IconEye } from "@tabler/icons-react"
import { GoalCategory, GoalStatus, GoalType } from "../../../types/database"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useGoalsRealtime, Goal } from "../../hooks/use-goals-realtime"

interface GoalsTableProps {
  onGoalUpdated?: () => void
}

export function GoalsTable({ onGoalUpdated }: GoalsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<GoalCategory | "all">("all")
  const [statusFilter, setStatusFilter] = useState<GoalStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<GoalType | "all">("all")
  
  // Edit and delete state
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    category: "" as GoalCategory,
    type: "" as GoalType,
    targetDate: "",
    assignedTo: "",
    status: "" as GoalStatus,
    progress: 0
  })

  // Use the real-time goals hook
  const { goals, isLoading, error, updateGoal, deleteGoal } = useGoalsRealtime()

  // Filter goals based on search and filters
  const filteredGoals = goals.filter((goal: Goal) => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === "all" || goal.category === categoryFilter
    const matchesStatus = statusFilter === "all" || goal.status === statusFilter
    const matchesType = typeFilter === "all" || goal.type === typeFilter
    
    return matchesSearch && matchesCategory && matchesStatus && matchesType
  })

  // Handle goal editing
  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setEditFormData({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      type: goal.type,
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : "",
      assignedTo: goal.assignedTo || "",
      status: goal.status,
      progress: goal.progress
    })
    setIsEditDialogOpen(true)
  }

  // Handle goal deletion
  const handleDeleteGoal = (goal: Goal) => {
    setDeletingGoal(goal)
    setIsDeleteDialogOpen(true)
  }

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGoal) return

    try {
      // Call the update function from the hook
      await updateGoal(editingGoal._id, {
        title: editFormData.title,
        description: editFormData.description,
        category: editFormData.category,
        type: editFormData.type,
        targetDate: editFormData.targetDate ? new Date(editFormData.targetDate).getTime() : undefined,
        assignedTo: editFormData.assignedTo || undefined,
        status: editFormData.status,
        progress: editFormData.progress
      })
      
      // Close dialog - no need to notify parent, data updates automatically
      setIsEditDialogOpen(false)
      setEditingGoal(null)
    } catch (error) {
      console.error("Error updating goal:", error)
    }
  }

  // Handle goal deletion confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingGoal) return

    try {
      // Call the delete function from the hook
      await deleteGoal(deletingGoal._id)
      
      // Close dialog - no need to notify parent, data updates automatically
      setIsDeleteDialogOpen(false)
      setDeletingGoal(null)
    } catch (error) {
      console.error("Error deleting goal:", error)
    }
  }

  const getStatusBadgeVariant = (status: GoalStatus) => {
    switch (status) {
      case "active":
        return "default"
      case "completed":
        return "secondary"
      case "paused":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "default"
    }
  }

  const getCategoryBadgeVariant = (category: GoalCategory) => {
    switch (category) {
      case "communication":
        return "default"
      case "social_skills":
        return "secondary"
      case "motor_skills":
        return "outline"
      case "independent_living":
        return "default"
      case "cognitive":
        return "secondary"
      case "emotional_regulation":
        return "outline"
      case "other":
        return "outline"
      default:
        return "default"
    }
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Not set"
    return new Date(timestamp).toLocaleDateString()
  }

  const formatProgress = (progress: number) => {
    return `${progress}%`
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">Search goals</Label>
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search goals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as GoalCategory | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="communication">Communication</SelectItem>
              <SelectItem value="social_skills">Social Skills</SelectItem>
              <SelectItem value="motor_skills">Motor Skills</SelectItem>
              <SelectItem value="independent_living">Independent Living</SelectItem>
              <SelectItem value="cognitive">Cognitive</SelectItem>
              <SelectItem value="emotional_regulation">Emotional Regulation</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as GoalStatus | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as GoalType | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="short_term">Short Term</SelectItem>
              <SelectItem value="long_term">Long Term</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading goals...</div>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <div className="text-red-600">Error: {error}</div>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Goals Table */}
      {!isLoading && !error && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGoals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {goals.length === 0 ? "No goals found. Create your first goal to get started." : "No goals match your current filters."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredGoals.map((goal) => (
                  <TableRow key={goal._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{goal.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {goal.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getCategoryBadgeVariant(goal.category)}>
                        {goal.category.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {goal.type.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{formatProgress(goal.progress)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(goal.status)}>
                        {goal.status.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(goal.targetDate)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {goal.assignedTo || "Unassigned"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditGoal(goal)}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteGoal(goal)}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Results count */}
      {!isLoading && !error && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredGoals.length} of {goals.length} goals
        </div>
      )}

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>
              Update the goal details below.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Goal Title *</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Improve Communication Skills"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={editFormData.category}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, category: value as GoalCategory }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="social_skills">Social Skills</SelectItem>
                    <SelectItem value="motor_skills">Motor Skills</SelectItem>
                    <SelectItem value="independent_living">Independent Living</SelectItem>
                    <SelectItem value="cognitive">Cognitive</SelectItem>
                    <SelectItem value="emotional_regulation">Emotional Regulation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Goal Type *</Label>
                <Select
                  value={editFormData.type}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, type: value as GoalType }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short_term">Short Term</SelectItem>
                    <SelectItem value="long_term">Long Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-targetDate">Target Date</Label>
                <Input
                  id="edit-targetDate"
                  type="date"
                  value={editFormData.targetDate}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status *</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value as GoalStatus }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-progress">Progress (%)</Label>
                <Input
                  id="edit-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={editFormData.progress}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-assignedTo">Assigned To</Label>
              <Input
                id="edit-assignedTo"
                value={editFormData.assignedTo}
                onChange={(e) => setEditFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                placeholder="Support worker name (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the goal in detail, including what success looks like..."
                rows={4}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Update Goal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Goal Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Goal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingGoal?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
