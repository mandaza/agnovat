"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"

export interface UserApprovalData {
  userId: Id<"users">
  assignedRole: "admin" | "public_guardian" | "support_worker" | "behavior_practitioner" | "family" | "support_coordinator"
}

export function useUserApproval() {
  // Queries
  const pendingUsers = useQuery(api.api.getPendingUsers) || []
  const approvedUsers = useQuery(api.api.getUsersByApprovalStatus, { status: "approved" }) || []
  const rejectedUsers = useQuery(api.api.getUsersByApprovalStatus, { status: "rejected" }) || []

  // Mutations
  const approveUserMutation = useMutation(api.api.approveUser)
  const rejectUserMutation = useMutation(api.api.rejectUser)
  const bulkApproveUsersMutation = useMutation(api.api.bulkApproveUsers)
  const resetUserToPendingMutation = useMutation(api.api.resetUserToPending)

  // Actions
  const approveUser = async (
    userId: Id<"users">, 
    assignedRole: UserApprovalData["assignedRole"],
    approvedByUserId: Id<"users">
  ) => {
    try {
      const result = await approveUserMutation({
        userId,
        assignedRole,
        approvedByUserId,
      })
      return result
    } catch (error) {
      console.error('Error approving user:', error)
      throw error
    }
  }

  const rejectUser = async (
    userId: Id<"users">, 
    rejectedByUserId: Id<"users">,
    rejectionReason?: string
  ) => {
    try {
      const result = await rejectUserMutation({
        userId,
        rejectedByUserId,
        rejectionReason,
      })
      return result
    } catch (error) {
      console.error('Error rejecting user:', error)
      throw error
    }
  }

  const bulkApproveUsers = async (
    approvals: UserApprovalData[],
    approvedByUserId: Id<"users">
  ) => {
    try {
      const result = await bulkApproveUsersMutation({
        approvals,
        approvedByUserId,
      })
      return result
    } catch (error) {
      console.error('Error bulk approving users:', error)
      throw error
    }
  }

  const resetUserToPending = async (
    userId: Id<"users">,
    resetByUserId: Id<"users">
  ) => {
    try {
      const result = await resetUserToPendingMutation({
        userId,
        resetByUserId,
      })
      return result
    } catch (error) {
      console.error('Error resetting user to pending:', error)
      throw error
    }
  }

  return {
    // Data
    pendingUsers,
    approvedUsers,
    rejectedUsers,
    
    // Actions
    approveUser,
    rejectUser,
    bulkApproveUsers,
    resetUserToPending,
    
    // Stats
    pendingCount: pendingUsers.length,
    approvedCount: approvedUsers.length,
    rejectedCount: rejectedUsers.length,
  }
}