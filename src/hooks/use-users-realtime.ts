"use client"

import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"

export function useUsersRealtime(role?: "admin" | "support_worker" | "behavior_practitioner" | "family" | "support_coordinator") {
  const users = useQuery(api.api.getUsers, role ? { role } : {}) || []
  
  return {
    users,
    isLoading: users === undefined,
    error: null,
  }
}