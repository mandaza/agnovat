"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconPlus } from "@tabler/icons-react"
import { useClientsRealtime } from "@/hooks/use-clients-realtime"

interface AddClientFormProps {
  onClientAdded?: () => void
}

export function AddClientForm({ onClientAdded }: AddClientFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    guardianName: "",
    guardianContact: "",
    medicalInfo: "",
    carePlan: "",
    isActive: true
  })

  const { createClient } = useClientsRealtime()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createClient({
        name: formData.name,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).getTime() : undefined,
        guardianName: formData.guardianName || undefined,
        guardianContact: formData.guardianContact || undefined,
        medicalInfo: formData.medicalInfo || undefined,
        carePlan: formData.carePlan || undefined,
        isActive: formData.isActive
      })

      // Reset form
      setFormData({
        name: "",
        dateOfBirth: "",
        guardianName: "",
        guardianContact: "",
        medicalInfo: "",
        carePlan: "",
        isActive: true
      })

      // Close dialog - no need to notify parent, data updates automatically
      setIsOpen(false)
    } catch (error) {
      console.error("Error creating client:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Create a new client profile with essential information and care details.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Tavonga Gore"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input
                id="guardianName"
                value={formData.guardianName}
                onChange={(e) => setFormData(prev => ({ ...prev, guardianName: e.target.value }))}
                placeholder="Guardian or parent name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="guardianContact">Guardian Contact</Label>
              <Input
                id="guardianContact"
                value={formData.guardianContact}
                onChange={(e) => setFormData(prev => ({ ...prev, guardianContact: e.target.value }))}
                placeholder="Phone number or email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalInfo">Medical Information</Label>
            <Textarea
              id="medicalInfo"
              value={formData.medicalInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, medicalInfo: e.target.value }))}
              placeholder="Diagnoses, medications, allergies, special considerations..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carePlan">Care Plan</Label>
            <Textarea
              id="carePlan"
              value={formData.carePlan}
              onChange={(e) => setFormData(prev => ({ ...prev, carePlan: e.target.value }))}
              placeholder="Care objectives, treatment goals, support strategies..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Active Client</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}