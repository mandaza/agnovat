"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useAuth, useUser } from "@clerk/nextjs"
import { useEffect, useRef } from "react"

export function useUserRealtime() {
  const { userId: clerkUserId } = useAuth()
  const { user } = useUser()
  const createUserMutation = useMutation(api.api.createUser)
  const creationAttempted = useRef(false)
  
  // Get the Convex user ID from Clerk user ID
  const convexUser = useQuery(api.api.getUserByClerkId, 
    clerkUserId ? { clerkId: clerkUserId } : "skip"
  )
  
  // Create user in Convex database if they don't exist
  useEffect(() => {
    const createUserIfNeeded = async () => {
      // Only attempt creation once per session and when we're sure user doesn't exist
      if (clerkUserId && user && convexUser === null && !creationAttempted.current) {
        creationAttempted.current = true
        
        // User is authenticated but doesn't exist in Convex database
        try {
          console.log("Creating user in Convex:", clerkUserId)
          await createUserMutation({
            clerkId: clerkUserId,
            email: user.primaryEmailAddress?.emailAddress || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            // No role assignment - will be set by admin during approval
            // No approvalStatus override - defaults to "pending" in mutation
          })
          console.log("User created successfully in Convex")
        } catch (error) {
          console.error("Error creating user in Convex database:", error)
          // Reset flag on error so it can be retried
          creationAttempted.current = false
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