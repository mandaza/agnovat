'use client'

import { useUser, useAuth } from "@clerk/nextjs"
import { useQuery, useAction } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function DebugUserPage() {
  const { user, isLoaded } = useUser()
  const { getToken, sessionClaims } = useAuth()
  const [testResult, setTestResult] = useState<any>(null)
  const testClerkSync = useAction(api.api.testClerkSync)
  const convexUser = useQuery(api.api.getUserByClerkId, 
    user?.id ? { clerkId: user.id } : "skip"
  )

  const handleTestSync = async () => {
    if (!user?.id) return
    try {
      const result = await testClerkSync({ clerkId: user.id })
      setTestResult(result)
    } catch (error) {
      setTestResult({ error: error.toString() })
    }
  }

  const handleRefreshSession = async () => {
    try {
      // Force Clerk to refresh the session by getting a new token
      await getToken()
      // Small delay to ensure token is refreshed
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('Error refreshing session:', error)
      // Fallback: just reload the page
      window.location.reload()
    }
  }

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Not signed in</div>
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">User Debug Info</h1>
        
        <div className="flex gap-4 mb-6">
          <Button onClick={handleTestSync}>Test Clerk Sync</Button>
          <Button onClick={handleRefreshSession} variant="outline">Refresh Session</Button>
        </div>

        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle>Test Sync Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Clerk User Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><strong>User ID:</strong> {user.id}</div>
            <div><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</div>
            <div><strong>Name:</strong> {user.firstName} {user.lastName}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clerk Session Claims</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><strong>Public Metadata:</strong></div>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(sessionClaims?.publicMetadata || {}, null, 2)}
            </pre>
            <div><strong>Private Metadata:</strong></div>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(sessionClaims?.privateMetadata || {}, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Convex User Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {convexUser === undefined && <div>Loading Convex user...</div>}
            {convexUser === null && <div>No Convex user found</div>}
            {convexUser && (
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify({
                  _id: convexUser._id,
                  email: convexUser.email,
                  firstName: convexUser.firstName,
                  lastName: convexUser.lastName,
                  role: convexUser.role,
                  approvalStatus: convexUser.approvalStatus,
                  isActive: convexUser.isActive,
                  approvedAt: convexUser.approvedAt,
                }, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}