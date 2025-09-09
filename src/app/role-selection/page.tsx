'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Roles } from "../../../types/globals"
import { 
  Shield, 
  Heart, 
  Brain, 
  Home, 
  UserCheck,
  Briefcase 
} from "lucide-react"

const roleOptions: Array<{
  value: Roles
  label: string
  description: string
  icon: React.ReactNode
  color: string
}> = [
  {
    value: 'admin',
    label: 'Administrator',
    description: 'Full system access and user management',
    icon: <Shield className="w-6 h-6" />,
    color: 'bg-red-100 text-red-700 border-red-200'
  },
  {
    value: 'public_guardian',
    label: 'Public Guardian',
    description: 'Legal representation and decision making',
    icon: <UserCheck className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    value: 'support_coordinator',
    label: 'Support Coordinator',
    description: 'Coordinate support services and planning',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    value: 'support_worker',
    label: 'Support Worker',
    description: 'Direct support and care provision',
    icon: <Heart className="w-6 h-6" />,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  {
    value: 'behavior_practitioner',
    label: 'Behavior Practitioner',
    description: 'Specialized behavior support and therapy',
    icon: <Brain className="w-6 h-6" />,
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  {
    value: 'family',
    label: 'Family Member',
    description: 'Family representation and involvement',
    icon: <Home className="w-6 h-6" />,
    color: 'bg-pink-100 text-pink-700 border-pink-200'
  }
]

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<Roles | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useUser()

  const handleRoleSelection = async () => {
    if (!selectedRole) return
    
    setIsSubmitting(true)
    
    try {
      // Here you would typically update the user's role in Clerk
      // For now, we'll simulate the process and redirect
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to dashboard after role selection
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Error updating role:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Role
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Welcome {user?.firstName || 'User'}! Please select the role that best describes your position 
            and responsibilities within the system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {roleOptions.map((role) => (
            <Card 
              key={role.value}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedRole === role.value 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:scale-105'
              }`}
              onClick={() => setSelectedRole(role.value)}
            >
              <CardHeader className="text-center pb-3">
                <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3">
                  {role.icon}
                </div>
                <CardTitle className="text-lg">{role.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  {role.description}
                </p>
                <Badge className={role.color}>
                  {role.value.replace('_', ' ').toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg"
            disabled={!selectedRole || isSubmitting}
            onClick={handleRoleSelection}
            className="px-8"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Updating Role...
              </>
            ) : (
              'Continue to Dashboard'
            )}
          </Button>
          
          {selectedRole && (
            <p className="text-sm text-gray-500 mt-3">
              Selected: <span className="font-medium">{roleOptions.find(r => r.value === selectedRole)?.label}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
