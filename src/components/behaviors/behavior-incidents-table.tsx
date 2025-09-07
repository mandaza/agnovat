"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  IconSearch, 
  IconEye, 
  IconEdit, 
  IconAlertTriangle, 
  IconUser, 
  IconClock,
  IconMapPin,
  IconShield
} from "@tabler/icons-react"
import { useBehaviorsRealtime, BehaviorIncident } from "../../hooks/use-behaviors-realtime"
import { useClientsRealtime } from "../../hooks/use-clients-realtime"
import { BehaviorStatus, Location } from "../../../types/database"

interface BehaviorIncidentsTableProps {
  clientId?: string
}

export function BehaviorIncidentsTable({ clientId }: BehaviorIncidentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<BehaviorStatus | "all">("all")
  const [intensityFilter, setIntensityFilter] = useState<string>("all")
  const [viewingIncident, setViewingIncident] = useState<BehaviorIncident | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Use the real-time behaviors hook and clients data
  const { behaviors, isLoading, analytics } = useBehaviorsRealtime({
    clientId,
  })
  const { clients } = useClientsRealtime()

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c._id === clientId)
    return client?.name || clientId
  }

  // Filter behaviors based on search and filters
  const filteredBehaviors = behaviors.filter((behavior: BehaviorIncident) => {
    const clientName = getClientName(behavior.clientId)
    const matchesSearch = behavior.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         behavior.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         behavior.behaviors.some(b => b.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" || behavior.status === statusFilter
    const matchesIntensity = intensityFilter === "all" || 
                           behavior.intensity.toString() === intensityFilter

    return matchesSearch && matchesStatus && matchesIntensity
  })

  const handleViewIncident = (incident: BehaviorIncident) => {
    setViewingIncident(incident)
    setIsViewDialogOpen(true)
  }

  const getStatusBadgeVariant = (status: BehaviorStatus) => {
    switch (status) {
      case "draft": return "outline"
      case "submitted": return "default"
      case "reviewed": return "secondary"
      case "archived": return "destructive"
      default: return "outline"
    }
  }

  const getIntensityBadgeVariant = (intensity: number) => {
    if (intensity >= 4) return "destructive"
    if (intensity >= 3) return "default"
    return "secondary"
  }

  const getLocationDisplay = (location: Location) => {
    const locationMap = {
      home: "Home",
      car: "Car",
      public: "Public",
      school: "School",
      other: "Other"
    }
    return locationMap[location] || location
  }

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalIncidents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Intensity</CardTitle>
            <IconShield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgIntensity}</div>
            <p className="text-xs text-muted-foreground">Out of 5</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Harm Incidents</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.harmIncidents}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <IconEye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.statusBreakdown.submitted}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">Search incidents</Label>
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by description, client, or behaviors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BehaviorStatus | "all")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={intensityFilter} onValueChange={setIntensityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Intensity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="1">Level 1</SelectItem>
            <SelectItem value="2">Level 2</SelectItem>
            <SelectItem value="3">Level 3</SelectItem>
            <SelectItem value="4">Level 4</SelectItem>
            <SelectItem value="5">Level 5</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading incidents...</div>
        </div>
      )}

      {/* Incidents Table */}
      {!isLoading && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Behaviors</TableHead>
                <TableHead>Intensity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Harm</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBehaviors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {behaviors.length === 0 
                        ? "No behavior incidents recorded yet." 
                        : "No incidents match your current filters."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBehaviors.map((incident) => (
                  <TableRow key={incident._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconClock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{formatDate(incident.dateTime)}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(incident.dateTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconUser className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{getClientName(incident.clientId)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconMapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{getLocationDisplay(incident.location)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {incident.behaviors.length} behavior(s)
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {incident.behaviors.slice(0, 2).join(", ")}
                          {incident.behaviors.length > 2 && "..."}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={getIntensityBadgeVariant(incident.intensity)}>
                        Level {incident.intensity}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(incident.status)}>
                        {incident.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {(incident.harmToClient?.occurred || incident.harmToOthers?.occurred) ? (
                        <Badge variant="destructive" className="gap-1">
                          <IconAlertTriangle className="h-3 w-3" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewIncident(incident)}
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={incident.status === "reviewed"}
                        >
                          <IconEdit className="h-4 w-4" />
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
      {!isLoading && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredBehaviors.length} of {behaviors.length} incidents
        </div>
      )}

      {/* View Incident Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Incident Details</DialogTitle>
            <DialogDescription>
              Complete information about this behavior incident
            </DialogDescription>
          </DialogHeader>
          
          {viewingIncident && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Client</Label>
                    <p className="text-sm text-muted-foreground">
                      {getClientName(viewingIncident.clientId)}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Date & Time</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(viewingIncident.dateTime)}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Location</Label>
                    <p className="text-sm text-muted-foreground">
                      {getLocationDisplay(viewingIncident.location)}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Status</Label>
                    <Badge variant={getStatusBadgeVariant(viewingIncident.status)}>
                      {viewingIncident.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Before */}
              {viewingIncident.activityBefore && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Activity Before Incident</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{viewingIncident.activityBefore}</p>
                  </CardContent>
                </Card>
              )}

              {/* Behaviors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Behaviors Observed</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="font-medium">Selected Behaviors</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {viewingIncident.behaviors.map((behavior) => (
                        <Badge key={behavior} variant="outline">
                          {behavior}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {viewingIncident.customBehaviors && (
                    <div>
                      <Label className="font-medium">Additional Behaviors</Label>
                      <p className="text-sm text-muted-foreground">{viewingIncident.customBehaviors}</p>
                    </div>
                  )}
                  <div>
                    <Label className="font-medium">Intensity Level</Label>
                    <Badge variant={getIntensityBadgeVariant(viewingIncident.intensity)} className="ml-2">
                      Level {viewingIncident.intensity}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Warning Signs */}
              {viewingIncident.warningSigns && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Warning Signs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">Present:</Label>
                        <Badge variant={viewingIncident.warningSigns.present ? "default" : "outline"}>
                          {viewingIncident.warningSigns.present ? "Yes" : "No"}
                        </Badge>
                      </div>
                      {viewingIncident.warningSigns.notes && (
                        <div>
                          <Label className="font-medium">Notes</Label>
                          <p className="text-sm text-muted-foreground">{viewingIncident.warningSigns.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Harm Assessment */}
              {(viewingIncident.harmToClient?.occurred || viewingIncident.harmToOthers?.occurred) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <IconAlertTriangle className="h-5 w-5 text-red-500" />
                      Harm Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {viewingIncident.harmToClient?.occurred && (
                      <div>
                        <Label className="font-medium">Harm to Client</Label>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm"><strong>Description:</strong> {viewingIncident.harmToClient.description}</p>
                          <p className="text-sm"><strong>Extent:</strong> {viewingIncident.harmToClient.extent}</p>
                        </div>
                      </div>
                    )}
                    {viewingIncident.harmToOthers?.occurred && (
                      <div>
                        <Label className="font-medium">Harm to Others</Label>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm"><strong>Description:</strong> {viewingIncident.harmToOthers.description}</p>
                          <p className="text-sm"><strong>Extent:</strong> {viewingIncident.harmToOthers.extent}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Interventions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Interventions Used</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="font-medium">Strategies</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {viewingIncident.interventions.map((intervention) => (
                        <Badge key={intervention} variant="secondary">
                          {intervention}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {viewingIncident.interventionNotes && (
                    <div>
                      <Label className="font-medium">Notes</Label>
                      <p className="text-sm text-muted-foreground">{viewingIncident.interventionNotes}</p>
                    </div>
                  )}
                  {viewingIncident.supportRequired?.secondPerson && (
                    <div>
                      <Label className="font-medium">Additional Support Required</Label>
                      <p className="text-sm text-muted-foreground">
                        {viewingIncident.supportRequired.explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Incident Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{viewingIncident.description}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}