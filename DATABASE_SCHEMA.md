# Agnovat CareSync Database Schema

## Overview

This document describes the database schema for the Agnovat CareSync application, which is built using Convex as the backend database. The schema is designed to support behavior tracking, goal management, shift notes, and comprehensive care coordination for clients like Tavonga.

## Database Technology

- **Backend**: Convex (serverless database)
- **Schema Definition**: `convex/schema.ts`
- **API Functions**: `convex/api.ts`
- **Seed Data**: `convex/seed.ts`
- **TypeScript Types**: `types/database.ts`

## Core Tables

### 1. Users Table
Stores user information and role-based access control.

**Fields:**
- `clerkId`: Clerk authentication ID
- `email`: User email address
- `firstName`, `lastName`: User names
- `role`: User role (admin, support_worker, behavior_practitioner, family, support_coordinator)
- `isActive`: Account status
- `createdAt`, `updatedAt`: Timestamps

**Indexes:**
- `by_clerk_id`: For authentication lookups
- `by_email`: For user identification
- `by_role`: For role-based queries

### 2. Clients Table
Stores client information (e.g., Tavonga).

**Fields:**
- `name`: Client name
- `dateOfBirth`: Birth date (Unix timestamp)
- `guardianName`, `guardianContact`: Guardian information
- `medicalInfo`: Medical history and notes
- `carePlan`: Care plan details
- `isActive`: Client status
- `createdAt`, `updatedAt`: Timestamps

**Indexes:**
- `by_active`: For active client queries
- `by_name`: For client name lookups

### 3. Behaviors Table
Core table for behavioral incident reports.

**Fields:**
- `userId`: Support worker who recorded the incident
- `clientId`: Client identifier
- `dateTime`, `endTime`: Incident timing
- `location`: Where the incident occurred
- `activityBefore`: Activity preceding the behavior
- `behaviors`: Array of behavior types from checklist
- `customBehaviors`: Free-text for unlisted behaviors
- `warningSigns`: Warning signs object with presence and notes
- `intensity`: 1-5 scale for behavior severity
- `harmToClient`, `harmToOthers`: Harm tracking objects
- `interventions`: Array of intervention strategies used
- `interventionNotes`: Additional intervention details
- `supportRequired`: Second person support requirements
- `description`: Detailed incident report
- `status`: Draft, submitted, reviewed, archived
- `reviewedBy`, `reviewedAt`: Review information
- `createdAt`, `updatedAt`: Timestamps

**Indexes:**
- `by_user_id`: For user-specific queries
- `by_client_id`: For client-specific queries
- `by_date`: For temporal queries
- `by_status`: For status-based filtering
- `by_reviewed_by`: For review tracking

### 4. Goals Table
Developmental goals linked to clients.

**Fields:**
- `clientId`: Client identifier
- `title`, `description`: Goal details
- `category`: Goal category (communication, social_skills, etc.)
- `type`: Short-term or long-term
- `targetDate`: Optional completion target
- `status`: Active, completed, paused, cancelled
- `progress`: 0-100 percentage completion
- `createdBy`: User who created the goal
- `assignedTo`: Support worker assigned to the goal
- `createdAt`, `updatedAt`: Timestamps

**Indexes:**
- `by_client_id`: For client-specific goals
- `by_category`: For category-based queries
- `by_status`: For status filtering
- `by_assigned_to`: For assignment tracking
- `by_created_by`: For creation tracking

### 5. Activities Table
Activities linked to goals for tracking progress.

**Fields:**
- `goalId`: Associated goal
- `title`, `description`: Activity details
- `frequency`: Daily, weekly, monthly, as needed
- `estimatedDuration`: Time estimate in minutes
- `instructions`: Activity instructions
- `materials`: Required materials array
- `isActive`: Activity status
- `createdAt`, `updatedAt`: Timestamps

**Indexes:**
- `by_goal_id`: For goal-specific activities
- `by_frequency`: For frequency-based queries
- `by_active`: For active activities only

### 6. Activity Completions Table
Tracks when activities are completed and their outcomes.

**Fields:**
- `activityId`, `goalId`: References to activity and goal
- `userId`: Support worker who completed the activity
- `clientId`: Client identifier
- `completedAt`: Completion timestamp
- `status`: Completed, in_progress, not_completed
- `notes`: Additional notes
- `difficulty`: Easy, moderate, difficult
- `clientEngagement`: High, medium, low
- `createdAt`: Creation timestamp

**Indexes:**
- `by_activity_id`: For activity-specific completions
- `by_goal_id`: For goal-specific completions
- `by_user_id`: For user-specific completions
- `by_client_id`: For client-specific completions
- `by_completed_at`: For temporal queries
- `by_status`: For status filtering

### 7. Shift Notes Table
Daily shift documentation and integration hub.

**Fields:**
- `userId`: Support worker
- `clientId`: Client identifier
- `shiftDate`, `startTime`, `endTime`: Shift timing
- `summary`: General shift summary
- `activitiesCompleted`: Array of completed activity IDs
- `goalsCovered`: Array of goal IDs worked on
- `challenges`: Difficulties faced
- `behaviorIncidentIds`: Related behavior incidents
- `skillsPracticed`: Skills reinforced during shift
- `generalNotes`: Additional notes
- `status`: Draft, submitted, reviewed
- `reviewedBy`, `reviewedAt`: Review information
- `createdAt`, `updatedAt`: Timestamps

**Indexes:**
- `by_user_id`: For user-specific shifts
- `by_client_id`: For client-specific shifts
- `by_shift_date`: For date-based queries
- `by_status`: For status filtering
- `by_reviewed_by`: For review tracking

### 8. Media Attachments Table
Stores photos, videos, and documents for various entities.

**Fields:**
- `fileName`, `fileUrl`: File information
- `fileType`: Image, video, or document
- `fileSize`: File size in bytes
- `mimeType`: MIME type
- `uploadedBy`: User who uploaded the file
- `behaviorId`, `goalId`, `activityCompletionId`, `shiftNoteId`: Reference fields (only one should be set)
- `description`: Optional file description
- `createdAt`: Upload timestamp

**Indexes:**
- `by_uploaded_by`: For user uploads
- `by_behavior_id`: For behavior-related media
- `by_goal_id`: For goal-related media
- `by_activity_completion_id`: For activity-related media
- `by_shift_note_id`: For shift note media
- `by_file_type`: For file type filtering

### 9. Behavior Checklist Table
Predefined behavior types for structured reporting.

**Fields:**
- `name`: Behavior name
- `category`: Behavior category
- `description`: Behavior description
- `isActive`: Active status
- `createdAt`: Creation timestamp

**Indexes:**
- `by_category`: For category-based queries
- `by_active`: For active behaviors only

### 10. Intervention Strategies Table
Predefined intervention options for behavior management.

**Fields:**
- `name`: Strategy name
- `category`: Strategy category
- `description`: Strategy description
- `isActive`: Active status
- `createdAt`: Creation timestamp

**Indexes:**
- `by_category`: For category-based queries
- `by_active`: For active strategies only

### 11. Reports Table
Generated reports for practitioners and families.

**Fields:**
- `title`: Report title
- `type`: Daily, weekly, monthly, custom
- `clientId`: Client identifier
- `startDate`, `endDate`: Report date range
- `generatedBy`: User who generated the report
- `reportData`: JSON data for the report
- `status`: Generating, completed, failed
- `createdAt`, `completedAt`: Timestamps

**Indexes:**
- `by_client_id`: For client-specific reports
- `by_type`: For report type filtering
- `by_generated_by`: For user-generated reports
- `by_status`: For status filtering
- `by_date_range`: For date range queries

## Relationships

### Primary Relationships
1. **Users → Behaviors**: One-to-many (users create behaviors)
2. **Users → Goals**: One-to-many (users create/are assigned goals)
3. **Users → Shift Notes**: One-to-many (users create shift notes)
4. **Users → Media**: One-to-many (users upload media)
5. **Clients → Behaviors**: One-to-many (clients have behaviors)
6. **Clients → Goals**: One-to-many (clients have goals)
7. **Goals → Activities**: One-to-many (goals have activities)
8. **Activities → Completions**: One-to-many (activities have completions)
9. **Goals → Completions**: One-to-many (goals have completions)

### Reference Integrity
- Foreign key relationships are maintained through Convex's ID system
- Cascading updates and deletes are handled at the application level
- Media attachments reference one primary entity at a time

## Data Flow

### Behavior Tracking Flow
1. Support worker creates behavior incident
2. Behavior is submitted for review
3. Behavior practitioner reviews and updates status
4. Behavior can be linked to shift notes
5. Media can be attached to behaviors

### Goal Management Flow
1. Practitioner creates goal for client
2. Activities are linked to goals
3. Support workers complete activities
4. Goal progress is automatically updated
5. Progress is tracked over time

### Shift Notes Flow
1. Support worker creates shift note
2. Activities completed during shift are linked
3. Goals worked on are recorded
4. Behavior incidents can be referenced
5. Skills practiced are documented

## Security Considerations

### Role-Based Access Control
- **Admin**: Full access to all data
- **Support Worker**: Can create/edit behaviors, complete activities, create shift notes
- **Behavior Practitioner**: Can review behaviors, create goals, view reports
- **Family**: Read-only access to progress and reports
- **Support Coordinator**: Can view all data, manage assignments

### Data Privacy
- Client data is protected through role-based access
- Media attachments are secured through proper authentication
- Audit trails are maintained for all data modifications

## Performance Optimizations

### Indexing Strategy
- Primary indexes on frequently queried fields
- Compound indexes for complex queries
- Date-based indexes for temporal queries
- Status-based indexes for filtering

### Query Optimization
- Efficient filtering using indexes
- Pagination support for large datasets
- Optimized joins through reference fields

## Seed Data

The database includes seed data for:
- Common behavior types (aggression, self-harm, wandering, etc.)
- Standard intervention strategies (verbal, sensory, environmental, etc.)
- Sample client data (Tavonga)

## Usage Examples

### Creating a Behavior Incident
```typescript
const behaviorId = await mutation.createBehavior({
  userId: "user123",
  clientId: "Tavonga",
  dateTime: Date.now(),
  location: "home",
  behaviors: ["Physical Aggression", "Property Destruction"],
  intensity: 3,
  interventions: ["Verbal Redirection", "Sensory Break"],
  description: "Detailed incident description..."
});
```

### Creating a Goal
```typescript
const goalId = await mutation.createGoal({
  clientId: "Tavonga",
  title: "Improve Communication Skills",
  description: "Work on verbal communication and expression",
  category: "communication",
  type: "long_term",
  createdBy: "user123"
});
```

### Completing an Activity
```typescript
const completionId = await mutation.completeActivity({
  activityId: "activity123",
  goalId: "goal456",
  userId: "user123",
  clientId: "Tavonga",
  status: "completed",
  notes: "Client showed great engagement",
  difficulty: "moderate",
  clientEngagement: "high"
});
```

## Maintenance and Updates

### Schema Evolution
- Schema changes require running `npx convex dev` to regenerate types
- Backward compatibility is maintained where possible
- Data migration scripts may be needed for major changes

### Data Backup
- Convex provides automatic backups
- Export functionality can be implemented for data portability
- Regular data validation and integrity checks are recommended

## Future Enhancements

### Potential Additions
- Advanced analytics and reporting
- Machine learning for behavior pattern recognition
- Integration with external care systems
- Mobile app synchronization
- Real-time notifications and alerts

### Scalability Considerations
- Partitioning strategies for large datasets
- Caching layers for frequently accessed data
- API rate limiting and optimization
- Multi-tenant support for multiple care organizations
