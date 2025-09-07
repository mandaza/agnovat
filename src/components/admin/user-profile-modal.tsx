'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  User, 
  Edit3, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Award, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin,
  Activity,
  FileText,
  Users
} from 'lucide-react'
import { Roles, ApprovalStatus } from '../../../types/globals'
import { UserProfile } from '../../../types/user-profile'

interface UserProfileModalProps {
  user: UserProfile
  onUpdate: (updatedUser: UserProfile) => void
  trigger?: React.ReactNode
}

export function UserProfileModal({ user, onUpdate, trigger }: UserProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<UserProfile>(user)
  const [isLoading, setIsLoading] = useState(false)

  const updateUser = useMutation(api.api.updateUser)
  
  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateUser({
        userId: user._id as any,
        updates: {
          email: editedUser.email,
          firstName: editedUser.firstName,
          lastName: editedUser.lastName,
          role: editedUser.role,
          phoneNumber: editedUser.phoneNumber,
          address: editedUser.address,
          emergencyContact: editedUser.emergencyContact,
          yearsExperience: editedUser.yearsExperience,
          performanceRating: editedUser.performanceRating,
          availabilitySchedule: editedUser.availabilitySchedule,
          notes: editedUser.notes,
        }
      })
      onUpdate(editedUser)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating user profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: ApprovalStatus | undefined) => {
    if (!status) return <Badge variant="outline">No Status</Badge>
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
    }
  }

  const getRoleBadge = (role: Roles | null | undefined) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <User className="w-4 h-4 mr-1" />
            View Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={isLoading}
            >
              <Edit3 className="w-4 h-4 mr-1" />
              {isEditing ? (isLoading ? 'Saving...' : 'Save') : 'Edit'}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    {user.approvalStatus ? getStatusBadge(user.approvalStatus) : <Badge variant="outline">No Status</Badge>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Role:</span>
                    {isEditing ? (
                      <Select 
                        value={editedUser.role || ''} 
                        onValueChange={(value) => setEditedUser({...editedUser, role: value as Roles})}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public_guardian">Public Guardian</SelectItem>
                          <SelectItem value="support_coordinator">Support Coordinator</SelectItem>
                          <SelectItem value="support_worker">Support Worker</SelectItem>
                          <SelectItem value="behavior_practitioner">Behavior Practitioner</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getRoleBadge(user.role || null)
                    )}
                  </div>
                  {user.requestedAt && (
                    <div className="text-xs text-gray-500">
                      Requested: {new Date(user.requestedAt).toLocaleDateString()}
                    </div>
                  )}
                  {user.approvedAt && (
                    <div className="text-xs text-gray-500">
                      Approved: {new Date(user.approvedAt).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={isEditing ? editedUser.email : user.email}
                      onChange={(e) => isEditing && setEditedUser({...editedUser, email: e.target.value})}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={isEditing ? editedUser.phoneNumber || '' : user.phoneNumber || ''}
                      onChange={(e) => isEditing && setEditedUser({...editedUser, phoneNumber: e.target.value})}
                      readOnly={!isEditing}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={isEditing ? editedUser.address || '' : user.address || ''}
                      onChange={(e) => isEditing && setEditedUser({...editedUser, address: e.target.value})}
                      readOnly={!isEditing}
                      placeholder="Enter address"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {user.emergencyContact && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={isEditing ? editedUser.emergencyContact?.name || '' : user.emergencyContact?.name || ''}
                      onChange={(e) => isEditing && setEditedUser({
                        ...editedUser, 
                        emergencyContact: {...editedUser.emergencyContact!, name: e.target.value}
                      })}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={isEditing ? editedUser.emergencyContact?.phone || '' : user.emergencyContact?.phone || ''}
                      onChange={(e) => isEditing && setEditedUser({
                        ...editedUser, 
                        emergencyContact: {...editedUser.emergencyContact!, phone: e.target.value}
                      })}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Input
                      value={isEditing ? editedUser.emergencyContact?.relationship || '' : user.emergencyContact?.relationship || ''}
                      onChange={(e) => isEditing && setEditedUser({
                        ...editedUser, 
                        emergencyContact: {...editedUser.emergencyContact!, relationship: e.target.value}
                      })}
                      readOnly={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="professional" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={isEditing ? editedUser.yearsExperience || '' : user.yearsExperience || ''}
                      onChange={(e) => isEditing && setEditedUser({...editedUser, yearsExperience: parseInt(e.target.value)})}
                      readOnly={!isEditing}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Performance Rating</Label>
                    <Select 
                      value={isEditing ? editedUser.performanceRating?.toString() || '' : user.performanceRating?.toString() || ''}
                      onValueChange={(value) => isEditing && setEditedUser({...editedUser, performanceRating: parseInt(value)})}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent (5)</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ Good (4)</SelectItem>
                        <SelectItem value="3">⭐⭐⭐ Average (3)</SelectItem>
                        <SelectItem value="2">⭐⭐ Below Average (2)</SelectItem>
                        <SelectItem value="1">⭐ Needs Improvement (1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Availability Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={isEditing ? 
                            editedUser.availabilitySchedule?.[day as keyof typeof editedUser.availabilitySchedule] || false :
                            user.availabilitySchedule?.[day as keyof typeof user.availabilitySchedule] || false
                          }
                          onCheckedChange={(checked) => isEditing && setEditedUser({
                            ...editedUser,
                            availabilitySchedule: {
                              ...editedUser.availabilitySchedule!,
                              [day]: checked
                            }
                          })}
                          disabled={!isEditing}
                        />
                        <Label htmlFor={day} className="capitalize">
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Certifications & Specializations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Certifications</Label>
                  <div className="flex flex-wrap gap-2">
                    {(user.certifications || []).map((cert, index) => (
                      <Badge key={index} variant="outline">{cert}</Badge>
                    ))}
                    {(!user.certifications || user.certifications.length === 0) && (
                      <span className="text-sm text-gray-500">No certifications added</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Specializations</Label>
                  <div className="flex flex-wrap gap-2">
                    {(user.specializations || []).map((spec, index) => (
                      <Badge key={index} variant="secondary">{spec}</Badge>
                    ))}
                    {(!user.specializations || user.specializations.length === 0) && (
                      <span className="text-sm text-gray-500">No specializations added</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Client Assignments
                </CardTitle>
                <CardDescription>
                  Clients currently assigned to this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.clientAssignments && user.clientAssignments.length > 0 ? (
                  <div className="space-y-2">
                    {user.clientAssignments.map((clientId, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Client {clientId}</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No client assignments</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.lastLoginAt && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Last Login</span>
                      <span className="text-sm font-medium">
                        {new Date(user.lastLoginAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Activity logs will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isEditing && (
          <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsEditing(false)
              setEditedUser(user)
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}