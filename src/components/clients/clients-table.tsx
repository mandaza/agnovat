"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IconSearch, IconEdit, IconTrash, IconEye, IconUserCheck, IconUserX } from "@tabler/icons-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useClientsRealtime, Client } from "../../hooks/use-clients-realtime"
import { Switch } from "@/components/ui/switch"

interface ClientsTableProps {
  onClientUpdated?: () => void
}

export function ClientsTable({ onClientUpdated }: ClientsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  
  // Edit and delete state
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: "",
    dateOfBirth: "",
    guardianName: "",
    guardianContact: "",
    medicalInfo: "",
    carePlan: "",
    isActive: true
  })

  // Use the real-time clients hook
  const { clients, isLoading, error, updateClient, deleteClient } = useClientsRealtime()

  // Filter clients based on search and filters
  const filteredClients = clients.filter((client: Client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.guardianName && client.guardianName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && client.isActive) ||
                         (statusFilter === "inactive" && !client.isActive)
    
    return matchesSearch && matchesStatus
  })

  // Handle client editing
  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setEditFormData({
      name: client.name,
      dateOfBirth: client.dateOfBirth ? new Date(client.dateOfBirth).toISOString().split('T')[0] : "",
      guardianName: client.guardianName || "",
      guardianContact: client.guardianContact || "",
      medicalInfo: client.medicalInfo || "",
      carePlan: client.carePlan || "",
      isActive: client.isActive
    })
    setIsEditDialogOpen(true)
  }

  // Handle client viewing
  const handleViewClient = (client: Client) => {
    setViewingClient(client)
    setIsViewDialogOpen(true)
  }

  // Handle client deletion
  const handleDeleteClient = (client: Client) => {
    setDeletingClient(client)
    setIsDeleteDialogOpen(true)
  }

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClient) return

    try {
      // Call the update function from the hook
      await updateClient(editingClient._id, {
        name: editFormData.name,
        dateOfBirth: editFormData.dateOfBirth ? new Date(editFormData.dateOfBirth).getTime() : undefined,
        guardianName: editFormData.guardianName || undefined,
        guardianContact: editFormData.guardianContact || undefined,
        medicalInfo: editFormData.medicalInfo || undefined,
        carePlan: editFormData.carePlan || undefined,
        isActive: editFormData.isActive
      })
      
      // Close dialog - no need to notify parent or refetch, data updates automatically
      setIsEditDialogOpen(false)
      setEditingClient(null)
    } catch (error) {
      console.error("Error updating client:", error)
    }
  }

  // Handle client deletion confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingClient) return

    try {
      // Call the delete function from the hook
      await deleteClient(deletingClient._id)
      
      // Close dialog - no need to notify parent or refetch, data updates automatically
      setIsDeleteDialogOpen(false)
      setDeletingClient(null)
    } catch (error) {
      console.error("Error deleting client:", error)
    }
  }

  // Toggle client status
  const handleToggleStatus = async (client: Client) => {
    try {
      await updateClient(client._id, {
        isActive: !client.isActive
      })
      // No need to notify parent - data updates automatically
    } catch (error) {
      console.error("Error updating client status:", error)
    }
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Not set"
    return new Date(timestamp).toLocaleDateString()
  }

  const calculateAge = (dateOfBirth?: number) => {
    if (!dateOfBirth) return "Unknown"
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return `${age} years`
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">Search clients</Label>
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search clients by name or guardian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("active")}
          >
            Active
          </Button>
          <Button 
            variant={statusFilter === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("inactive")}
          >
            Inactive
          </Button>
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading clients...</div>
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

      {/* Clients Table */}
      {!isLoading && !error && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Guardian Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {clients.length === 0 ? "No clients found. Add your first client to get started." : "No clients match your current filters."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client._id}>
                    <TableCell>
                      <div className="font-medium">{client.name}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{calculateAge(client.dateOfBirth)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{client.guardianName || "Not set"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{client.guardianContact || "Not set"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={client.isActive ? "default" : "secondary"}>
                          {client.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={client.isActive}
                          onCheckedChange={() => handleToggleStatus(client)}
                          size="sm"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(client.createdAt)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewClient(client)}
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditClient(client)}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClient(client)}
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
          Showing {filteredClients.length} of {clients.length} clients
        </div>
      )}

      {/* View Client Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>
              Complete client information and care details
            </DialogDescription>
          </DialogHeader>
          
          {viewingClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Client Name</Label>
                  <p className="text-sm text-muted-foreground">{viewingClient.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Age</Label>
                  <p className="text-sm text-muted-foreground">{calculateAge(viewingClient.dateOfBirth)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Guardian Name</Label>
                  <p className="text-sm text-muted-foreground">{viewingClient.guardianName || "Not set"}</p>
                </div>
                <div>
                  <Label className="font-medium">Guardian Contact</Label>
                  <p className="text-sm text-muted-foreground">{viewingClient.guardianContact || "Not set"}</p>
                </div>
              </div>
              
              <div>
                <Label className="font-medium">Medical Information</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {viewingClient.medicalInfo || "No medical information recorded"}
                </p>
              </div>
              
              <div>
                <Label className="font-medium">Care Plan</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {viewingClient.carePlan || "No care plan recorded"}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Status</Label>
                  <p className="text-sm">
                    <Badge variant={viewingClient.isActive ? "default" : "secondary"}>
                      {viewingClient.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">{formatDate(viewingClient.createdAt)}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update the client information below.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Client Name *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Tavonga Gore"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                <Input
                  id="edit-dateOfBirth"
                  type="date"
                  value={editFormData.dateOfBirth}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-guardianName">Guardian Name</Label>
                <Input
                  id="edit-guardianName"
                  value={editFormData.guardianName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, guardianName: e.target.value }))}
                  placeholder="Guardian or parent name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-guardianContact">Guardian Contact</Label>
                <Input
                  id="edit-guardianContact"
                  value={editFormData.guardianContact}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, guardianContact: e.target.value }))}
                  placeholder="Phone number or email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-medicalInfo">Medical Information</Label>
              <Textarea
                id="edit-medicalInfo"
                value={editFormData.medicalInfo}
                onChange={(e) => setEditFormData(prev => ({ ...prev, medicalInfo: e.target.value }))}
                placeholder="Diagnoses, medications, allergies, special considerations..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-carePlan">Care Plan</Label>
              <Textarea
                id="edit-carePlan"
                value={editFormData.carePlan}
                onChange={(e) => setEditFormData(prev => ({ ...prev, carePlan: e.target.value }))}
                placeholder="Care objectives, treatment goals, support strategies..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={editFormData.isActive}
                onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="edit-isActive">Active Client</Label>
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
                Update Client
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Client Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingClient?.name}"? This action cannot be undone and will remove all associated data.
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
              Delete Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}