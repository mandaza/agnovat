'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { useUserRealtime } from '@/hooks/use-user-realtime'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Clock, AlertTriangle } from 'lucide-react'

export type UserRole = "admin" | "public_guardian" | "support_worker" | "behavior_practitioner" | "family" | "support_coordinator"
export type ApprovalStatus = "pending" | "approved" | "rejected"

interface AccessGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
  fallback?: React.ReactNode
  requireApproval?: boolean
  adminOnly?: boolean
}

export function AccessGuard({ 
  children, 
  requiredRole, 
  fallback,
  requireApproval = true,
  adminOnly = false
}: AccessGuardProps) {
  const { convexUser, isLoading, clerkUserId } = useUserRealtime()
  const router = useRouter()
  const [accessState, setAccessState] = useState<'loading' | 'approved' | 'pending' | 'rejected' | 'no_access'>('loading')

  // Role hierarchy for permission checking
  const roleHierarchy: Record<UserRole, number> = useMemo(() => ({
    admin: 100,
    public_guardian: 80,
    support_coordinator: 70,
    behavior_practitioner: 60,
    support_worker: 50,
    family: 30
  }), [])

  useEffect(() => {
    // Still loading user data
    if (isLoading || !clerkUserId) {
      setAccessState('loading')
      return
    }

    // No Clerk user - redirect to sign in
    if (!clerkUserId) {
      router.push('/sign-in')
      return
    }

    // User not found in Convex (shouldn't happen but handle gracefully)
    if (!convexUser) {
      setAccessState('pending')
      return
    }

    // Check approval status
    if (requireApproval) {
      if (convexUser.approvalStatus === 'rejected') {
        setAccessState('rejected')
        return
      }
      
      if (convexUser.approvalStatus === 'pending') {
        setAccessState('pending')
        return
      }
      
      if (convexUser.approvalStatus !== 'approved') {
        setAccessState('pending')
        return
      }
    }

    // Admin-only check
    if (adminOnly && convexUser.role !== 'admin') {
      setAccessState('no_access')
      return
    }

    // Role-based access check
    if (requiredRole) {
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      const userRole = convexUser.role
      
      if (!userRole) {
        setAccessState('pending')
        return
      }

      // Check if user has any of the required roles
      const hasRequiredRole = requiredRoles.some(role => {
        // Direct role match
        if (userRole === role) return true
        
        // Check if user has higher-level permissions
        return roleHierarchy[userRole] >= roleHierarchy[role]
      })

      if (!hasRequiredRole) {
        setAccessState('no_access')
        return
      }
    }

    // User has access
    setAccessState('approved')
  }, [convexUser, isLoading, clerkUserId, requiredRole, requireApproval, adminOnly, router, roleHierarchy])

  // Loading state
  if (accessState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    )
  }

  // User has access - render children
  if (accessState === 'approved') {
    return <>{children}</>
  }

  // Custom fallback
  if (fallback) {
    return <>{fallback}</>
  }

  // Pending approval state
  if (accessState === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
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
                Current Status: <span className="font-medium capitalize text-yellow-600">Pending Approval</span>
              </p>
              <div className="space-y-2">
                <p className="text-xs text-gray-400">
                  You will receive access once an administrator reviews your account.
                </p>
                <Button 
                  onClick={() => router.push('/approval-pending')}
                  className="w-full"
                >
                  View Status Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Rejected state
  if (accessState === 'rejected') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Access Denied
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your account access has been denied by an administrator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                Current Status: <span className="font-medium capitalize text-red-600">Rejected</span>
              </p>
              <div className="space-y-2">
                <p className="text-xs text-gray-400">
                  If you believe this is an error, please contact your administrator.
                </p>
                <Button 
                  onClick={() => router.push('/approval-pending')}
                  variant="outline"
                  className="w-full"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No access due to insufficient role
  if (accessState === 'no_access') {
    const requiredRolesList = Array.isArray(requiredRole) ? requiredRole : requiredRole ? [requiredRole] : []
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Insufficient Permissions
            </CardTitle>
            <CardDescription className="text-gray-600">
              You don&apos;t have permission to access this feature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              {requiredRolesList.length > 0 && (
                <p className="text-sm text-gray-500">
                  Required Role{requiredRolesList.length > 1 ? 's' : ''}: {' '}
                  <span className="font-medium">
                    {requiredRolesList.map(role => role.replace('_', ' ')).join(', ')}
                  </span>
                </p>
              )}
              <p className="text-sm text-gray-500">
                Your Role: <span className="font-medium capitalize">
                  {convexUser?.role?.replace('_', ' ') || 'None'}
                </span>
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

  // Fallback - should not reach here
  return null
}