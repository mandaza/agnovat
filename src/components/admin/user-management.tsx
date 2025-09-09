"use client"

import { useState } from "react"
import { useUserApproval, UserApprovalData } from "@/hooks/use-user-approval"
import { useUserRealtime } from "@/hooks/use-user-realtime"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// Using Dialog instead of AlertDialog for compatibility
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  UserCheck, 
  UserX, 
  Mail, 
  Calendar, 
  Shield,
  Eye,
  RotateCcw
} from "lucide-react"
import { Id } from "../../../convex/_generated/dataModel"

export type UserRole = "admin" | "public_guardian" | "support_worker" | "behavior_practitioner" | "family" | "support_coordinator"

interface ApprovalAction {
  userId: Id<"users">
  role: UserRole
  user: any
}

export function UserManagement() {
  const { convexUser } = useUserRealtime()
  const {
    pendingUsers,
    approvedUsers,
    rejectedUsers,
    pendingCount,
    approvedCount,
    rejectedCount,
    approveUser,
    rejectUser,
    bulkApproveUsers,
    resetUserToPending
  } = useUserApproval()

  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [bulkRole, setBulkRole] = useState<UserRole>("support_worker")
  const [rejectionReason, setRejectionReason] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Filter users based on search
  const filterUsers = (users: any[]) => {
    if (!searchTerm) return users
    return users.filter(user => 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const handleSingleApproval = async (userId: Id<"users">, role: UserRole) => {
    if (!convexUser?._id) return
    
    setIsProcessing(true)
    try {
      await approveUser(userId, role, convexUser._id)
    } catch (error) {
      console.error('Error approving user:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSingleRejection = async (userId: Id<"users">) => {
    if (!convexUser?._id) return
    
    setIsProcessing(true)
    try {
      await rejectUser(userId, convexUser._id, rejectionReason)
      setRejectionReason("")
    } catch (error) {
      console.error('Error rejecting user:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkApproval = async () => {
    if (!convexUser?._id || selectedUsers.size === 0) return
    
    setIsProcessing(true)
    try {
      const approvals: UserApprovalData[] = Array.from(selectedUsers).map(userId => ({
        userId: userId as Id<"users">,
        assignedRole: bulkRole
      }))
      
      await bulkApproveUsers(approvals, convexUser._id)
      setSelectedUsers(new Set())
    } catch (error) {
      console.error('Error bulk approving users:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleResetToPending = async (userId: Id<"users">) => {
    if (!convexUser?._id) return
    
    setIsProcessing(true)
    try {
      await resetUserToPending(userId, convexUser._id)
    } catch (error) {
      console.error('Error resetting user to pending:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers)
    if (newSelection.has(userId)) {
      newSelection.delete(userId)
    } else {
      newSelection.add(userId)
    }
    setSelectedUsers(newSelection)
  }

  const getRoleColor = (role?: UserRole) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-800"
      case "public_guardian": return "bg-blue-100 text-blue-800"
      case "support_coordinator": return "bg-indigo-100 text-indigo-800"
      case "behavior_practitioner": return "bg-green-100 text-green-800"
      case "support_worker": return "bg-orange-100 text-orange-800"
      case "family": return "bg-pink-100 text-pink-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const UserCard = ({ user, showActions = true, status }: { user: any, showActions?: boolean, status: string }) => (
    <Card key={user._id} className="relative">
      {showActions && status === 'pending' && (
        <div className="absolute top-2 left-2">
          <input
            type="checkbox"
            checked={selectedUsers.has(user._id)}
            onChange={() => toggleUserSelection(user._id)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {user.firstName} {user.lastName}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4" />
              {user.email}
            </CardDescription>
          </div>
          <Badge className={getRoleColor(user.role)}>
            {user.role ? user.role.replace('_', ' ') : 'No Role'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Requested: {new Date(user.requestedAt || user.createdAt).toLocaleDateString()}</span>
          </div>
          
          {user.approvedAt && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{status === 'rejected' ? 'Rejected' : 'Approved'}: {new Date(user.approvedAt).toLocaleDateString()}</span>
            </div>
          )}

          {user.notes && (
            <div className="bg-gray-50 p-2 rounded text-sm">
              <strong>Notes:</strong> {user.notes}
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2 mt-4">
            {status === 'pending' && (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex-1">
                      <UserCheck className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approve User</DialogTitle>
                      <DialogDescription>
                        Select a role for {user.firstName} {user.lastName}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Assign Role</Label>
                        <Select defaultValue="support_worker" onValueChange={(value: UserRole) => {
                          handleSingleApproval(user._id, value)
                        }}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="support_worker">Support Worker</SelectItem>
                            <SelectItem value="behavior_practitioner">Behavior Practitioner</SelectItem>
                            <SelectItem value="support_coordinator">Support Coordinator</SelectItem>
                            <SelectItem value="public_guardian">Public Guardian</SelectItem>
                            <SelectItem value="family">Family Member</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1">
                      <UserX className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject User</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to reject {user.firstName} {user.lastName}&apos;s access request?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="rejection-reason">Reason (Optional)</Label>
                        <Textarea
                          id="rejection-reason"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Provide a reason for rejection..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setRejectionReason("")}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => handleSingleRejection(user._id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Reject User
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {(status === 'approved' || status === 'rejected') && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleResetToPending(user._id)}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset to Pending
              </Button>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Eye className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>User Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <div><strong>Name:</strong> {user.firstName} {user.lastName}</div>
                  <div><strong>Email:</strong> {user.email}</div>
                  <div><strong>Status:</strong> {user.approvalStatus}</div>
                  <div><strong>Role:</strong> {user.role || 'None'}</div>
                  <div><strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}</div>
                  {user.phoneNumber && <div><strong>Phone:</strong> {user.phoneNumber}</div>}
                  {user.address && <div><strong>Address:</strong> {user.address}</div>}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage user access and roles</p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-sm text-gray-500">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <div className="text-sm text-gray-500">Rejected</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
              </span>
              <Select value={bulkRole} onValueChange={(value: UserRole) => setBulkRole(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support_worker">Support Worker</SelectItem>
                  <SelectItem value="behavior_practitioner">Behavior Practitioner</SelectItem>
                  <SelectItem value="support_coordinator">Support Coordinator</SelectItem>
                  <SelectItem value="public_guardian">Public Guardian</SelectItem>
                  <SelectItem value="family">Family Member</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleBulkApproval}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Bulk Approve
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedUsers(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Lists */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Rejected ({rejectedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filterUsers(pendingUsers).length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No pending users</h3>
                  <p className="text-gray-500">All users have been reviewed</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterUsers(pendingUsers).map(user => (
                <UserCard key={user._id} user={user} status="pending" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filterUsers(approvedUsers).length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No approved users</h3>
                  <p className="text-gray-500">No users have been approved yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterUsers(approvedUsers).map(user => (
                <UserCard key={user._id} user={user} status="approved" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {filterUsers(rejectedUsers).length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No rejected users</h3>
                  <p className="text-gray-500">No users have been rejected</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterUsers(rejectedUsers).map(user => (
                <UserCard key={user._id} user={user} status="rejected" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}