import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ===== CLIENT MANAGEMENT =====

export const getClients = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("clients")
      .withIndex("by_active")
      .collect();
  },
});

export const getClientById = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.clientId);
  },
});

export const createClient = mutation({
  args: {
    name: v.string(),
    dateOfBirth: v.optional(v.number()),
    guardianName: v.optional(v.string()),
    guardianContact: v.optional(v.string()),
    medicalInfo: v.optional(v.string()),
    carePlan: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const clientId = await ctx.db.insert("clients", {
      name: args.name,
      dateOfBirth: args.dateOfBirth,
      guardianName: args.guardianName,
      guardianContact: args.guardianContact,
      medicalInfo: args.medicalInfo,
      carePlan: args.carePlan,
      isActive: args.isActive,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(clientId);
  },
});

export const updateClient = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    guardianName: v.optional(v.string()),
    guardianContact: v.optional(v.string()),
    medicalInfo: v.optional(v.string()),
    carePlan: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { clientId, ...updates } = args;
    
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(clientId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(clientId);
  },
});

export const deleteClient = mutation({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.clientId);
  },
});

// Namespace for clients API
export const clients = {
  getAll: getClients,
  getById: getClientById,
  create: createClient,
  update: updateClient,
  remove: deleteClient,
};

// ===== USER MANAGEMENT =====

export const getUsers = query({
  args: { 
    role: v.optional(v.union(
      v.literal("admin"),
      v.literal("public_guardian"),
      v.literal("support_worker"),
      v.literal("behavior_practitioner"),
      v.literal("family"),
      v.literal("support_coordinator")
    )),
    approvalStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    )),
    includeInactive: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    // Apply filters
    let users;
    if (args.role) {
      users = await ctx.db.query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role!))
        .collect();
    } else {
      users = await ctx.db.query("users").collect();
    }
    
    // Filter by approval status
    if (args.approvalStatus) {
      users = users.filter(user => user.approvalStatus === args.approvalStatus);
    }
    
    // Filter by active status
    if (!args.includeInactive) {
      users = users.filter(user => user.isActive === true);
    }
    
    return users;
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const createUser = mutation({
  args: {
    clerkId: v.string(),
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
    // Enhanced profile fields (optional during creation)
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
    clientAssignments: v.optional(v.array(v.string())),
    performanceRating: v.optional(v.number()),
    approvalStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    )),
    requestedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      requestedAt: args.requestedAt || now,
      approvalStatus: args.approvalStatus || "pending",
    });
    return userId;
  },
});

// Update user profile
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      email: v.optional(v.string()),
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
      clientAssignments: v.optional(v.array(v.string())),
      performanceRating: v.optional(v.number()),
      role: v.optional(v.union(
        v.literal("admin"),
        v.literal("public_guardian"),
        v.literal("support_worker"),
        v.literal("behavior_practitioner"),
        v.literal("family"),
        v.literal("support_coordinator")
      )),
      approvalStatus: v.optional(v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      )),
      approvedBy: v.optional(v.string()),
      approvedAt: v.optional(v.number()),
      isActive: v.optional(v.boolean()),
      lastLoginAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(args.updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(args.userId, {
      ...filteredUpdates,
      updatedAt: now,
    });

    return await ctx.db.get(args.userId);
  },
});

// Bulk user operations
export const bulkUpdateUsers = mutation({
  args: {
    userIds: v.array(v.id("users")),
    updates: v.object({
      role: v.optional(v.union(
        v.literal("admin"),
        v.literal("public_guardian"),
        v.literal("support_worker"),
        v.literal("behavior_practitioner"),
        v.literal("family"),
        v.literal("support_coordinator")
      )),
      approvalStatus: v.optional(v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      )),
      approvedBy: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];
    
    for (const userId of args.userIds) {
      const updates = {
        ...args.updates,
        updatedAt: now,
      };
      
      // Note: approvedAt timestamp is handled by the main updateUser function
      
      await ctx.db.patch(userId, updates);
      const updatedUser = await ctx.db.get(userId);
      results.push(updatedUser);
    }
    
    return results;
  },
});

// ===== BEHAVIOR MANAGEMENT =====

export const getBehaviors = query({
  args: {
    clientId: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("reviewed"),
      v.literal("archived")
    )),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let behaviors = await ctx.db.query("behaviors").collect();
    
    // Apply filters
    if (args.clientId) {
      behaviors = behaviors.filter(behavior => behavior.clientId === args.clientId);
    }
    
    if (args.userId) {
      behaviors = behaviors.filter(behavior => behavior.userId === args.userId);
    }
    
    if (args.status) {
      behaviors = behaviors.filter(behavior => behavior.status === args.status);
    }
    
    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      behaviors = behaviors.filter(behavior => {
        if (args.startDate && behavior.dateTime < args.startDate) return false;
        if (args.endDate && behavior.dateTime > args.endDate) return false;
        return true;
      });
    }
    
    return behaviors;
  },
});

export const createBehavior = mutation({
  args: {
    userId: v.id("users"),
    clientId: v.string(),
    dateTime: v.number(),
    endTime: v.optional(v.number()),
    location: v.union(
      v.literal("home"),
      v.literal("car"),
      v.literal("public"),
      v.literal("school"),
      v.literal("other")
    ),
    activityBefore: v.optional(v.string()),
    behaviors: v.array(v.string()),
    customBehaviors: v.optional(v.string()),
    warningSigns: v.optional(v.object({
      present: v.boolean(),
      notes: v.optional(v.string()),
    })),
    intensity: v.union(
      v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5)
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
    interventions: v.array(v.string()),
    interventionNotes: v.optional(v.string()),
    supportRequired: v.optional(v.object({
      secondPerson: v.boolean(),
      explanation: v.optional(v.string()),
    })),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const behaviorId = await ctx.db.insert("behaviors", {
      ...args,
      status: "submitted",
      createdAt: now,
      updatedAt: now,
    });
    return behaviorId;
  },
});

export const updateBehavior = mutation({
  args: {
    behaviorId: v.id("behaviors"),
    updates: v.object({
      dateTime: v.optional(v.number()),
      endTime: v.optional(v.number()),
      location: v.optional(v.union(
        v.literal("home"),
        v.literal("car"),
        v.literal("public"),
        v.literal("school"),
        v.literal("other")
      )),
      activityBefore: v.optional(v.string()),
      behaviors: v.optional(v.array(v.string())),
      customBehaviors: v.optional(v.string()),
      warningSigns: v.optional(v.object({
        present: v.boolean(),
        notes: v.optional(v.string()),
      })),
      intensity: v.optional(v.union(
        v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5)
      )),
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
      interventions: v.optional(v.array(v.string())),
      interventionNotes: v.optional(v.string()),
      supportRequired: v.optional(v.object({
        secondPerson: v.boolean(),
        explanation: v.optional(v.string()),
      })),
      description: v.optional(v.string()),
      status: v.optional(v.union(
        v.literal("draft"),
        v.literal("submitted"),
        v.literal("reviewed"),
        v.literal("archived")
      )),
    }),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      ...args.updates,
      updatedAt: Date.now(),
    };
    
    if (args.updates.status === "reviewed") {
      updates.reviewedAt = Date.now();
    }
    
    await ctx.db.patch(args.behaviorId, updates);
    return { success: true };
  },
});

export const reviewBehavior = mutation({
  args: {
    behaviorId: v.id("behaviors"),
    reviewedBy: v.id("users"),
    status: v.union(
      v.literal("reviewed"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.behaviorId, {
      status: args.status,
      reviewedBy: args.reviewedBy,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// ===== GOAL MANAGEMENT =====

export const getGoals = query({
  args: {
    clientId: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("communication"),
      v.literal("social_skills"),
      v.literal("motor_skills"),
      v.literal("independent_living"),
      v.literal("cognitive"),
      v.literal("emotional_regulation"),
      v.literal("other")
    )),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("paused"),
      v.literal("cancelled")
    )),
    assignedTo: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let goals = await ctx.db.query("goals").collect();
    
    // Apply filters
    if (args.clientId) {
      goals = goals.filter(goal => goal.clientId === args.clientId);
    }
    
    if (args.category) {
      goals = goals.filter(goal => goal.category === args.category);
    }
    
    if (args.status) {
      goals = goals.filter(goal => goal.status === args.status);
    }
    
    if (args.assignedTo) {
      goals = goals.filter(goal => goal.assignedTo === args.assignedTo);
    }
    
    return goals;
  },
});

export const createGoal = mutation({
  args: {
    clientId: v.string(),
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
    targetDate: v.optional(v.number()),
    assignedTo: v.optional(v.id("users")),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const goalId = await ctx.db.insert("goals", {
      ...args,
      progress: 0,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    return goalId;
  },
});

export const updateGoalProgress = mutation({
  args: {
    goalId: v.id("goals"),
    progress: v.number(),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("paused"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      progress: Math.max(0, Math.min(100, args.progress)),
      updatedAt: Date.now(),
    };
    
    if (args.status) {
      updates.status = args.status;
    }
    
    await ctx.db.patch(args.goalId, updates);
    return { success: true };
  },
});

export const updateGoal = mutation({
  args: {
    goalId: v.id("goals"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      category: v.optional(v.union(
        v.literal("communication"),
        v.literal("social_skills"),
        v.literal("motor_skills"),
        v.literal("independent_living"),
        v.literal("cognitive"),
        v.literal("emotional_regulation"),
        v.literal("other")
      )),
      type: v.optional(v.union(
        v.literal("short_term"),
        v.literal("long_term")
      )),
      targetDate: v.optional(v.number()),
      status: v.optional(v.union(
        v.literal("active"),
        v.literal("completed"),
        v.literal("paused"),
        v.literal("cancelled")
      )),
      progress: v.optional(v.number()),
      assignedTo: v.optional(v.id("users")),
    }),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      ...args.updates,
      updatedAt: Date.now(),
    };
    
    if (args.updates.progress !== undefined) {
      updates.progress = Math.max(0, Math.min(100, args.updates.progress));
    }
    
    await ctx.db.patch(args.goalId, updates);
    return { success: true };
  },
});

export const deleteGoal = mutation({
  args: {
    goalId: v.id("goals"),
  },
  handler: async (ctx, args) => {
    // Check if there are any activities linked to this goal
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_goal_id", (q) => q.eq("goalId", args.goalId))
      .collect();
    
    if (activities.length > 0) {
      throw new Error("Cannot delete goal with linked activities. Please delete activities first.");
    }
    
    // Check if there are any shift notes referencing this goal
    const shiftNotes = await ctx.db
      .query("shiftNotes")
      .collect();
    
    const hasShiftNotes = shiftNotes.some(note => 
      note.goalsCovered && note.goalsCovered.includes(args.goalId)
    );
    
    if (hasShiftNotes) {
      throw new Error("Cannot delete goal referenced in shift notes. Please update shift notes first.");
    }
    
    await ctx.db.delete(args.goalId);
    return { success: true };
  },
});

// Development helper: Create test goals and activities with schedules
export const createTestGoals = mutation({
  args: {},
  handler: async (ctx) => {
    // Create a sample user for testing
    const userId = await ctx.db.insert("users", {
      clerkId: "test_clerk_id",
      email: "test@agnovat.com",
      firstName: "Test",
      lastName: "User",
      role: "support_worker",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create test goals
    const testGoals = [
      {
        clientId: "Tavonga",
        title: "Improve Communication Skills",
        description: "Work on verbal communication and expression of needs",
        category: "communication" as const,
        type: "long_term" as const,
        targetDate: new Date("2024-12-31").getTime(),
        status: "active" as const,
        progress: 65,
        createdBy: userId,
        assignedTo: userId,
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      },
      {
        clientId: "Tavonga",
        title: "Independent Dressing",
        description: "Learn to dress independently with minimal assistance",
        category: "independent_living" as const,
        type: "short_term" as const,
        targetDate: new Date("2024-10-31").getTime(),
        status: "active" as const,
        progress: 40,
        createdBy: userId,
        assignedTo: userId,
        createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      },
    ];

    const goalIds = [];
    for (const goal of testGoals) {
      const goalId = await ctx.db.insert("goals", goal);
      goalIds.push(goalId);
    }

    // Create test activities for these goals
    const testActivities = [
      {
        goalId: goalIds[0], // Communication goal
        title: "Daily Conversation Practice",
        description: "Practice verbal communication through structured conversations",
        frequency: "daily" as const,
        estimatedDuration: 30,
        instructions: "Use picture cards to prompt conversation. Focus on expressing needs and feelings.",
        materials: ["Picture cards", "Communication board"],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        goalId: goalIds[0], // Communication goal
        title: "Sign Language Practice",
        description: "Practice basic sign language for essential needs",
        frequency: "weekly" as const,
        estimatedDuration: 45,
        instructions: "Focus on signs for: water, food, help, bathroom, more",
        materials: ["Sign language cards", "Mirror"],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        goalId: goalIds[1], // Dressing goal
        title: "Morning Dressing Routine",
        description: "Practice putting on clothes independently",
        frequency: "daily" as const,
        estimatedDuration: 20,
        instructions: "Start with easier items (socks, t-shirt) then progress to buttons and zippers",
        materials: ["Practice clothes", "Step-by-step visual guide"],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    const activityIds = [];
    for (const activity of testActivities) {
      const activityId = await ctx.db.insert("activities", activity);
      activityIds.push(activityId);
    }

    // Create some scheduled activities for the next few days
    const schedules = [];
    const now = new Date();
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const scheduleDate = new Date(now);
      scheduleDate.setDate(now.getDate() + dayOffset);
      scheduleDate.setHours(0, 0, 0, 0); // Start of day
      
      // Schedule daily activities
      if (dayOffset < 5) { // Weekdays only
        // Morning conversation practice
        const morningSchedule = {
          activityId: activityIds[0], // Daily conversation
          goalId: goalIds[0],
          clientId: "Tavonga",
          scheduledDate: scheduleDate.getTime(),
          scheduledStartTime: scheduleDate.getTime() + (9 * 60 * 60 * 1000), // 9 AM
          scheduledEndTime: scheduleDate.getTime() + (9.5 * 60 * 60 * 1000), // 9:30 AM
          assignedTo: userId,
          priority: "high" as const,
          status: dayOffset === 0 ? "completed" as const : "scheduled" as const,
          notes: "Morning communication session",
          createdBy: userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        // Dressing practice
        const dressingSchedule = {
          activityId: activityIds[2], // Dressing
          goalId: goalIds[1],
          clientId: "Tavonga",
          scheduledDate: scheduleDate.getTime(),
          scheduledStartTime: scheduleDate.getTime() + (8 * 60 * 60 * 1000), // 8 AM
          scheduledEndTime: scheduleDate.getTime() + (8.33 * 60 * 60 * 1000), // 8:20 AM
          assignedTo: userId,
          priority: "medium" as const,
          status: dayOffset === 0 ? "completed" as const : "scheduled" as const,
          notes: "Morning dressing routine",
          createdBy: userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        const morningScheduleId = await ctx.db.insert("activitySchedules", morningSchedule);
        const dressingScheduleId = await ctx.db.insert("activitySchedules", dressingSchedule);
        schedules.push(morningScheduleId, dressingScheduleId);
      }
      
      // Weekly sign language on Tuesdays
      if (scheduleDate.getDay() === 2 && dayOffset < 7) { // Tuesday
        const signLanguageSchedule = {
          activityId: activityIds[1], // Sign language
          goalId: goalIds[0],
          clientId: "Tavonga",
          scheduledDate: scheduleDate.getTime(),
          scheduledStartTime: scheduleDate.getTime() + (14 * 60 * 60 * 1000), // 2 PM
          scheduledEndTime: scheduleDate.getTime() + (14.75 * 60 * 60 * 1000), // 2:45 PM
          assignedTo: userId,
          priority: "medium" as const,
          status: dayOffset === 0 ? "completed" as const : "scheduled" as const,
          notes: "Weekly sign language session",
          createdBy: userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        const signScheduleId = await ctx.db.insert("activitySchedules", signLanguageSchedule);
        schedules.push(signScheduleId);
      }
    }

    return { 
      message: "Test data created successfully", 
      goalIds,
      activityIds,
      schedules,
      userId,
      counts: {
        goals: goalIds.length,
        activities: activityIds.length,
        schedules: schedules.length
      }
    };
  },
});

// ===== ACTIVITY MANAGEMENT =====

export const getActivities = query({
  args: {
    goalId: v.optional(v.id("goals")),
    frequency: v.optional(v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("as_needed")
    )),
  },
  handler: async (ctx, args) => {
    let activities = await ctx.db.query("activities").collect();
    
    // Apply filters
    if (args.goalId) {
      activities = activities.filter(activity => activity.goalId === args.goalId);
    }
    
    if (args.frequency) {
      activities = activities.filter(activity => activity.frequency === args.frequency);
    }
    
    return activities.filter(activity => activity.isActive);
  },
});

export const createActivity = mutation({
  args: {
    goalId: v.id("goals"),
    title: v.string(),
    description: v.string(),
    frequency: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("as_needed")
    ),
    estimatedDuration: v.optional(v.number()),
    instructions: v.optional(v.string()),
    materials: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const activityId = await ctx.db.insert("activities", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    return activityId;
  },
});

export const updateActivity = mutation({
  args: {
    activityId: v.id("activities"),
    updates: v.object({
      goalId: v.optional(v.id("goals")),
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      frequency: v.optional(v.union(
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("as_needed")
      )),
      estimatedDuration: v.optional(v.number()),
      instructions: v.optional(v.string()),
      materials: v.optional(v.array(v.string())),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(args.updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(args.activityId, {
      ...filteredUpdates,
      updatedAt: now,
    });

    return await ctx.db.get(args.activityId);
  },
});

export const deleteActivity = mutation({
  args: {
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    // Check if there are any scheduled activities linked to this activity
    const schedules = await ctx.db
      .query("activitySchedules")
      .withIndex("by_activity_id", (q) => q.eq("activityId", args.activityId))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();
    
    if (schedules.length > 0) {
      throw new Error("Cannot delete activity with existing schedules. Please cancel all schedules first.");
    }
    
    // Check if there are any activity completions linked to this activity
    const completions = await ctx.db
      .query("activityCompletions")
      .withIndex("by_activity_id", (q) => q.eq("activityId", args.activityId))
      .collect();
    
    if (completions.length > 0) {
      throw new Error("Cannot delete activity with completion records. Consider deactivating instead.");
    }
    
    await ctx.db.delete(args.activityId);
    return { success: true };
  },
});

export const deactivateActivity = mutation({
  args: {
    activityId: v.id("activities"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.activityId, {
      isActive: false,
      updatedAt: now,
    });
    
    return { success: true };
  },
});

export const completeActivity = mutation({
  args: {
    activityId: v.id("activities"),
    goalId: v.id("goals"),
    userId: v.id("users"),
    clientId: v.string(),
    scheduledId: v.optional(v.id("activitySchedules")),
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const completionId = await ctx.db.insert("activityCompletions", {
      ...args,
      completedAt: now,
      createdAt: now,
    });
    
    // Update scheduled activity status if this completion is linked to a schedule
    if (args.scheduledId && args.status === "completed") {
      await ctx.db.patch(args.scheduledId, {
        status: "completed",
        completionId: completionId,
        updatedAt: now,
      });
    }
    
    // Update goal progress if activity is completed
    if (args.status === "completed") {
      // This is a simplified progress calculation
      // In a real app, you might want more sophisticated progress tracking
      const goal = await ctx.db.get(args.goalId);
      if (goal) {
        const currentProgress = goal.progress;
        // Increment progress by a small amount (e.g., 5%)
        const newProgress = Math.min(100, currentProgress + 5);
        await ctx.db.patch(args.goalId, {
          progress: newProgress,
          updatedAt: now,
        });
      }
    }
    
    return completionId;
  },
});

// ===== ACTIVITY SCHEDULING MANAGEMENT =====

export const getActivitySchedules = query({
  args: {
    activityId: v.optional(v.id("activities")),
    goalId: v.optional(v.id("goals")),
    clientId: v.optional(v.string()),
    assignedTo: v.optional(v.id("users")),
    status: v.optional(v.union(
      v.literal("scheduled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("rescheduled"),
      v.literal("cancelled")
    )),
    priority: v.optional(v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    )),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    scheduledDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let schedules = await ctx.db.query("activitySchedules").collect();
    
    // Apply filters
    if (args.activityId) {
      schedules = schedules.filter(schedule => schedule.activityId === args.activityId);
    }
    
    if (args.goalId) {
      schedules = schedules.filter(schedule => schedule.goalId === args.goalId);
    }
    
    if (args.clientId) {
      schedules = schedules.filter(schedule => schedule.clientId === args.clientId);
    }
    
    if (args.assignedTo) {
      schedules = schedules.filter(schedule => schedule.assignedTo === args.assignedTo);
    }
    
    if (args.status) {
      schedules = schedules.filter(schedule => schedule.status === args.status);
    }
    
    if (args.priority) {
      schedules = schedules.filter(schedule => schedule.priority === args.priority);
    }
    
    if (args.scheduledDate) {
      schedules = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.scheduledDate);
        const targetDate = new Date(args.scheduledDate!);
        return scheduleDate.toDateString() === targetDate.toDateString();
      });
    }
    
    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      schedules = schedules.filter(schedule => {
        if (args.startDate && schedule.scheduledDate < args.startDate) return false;
        if (args.endDate && schedule.scheduledDate > args.endDate) return false;
        return true;
      });
    }
    
    return schedules;
  },
});

export const createActivitySchedule = mutation({
  args: {
    activityId: v.id("activities"),
    goalId: v.id("goals"),
    clientId: v.string(),
    scheduledDate: v.number(),
    scheduledStartTime: v.number(),
    scheduledEndTime: v.number(),
    assignedTo: v.id("users"),
    priority: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    notes: v.optional(v.string()),
    recurringPattern: v.optional(v.object({
      frequency: v.union(
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly")
      ),
      interval: v.number(),
      endDate: v.optional(v.number()),
      daysOfWeek: v.optional(v.array(v.number())),
    })),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check for scheduling conflicts
    const existingSchedules = await ctx.db
      .query("activitySchedules")
      .withIndex("by_date_and_user", (q) => 
        q.eq("scheduledDate", args.scheduledDate).eq("assignedTo", args.assignedTo)
      )
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();
    
    const hasConflict = existingSchedules.some(schedule => {
      const scheduleStart = schedule.scheduledStartTime;
      const scheduleEnd = schedule.scheduledEndTime;
      const newStart = args.scheduledStartTime;
      const newEnd = args.scheduledEndTime;
      
      // Check for time overlap
      return (newStart < scheduleEnd && newEnd > scheduleStart);
    });
    
    if (hasConflict) {
      throw new Error("Schedule conflict detected. There is already an activity scheduled during this time.");
    }
    
    const scheduleId = await ctx.db.insert("activitySchedules", {
      ...args,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    });
    
    // If this is a recurring schedule, create future occurrences
    if (args.recurringPattern) {
      await createRecurringSchedules(ctx, scheduleId, args);
    }
    
    return scheduleId;
  },
});

export const updateActivitySchedule = mutation({
  args: {
    scheduleId: v.id("activitySchedules"),
    updates: v.object({
      scheduledDate: v.optional(v.number()),
      scheduledStartTime: v.optional(v.number()),
      scheduledEndTime: v.optional(v.number()),
      assignedTo: v.optional(v.id("users")),
      priority: v.optional(v.union(
        v.literal("high"),
        v.literal("medium"),
        v.literal("low")
      )),
      status: v.optional(v.union(
        v.literal("scheduled"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("rescheduled"),
        v.literal("cancelled")
      )),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // If rescheduling, check for conflicts
    if (args.updates.scheduledDate || args.updates.scheduledStartTime || args.updates.scheduledEndTime || args.updates.assignedTo) {
      const currentSchedule = await ctx.db.get(args.scheduleId);
      if (!currentSchedule) {
        throw new Error("Schedule not found");
      }
      
      const scheduledDate = args.updates.scheduledDate || currentSchedule.scheduledDate;
      const assignedTo = args.updates.assignedTo || currentSchedule.assignedTo;
      const startTime = args.updates.scheduledStartTime || currentSchedule.scheduledStartTime;
      const endTime = args.updates.scheduledEndTime || currentSchedule.scheduledEndTime;
      
      const existingSchedules = await ctx.db
        .query("activitySchedules")
        .withIndex("by_date_and_user", (q) => 
          q.eq("scheduledDate", scheduledDate).eq("assignedTo", assignedTo)
        )
        .filter((q) => q.and(
          q.neq(q.field("_id"), args.scheduleId),
          q.neq(q.field("status"), "cancelled")
        ))
        .collect();
      
      const hasConflict = existingSchedules.some(schedule => {
        const scheduleStart = schedule.scheduledStartTime;
        const scheduleEnd = schedule.scheduledEndTime;
        
        // Check for time overlap
        return (startTime < scheduleEnd && endTime > scheduleStart);
      });
      
      if (hasConflict) {
        throw new Error("Schedule conflict detected. There is already an activity scheduled during this time.");
      }
    }
    
    await ctx.db.patch(args.scheduleId, {
      ...args.updates,
      updatedAt: now,
    });
    
    return { success: true };
  },
});

export const rescheduleActivity = mutation({
  args: {
    originalScheduleId: v.id("activitySchedules"),
    newScheduledDate: v.number(),
    newScheduledStartTime: v.number(),
    newScheduledEndTime: v.number(),
    newAssignedTo: v.optional(v.id("users")),
    rescheduleReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const originalSchedule = await ctx.db.get(args.originalScheduleId);
    
    if (!originalSchedule) {
      throw new Error("Original schedule not found");
    }
    
    // Mark original as rescheduled
    await ctx.db.patch(args.originalScheduleId, {
      status: "rescheduled",
      updatedAt: now,
    });
    
    // Create new schedule
    const newScheduleId = await ctx.db.insert("activitySchedules", {
      activityId: originalSchedule.activityId,
      goalId: originalSchedule.goalId,
      clientId: originalSchedule.clientId,
      scheduledDate: args.newScheduledDate,
      scheduledStartTime: args.newScheduledStartTime,
      scheduledEndTime: args.newScheduledEndTime,
      assignedTo: args.newAssignedTo || originalSchedule.assignedTo,
      priority: originalSchedule.priority,
      status: "scheduled",
      notes: args.rescheduleReason ? `Rescheduled: ${args.rescheduleReason}` : originalSchedule.notes,
      rescheduledFrom: args.originalScheduleId,
      createdBy: originalSchedule.createdBy,
      createdAt: now,
      updatedAt: now,
    });
    
    return newScheduleId;
  },
});

export const cancelActivitySchedule = mutation({
  args: {
    scheduleId: v.id("activitySchedules"),
    cancellationReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw new Error("Schedule not found");
    }
    
    const cancelNotes = args.cancellationReason 
      ? `Cancelled: ${args.cancellationReason}`
      : "Cancelled";
    
    await ctx.db.patch(args.scheduleId, {
      status: "cancelled",
      notes: schedule.notes ? `${schedule.notes} | ${cancelNotes}` : cancelNotes,
      updatedAt: now,
    });
    
    return { success: true };
  },
});

// Helper function for creating recurring schedules
async function createRecurringSchedules(ctx: any, originalScheduleId: any, args: any) {
  if (!args.recurringPattern) return;
  
  const { frequency, interval, endDate, daysOfWeek } = args.recurringPattern;
  const maxOccurrences = 52; // Limit to prevent infinite schedules
  let occurrences = 0;
  
  let currentDate = new Date(args.scheduledDate);
  const originalStartTime = args.scheduledStartTime;
  const originalEndTime = args.scheduledEndTime;
  
  while (occurrences < maxOccurrences) {
    // Calculate next occurrence
    switch (frequency) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + interval);
        break;
      case "weekly":
        currentDate.setDate(currentDate.getDate() + (7 * interval));
        break;
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + interval);
        break;
    }
    
    // Check if we've reached the end date
    if (endDate && currentDate.getTime() > endDate) {
      break;
    }
    
    // For weekly patterns, check if this day of week is included
    if (frequency === "weekly" && daysOfWeek && daysOfWeek.length > 0) {
      if (!daysOfWeek.includes(currentDate.getDay())) {
        continue;
      }
    }
    
    // Create the recurring schedule
    await ctx.db.insert("activitySchedules", {
      activityId: args.activityId,
      goalId: args.goalId,
      clientId: args.clientId,
      scheduledDate: currentDate.getTime(),
      scheduledStartTime: originalStartTime + (currentDate.getTime() - args.scheduledDate),
      scheduledEndTime: originalEndTime + (currentDate.getTime() - args.scheduledDate),
      assignedTo: args.assignedTo,
      priority: args.priority,
      status: "scheduled",
      notes: `${args.notes || ""} (Recurring)`.trim(),
      recurringPattern: args.recurringPattern,
      createdBy: args.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    occurrences++;
  }
}

// ===== SHIFT NOTES MANAGEMENT =====

export const getShiftNotes = query({
  args: {
    userId: v.optional(v.id("users")),
    clientId: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("reviewed")
    )),
  },
  handler: async (ctx, args) => {
    let shiftNotes = await ctx.db.query("shiftNotes").collect();
    
    // Apply filters
    if (args.userId) {
      shiftNotes = shiftNotes.filter(note => note.userId === args.userId);
    }
    
    if (args.clientId) {
      shiftNotes = shiftNotes.filter(note => note.clientId === args.clientId);
    }
    
    if (args.status) {
      shiftNotes = shiftNotes.filter(note => note.status === args.status);
    }
    
    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      shiftNotes = shiftNotes.filter(note => {
        if (args.startDate && note.shiftDate < args.startDate) return false;
        if (args.endDate && note.shiftDate > args.endDate) return false;
        return true;
      });
    }
    
    return shiftNotes;
  },
});

export const createShiftNote = mutation({
  args: {
    userId: v.id("users"),
    clientId: v.string(),
    shiftDate: v.number(),
    startTime: v.number(),
    endTime: v.number(),
    summary: v.string(),
    activitiesCompleted: v.array(v.id("activityCompletions")),
    goalsCovered: v.array(v.id("goals")),
    challenges: v.optional(v.string()),
    behaviorIncidentIds: v.optional(v.array(v.id("behaviors"))),
    skillsPracticed: v.array(v.string()),
    generalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const shiftNoteId = await ctx.db.insert("shiftNotes", {
      ...args,
      status: "submitted",
      createdAt: now,
      updatedAt: now,
    });
    return shiftNoteId;
  },
});

// ===== MEDIA MANAGEMENT =====

export const getMediaAttachments = query({
  args: {
    behaviorId: v.optional(v.id("behaviors")),
    goalId: v.optional(v.id("goals")),
    activityCompletionId: v.optional(v.id("activityCompletions")),
    shiftNoteId: v.optional(v.id("shiftNotes")),
    uploadedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let media = await ctx.db.query("mediaAttachments").collect();
    
    // Apply filters
    if (args.behaviorId) {
      media = media.filter(item => item.behaviorId === args.behaviorId);
    } else if (args.goalId) {
      media = media.filter(item => item.goalId === args.goalId);
    } else if (args.activityCompletionId) {
      media = media.filter(item => item.activityCompletionId === args.activityCompletionId);
    } else if (args.shiftNoteId) {
      media = media.filter(item => item.shiftNoteId === args.shiftNoteId);
    } else if (args.uploadedBy) {
      media = media.filter(item => item.uploadedBy === args.uploadedBy);
    }
    
    return media;
  },
});

export const createMediaAttachment = mutation({
  args: {
    fileName: v.string(),
    fileUrl: v.string(),
    fileType: v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("document")
    ),
    fileSize: v.number(),
    mimeType: v.string(),
    uploadedBy: v.id("users"),
    behaviorId: v.optional(v.id("behaviors")),
    goalId: v.optional(v.id("goals")),
    activityCompletionId: v.optional(v.id("activityCompletions")),
    shiftNoteId: v.optional(v.id("shiftNotes")),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const mediaId = await ctx.db.insert("mediaAttachments", {
      ...args,
      createdAt: now,
    });
    return mediaId;
  },
});

// ===== REPORTS =====

export const generateReport = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const reportId = await ctx.db.insert("reports", {
      ...args,
      reportData: {}, // Will be populated by the report generation logic
      status: "generating",
      createdAt: now,
    });
    
    // In a real implementation, you might want to trigger an action
    // to generate the actual report data asynchronously
    
    return reportId;
  },
});

// ===== UTILITY QUERIES =====

export const getBehaviorChecklist = query({
  args: {
    category: v.optional(v.union(
      v.literal("aggression"),
      v.literal("self_harm"),
      v.literal("wandering"),
      v.literal("inappropriate_behavior"),
      v.literal("communication"),
      v.literal("other")
    )),
  },
  handler: async (ctx, args) => {
    let checklist = await ctx.db.query("behaviorChecklist").collect();
    
    if (args.category) {
      checklist = checklist.filter(item => item.category === args.category);
    }
    
    return checklist.filter(item => item.isActive);
  },
});

export const getInterventionStrategies = query({
  args: {
    category: v.optional(v.union(
      v.literal("verbal"),
      v.literal("sensory"),
      v.literal("environmental"),
      v.literal("physical"),
      v.literal("other")
    )),
  },
  handler: async (ctx, args) => {
    let strategies = await ctx.db.query("interventionStrategies").collect();
    
    if (args.category) {
      strategies = strategies.filter(item => item.category === args.category);
    }
    
    return strategies.filter(item => item.isActive);
  },
});
