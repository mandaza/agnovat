'use client'

import { useUserRealtime } from "@/hooks/use-user-realtime"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, UserCheck, AlertCircle, AlertTriangle, CheckCircle, Mail, Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import { SignOutButton } from "@clerk/nextjs"
import Link from "next/link"

export default function ApprovalPendingPage() {
  const router = useRouter()
  const { convexUser, isLoading } = useUserRealtime()
  
  const approvalStatus = convexUser?.approvalStatus
  const isApproved = approvalStatus === 'approved'
  const isRejected = approvalStatus === 'rejected'
  const isPending = approvalStatus === 'pending'

  // Remove automatic redirect - let user choose when to go to dashboard
  // useEffect(() => {
  //   if (isApproved && convexUser?.role) {
  //     router.push('/dashboard')
  //   }
  // }, [isApproved, convexUser?.role, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading account status...</p>
        </div>
      </div>
    )
  }

  const handleCheckStatus = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Main Status Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
              isRejected 
                ? 'bg-red-100'
                : isPending 
                  ? 'bg-yellow-100'
                  : isApproved
                    ? 'bg-green-100'
                    : 'bg-gray-100'
            }`}>
              {isRejected ? (
                <AlertTriangle className="w-8 h-8 text-red-600" />
              ) : isPending ? (
                <Clock className="w-8 h-8 text-yellow-600" />
              ) : isApproved ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <UserCheck className="w-8 h-8 text-gray-600" />
              )}
            </div>
            <CardTitle className={`text-2xl font-bold ${
              isRejected
                ? 'text-red-900'
                : isPending
                  ? 'text-yellow-900'
                  : isApproved
                    ? 'text-green-900'
                    : 'text-gray-900'
            }`}>
              {isRejected ? 'Access Denied' 
               : isPending ? 'Approval Pending'
               : isApproved ? 'Account Approved'
               : 'Account Status Unknown'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isRejected 
                ? 'Your account access has been denied by our administrators'
                : isPending
                  ? 'Your account is currently under review by our administrators'
                  : isApproved
                    ? 'Your account has been approved and is ready to use'
                    : 'Unable to determine account status'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Account Details */}
            {convexUser && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p><span className="font-medium">Name:</span> {convexUser.firstName} {convexUser.lastName}</p>
                  <p><span className="font-medium">Email:</span> {convexUser.email}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      isRejected ? 'bg-red-100 text-red-800'
                      : isPending ? 'bg-yellow-100 text-yellow-800'
                      : isApproved ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                      {approvalStatus ? approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1) : 'Unknown'}
                    </span>
                  </p>
                  {convexUser.role && (
                    <p><span className="font-medium">Role:</span> {convexUser.role.replace('_', ' ')}</p>
                  )}
                  {convexUser.requestedAt && (
                    <p className="col-span-full"><span className="font-medium">Requested:</span> {new Date(convexUser.requestedAt).toLocaleString()}</p>
                  )}
                  {convexUser.approvedAt && (
                    <p className="col-span-full">
                      <span className="font-medium">{isRejected ? 'Rejected:' : 'Approved:'}</span> {new Date(convexUser.approvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Status-specific content */}
            <div className="space-y-4">
              {isPending && (
                <>
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
                        You&apos;ll gain access once your account is approved and a role is assigned
                      </p>
                    </div>
                  </div>
                </>
              )}

              {isRejected && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Access Denied</p>
                      <p className="text-sm text-red-700 mt-1">
                        Your account request was not approved. If you believe this is an error, please contact support.
                      </p>
                      {convexUser?.notes && (
                        <p className="text-sm text-red-700 mt-2 font-medium">
                          Reason: {convexUser.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isApproved && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Account Approved!</p>
                      <p className="text-sm text-green-700 mt-1">
                        Your account has been approved. You can now access the dashboard.
                      </p>
                      {convexUser?.role && (
                        <p className="text-sm text-green-700 mt-1">
                          <span className="font-medium">Assigned Role:</span> {convexUser.role.replace('_', ' ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {isPending && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  This process typically takes 24-48 hours. 
                  If you have urgent access needs, please contact support.
                </p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <SignOutButton>
                <Button variant="outline" className="flex-1">
                  Sign Out
                </Button>
              </SignOutButton>
              
              {!isRejected && (
                <Button className="flex-1" onClick={handleCheckStatus}>
                  Refresh Status
                </Button>
              )}

              {isApproved && convexUser?.role && (
                <Button className="flex-1" onClick={() => router.push('/dashboard')}>
                  Go to Dashboard
                </Button>
              )}

              {isRejected && (
                <Button asChild className="flex-1">
                  <Link href="mailto:support@ndiplatform.com">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-center">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <p className="text-gray-600 text-sm">
              If you have questions about your account status or need immediate assistance, 
              please contact our support team.
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm">
              <a href="mailto:support@ndiplatform.com" className="text-blue-600 hover:underline flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                support@ndiplatform.com
              </a>
              <span className="text-gray-400">|</span>
              <a href="tel:+1234567890" className="text-blue-600 hover:underline flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                (123) 456-7890
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
