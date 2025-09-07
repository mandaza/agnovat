
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconPlus, IconNotes, IconClock, IconUser, IconSearch, IconFilter } from "@tabler/icons-react"
import { ShiftNotesDialog } from "@/components/shift-notes/shift-notes-dialog"
import { ShiftNotesList } from "@/components/shift-notes/shift-notes-list"
import { ShiftAnalytics } from "@/components/shift-notes/shift-analytics"
import { useShiftNotesRealtime } from "@/hooks/use-shift-notes-realtime"
import { Id } from "../../../../convex/_generated/dataModel"

export default function ShiftNotesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingShiftNoteId, setEditingShiftNoteId] = useState<Id<"shiftNotes"> | undefined>(undefined)
  
  const { analytics } = useShiftNotesRealtime()
  
  const handleShiftNoteCreated = (shiftNoteId: Id<"shiftNotes">) => {
    setIsFormOpen(false)
    setEditingShiftNoteId(undefined)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingShiftNoteId(undefined)
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
                    <h1 className="text-3xl font-bold tracking-tight">Shift Notes</h1>
                    <p className="text-muted-foreground">
                      Document and track shift activities, observations, and handoffs
                    </p>
                  </div>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => setIsFormOpen(true)}
                  >
                    <IconPlus className="h-4 w-4" />
                    New Note
                  </Button>
                </div>
              </div>

              {/* Shift Notes Overview Cards */}
              <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today&apos;s Notes</CardTitle>
                    <IconNotes className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.today || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Today&apos;s shift notes
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
                    <IconClock className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.draft || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Draft notes
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Staff on Duty</CardTitle>
                    <IconUser className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.submitted || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Submitted notes
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Handoffs</CardTitle>
                    <IconNotes className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.reviewed || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Reviewed notes
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filter Bar */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 @sm:flex-row @sm:items-center @sm:justify-between">
                      <div className="flex items-center gap-2">
                        <IconSearch className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search shift notes..."
                          className="flex-1 bg-transparent border-none outline-none text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <IconFilter className="h-4 w-4" />
                          Filter
                        </Button>
                        <Button variant="outline" size="sm">Date Range</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Section */}
              <div className="px-4 lg:px-6">
                <ShiftAnalytics />
              </div>

              {/* Shift Notes List */}
              <div className="px-4 lg:px-6">
                <ShiftNotesList
                  onEditShiftNote={(shiftNoteId) => {
                    setEditingShiftNoteId(shiftNoteId)
                    setIsFormOpen(true)
                  }}
                  onViewShiftNote={(shiftNoteId) => {
                    // Could implement a view-only dialog here
                    console.log('View shift note:', shiftNoteId)
                  }}
                />
              </div>

              {/* Note Creation */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Shift Note</CardTitle>
                    <CardDescription>
                      Document your shift activities, observations, and handoff information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <IconNotes className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Shift Note Creation</h3>
                      <p className="text-muted-foreground mb-4">
                        Create detailed shift notes with templates, attachments, and automated handoff processes.
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline">Use Template</Button>
                        <Button onClick={() => setIsFormOpen(true)}>
                          Start Enhanced Note
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Shift Notes Dialog */}
        <ShiftNotesDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          initialShiftNoteId={editingShiftNoteId}
          clientId="js71rnhs3ts703d1thj36n7pc57pahxb"
          onShiftNoteCreated={handleShiftNoteCreated}
        />
    </>
  )
}
