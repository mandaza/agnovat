import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
])

const isApprovalRoute = createRouteMatcher([
  '/approval-pending',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, sessionClaims } = await auth()
    
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Check if user is approved
    const metadata = sessionClaims?.metadata as { approvalStatus?: string; role?: string }
    const approvalStatus = metadata?.approvalStatus
    const role = metadata?.role

    // If user is not approved and not already on approval page, redirect to approval pending
    if (approvalStatus !== 'approved' && !isApprovalRoute(req)) {
      return NextResponse.redirect(new URL('/approval-pending', req.url))
    }

    // If user is approved but has no role, redirect to role selection (optional)
    if (approvalStatus === 'approved' && !role && !isApprovalRoute(req)) {
      return NextResponse.redirect(new URL('/role-selection', req.url))
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}