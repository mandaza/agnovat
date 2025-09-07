'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, UserCheck, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { SignOutButton } from "@clerk/nextjs"

export default function ApprovalPendingPage() {
  const router = useRouter()

  

  const handleCheckStatus = () => {
    // Refresh the page to check if approval status has changed
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl bg-white">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Approval Pending
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your account is currently under review by our administrators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <UserCheck className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Account Review</p>
                <p className="text-sm text-gray-600">
                  Our team is reviewing your registration details
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">What Happens Next?</p>
                <p className="text-sm text-gray-600">
                  You'll receive an email notification once your account is approved
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              This process typically takes 24-48 hours. 
              If you have urgent access needs, please contact support.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <SignOutButton>
              <Button variant="outline" className="flex-1" >
                Sign Out
              </Button>
            </SignOutButton>
            
            <Button className="flex-1" onClick={handleCheckStatus}>
              Check Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
