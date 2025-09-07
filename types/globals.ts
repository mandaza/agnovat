export {}

// Create a type for the roles
export type Roles = 'admin' | 'public_guardian' | 'support_coordinator' | 'support_worker' | 'behavior_practitioner' | 'family'

// Approval status types
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
      approvalStatus?: ApprovalStatus
      approvedBy?: string
      approvedAt?: string
      requestedAt?: string
    }
  }
}