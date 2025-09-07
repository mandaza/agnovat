'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Roles, ApprovalStatus } from "../../../../types/globals"
import { UserProfile } from "../../../../types/user-profile"
import { 
  Users, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  RefreshCw,
  Activity,
  Settings,
  Eye
} from "lucide-react"

// Import new components
import { UserProfileModal } from "@/components/admin/user-profile-modal"
import { BulkUserOperations } from "@/components/admin/bulk-user-operations"
import { UserActivityDashboard } from "@/components/admin/user-activity-dashboard"
import { AdvancedUserSearch } from "@/components/admin/advanced-user-search"

// Using shared UserProfile interface

export default function AdminDashboard() {
  const { userId, sessionClaims } = useAuth()
  
  // Convex queries and mutations
  const allUsers = useQuery(api.api.getUsers, { includeInactive: true })
  const updateUser = useMutation(api.api.updateUser)
  const bulkUpdateUsers = useMutation(api.api.bulkUpdateUsers)
  
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('users')

  // Check if current user is admin
  const isAdmin = (sessionClaims?.metadata as any)?.role === 'admin'

  useEffect(() => {
    if (!isAdmin) {
      // Redirect non-admin users
      window.location.href = '/dashboard'
    }
  }, [isAdmin])

  // Initialize filtered users when data loads
  useEffect(() => {
    if (allUsers && allUsers.length >= 0) {
      setFilteredUsers(allUsers)
    }
  }, [allUsers])

  const handleApprove = async (userId: string) => {
    setIsLoading(true)
    try {
      const currentUser = sessionClaims?.metadata as any
      await updateUser({
        userId: userId as any,
        updates: {
          approvalStatus: 'approved',
          approvedBy: currentUser?.email || userId,
          approvedAt: Date.now()
        }
      })
    } catch (error) {
      console.error('Error approving user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async (userId: string) => {
    setIsLoading(true)
    try {
      const currentUser = sessionClaims?.metadata as any
      await updateUser({
        userId: userId as any,
        updates: {
          approvalStatus: 'rejected',
          approvedBy: currentUser?.email || userId
        }
      })
    } catch (error) {
      console.error('Error rejecting user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleUpdate = async (userId: string, newRole: Roles) => {
    setIsLoading(true)
    try {
      await updateUser({
        userId: userId as any,
        updates: { role: newRole }
      })
    } catch (error) {
      console.error('Error updating role:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkUpdate = async (userIds: string[], updates: Partial<UserProfile>) => {
    setIsLoading(true)
    try {
      const currentUser = sessionClaims?.metadata as any
      const bulkUpdates: any = {}
      
      if (updates.approvalStatus) bulkUpdates.approvalStatus = updates.approvalStatus
      if (updates.role) bulkUpdates.role = updates.role
      if (updates.approvalStatus === 'approved') {
        bulkUpdates.approvedBy = currentUser?.email || 'admin'
      }
      
      await bulkUpdateUsers({
        userIds: userIds as any[],
        updates: bulkUpdates
      })
      
      setSelectedUsers([])
    } catch (error) {
      console.error('Error bulk updating users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserProfileUpdate = async (updatedUser: UserProfile) => {
    try {
      await updateUser({
        userId: updatedUser._id as any,
        updates: {
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          address: updatedUser.address,
          dateOfBirth: updatedUser.dateOfBirth,
          emergencyContact: updatedUser.emergencyContact,
          certifications: updatedUser.certifications,
          specializations: updatedUser.specializations,
          yearsExperience: updatedUser.yearsExperience,
          availabilitySchedule: updatedUser.availabilitySchedule,
          notes: updatedUser.notes,
          clientAssignments: updatedUser.clientAssignments,
          performanceRating: updatedUser.performanceRating,
        }
      })
    } catch (error) {
      console.error('Error updating user profile:', error)
    }
  }

  const handleFiltersChange = (filters: any) => {
    let filtered = allUsers || []
    
    // Apply search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower)
      )
    }
    
    // Apply role filters
    if (filters.roles && filters.roles.length > 0) {
      filtered = filtered.filter(user => 
        user.role && filters.roles.includes(user.role)
      )
    }
    
    // Apply status filters
    if (filters.approvalStatuses && filters.approvalStatuses.length > 0) {
      filtered = filtered.filter(user => 
        filters.approvalStatuses.includes(user.approvalStatus || 'pending')
      )
    }
    
    // Apply performance rating filter
    if (filters.performanceRating.min !== null || filters.performanceRating.max !== null) {
      filtered = filtered.filter(user => {
        if (!user.performanceRating) return false
        const min = filters.performanceRating.min || 1
        const max = filters.performanceRating.max || 5
        return user.performanceRating >= min && user.performanceRating <= max
      })
    }
    
    // Apply client assignments filter
    if (filters.clientAssignments !== null) {
      filtered = filtered.filter(user => {
        const hasAssignments = user.clientAssignments && user.clientAssignments.length > 0
        return filters.clientAssignments ? hasAssignments : !hasAssignments
      })
    }
    
    // Apply certifications filter
    if (filters.certifications && filters.certifications.length > 0) {
      filtered = filtered.filter(user => 
        user.certifications && filters.certifications.some((cert: string) => 
          user.certifications?.includes(cert)
        )
      )
    }
    
    setFilteredUsers(filtered)
  }

  const handleUserSelection = (user: UserProfile, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, user])
    } else {
      setSelectedUsers(prev => prev.filter(u => u._id !== user._id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers)
    } else {
      setSelectedUsers([])
    }
  }

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
    }
  }

  const getRoleBadge = (role: Roles | null) => {
    if (!role) return <Badge variant="outline">No Role</Badge>
    
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      public_guardian: 'bg-blue-100 text-blue-800',
      support_coordinator: 'bg-green-100 text-green-800',
      support_worker: 'bg-purple-100 text-purple-800',
      behavior_practitioner: 'bg-orange-100 text-orange-800',
      family: 'bg-pink-100 text-pink-800'
    }
    
    return (
      <Badge className={roleColors[role]}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Comprehensive user administration and monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <BulkUserOperations 
            selectedUsers={selectedUsers}
            onBulkUpdate={handleBulkUpdate}
            onClearSelection={() => setSelectedUsers([])}
          />
          <Button onClick={() => window.location.reload()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Users ({allUsers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allUsers?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allUsers?.filter(u => (u.approvalStatus || 'pending') === 'pending').length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Users</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allUsers?.filter(u => u.approvalStatus === 'approved').length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected Users</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allUsers?.filter(u => u.approvalStatus === 'rejected').length || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Search and Filters */}
          <AdvancedUserSearch 
            onFiltersChange={handleFiltersChange}
            resultsCount={filteredUsers.length}
          />

          {/* Enhanced Users Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Users ({filteredUsers.length})</CardTitle>
                  <CardDescription>Manage user approvals, roles, and profiles</CardDescription>
                </div>
                {selectedUsers.length > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {selectedUsers.length} selected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedUsers.some(u => u._id === user._id)}
                          onCheckedChange={(checked) => handleUserSelection(user, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.phoneNumber && (
                            <div className="text-xs text-gray-400">{user.phoneNumber}</div>
                          )}
                          <div className="text-xs text-gray-400">
                            Joined: {new Date(user.requestedAt || user._creationTime).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Select 
                            value={user.role || ''} 
                            onValueChange={(value) => handleRoleUpdate(user._id, value as Roles)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="No role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public_guardian">Public Guardian</SelectItem>
                              <SelectItem value="support_coordinator">Support Coordinator</SelectItem>
                              <SelectItem value="support_worker">Support Worker</SelectItem>
                              <SelectItem value="behavior_practitioner">Behavior Practitioner</SelectItem>
                              <SelectItem value="family">Family</SelectItem>
                            </SelectContent>
                          </Select>
                          {user.yearsExperience && (
                            <div className="text-xs text-gray-500">
                              {user.yearsExperience} years exp.
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.approvalStatus || 'pending')}</TableCell>
                      <TableCell>
                        {user.performanceRating ? (
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium">{user.performanceRating}/5</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span 
                                  key={star} 
                                  className={`text-xs ${star <= user.performanceRating! ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                  ⭐
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not rated</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.lastLoginAt ? (
                            <>
                              <div>{new Date(user.lastLoginAt).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(user.lastLoginAt).toLocaleTimeString()}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <UserProfileModal 
                            user={user}
                            onUpdate={handleUserProfileUpdate}
                            trigger={
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            }
                          />
                          {(user.approvalStatus || 'pending') === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleApprove(user._id)}
                                disabled={isLoading}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleReject(user._id)}
                                disabled={isLoading}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {user.approvalStatus === 'rejected' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleApprove(user._id)}
                              disabled={isLoading}
                            >
                              Re-approve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {!allUsers && (
                <div className="text-center py-8">
                  <div className="animate-pulse">
                    <div className="text-gray-500">Loading users...</div>
                  </div>
                </div>
              )}
              
              {allUsers && allUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No users found</h3>
                  <p className="text-gray-500">Users will appear here once they register for the platform.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <UserActivityDashboard />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide user management settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Settings Panel</h3>
                <p className="text-sm">System configuration options will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}