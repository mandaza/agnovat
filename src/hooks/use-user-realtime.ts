"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useAuth, useUser } from "@clerk/nextjs"
import { useEffect } from "react"

export function useUserRealtime() {
  const { userId: clerkUserId } = useAuth()
  const { user } = useUser()
  const createUserMutation = useMutation(api.api.createUser)
  
  // Get the Convex user ID from Clerk user ID
  const convexUser = useQuery(api.api.getUserByClerkId, 
    clerkUserId ? { clerkId: clerkUserId } : "skip"
  )
  
  // Create user in Convex database if they don't exist
  useEffect(() => {
    const createUserIfNeeded = async () => {
      if (clerkUserId && user && convexUser === null) {
        // User is authenticated but doesn't exist in Convex database
        try {
          await createUserMutation({
            clerkId: clerkUserId,
            email: user.primaryEmailAddress?.emailAddress || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            role: "support_worker", // Default role - should be changed by admin
          })
        } catch (error) {
          console.error("Error creating user in Convex database:", error)
        }
      }
    }
    
    createUserIfNeeded()
  }, [clerkUserId, user, convexUser, createUserMutation])
  
  return {
    convexUser,
    isLoading: convexUser === undefined,
    clerkUserId,
  }
}