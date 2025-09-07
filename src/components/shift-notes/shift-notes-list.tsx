"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  IconClock, 
  IconUser, 
  IconCalendar,
  IconSearch,
  IconFilter,
  IconEye,
  IconEdit,
  IconTrash,
  IconDownload,
  IconCircleCheck,
  IconClock as IconPending,
  IconAlertCircle,
  IconNotes,
  IconTarget,
  IconBrain,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-react"
import { useShiftNotesRealtime } from "@/hooks/use-shift-notes-realtime"
import { useActivitiesRealtime } from "@/hooks/use-activity-schedules-realtime"
import { useGoalsRealtime } from "@/hooks/use-goals-realtime"
import { Id } from "../../../convex/_generated/dataModel"

interface ShiftNotesListProps {
  onEditShiftNote?: (shiftNoteId: Id<"shiftNotes">) => void
  onViewShiftNote?: (shiftNoteId: Id<"shiftNotes">) => void
}

export function ShiftNotesList({ onEditShiftNote, onViewShiftNote }: ShiftNotesListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("week")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { shiftNotes, isLoading: notesLoading } = useShiftNotesRealtime()
  const { activities, isLoading: activitiesLoading } = useActivitiesRealtime()
  const { goals, isLoading: goalsLoading } = useGoalsRealtime()

  const isLoading = notesLoading || activitiesLoading || goalsLoading

  // Filter and search shift notes
  const filteredShiftNotes = useMemo(() => {
    let filtered = [...shiftNotes]

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(note => note.status === statusFilter)
    }

    // Apply date range filter
    const now = Date.now()
    const dateRangeMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      all: Infinity
    }

    if (dateRange !== "all") {
      const rangeMs = dateRangeMs[dateRange as keyof typeof dateRangeMs]
      filtered = filtered.filter(note => now - note.shiftDate <= rangeMs)
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(note =>
        note.summary.toLowerCase().includes(search) ||
        note.generalNotes?.toLowerCase().includes(search) ||
        note.challenges?.toLowerCase().includes(search) ||
        note.skillsPracticed.some(skill => skill.toLowerCase().includes(search))
      )
    }

    // Sort by most recent first
    return filtered.sort((a, b) => b.shiftDate - a.shiftDate)
  }, [shiftNotes, searchTerm, statusFilter, dateRange])

  // Pagination
  const totalPages = Math.ceil(filteredShiftNotes.length / itemsPerPage)
  const paginatedNotes = filteredShiftNotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Helper functions
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary'
      case 'submitted': return 'default'
      case 'reviewed': return 'outline'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <IconPending className="h-3 w-3" />
      case 'submitted': return <IconCircleCheck className="h-3 w-3" />
      case 'reviewed': return <IconCircleCheck className="h-3 w-3" />
      default: return <IconAlertCircle className="h-3 w-3" />
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getShiftDuration = (startTime: number, endTime: number) => {
    const duration = endTime - startTime
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  // Calculate completion statistics for a shift note
  const getCompletionStats = (note: typeof shiftNotes[0]) => {
    const completedCount = note.activitiesCompleted.length
    const goalsCoveredCount = note.goalsCovered.length
    const skillsCount = note.skillsPracticed.length
    
    return { completedCount, goalsCoveredCount, skillsCount }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading shift notes...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconNotes className="h-5 w-5" />
              Shift Notes
            </CardTitle>
            <CardDescription>
              Manage and review all shift documentation
            </CardDescription>
          </div>
          
          {/* Export Button */}
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <IconDownload className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shift notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {paginatedNotes.length === 0 ? (
          <div className="text-center py-12">
            <IconNotes className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No shift notes found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "Start by creating your first shift note"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedNotes.map((note) => {
              const stats = getCompletionStats(note)
              
              return (
                <div key={note._id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">
                          Shift - {formatDate(note.shiftDate)}
                        </h3>
                        <Badge variant={getStatusVariant(note.status)} className="flex items-center gap-1">
                          {getStatusIcon(note.status)}
                          {note.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <IconClock className="h-3 w-3" />
                          {formatTime(note.startTime)} - {formatTime(note.endTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconUser className="h-3 w-3" />
                          Duration: {getShiftDuration(note.startTime, note.endTime)}
                        </span>
                      </div>

                      {/* Summary Preview */}
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {note.summary}
                      </p>

                      {/* Quick Stats */}
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <IconCircleCheck className="h-3 w-3 text-green-600" />
                          {stats.completedCount} Activities
                        </span>
                        <span className="flex items-center gap-1">
                          <IconTarget className="h-3 w-3 text-blue-600" />
                          {stats.goalsCoveredCount} Goals
                        </span>
                        <span className="flex items-center gap-1">
                          <IconBrain className="h-3 w-3 text-purple-600" />
                          {stats.skillsCount} Skills
                        </span>
                        {note.challenges && (
                          <span className="flex items-center gap-1">
                            <IconAlertCircle className="h-3 w-3 text-orange-600" />
                            Challenges noted
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewShiftNote?.(note._id)}
                        className="flex items-center gap-1"
                      >
                        <IconEye className="h-4 w-4" />
                        View
                      </Button>
                      
                      {note.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditShiftNote?.(note._id)}
                          className="flex items-center gap-1"
                        >
                          <IconEdit className="h-4 w-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Skills Practiced (if any) */}
                  {note.skillsPracticed.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t">
                      <span className="text-xs text-muted-foreground mr-2">Skills:</span>
                      {note.skillsPracticed.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {note.skillsPracticed.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.skillsPracticed.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredShiftNotes.length)} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredShiftNotes.length)} of {filteredShiftNotes.length} notes
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <IconChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}