"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EnhancedShiftNotesForm } from "./enhanced-shift-notes-form"
import { Id } from "../../../convex/_generated/dataModel"

interface ShiftNotesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialShiftNoteId?: Id<"shiftNotes">
  clientId?: string
  onShiftNoteCreated?: (shiftNoteId: Id<"shiftNotes">) => void
}

export function ShiftNotesDialog({ 
  open, 
  onOpenChange, 
  initialShiftNoteId, 
  clientId, 
  onShiftNoteCreated 
}: ShiftNotesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialShiftNoteId ? "Edit Shift Note" : "Create New Shift Note"}
          </DialogTitle>
        </DialogHeader>
        <EnhancedShiftNotesForm
          initialShiftNoteId={initialShiftNoteId}
          clientId={clientId}
          onClose={() => onOpenChange(false)}
          onShiftNoteCreated={onShiftNoteCreated}
        />
      </DialogContent>
    </Dialog>
  )
}