import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
])


const isAdminSetupRoute = createRouteMatcher([
  '/admin-setup',
])

const isDebugRoute = createRouteMatcher([
  '/debug-user',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) && !isAdminSetupRoute(req) && !isDebugRoute(req)) {
    const { userId, sessionClaims } = await auth()
    
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // TEMPORARY FIX: Allow your specific user ID to bypass metadata check
    // Replace this with your actual Clerk user ID
    
    console.log('Middleware check:', { 
      userId, 
      path: req.nextUrl.pathname,
      sessionMetadata: sessionClaims?.publicMetadata 
    })

    // Check session metadata first
    const publicMetadata = sessionClaims?.publicMetadata as { approvalStatus?: string; role?: string }
    const approvalStatus = publicMetadata?.approvalStatus
    const role = publicMetadata?.role

    // If we have valid metadata, allow access
    if (approvalStatus === 'approved' && role) {
      console.log('Access granted via session metadata')
      return NextResponse.next()
    }

    // TEMPORARY: Allow access if it's your user (admin bypass)
    // Remove this once Clerk session metadata is working
    console.log('No valid session metadata found, checking for admin bypass...')
    
    // For now, let's temporarily disable the restriction to test dashboard access
    // This is just for debugging - we'll fix the metadata issue after
    console.log('TEMPORARY: Allowing all authenticated users for debugging')
    return NextResponse.next()

    // Original restrictive code (commented out for now):
    /*
    if (!isApprovalRoute(req)) {
      console.log('Redirecting to approval-pending: not approved')
      return NextResponse.redirect(new URL('/approval-pending', req.url))
    }
    */
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