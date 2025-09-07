# Role-Based Access Control (RBAC) Implementation

This document describes the implementation of a comprehensive role-based access control system for the Agnovat application.

## Overview

The system implements a multi-layer access control approach:
1. **Authentication Layer** - User is signed in through Clerk
2. **Approval Layer** - User has been approved by an administrator
3. **Role Layer** - User has appropriate role for specific features
4. **Route Protection** - Specific dashboard sections based on roles

## User Flow

### 1. User Registration
- User signs up through Clerk
- User is automatically assigned `approvalStatus: 'pending'`
- User is redirected to `/approval-pending` page

### 2. Admin Approval Process
- Administrator reviews user registration
- Admin can approve, reject, or assign roles
- Admin dashboard available at `/dashboard/admin`

### 3. Post-Approval
- Approved users are redirected to role selection (if no role assigned)
- Users with roles can access the main dashboard
- Role-based navigation is displayed in the sidebar

## Role Hierarchy

```typescript
const ROLE_HIERARCHY = {
  admin: 100,                    // Full system access
  public_guardian: 80,           // Legal representation
  support_coordinator: 70,       // Service coordination
  behavior_practitioner: 60,     // Behavior support
  support_worker: 50,            // Direct support
  family: 30                     // Family involvement
}
```

## File Structure

```
src/
├── app/
│   ├── approval-pending/        # Approval pending page
│   ├── role-selection/          # Role selection page
│   ├── dashboard/
│   │   ├── admin/               # Admin dashboard
│   │   └── layout.tsx           # Dashboard layout with RoleGuard
│   └── api/
│       └── users/
│           └── approve/          # User approval API
├── components/
│   ├── role-guard.tsx           # Route protection component
│   └── app-sidebar.tsx          # Role-based navigation
├── types/
│   └── globals.ts               # Type definitions
└── utils/
    └── roles.ts                 # Role checking utilities
```

## Key Components

### RoleGuard Component
Protects routes based on user roles and approval status:

```tsx
import { RoleGuard } from '@/components/role-guard'

// Protect entire dashboard
<RoleGuard>
  <DashboardContent />
</RoleGuard>

// Protect specific routes with role requirements
<RoleGuard requiredRole="admin">
  <AdminOnlyContent />
</RoleGuard>
```

### AppSidebar
Dynamic navigation based on user roles:

```tsx
// Navigation items are filtered based on user role
const getRoleBasedNavItems = () => {
  return baseItems.filter(item => 
    item.roles.includes(userRole) || item.roles.includes('admin')
  )
}
```

### Middleware
Server-side route protection:

```typescript
// Checks approval status and redirects unapproved users
if (approvalStatus !== 'approved' && !isApprovalRoute(req)) {
  return NextResponse.redirect(new URL('/approval-pending', req.url))
}
```

## Usage Examples

### Protecting Routes

```tsx
// In a page component
export default function AdminPage() {
  return (
    <RoleGuard requiredRole="admin">
      <div>Admin-only content</div>
    </RoleGuard>
  )
}
```

### Checking Permissions in Components

```tsx
import { useAuth } from '@clerk/nextjs'

export function MyComponent() {
  const { sessionClaims } = useAuth()
  const userRole = sessionClaims?.metadata?.role
  const isApproved = sessionClaims?.metadata?.approvalStatus === 'approved'
  
  if (!isApproved) {
    return <div>Account pending approval</div>
  }
  
  return <div>Welcome, {userRole}!</div>
}
```

### Server-Side Role Checking

```tsx
import { checkUserAccess, isAdmin } from '@/utils/roles'

export async function GET() {
  const access = await checkUserAccess('support_coordinator')
  
  if (!access.hasAccess) {
    return new Response('Access denied', { status: 403 })
  }
  
  // Proceed with protected logic
}
```

## Configuration

### Clerk JWT Template
Ensure your Clerk JWT template includes:

```json
{
  "metadata": {
    "role": "{{user.public_metadata.role}}",
    "approvalStatus": "{{user.public_metadata.approvalStatus}}",
    "approvedBy": "{{user.public_metadata.approvedBy}}",
    "approvedAt": "{{user.public_metadata.approvedAt}}",
    "requestedAt": "{{user.public_metadata.requestedAt}}"
  }
}
```

### Environment Variables
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
NEXT_PUBLIC_CLERK_JWT_ISSUER_DOMAIN=your_domain
```

## Admin Workflow

### 1. Access Admin Dashboard
- Navigate to `/dashboard/admin`
- Only users with `admin` role can access

### 2. Review Pending Users
- View list of users awaiting approval
- Filter by status, search by name/email

### 3. Approve/Reject Users
- Click "Approve" or "Reject" buttons
- Assign appropriate roles
- Users receive email notifications

### 4. Manage Existing Users
- Update user roles
- View approval history
- Monitor user activity

## Security Features

- **Multi-layer protection**: Authentication + Approval + Role
- **Server-side validation**: Middleware and API route protection
- **Role hierarchy**: Higher roles inherit lower role permissions
- **Audit trail**: Track all approval actions
- **Session-based**: Real-time permission checking

## Integration Points

### Clerk Webhooks
Set up webhooks for:
- User creation
- User updates
- Role changes

### Email Notifications
Send emails for:
- Approval status changes
- Role assignments
- Access granted/revoked

### Database Integration
Store additional user data in:
- Convex (for real-time features)
- External database (for complex queries)

## Testing

### Test Scenarios
1. **Unapproved user**: Should be redirected to approval page
2. **Approved user without role**: Should see role selection
3. **Role-based access**: Users should only see permitted navigation
4. **Admin access**: Admin should see all features and user management

### Test Users
Create test users with different roles and approval statuses to verify the system works correctly.

## Troubleshooting

### Common Issues
1. **User stuck on approval page**: Check Clerk metadata configuration
2. **Role not updating**: Verify JWT template includes role field
3. **Navigation not showing**: Check role permissions in sidebar logic
4. **API access denied**: Verify role checking in API routes

### Debug Steps
1. Check browser console for errors
2. Verify Clerk session claims in browser dev tools
3. Check server logs for middleware issues
4. Verify environment variables are set correctly

## Future Enhancements

- **Time-based approvals**: Auto-approve after certain conditions
- **Bulk user management**: Approve/reject multiple users at once
- **Advanced permissions**: Granular feature-level permissions
- **Audit logging**: Comprehensive activity tracking
- **Role templates**: Predefined role configurations
- **Integration APIs**: Connect with external HR systems

## Support

For issues or questions about the RBAC implementation, refer to:
- Clerk documentation for authentication
- Next.js documentation for middleware
- Project-specific documentation for business logic
