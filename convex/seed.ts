import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed behavior checklist items
export const seedBehaviorChecklist = mutation({
  args: {},
  handler: async (ctx) => {
    const behaviors = [
      {
        name: "Physical Aggression",
        category: "aggression",
        description: "Hitting, kicking, biting, or other physical attacks",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Verbal Aggression",
        category: "aggression",
        description: "Yelling, cursing, or threatening language",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Self-Harm",
        category: "self_harm",
        description: "Head banging, scratching, or other self-injurious behavior",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Wandering/Elopement",
        category: "wandering",
        description: "Leaving designated areas without permission",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Inappropriate Sexual Behavior",
        category: "inappropriate_behavior",
        description: "Public masturbation or other sexual behaviors",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Property Destruction",
        category: "aggression",
        description: "Breaking or damaging objects",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Refusal/Non-compliance",
        category: "communication",
        description: "Refusing to follow instructions or complete tasks",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Screaming/Shouting",
        category: "communication",
        description: "Excessive vocalizations or noise-making",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Repetitive Behaviors",
        category: "other",
        description: "Stereotypical or repetitive movements/actions",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Food Refusal",
        category: "other",
        description: "Refusing to eat or drink",
        isActive: true,
        createdAt: Date.now(),
      },
    ];

    for (const behavior of behaviors) {
      await ctx.db.insert("behaviorChecklist", behavior);
    }

    return { message: "Behavior checklist seeded successfully" };
  },
});

// Seed intervention strategies
export const seedInterventionStrategies = mutation({
  args: {},
  handler: async (ctx) => {
    const strategies = [
      {
        name: "Verbal Redirection",
        category: "verbal",
        description: "Using calm, clear language to redirect attention",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Sensory Break",
        category: "sensory",
        description: "Providing quiet time or sensory input to calm",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Environmental Modification",
        category: "environmental",
        description: "Changing the physical environment to reduce triggers",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Physical Guidance",
        category: "physical",
        description: "Gentle physical assistance to complete tasks",
        isActive: true,
        createdAt: Date.now(),
      },
      {
        name: "Positive Reinforcement",
        category: "verbal",
        description: "Praising and rewarding positive behaviors",
        isActive: true,
        createdAt: Date.now(),
      },
    ];

    for (const strategy of strategies) {
      await ctx.db.insert("interventionStrategies", strategy);
    }

    return { message: "Intervention strategies seeded successfully" };
  },
});

// Seed sample goals for testing
export const seedGoals = mutation({
  args: {},
  handler: async (ctx) => {
    // First, create a sample user if none exists
    let userId = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "admin@agnovat.com"))
      .first();
    
    if (!userId) {
      userId = await ctx.db.insert("users", {
        clerkId: "sample_clerk_id",
        email: "admin@agnovat.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Create sample goals
    const goals = [
      {
        clientId: "Tavonga",
        title: "Improve Communication Skills",
        description: "Work on verbal communication and expression of needs",
        category: "communication" as const,
        type: "long_term" as const,
        targetDate: new Date("2024-12-31").getTime(),
        status: "active" as const,
        progress: 65,
        createdBy: userId._id,
        assignedTo: undefined,
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
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
        createdBy: userId._id,
        assignedTo: undefined,
        createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 days ago
        updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      },
      {
        clientId: "Tavonga",
        title: "Social Interaction Skills",
        description: "Develop appropriate social behaviors in group settings",
        category: "social_skills" as const,
        type: "long_term" as const,
        targetDate: new Date("2025-06-30").getTime(),
        status: "completed" as const,
        progress: 100,
        createdBy: userId._id,
        assignedTo: undefined,
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
        updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
      },
      {
        clientId: "Tavonga",
        title: "Fine Motor Skills",
        description: "Improve hand-eye coordination and fine motor control",
        category: "motor_skills" as const,
        type: "short_term" as const,
        targetDate: new Date("2024-09-15").getTime(),
        status: "paused" as const,
        progress: 25,
        createdBy: userId._id,
        assignedTo: undefined,
        createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
        updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
      },
    ];

    for (const goal of goals) {
      await ctx.db.insert("goals", goal);
    }

    return { message: "Goals seeded successfully" };
  },
});

// Seed a sample client (Tavonga)
export const seedSampleClient = mutation({
  args: {},
  handler: async (ctx) => {
    const client = {
      name: "Tavonga",
      dateOfBirth: new Date("2010-01-01").getTime(), // Example date
      guardianName: "Parent/Guardian Name",
      guardianContact: "contact@example.com",
      medicalInfo: "Sample medical information",
      carePlan: "Sample care plan details",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const clientId = await ctx.db.insert("clients", client);
    return { message: "Sample client created", clientId };
  },
});

// Seed all data
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    await ctx.db.insert("behaviorChecklist", {
      name: "Physical Aggression",
      category: "aggression",
      description: "Hitting, kicking, biting, or other physical attacks",
      isActive: true,
      createdAt: Date.now(),
    });

    await ctx.db.insert("interventionStrategies", {
      name: "Verbal Redirection",
      category: "verbal",
      description: "Using calm, clear language to redirect attention",
      isActive: true,
      createdAt: Date.now(),
    });

    await ctx.db.insert("clients", {
      name: "Tavonga",
      dateOfBirth: new Date("2010-01-01").getTime(),
      guardianName: "Parent/Guardian Name",
      guardianContact: "contact@example.com",
      medicalInfo: "Sample medical information",
      carePlan: "Sample care plan details",
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { message: "All seed data created successfully" };
  },
});
