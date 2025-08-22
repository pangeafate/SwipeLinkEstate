/**
 * Visit Booking Type Definitions
 * Shared types for the visit booking system components
 */

import { Property } from '../types'

export interface Agent {
  id: string
  name: string
  phone: string
  email: string
  avatar?: string
}

export interface TimeSlot {
  date: string
  time: string
  available: boolean
}

export interface VisitorInfo {
  name: string
  email: string
  phone: string
  groupSize: number
}

export interface VisitPreferences {
  specialRequirements: string
  accessibilityNeeds: boolean
  budgetDiscussion: boolean
  financingDiscussion: boolean
}

export interface AdditionalRequests {
  neighborhoodTour: boolean
  comparableProperties: boolean
  marketAnalysis: boolean
  customNotes: string
}

export interface BookingSubmission {
  propertyId: string
  date: string
  time: string
  visitor: VisitorInfo
  preferences: VisitPreferences
  additionalRequests: AdditionalRequests
}

export interface ConfirmedBooking {
  confirmationNumber: string
  date: string
  time: string
  property: Property
  agent: Agent
}

export interface ExistingBooking {
  id: string
  confirmationNumber?: string
  date: string
  time: string
  property?: Property
}

export interface BookingFormData {
  selectedDate: string
  selectedTime: string
  visitor: VisitorInfo
  preferences: VisitPreferences
  additionalRequests: AdditionalRequests
  selectedProperties: string[]
}

export interface ValidationErrors {
  date?: string
  time?: string
  name?: string
  email?: string
  phone?: string
  groupSize?: string
  general?: string
}