'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface DashboardWrapperProps {
  children: React.ReactNode
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  const { userId, sessionClaims, isLoaded } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    if (!userId) {
      router.push('/sign-in')
      return
    }

    const metadata = sessionClaims?.metadata as { approvalStatus?: string; role?: string }
    const approvalStatus = metadata?.approvalStatus
    const role = metadata?.role

    // If user is not approved and not on approval page, redirect
    if (approvalStatus !== 'approved' && pathname !== '/approval-pending') {
      router.push('/approval-pending')
      return
    }

    // If user is approved but has no role and not on role selection, redirect
    if (approvalStatus === 'approved' && !role && pathname !== '/role-selection') {
      router.push('/role-selection')
      return
    }

    setIsChecking(false)
  }, [userId, sessionClaims, isLoaded, router, pathname])

  if (!isLoaded || isChecking) {
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
