'use client'

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useAction } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function AdminSetupPage() {
  const { user, isLoaded } = useUser()
  const createAdminUser = useAction(api.api.createAdminUser)
  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to create an admin account.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleCreateAdmin = async () => {
    if (!user) return

    setIsCreating(true)
    setError(null)
    setResult(null)

    try {
      await createAdminUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      })

      setResult(`Admin user created successfully! Refreshing session...`)
      
      // Force a complete page refresh to ensure Clerk gets the new session
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
      
    } catch (err) {
      setError(`Failed to create admin user: ${err}`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Setup</CardTitle>
          <CardDescription>
            Create an admin account for the current user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="text-sm">
              <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
            </div>
            <div className="text-sm">
              <span className="font-medium">Email:</span> {user.primaryEmailAddress?.emailAddress}
            </div>
            <div className="text-sm">
              <span className="font-medium">Clerk ID:</span> {user.id}
            </div>
          </div>

          {/* Result Messages */}
          {result && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{result}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Button */}
          <Button 
            onClick={handleCreateAdmin} 
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? "Creating Admin User..." : "Create Admin Account"}
          </Button>

          {result && (
            <div className="text-center text-sm text-gray-600">
              Redirecting to dashboard...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}