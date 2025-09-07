import { Roles, ApprovalStatus } from '../types/globals'
import { auth } from '@clerk/nextjs/server'

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth()
  return sessionClaims?.metadata.role === role
}

export const checkApprovalStatus = async (): Promise<ApprovalStatus | null> => {
  const { sessionClaims } = await auth()
  return (sessionClaims?.metadata as any)?.approvalStatus || null
}

export const checkUserAccess = async (requiredRole?: Roles) => {
  const { sessionClaims } = await auth()
  const metadata = sessionClaims?.metadata as any
  
  // Check if user is approved
  if (metadata?.approvalStatus !== 'approved') {
    return { hasAccess: false, reason: 'User not approved' }
  }
  
  // Check if user has required role
  if (requiredRole && metadata?.role !== requiredRole) {
    return { hasAccess: false, reason: 'Insufficient role permissions' }
  }
  
  return { hasAccess: true, reason: null }
}

export const isAdmin = async (): Promise<boolean> => {
  const { sessionClaims } = await auth()
  return (sessionClaims?.metadata as any)?.role === 'admin'
}

export const getUserRole = async (): Promise<Roles | null> => {
  const { sessionClaims } = await auth()
  return (sessionClaims?.metadata as any)?.role || null
}

export const getUserApprovalStatus = async (): Promise<ApprovalStatus | null> => {
  const { sessionClaims } = await auth()
  return (sessionClaims?.metadata as any)?.approvalStatus || null
}

// Role hierarchy for permission checking
export const ROLE_HIERARCHY: Record<Roles, number> = {
  admin: 100,
  public_guardian: 80,
  support_coordinator: 70,
  behavior_practitioner: 60,
  support_worker: 50,
  family: 30
}

export const hasRolePermission = (userRole: Roles, requiredRole: Roles): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}