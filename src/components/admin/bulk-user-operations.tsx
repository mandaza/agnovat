'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, CheckCircle, Users, Settings } from 'lucide-react'
import { Roles, ApprovalStatus } from '../../../types/globals'

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Roles | null
  approvalStatus: ApprovalStatus
}

interface BulkUserOperationsProps {
  selectedUsers: UserProfile[]
  onBulkUpdate: (userIds: string[], updates: Partial<UserProfile>) => Promise<void>
  onClearSelection: () => void
}

type BulkOperation = 'approve' | 'reject' | 'assign_role' | 'deactivate' | 'reactivate'

export function BulkUserOperations({ 
  selectedUsers, 
  onBulkUpdate, 
  onClearSelection 
}: BulkUserOperationsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation | null>(null)
  const [selectedRole, setSelectedRole] = useState<Roles | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationStep, setConfirmationStep] = useState(false)

  const operations = [
    {
      id: 'approve' as BulkOperation,
      label: 'Approve Users',
      description: 'Approve selected pending users',
      icon: CheckCircle,
      color: 'text-green-600',
      requiresConfirmation: true,
      applicableTo: (user: UserProfile) => user.approvalStatus === 'pending'
    },
    {
      id: 'reject' as BulkOperation,
      label: 'Reject Users',
      description: 'Reject selected pending users',
      icon: AlertTriangle,
      color: 'text-red-600',
      requiresConfirmation: true,
      applicableTo: (user: UserProfile) => user.approvalStatus === 'pending'
    },
    {
      id: 'assign_role' as BulkOperation,
      label: 'Assign Role',
      description: 'Assign a role to selected users',
      icon: Settings,
      color: 'text-blue-600',
      requiresConfirmation: true,
      requiresRole: true,
      applicableTo: (user: UserProfile) => user.approvalStatus === 'approved'
    }
  ]

  const getApplicableUsers = (operation: BulkOperation) => {
    const op = operations.find(o => o.id === operation)
    if (!op) return selectedUsers
    return selectedUsers.filter(op.applicableTo)
  }

  const handleExecuteOperation = async () => {
    if (!selectedOperation) return

    setIsLoading(true)
    try {
      const applicableUsers = getApplicableUsers(selectedOperation)
      const userIds = applicableUsers.map(u => u.id)
      
      const updates: Partial<UserProfile> = {}
      
      switch (selectedOperation) {
        case 'approve':
          updates.approvalStatus = 'approved'
          break
        case 'reject':
          updates.approvalStatus = 'rejected'
          break
        case 'assign_role':
          if (selectedRole) {
            updates.role = selectedRole
          }
          break
      }

      await onBulkUpdate(userIds, updates)
      
      // Reset state
      setIsOpen(false)
      setSelectedOperation(null)
      setSelectedRole(null)
      setConfirmationStep(false)
      onClearSelection()
      
    } catch (error) {
      console.error('Error executing bulk operation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedOp = operations.find(op => op.id === selectedOperation)
  const applicableUsers = selectedOperation ? getApplicableUsers(selectedOperation) : []
  const ineligibleUsers = selectedUsers.filter(user => 
    selectedOperation && !getApplicableUsers(selectedOperation).includes(user)
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={selectedUsers.length === 0} className="relative">
          <Users className="w-4 h-4 mr-2" />
          Bulk Actions
          {selectedUsers.length > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 bg-blue-100 text-blue-800"
            >
              {selectedUsers.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk User Operations</DialogTitle>
          <DialogDescription>
            Perform operations on {selectedUsers.length} selected user(s)
          </DialogDescription>
        </DialogHeader>

        {!confirmationStep ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Select Operation</h3>
              <div className="grid gap-2">
                {operations.map((operation) => {
                  const Icon = operation.icon
                  const applicableCount = getApplicableUsers(operation.id).length
                  
                  return (
                    <Card 
                      key={operation.id}
                      className={`cursor-pointer transition-colors ${
                        selectedOperation === operation.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      } ${applicableCount === 0 ? 'opacity-50' : ''}`}
                      onClick={() => applicableCount > 0 && setSelectedOperation(operation.id)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <div className="flex items-center">
                            <Icon className={`w-4 h-4 mr-2 ${operation.color}`} />
                            {operation.label}
                          </div>
                          <Badge variant="outline">
                            {applicableCount} eligible
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-gray-600">{operation.description}</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {selectedOp?.requiresRole && (
              <div className="space-y-2">
                <h3 className="font-medium">Select Role</h3>
                <Select value={selectedRole || ''} onValueChange={(value) => setSelectedRole(value as Roles)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public_guardian">Public Guardian</SelectItem>
                    <SelectItem value="support_coordinator">Support Coordinator</SelectItem>
                    <SelectItem value="support_worker">Support Worker</SelectItem>
                    <SelectItem value="behavior_practitioner">Behavior Practitioner</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => setConfirmationStep(true)}
                disabled={
                  !selectedOperation || 
                  (selectedOp?.requiresRole && !selectedRole) ||
                  applicableUsers.length === 0
                }
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <h3 className="font-medium text-yellow-800">Confirm Bulk Operation</h3>
              </div>
              <p className="text-sm text-yellow-700">
                Are you sure you want to {selectedOp?.label.toLowerCase()} the following users?
                {selectedOp?.requiresRole && selectedRole && (
                  <> Role will be set to: <span className="font-medium">{selectedRole.replace('_', ' ')}</span></>
                )}
              </p>
            </div>

            {applicableUsers.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-green-700">
                  Users to be affected ({applicableUsers.length}):
                </h3>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {applicableUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm">
                        {user.firstName} {user.lastName} ({user.email})
                      </span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {user.approvalStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ineligibleUsers.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">
                    Users not eligible for this operation ({ineligibleUsers.length}):
                  </h3>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {ineligibleUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">
                          {user.firstName} {user.lastName} ({user.email})
                        </span>
                        <Badge variant="outline" className="bg-gray-100 text-gray-600">
                          {user.approvalStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setConfirmationStep(false)}>
                Back
              </Button>
              <Button 
                onClick={handleExecuteOperation}
                disabled={isLoading || applicableUsers.length === 0}
                variant={selectedOp?.id === 'reject' ? 'destructive' : 'default'}
              >
                {isLoading ? 'Processing...' : `Confirm ${selectedOp?.label}`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}