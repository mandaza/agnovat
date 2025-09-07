import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - stores user information and roles
  users: defineTable({
    clerkId: v.string(), // Clerk authentication ID
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.optional(v.union(
      v.literal("admin"),
      v.literal("public_guardian"),
      v.literal("support_worker"),
      v.literal("behavior_practitioner"),
      v.literal("family"),
      v.literal("support_coordinator")
    )),
    isActive: v.boolean(),
    // Enhanced profile fields
    phoneNumber: v.optional(v.string()),
    address: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    emergencyContact: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string(),
    })),
    certifications: v.optional(v.array(v.string())),
    specializations: v.optional(v.array(v.string())),
    yearsExperience: v.optional(v.number()),
    availabilitySchedule: v.optional(v.object({
      monday: v.boolean(),
      tuesday: v.boolean(),
      wednesday: v.boolean(),
      thursday: v.boolean(),
      friday: v.boolean(),
      saturday: v.boolean(),
      sunday: v.boolean(),
    })),
    notes: v.optional(v.string()),
    lastLoginAt: v.optional(v.number()),
    clientAssignments: v.optional(v.array(v.string())),
    performanceRating: v.optional(v.number()),
    // Approval system fields (will be synced from Clerk metadata)
    approvalStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    )),
    approvedBy: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    requestedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_approval_status", ["approvalStatus"])
    .index("by_active", ["isActive"]),

  // Behavior incidents table - stores behavioral incident reports
  behaviors: defineTable({
    userId: v.id("users"), // Support worker who recorded the incident
    clientId: v.string(), // Tavonga's ID or client identifier
    dateTime: v.number(), // Unix timestamp
    endTime: v.optional(v.number()), // Optional end time for duration tracking
    location: v.union(
      v.literal("home"),
      v.literal("car"),
      v.literal("public"),
      v.literal("school"),
      v.literal("other")
    ),
    activityBefore: v.optional(v.string()), // Activity or situation before behavior
    behaviors: v.array(v.string()), // Array of behavior types from checklist
    customBehaviors: v.optional(v.string()), // Free-text for unlisted behaviors
    warningSigns: v.optional(v.object({
      present: v.boolean(),
      notes: v.optional(v.string()),
    })),
    intensity: v.union(
      v.literal(1), // Mild
      v.literal(2), // Mild-Moderate
      v.literal(3), // Moderate
      v.literal(4), // Moderate-Severe
      v.literal(5)  // Severe
    ),
    harmToClient: v.optional(v.object({
      occurred: v.boolean(),
      description: v.optional(v.string()),
      extent: v.optional(v.string()),
    })),
    harmToOthers: v.optional(v.object({
      occurred: v.boolean(),
      description: v.optional(v.string()),
      extent: v.optional(v.string()),
    })),
    interventions: v.array(v.string()), // Array of intervention strategies used
    interventionNotes: v.optional(v.string()),
    supportRequired: v.optional(v.object({
      secondPerson: v.boolean(),
      explanation: v.optional(v.string()),
    })),
    description: v.string(), // Detailed incident report
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("reviewed"),
      v.literal("archived")
    ),
    reviewedBy: v.optional(v.id("users")), // Behavior practitioner who reviewed
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_client_id", ["clientId"])
    .index("by_date", ["dateTime"])
    .index("by_status", ["status"])
    .index("by_reviewed_by", ["reviewedBy"]),

  // Goals table - stores developmental goals
  goals: defineTable({
    clientId: v.string(), // Tavonga's ID
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("communication"),
      v.literal("social_skills"),
      v.literal("motor_skills"),
      v.literal("independent_living"),
      v.literal("cognitive"),
      v.literal("emotional_regulation"),
      v.literal("other")
    ),
    type: v.union(
      v.literal("short_term"),
      v.literal("long_term")
    ),
    targetDate: v.optional(v.number()), // Optional target completion date
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("paused"),
      v.literal("cancelled")
    ),
    progress: v.number(), // 0-100 percentage
    createdBy: v.id("users"),
    assignedTo: v.optional(v.id("users")), // Support worker assigned to this goal
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client_id", ["clientId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_assigned_to", ["assignedTo"])
    .index("by_created_by", ["createdBy"]),

  // Activities table - stores activities linked to goals
  activities: defineTable({
    goalId: v.id("goals"),
    title: v.string(),
    description: v.string(),
    frequency: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("as_needed")
    ),
    estimatedDuration: v.optional(v.number()), // in minutes
    instructions: v.optional(v.string()),
    materials: v.optional(v.array(v.string())), // Array of required materials
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_goal_id", ["goalId"])
    .index("by_frequency", ["frequency"])
    .index("by_active", ["isActive"]),

  // Activity schedules table - stores scheduled activity instances
  activitySchedules: defineTable({
    activityId: v.id("activities"), // Reference to activity template
    goalId: v.id("goals"), // Reference to associated goal
    clientId: v.string(), // Client this activity is scheduled for
    scheduledDate: v.number(), // Date of scheduled activity (YYYY-MM-DD as timestamp)
    scheduledStartTime: v.number(), // Scheduled start time (timestamp)
    scheduledEndTime: v.number(), // Scheduled end time (timestamp)
    assignedTo: v.id("users"), // Support worker assigned to this scheduled activity
    status: v.union(
      v.literal("scheduled"), // Activity is scheduled and pending
      v.literal("in_progress"), // Activity has been started
      v.literal("completed"), // Activity was completed
      v.literal("rescheduled"), // Activity was moved to different time
      v.literal("cancelled") // Activity was cancelled
    ),
    priority: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    notes: v.optional(v.string()), // Optional scheduling notes or instructions
    completionId: v.optional(v.id("activityCompletions")), // Link to completion record when completed
    rescheduledFrom: v.optional(v.id("activitySchedules")), // Reference to original schedule if rescheduled
    recurringPattern: v.optional(v.object({
      frequency: v.union(
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly")
      ),
      interval: v.number(), // Every X days/weeks/months
      endDate: v.optional(v.number()), // When to stop recurring
      daysOfWeek: v.optional(v.array(v.number())), // For weekly: 0=Sunday, 1=Monday, etc.
    })),
    createdBy: v.id("users"), // User who created this schedule
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_activity_id", ["activityId"])
    .index("by_goal_id", ["goalId"])
    .index("by_client_id", ["clientId"])
    .index("by_scheduled_date", ["scheduledDate"])
    .index("by_assigned_to", ["assignedTo"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_created_by", ["createdBy"])
    .index("by_date_and_user", ["scheduledDate", "assignedTo"])
    .index("by_client_and_date", ["clientId", "scheduledDate"]),

  // Activity completions table - tracks when activities are completed
  activityCompletions: defineTable({
    activityId: v.id("activities"),
    goalId: v.id("goals"),
    userId: v.id("users"), // Support worker who completed the activity
    clientId: v.string(),
    scheduledId: v.optional(v.id("activitySchedules")), // Link to scheduled activity if completed from schedule
    completedAt: v.number(),
    status: v.union(
      v.literal("completed"),
      v.literal("in_progress"),
      v.literal("not_completed")
    ),
    notes: v.optional(v.string()),
    difficulty: v.optional(v.union(
      v.literal("easy"),
      v.literal("moderate"),
      v.literal("difficult")
    )),
    clientEngagement: v.optional(v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    )),
    createdAt: v.number(),
  })
    .index("by_activity_id", ["activityId"])
    .index("by_goal_id", ["goalId"])
    .index("by_user_id", ["userId"])
    .index("by_client_id", ["clientId"])
    .index("by_scheduled_id", ["scheduledId"])
    .index("by_completed_at", ["completedAt"])
    .index("by_status", ["status"]),

  // Shift notes table - stores daily shift documentation
  shiftNotes: defineTable({
    userId: v.id("users"), // Support worker
    clientId: v.string(),
    shiftDate: v.number(), // Date of the shift
    startTime: v.number(),
    endTime: v.number(),
    summary: v.string(), // General summary of the shift
    activitiesCompleted: v.array(v.id("activityCompletions")), // References to completed activities
    goalsCovered: v.array(v.id("goals")), // Goals that were worked on
    challenges: v.optional(v.string()), // Difficulties faced
    behaviorIncidentIds: v.optional(v.array(v.id("behaviors"))), // Related behavior incidents
    skillsPracticed: v.array(v.string()), // Skills reinforced during activities
    generalNotes: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("reviewed")
    ),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_client_id", ["clientId"])
    .index("by_shift_date", ["shiftDate"])
    .index("by_status", ["status"])
    .index("by_reviewed_by", ["reviewedBy"]),

  // Media attachments table - stores photos/videos for behaviors, goals, and shift notes
  mediaAttachments: defineTable({
    fileName: v.string(),
    fileUrl: v.string(),
    fileType: v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("document")
    ),
    fileSize: v.number(), // in bytes
    mimeType: v.string(),
    uploadedBy: v.id("users"),
    // Reference fields - only one should be set
    behaviorId: v.optional(v.id("behaviors")),
    goalId: v.optional(v.id("goals")),
    activityCompletionId: v.optional(v.id("activityCompletions")),
    shiftNoteId: v.optional(v.id("shiftNotes")),
    description: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_uploaded_by", ["uploadedBy"])
    .index("by_behavior_id", ["behaviorId"])
    .index("by_goal_id", ["goalId"])
    .index("by_activity_completion_id", ["activityCompletionId"])
    .index("by_shift_note_id", ["shiftNoteId"])
    .index("by_file_type", ["fileType"]),

  // Behavior checklist table - stores predefined behavior types
  behaviorChecklist: defineTable({
    name: v.string(),
    category: v.union(
      v.literal("aggression"),
      v.literal("self_harm"),
      v.literal("wandering"),
      v.literal("inappropriate_behavior"),
      v.literal("communication"),
      v.literal("other")
    ),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  // Intervention strategies table - stores predefined intervention options
  interventionStrategies: defineTable({
    name: v.string(),
    category: v.union(
      v.literal("verbal"),
      v.literal("sensory"),
      v.literal("environmental"),
      v.literal("physical"),
      v.literal("other")
    ),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  // Clients table - stores client information (like Tavonga)
  clients: defineTable({
    name: v.string(),
    dateOfBirth: v.optional(v.number()),
    guardianName: v.optional(v.string()),
    guardianContact: v.optional(v.string()),
    medicalInfo: v.optional(v.string()),
    carePlan: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active", ["isActive"])
    .index("by_name", ["name"]),

  // Reports table - stores generated reports for practitioners
  reports: defineTable({
    title: v.string(),
    type: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("custom")
    ),
    clientId: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    generatedBy: v.id("users"),
    reportData: v.any(), // JSON data for the report
    status: v.union(
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_client_id", ["clientId"])
    .index("by_type", ["type"])
    .index("by_generated_by", ["generatedBy"])
    .index("by_status", ["status"])
    .index("by_date_range", ["startDate", "endDate"]),
});
