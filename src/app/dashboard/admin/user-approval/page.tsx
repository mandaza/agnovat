"use client"

import { AccessGuard } from "@/components/access-guard"
import { UserManagement } from "@/components/admin/user-management"

export default function UserApprovalPage() {
  return (
    <AccessGuard adminOnly={true} requireApproval={true}>
      <div className="container mx-auto py-6">
        <UserManagement />
      </div>
    </AccessGuard>
  )
}