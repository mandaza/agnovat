'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useUserRealtime } from '@/hooks/use-user-realtime'

interface DashboardWrapperProps {
  children: React.ReactNode
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  const { userId, isLoaded } = useAuth()
  const { convexUser, isLoading } = useUserRealtime()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoaded || isLoading) return

    if (!userId) {
      router.push('/sign-in')
      return
    }

    // If no convex user found, redirect to approval pending
    if (!convexUser) {
      router.push('/approval-pending')
      return
    }

    const approvalStatus = convexUser.approvalStatus
    const role = convexUser.role

    // If user is not approved and not on approval page, redirect
    if (approvalStatus !== 'approved' && pathname !== '/approval-pending') {
      router.push('/approval-pending')
      return
    }

    // If user is approved but has no role, still redirect to approval pending
    // (admin will assign role during approval process)
    if (approvalStatus === 'approved' && !role && pathname !== '/approval-pending') {
      router.push('/approval-pending')
      return
    }

    setIsChecking(false)
  }, [userId, convexUser, isLoaded, isLoading, router, pathname])

  if (!isLoaded || isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
