"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IconAlertTriangle, IconChevronLeft, IconChevronRight, IconPlus } from "@tabler/icons-react"
import { Location } from "../../../types/database"
import { useBehaviorsRealtime } from "../../hooks/use-behaviors-realtime"
import { useClientsRealtime } from "../../hooks/use-clients-realtime"
import { useUser } from "@clerk/nextjs"

interface BehaviorIncidentFormProps {
  onIncidentSubmitted?: () => void
}

interface FormData {
  // Basic incident info
  clientId: string
  dateTime: string
  timeOnly: string
  endTime: string
  location: Location | ""
  activityBefore: string
  
  // Behaviors
  selectedBehaviors: string[]
  customBehaviors: string
  
  // Warning signs
  warningSignsPresent: boolean
  warningSignsNotes: string
  
  // Intensity and harm
  intensity: number
  harmToClientOccurred: boolean
  harmToClientDescription: string
  harmToClientExtent: string
  harmToOthersOccurred: boolean
  harmToOthersDescription: string
  harmToOthersExtent: string
  
  // Interventions
  selectedInterventions: string[]
  interventionNotes: string
  supportPersonRequired: boolean
  supportPersonExplanation: string
  
  // Description
  description: string
}

const initialFormData: FormData = {
  clientId: "",
  dateTime: "",
  timeOnly: "",
  endTime: "",
  location: "",
  activityBefore: "",
  selectedBehaviors: [],
  customBehaviors: "",
  warningSignsPresent: false,
  warningSignsNotes: "",
  intensity: 1,
  harmToClientOccurred: false,
  harmToClientDescription: "",
  harmToClientExtent: "",
  harmToOthersOccurred: false,
  harmToOthersDescription: "",
  harmToOthersExtent: "",
  selectedInterventions: [],
  interventionNotes: "",
  supportPersonRequired: false,
  supportPersonExplanation: "",
  description: "",
}

const behaviorTypes = [
  "Physical aggression towards others",
  "Verbal aggression/threats",
  "Self-injurious behavior",
  "Property destruction",
  "Inappropriate sexual behavior",
  "Wandering/elopement",
  "Refusal to follow directions",
  "Repetitive behaviors",
  "Inappropriate vocalizations",
  "Food-related behaviors",
  "Sleep disturbances",
  "Social withdrawal",
]

const interventionStrategies = [
  "Verbal redirection",
  "Environmental modification",
  "Sensory tools (weighted blanket, fidget)",
  "Physical redirection",
  "Remove from situation",
  "Offer alternatives/choices",
  "Deep breathing exercises",
  "Calming activities",
  "One-on-one attention",
  "Break/rest time",
  "Distraction technique",
  "Professional consultation",
]

const intensityDescriptions = {
  1: "Minimal - Brief, easily redirected",
  2: "Low - Some persistence, responds to verbal cues", 
  3: "Moderate - Sustained behavior, requires intervention",
  4: "High - Intense behavior, multiple interventions needed",
  5: "Severe - Dangerous behavior, immediate action required"
}

export function BehaviorIncidentForm({ onIncidentSubmitted }: BehaviorIncidentFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  
  // Get real-time behaviors hook, clients data, and user info
  const { createBehaviorIncident } = useBehaviorsRealtime()
  const { clients, isLoading: clientsLoading } = useClientsRealtime()
  const { user } = useUser()

  const totalSteps = 5

  const updateFormData = (field: keyof FormData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const toggleBehavior = (behavior: string) => {
    setFormData(prev => ({
      ...prev,
      selectedBehaviors: prev.selectedBehaviors.includes(behavior)
        ? prev.selectedBehaviors.filter(b => b !== behavior)
        : [...prev.selectedBehaviors, behavior]
    }))
  }

  const toggleIntervention = (intervention: string) => {
    setFormData(prev => ({
      ...prev,
      selectedInterventions: prev.selectedInterventions.includes(intervention)
        ? prev.selectedInterventions.filter(i => i !== intervention)
        : [...prev.selectedInterventions, intervention]
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setCurrentStep(1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Validation
      if (!formData.clientId || !formData.dateTime || !formData.timeOnly || !formData.location || !formData.description) {
        throw new Error("Please fill in all required fields")
      }

      if (!user) {
        throw new Error("User not authenticated")
      }

      // Combine date and time
      const dateTimeISO = formData.dateTime + 'T' + (formData.timeOnly || '12:00')
      const endTimeISO = formData.endTime ? formData.dateTime + 'T' + formData.endTime : undefined

      const behaviorData = {
        clientId: formData.clientId,
        dateTime: new Date(dateTimeISO).getTime(),
        endTime: endTimeISO ? new Date(endTimeISO).getTime() : undefined,
        location: formData.location as Location,
        activityBefore: formData.activityBefore || undefined,
        behaviors: formData.selectedBehaviors,
        customBehaviors: formData.customBehaviors || undefined,
        warningSigns: formData.warningSignsPresent ? {
          present: formData.warningSignsPresent,
          notes: formData.warningSignsNotes || undefined,
        } : undefined,
        intensity: formData.intensity as 1 | 2 | 3 | 4 | 5,
        harmToClient: formData.harmToClientOccurred ? {
          occurred: formData.harmToClientOccurred,
          description: formData.harmToClientDescription || undefined,
          extent: formData.harmToClientExtent || undefined,
        } : undefined,
        harmToOthers: formData.harmToOthersOccurred ? {
          occurred: formData.harmToOthersOccurred,
          description: formData.harmToOthersDescription || undefined,
          extent: formData.harmToOthersExtent || undefined,
        } : undefined,
        interventions: formData.selectedInterventions,
        interventionNotes: formData.interventionNotes || undefined,
        supportRequired: formData.supportPersonRequired ? {
          secondPerson: formData.supportPersonRequired,
          explanation: formData.supportPersonExplanation || undefined,
        } : undefined,
        description: formData.description,
      }

      // Call Convex mutation to create behavior incident
      await createBehaviorIncident(behaviorData)
      
      // Reset and close
      resetForm()
      setIsOpen(false)
      onIncidentSubmitted?.()
      
    } catch (error) {
      console.error("Error submitting behavior incident:", error)
      // In a real app, show a toast notification with the error
      alert(error instanceof Error ? error.message : "Failed to submit incident report")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Incident Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select value={formData.clientId} onValueChange={(value) => updateFormData('clientId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={clientsLoading ? "Loading clients..." : "Select a client"} />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsLoading ? (
                        <SelectItem value="" disabled>Loading clients...</SelectItem>
                      ) : clients.length === 0 ? (
                        <SelectItem value="" disabled>No clients available</SelectItem>
                      ) : (
                        clients
                          .filter(client => client.isActive) // Only show active clients
                          .map((client) => (
                            <SelectItem key={client._id} value={client._id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{client.name}</span>
                                {client.guardianName && (
                                  <span className="text-xs text-muted-foreground">
                                    Guardian: {client.guardianName}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select value={formData.location} onValueChange={(value) => updateFormData('location', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.dateTime}
                    onChange={(e) => updateFormData('dateTime', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Start Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.timeOnly}
                    onChange={(e) => updateFormData('timeOnly', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => updateFormData('endTime', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="activity">Activity Before Incident</Label>
                <Textarea
                  id="activity"
                  placeholder="What was happening immediately before the incident?"
                  value={formData.activityBefore}
                  onChange={(e) => updateFormData('activityBefore', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Behaviors Observed</h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Select all behaviors that occurred:</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {behaviorTypes.map((behavior) => (
                      <div key={behavior} className="flex items-center space-x-2">
                        <Checkbox
                          id={behavior}
                          checked={formData.selectedBehaviors.includes(behavior)}
                          onCheckedChange={() => toggleBehavior(behavior)}
                        />
                        <Label htmlFor={behavior} className="text-sm leading-tight">
                          {behavior}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customBehaviors">Other Behaviors (Please specify)</Label>
                  <Textarea
                    id="customBehaviors"
                    placeholder="Describe any other behaviors not listed above..."
                    value={formData.customBehaviors}
                    onChange={(e) => updateFormData('customBehaviors', e.target.value)}
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="warningSigns"
                      checked={formData.warningSignsPresent}
                      onCheckedChange={(checked) => updateFormData('warningSignsPresent', checked)}
                    />
                    <Label htmlFor="warningSigns" className="text-base font-medium">
                      Warning signs were present before the incident
                    </Label>
                  </div>
                  
                  {formData.warningSignsPresent && (
                    <div className="space-y-2">
                      <Label htmlFor="warningNotes">Describe the warning signs</Label>
                      <Textarea
                        id="warningNotes"
                        placeholder="What warning signs did you observe?"
                        value={formData.warningSignsNotes}
                        onChange={(e) => updateFormData('warningSignsNotes', e.target.value)}
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Intensity & Impact</h3>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Behavior Intensity Level *</Label>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div key={level} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id={`intensity-${level}`}
                          name="intensity"
                          value={level}
                          checked={formData.intensity === level}
                          onChange={() => updateFormData('intensity', level)}
                          className="w-4 h-4"
                        />
                        <Label htmlFor={`intensity-${level}`} className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={level >= 4 ? "destructive" : level >= 3 ? "default" : "secondary"}>
                              Level {level}
                            </Badge>
                            <span className="text-sm">{intensityDescriptions[level as keyof typeof intensityDescriptions]}</span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <IconAlertTriangle className="h-5 w-5 text-orange-500" />
                    Harm Assessment
                  </h4>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Harm to Client</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="harmToClient"
                          checked={formData.harmToClientOccurred}
                          onCheckedChange={(checked) => updateFormData('harmToClientOccurred', checked)}
                        />
                        <Label htmlFor="harmToClient">Client was harmed during this incident</Label>
                      </div>
                      
                      {formData.harmToClientOccurred && (
                        <div className="space-y-3 ml-6">
                          <div className="space-y-2">
                            <Label htmlFor="clientHarmDesc">Description of harm</Label>
                            <Textarea
                              id="clientHarmDesc"
                              placeholder="Describe the nature of the harm..."
                              value={formData.harmToClientDescription}
                              onChange={(e) => updateFormData('harmToClientDescription', e.target.value)}
                              rows={2}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="clientHarmExtent">Extent/severity of harm</Label>
                            <Input
                              id="clientHarmExtent"
                              placeholder="e.g., Minor bruising, No medical attention needed"
                              value={formData.harmToClientExtent}
                              onChange={(e) => updateFormData('harmToClientExtent', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Harm to Others</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="harmToOthers"
                          checked={formData.harmToOthersOccurred}
                          onCheckedChange={(checked) => updateFormData('harmToOthersOccurred', checked)}
                        />
                        <Label htmlFor="harmToOthers">Others were harmed during this incident</Label>
                      </div>
                      
                      {formData.harmToOthersOccurred && (
                        <div className="space-y-3 ml-6">
                          <div className="space-y-2">
                            <Label htmlFor="othersHarmDesc">Description of harm to others</Label>
                            <Textarea
                              id="othersHarmDesc"
                              placeholder="Describe who was harmed and how..."
                              value={formData.harmToOthersDescription}
                              onChange={(e) => updateFormData('harmToOthersDescription', e.target.value)}
                              rows={2}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="othersHarmExtent">Extent/severity of harm</Label>
                            <Input
                              id="othersHarmExtent"
                              placeholder="e.g., Staff member scratched, First aid provided"
                              value={formData.harmToOthersExtent}
                              onChange={(e) => updateFormData('harmToOthersExtent', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Interventions & Support</h3>
              
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-3 block">Interventions Used</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {interventionStrategies.map((intervention) => (
                      <div key={intervention} className="flex items-center space-x-2">
                        <Checkbox
                          id={intervention}
                          checked={formData.selectedInterventions.includes(intervention)}
                          onCheckedChange={() => toggleIntervention(intervention)}
                        />
                        <Label htmlFor={intervention} className="text-sm leading-tight">
                          {intervention}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interventionNotes">Additional Intervention Notes</Label>
                  <Textarea
                    id="interventionNotes"
                    placeholder="Describe effectiveness of interventions, what worked/didn't work..."
                    value={formData.interventionNotes}
                    onChange={(e) => updateFormData('interventionNotes', e.target.value)}
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="supportPerson"
                      checked={formData.supportPersonRequired}
                      onCheckedChange={(checked) => updateFormData('supportPersonRequired', checked)}
                    />
                    <Label htmlFor="supportPerson" className="text-base font-medium">
                      Additional support person was required
                    </Label>
                  </div>
                  
                  {formData.supportPersonRequired && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="supportExplanation">Explanation</Label>
                      <Textarea
                        id="supportExplanation"
                        placeholder="Why was additional support needed? Who provided support?"
                        value={formData.supportPersonExplanation}
                        onChange={(e) => updateFormData('supportPersonExplanation', e.target.value)}
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Incident Summary</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Complete Description of Incident *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a comprehensive description of what happened, including context, sequence of events, and outcomes..."
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-base">Review Your Submission</CardTitle>
                    <CardDescription>
                      Please review the key details before submitting this incident report
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <strong>Client:</strong> {
                        formData.clientId 
                          ? clients.find(c => c._id === formData.clientId)?.name || 'Selected client'
                          : 'No client selected'
                      }
                    </div>
                    <div><strong>Date/Time:</strong> {formData.dateTime} at {formData.timeOnly}</div>
                    <div><strong>Location:</strong> {formData.location}</div>
                    <div><strong>Behaviors:</strong> {formData.selectedBehaviors.length} selected</div>
                    <div><strong>Intensity Level:</strong> {formData.intensity}/5</div>
                    <div><strong>Harm Occurred:</strong> {
                      formData.harmToClientOccurred || formData.harmToOthersOccurred ? 'Yes' : 'No'
                    }</div>
                    <div><strong>Interventions:</strong> {formData.selectedInterventions.length} used</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <IconPlus className="h-4 w-4" />
          Report Incident
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Behavior Incident Report</DialogTitle>
          <DialogDescription>
            Step {currentStep} of {totalSteps} - Complete all sections to submit the incident report
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center space-x-2 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : step < currentStep 
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step}
              </div>
              {step < totalSteps && (
                <div className={`h-0.5 w-8 mx-1 ${
                  step < currentStep ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <IconChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep}>
                Next
                <IconChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.description || !formData.clientId}
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            )}
          </div>
          
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}