'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Roles, ApprovalStatus } from '../../types/globals'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Clock } from 'lucide-react'

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: Roles
  fallback?: React.ReactNode
  showApprovalPending?: boolean
}

export function RoleGuard({ 
  children, 
  requiredRole, 
  fallback,
  showApprovalPending = true 
}: RoleGuardProps) {
  const { userId, sessionClaims, isLoaded } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    if (!isLoaded) return

    if (!userId) {
      router.push('/sign-in')
      return
    }

    const metadata = sessionClaims?.metadata as { approvalStatus?: string; role?: string }
    const approvalStatus = metadata?.approvalStatus as ApprovalStatus
    const userRole = metadata?.role as Roles

    // Check approval status first
    if (approvalStatus !== 'approved') {
      if (approvalStatus === 'pending' && showApprovalPending) {
        router.push('/approval-pending')
        return
      } else if (approvalStatus === 'rejected') {
        router.push('/approval-pending')
        return
      }
    }

    // Check role permissions if required
    if (requiredRole && userRole !== requiredRole) {
      // Check if user has higher role permissions
      const roleHierarchy: Record<Roles, number> = {
        admin: 100,
        public_guardian: 80,
        support_coordinator: 70,
        behavior_practitioner: 60,
        support_worker: 50,
        family: 30
      }

      if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
        // User doesn't have sufficient permissions
        setHasAccess(false)
        setIsChecking(false)
        return
      }
    }

    // User has access
    setHasAccess(true)
    setIsChecking(false)
  }, [userId, sessionClaims, isLoaded, requiredRole, router, showApprovalPending])

  if (!isLoaded || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!userId) {
    return null // Will redirect to sign-in
  }

  const metadata = sessionClaims?.metadata as { approvalStatus?: string; role?: string }
  const approvalStatus = metadata?.approvalStatus as ApprovalStatus
  const userRole = metadata?.role as Roles

  // Show approval pending if user is not approved
  if (approvalStatus !== 'approved') {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Approval Required
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your account needs administrator approval to access this feature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Current Status: <span className="font-medium capitalize">{approvalStatus}</span>
              </p>
              <Button 
                onClick={() => router.push('/approval-pending')}
                className="w-full"
              >
                Check Approval Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check role permissions
  if (requiredRole && userRole !== requiredRole) {
    const roleHierarchy: Record<Roles, number> = {
      admin: 100,
      public_guardian: 80,
      support_coordinator: 70,
      behavior_practitioner: 60,
      support_worker: 50,
      family: 30
    }

    if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
      if (fallback) {
        return <>{fallback}</>
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Access Denied
              </CardTitle>
              <CardDescription className="text-gray-600">
                You don&apos;t have permission to access this feature
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">
                  Required Role: <span className="font-medium capitalize">{requiredRole.replace('_', ' ')}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Your Role: <span className="font-medium capitalize">{userRole?.replace('_', ' ') || 'None'}</span>
                </p>
                <Button 
                  onClick={() => router.push('/dashboard')} 
                  variant="outline"
                  className="w-full"
                >
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  // User has access, render children
  return <>{children}</>
}
