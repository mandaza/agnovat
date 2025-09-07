'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DatePicker } from "@/components/ui/date-picker"
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  Calendar,
  User,
  Shield,
  Award,
  MapPin,
  Clock
} from 'lucide-react'
import { Roles, ApprovalStatus } from '../../../types/globals'

interface SearchFilters {
  searchTerm: string
  roles: Roles[]
  approvalStatuses: ApprovalStatus[]
  dateRange: {
    from: Date | null
    to: Date | null
  }
  lastLoginRange: {
    from: Date | null
    to: Date | null
  }
  certifications: string[]
  specializations: string[]
  performanceRating: {
    min: number | null
    max: number | null
  }
  clientAssignments: boolean | null
  availableDays: string[]
}

interface AdvancedUserSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  resultsCount?: number
}

const INITIAL_FILTERS: SearchFilters = {
  searchTerm: '',
  roles: [],
  approvalStatuses: [],
  dateRange: { from: null, to: null },
  lastLoginRange: { from: null, to: null },
  certifications: [],
  specializations: [],
  performanceRating: { min: null, max: null },
  clientAssignments: null,
  availableDays: []
}

export function AdvancedUserSearch({ onFiltersChange, resultsCount }: AdvancedUserSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  const availableCertifications = [
    'NDIS Worker Screening',
    'First Aid Certificate',
    'CPR Certification',
    'Disability Support Certificate',
    'Behavior Support Training',
    'Mental Health First Aid',
    'Manual Handling Training'
  ]

  const availableSpecializations = [
    'Autism Support',
    'Physical Disabilities',
    'Intellectual Disabilities',
    'Mental Health',
    'Behavior Support',
    'Communication Disorders',
    'Mobility Support',
    'Independent Living Skills'
  ]

  const weekDays = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ]

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
    
    // Count active filters
    let count = 0
    if (updatedFilters.searchTerm) count++
    if (updatedFilters.roles.length > 0) count++
    if (updatedFilters.approvalStatuses.length > 0) count++
    if (updatedFilters.dateRange.from || updatedFilters.dateRange.to) count++
    if (updatedFilters.lastLoginRange.from || updatedFilters.lastLoginRange.to) count++
    if (updatedFilters.certifications.length > 0) count++
    if (updatedFilters.specializations.length > 0) count++
    if (updatedFilters.performanceRating.min !== null || updatedFilters.performanceRating.max !== null) count++
    if (updatedFilters.clientAssignments !== null) count++
    if (updatedFilters.availableDays.length > 0) count++
    
    setActiveFiltersCount(count)
  }

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS)
    onFiltersChange(INITIAL_FILTERS)
    setActiveFiltersCount(0)
  }

  const toggleArrayFilter = (array: string[], value: string, key: keyof SearchFilters) => {
    const newArray = array.includes(value) 
      ? array.filter(item => item !== value)
      : [...array, value]
    updateFilters({ [key]: newArray })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Advanced Search & Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {resultsCount !== undefined && (
              <span className="text-sm text-gray-600">{resultsCount} results</span>
            )}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-1" />
                  {isExpanded ? 'Simple' : 'Advanced'}
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search by name, email, or ID..."
            value={filters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            className="pl-10"
          />
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-6">
            
            {/* Role and Status Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  Roles
                </Label>
                <div className="space-y-2">
                  {(['admin', 'public_guardian', 'support_coordinator', 'support_worker', 'behavior_practitioner', 'family'] as Roles[]).map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={filters.roles.includes(role)}
                        onCheckedChange={() => toggleArrayFilter(filters.roles, role, 'roles')}
                      />
                      <Label htmlFor={`role-${role}`} className="text-sm capitalize">
                        {role.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Approval Status</Label>
                <div className="space-y-2">
                  {(['pending', 'approved', 'rejected'] as ApprovalStatus[]).map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filters.approvalStatuses.includes(status)}
                        onCheckedChange={() => toggleArrayFilter(filters.approvalStatuses, status, 'approvalStatuses')}
                      />
                      <Label htmlFor={`status-${status}`} className="text-sm capitalize">
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Registration Date
                </Label>
                <div className="flex space-x-2">
                  <DatePicker
                    date={filters.dateRange.from}
                    onDateChange={(date) => updateFilters({
                      dateRange: { ...filters.dateRange, from: date }
                    })}
                    placeholder="From"
                  />
                  <DatePicker
                    date={filters.dateRange.to}
                    onDateChange={(date) => updateFilters({
                      dateRange: { ...filters.dateRange, to: date }
                    })}
                    placeholder="To"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Last Login
                </Label>
                <div className="flex space-x-2">
                  <DatePicker
                    date={filters.lastLoginRange.from}
                    onDateChange={(date) => updateFilters({
                      lastLoginRange: { ...filters.lastLoginRange, from: date }
                    })}
                    placeholder="From"
                  />
                  <DatePicker
                    date={filters.lastLoginRange.to}
                    onDateChange={(date) => updateFilters({
                      lastLoginRange: { ...filters.lastLoginRange, to: date }
                    })}
                    placeholder="To"
                  />
                </div>
              </div>
            </div>

            {/* Performance Rating */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Award className="w-4 h-4 mr-1" />
                Performance Rating
              </Label>
              <div className="flex space-x-2 items-center">
                <Input
                  type="number"
                  placeholder="Min"
                  min="1"
                  max="5"
                  value={filters.performanceRating.min || ''}
                  onChange={(e) => updateFilters({
                    performanceRating: {
                      ...filters.performanceRating,
                      min: e.target.value ? parseInt(e.target.value) : null
                    }
                  })}
                  className="w-20"
                />
                <span className="text-sm text-gray-500">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  min="1"
                  max="5"
                  value={filters.performanceRating.max || ''}
                  onChange={(e) => updateFilters({
                    performanceRating: {
                      ...filters.performanceRating,
                      max: e.target.value ? parseInt(e.target.value) : null
                    }
                  })}
                  className="w-20"
                />
                <span className="text-xs text-gray-400">(1-5 stars)</span>
              </div>
            </div>

            {/* Client Assignments */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                Client Assignments
              </Label>
              <Select 
                value={filters.clientAssignments === null ? '' : filters.clientAssignments.toString()}
                onValueChange={(value) => updateFilters({
                  clientAssignments: value === '' ? null : value === 'true'
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any assignment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any assignment status</SelectItem>
                  <SelectItem value="true">Has client assignments</SelectItem>
                  <SelectItem value="false">No client assignments</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Certifications */}
            <div className="space-y-2">
              <Label>Certifications</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableCertifications.map((cert) => (
                  <div key={cert} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cert-${cert}`}
                      checked={filters.certifications.includes(cert)}
                      onCheckedChange={() => toggleArrayFilter(filters.certifications, cert, 'certifications')}
                    />
                    <Label htmlFor={`cert-${cert}`} className="text-sm">
                      {cert}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div className="space-y-2">
              <Label>Specializations</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableSpecializations.map((spec) => (
                  <div key={spec} className="flex items-center space-x-2">
                    <Checkbox
                      id={`spec-${spec}`}
                      checked={filters.specializations.includes(spec)}
                      onCheckedChange={() => toggleArrayFilter(filters.specializations, spec, 'specializations')}
                    />
                    <Label htmlFor={`spec-${spec}`} className="text-sm">
                      {spec}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability Days */}
            <div className="space-y-2">
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day}`}
                      checked={filters.availableDays.includes(day)}
                      onCheckedChange={() => toggleArrayFilter(filters.availableDays, day, 'availableDays')}
                    />
                    <Label htmlFor={`day-${day}`} className="text-sm capitalize">
                      {day.slice(0, 3)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">
                    Active Filters ({activeFiltersCount})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {filters.roles.map(role => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      Role: {role.replace('_', ' ')}
                    </Badge>
                  ))}
                  {filters.approvalStatuses.map(status => (
                    <Badge key={status} variant="secondary" className="text-xs">
                      Status: {status}
                    </Badge>
                  ))}
                  {filters.certifications.map(cert => (
                    <Badge key={cert} variant="secondary" className="text-xs">
                      Cert: {cert}
                    </Badge>
                  ))}
                  {/* Add more filter badges as needed */}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}