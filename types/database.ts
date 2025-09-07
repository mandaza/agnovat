// Database entity types for Agnovat CareSync

export type UserRole = 
  | "admin"
  | "support_worker"
  | "behavior_practitioner"
  | "family"
  | "support_coordinator";

export type BehaviorStatus = 
  | "draft"
  | "submitted"
  | "reviewed"
  | "archived";

export type GoalStatus = 
  | "active"
  | "completed"
  | "paused"
  | "cancelled";

export type GoalCategory = 
  | "communication"
  | "social_skills"
  | "motor_skills"
  | "independent_living"
  | "cognitive"
  | "emotional_regulation"
  | "other";

export type GoalType = 
  | "short_term"
  | "long_term";

export type ActivityFrequency = 
  | "daily"
  | "weekly"
  | "monthly"
  | "as_needed";

export type ActivityCompletionStatus = 
  | "completed"
  | "in_progress"
  | "not_completed";

export type ActivityScheduleStatus = 
  | "scheduled"
  | "in_progress"
  | "completed"
  | "rescheduled"
  | "cancelled";

export type SchedulePriority = 
  | "high"
  | "medium"
  | "low";

export type RecurringFrequency = 
  | "daily"
  | "weekly"
  | "monthly";

export type ShiftNoteStatus = 
  | "draft"
  | "submitted"
  | "reviewed";

export type MediaFileType = 
  | "image"
  | "video"
  | "document";

export type ReportType = 
  | "daily"
  | "weekly"
  | "monthly"
  | "custom";

export type ReportStatus = 
  | "generating"
  | "completed"
  | "failed";

export type BehaviorCategory = 
  | "aggression"
  | "self_harm"
  | "wandering"
  | "inappropriate_behavior"
  | "communication"
  | "other";

export type InterventionCategory = 
  | "verbal"
  | "sensory"
  | "environmental"
  | "physical"
  | "other";

export type Location = 
  | "home"
  | "car"
  | "public"
  | "school"
  | "other";

export type Difficulty = 
  | "easy"
  | "moderate"
  | "difficult";

export type ClientEngagement = 
  | "high"
  | "medium"
  | "low";

// Base entity interface
export interface BaseEntity {
  _id: string;
  createdAt: number;
  updatedAt?: number;
}

// User entity
export interface User extends BaseEntity {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

// Client entity
export interface Client extends BaseEntity {
  name: string;
  dateOfBirth?: number;
  guardianName?: string;
  guardianContact?: string;
  medicalInfo?: string;
  carePlan?: string;
  isActive: boolean;
}

// Behavior incident entity
export interface Behavior extends BaseEntity {
  userId: string;
  clientId: string;
  dateTime: number;
  endTime?: number;
  location: Location;
  activityBefore?: string;
  behaviors: string[];
  customBehaviors?: string;
  warningSigns?: {
    present: boolean;
    notes?: string;
  };
  intensity: 1 | 2 | 3 | 4 | 5;
  harmToClient?: {
    occurred: boolean;
    description?: string;
    extent?: string;
  };
  harmToOthers?: {
    occurred: boolean;
    description?: string;
    extent?: string;
  };
  interventions: string[];
  interventionNotes?: string;
  supportRequired?: {
    secondPerson: boolean;
    explanation?: string;
  };
  description: string;
  status: BehaviorStatus;
  reviewedBy?: string;
  reviewedAt?: number;
}

// Goal entity
export interface Goal extends BaseEntity {
  clientId: string;
  title: string;
  description: string;
  category: GoalCategory;
  type: GoalType;
  targetDate?: number;
  status: GoalStatus;
  progress: number;
  createdBy: string;
  assignedTo?: string;
}

// Activity entity
export interface Activity extends BaseEntity {
  goalId: string;
  title: string;
  description: string;
  frequency: ActivityFrequency;
  estimatedDuration?: number;
  instructions?: string;
  materials?: string[];
  isActive: boolean;
}

// Activity schedule entity
export interface ActivitySchedule extends BaseEntity {
  activityId: string;
  goalId: string;
  clientId: string;
  scheduledDate: number;
  scheduledStartTime: number;
  scheduledEndTime: number;
  assignedTo: string;
  status: ActivityScheduleStatus;
  priority: SchedulePriority;
  notes?: string;
  completionId?: string;
  rescheduledFrom?: string;
  recurringPattern?: {
    frequency: RecurringFrequency;
    interval: number;
    endDate?: number;
    daysOfWeek?: number[];
  };
  createdBy: string;
}

// Activity completion entity
export interface ActivityCompletion extends BaseEntity {
  activityId: string;
  goalId: string;
  userId: string;
  clientId: string;
  scheduledId?: string;
  completedAt: number;
  status: ActivityCompletionStatus;
  notes?: string;
  difficulty?: Difficulty;
  clientEngagement?: ClientEngagement;
}

// Shift note entity
export interface ShiftNote extends BaseEntity {
  userId: string;
  clientId: string;
  shiftDate: number;
  startTime: number;
  endTime: number;
  summary: string;
  activitiesCompleted: string[];
  goalsCovered: string[];
  challenges?: string;
  behaviorIncidentIds?: string[];
  skillsPracticed: string[];
  generalNotes?: string;
  status: ShiftNoteStatus;
  reviewedBy?: string;
  reviewedAt?: number;
}

// Media attachment entity
export interface MediaAttachment extends BaseEntity {
  fileName: string;
  fileUrl: string;
  fileType: MediaFileType;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  behaviorId?: string;
  goalId?: string;
  activityCompletionId?: string;
  shiftNoteId?: string;
  description?: string;
}

// Behavior checklist item entity
export interface BehaviorChecklistItem extends BaseEntity {
  name: string;
  category: BehaviorCategory;
  description?: string;
  isActive: boolean;
}

// Intervention strategy entity
export interface InterventionStrategy extends BaseEntity {
  name: string;
  category: InterventionCategory;
  description?: string;
  isActive: boolean;
}

// Report entity
export interface Report extends BaseEntity {
  title: string;
  type: ReportType;
  clientId: string;
  startDate: number;
  endDate: number;
  generatedBy: string;
  reportData: any;
  status: ReportStatus;
  completedAt?: number;
}

// Form data types for creating/updating entities
export interface CreateBehaviorData {
  userId: string;
  clientId: string;
  dateTime: number;
  endTime?: number;
  location: Location;
  activityBefore?: string;
  behaviors: string[];
  customBehaviors?: string;
  warningSigns?: {
    present: boolean;
    notes?: string;
  };
  intensity: 1 | 2 | 3 | 4 | 5;
  harmToClient?: {
    occurred: boolean;
    description?: string;
    extent?: string;
  };
  harmToOthers?: {
    occurred: boolean;
    description?: string;
    extent?: string;
  };
  interventions: string[];
  interventionNotes?: string;
  supportRequired?: {
    secondPerson: boolean;
    explanation?: string;
  };
  description: string;
}

export interface CreateGoalData {
  clientId: string;
  title: string;
  description: string;
  category: GoalCategory;
  type: GoalType;
  targetDate?: number;
  assignedTo?: string;
  createdBy: string;
}

export interface CreateActivityData {
  goalId: string;
  title: string;
  description: string;
  frequency: ActivityFrequency;
  estimatedDuration?: number;
  instructions?: string;
  materials?: string[];
}

export interface CreateActivityScheduleData {
  activityId: string;
  goalId: string;
  clientId: string;
  scheduledDate: number;
  scheduledStartTime: number;
  scheduledEndTime: number;
  assignedTo: string;
  priority: SchedulePriority;
  notes?: string;
  recurringPattern?: {
    frequency: RecurringFrequency;
    interval: number;
    endDate?: number;
    daysOfWeek?: number[];
  };
  createdBy: string;
}

export interface CreateShiftNoteData {
  userId: string;
  clientId: string;
  shiftDate: number;
  startTime: number;
  endTime: number;
  summary: string;
  activitiesCompleted: string[];
  goalsCovered: string[];
  challenges?: string;
  behaviorIncidentIds?: string[];
  skillsPracticed: string[];
  generalNotes?: string;
}

export interface CreateMediaAttachmentData {
  fileName: string;
  fileUrl: string;
  fileType: MediaFileType;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  behaviorId?: string;
  goalId?: string;
  activityCompletionId?: string;
  shiftNoteId?: string;
  description?: string;
}

// Filter and query types
export interface BehaviorFilters {
  clientId?: string;
  userId?: string;
  status?: BehaviorStatus;
  startDate?: number;
  endDate?: number;
}

export interface GoalFilters {
  clientId?: string;
  category?: GoalCategory;
  status?: GoalStatus;
  assignedTo?: string;
}

export interface ActivityScheduleFilters {
  activityId?: string;
  goalId?: string;
  clientId?: string;
  assignedTo?: string;
  status?: ActivityScheduleStatus;
  priority?: SchedulePriority;
  startDate?: number;
  endDate?: number;
  scheduledDate?: number;
}

export interface ShiftNoteFilters {
  userId?: string;
  clientId?: string;
  startDate?: number;
  endDate?: number;
  status?: ShiftNoteStatus;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
