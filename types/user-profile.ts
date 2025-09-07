import { Roles, ApprovalStatus } from './globals'

export interface UserProfile {
  _id: string
  _creationTime: number
  clerkId: string
  email: string
  firstName: string
  lastName: string
  role?: Roles
  approvalStatus?: ApprovalStatus
  requestedAt?: number
  approvedAt?: number
  approvedBy?: string
  isActive: boolean
  // Enhanced profile fields
  phoneNumber?: string
  address?: string
  dateOfBirth?: number
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  certifications?: string[]
  specializations?: string[]
  yearsExperience?: number
  availabilitySchedule?: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
  notes?: string
  lastLoginAt?: number
  clientAssignments?: string[]
  performanceRating?: number
  createdAt: number
  updatedAt: number
}