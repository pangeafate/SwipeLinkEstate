// Client module type definitions following README-driven development

export interface Property {
  id: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  area_sqft: number
  property_type: string
  images: string[]
  features: string[]
  description: string
  year_built?: number
  lot_size?: number
  garage_spaces?: number
  neighborhood: string
  school_district: string
  latitude?: number
  longitude?: number
}

export enum PropertyType {
  HOUSE = 'house',
  CONDO = 'condo',
  TOWNHOUSE = 'townhouse',
  APARTMENT = 'apartment',
  LAND = 'land',
  COMMERCIAL = 'commercial'
}

export enum PropertyStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SOLD = 'sold',
  OFF_MARKET = 'off_market'
}

// Updated bucket types for the 5-bucket system
export type BucketType = 'new_properties' | 'liked' | 'disliked' | 'considering' | 'schedule_visit'

export interface BucketData {
  new_properties: string[]
  liked: string[]
  disliked: string[]
  considering: string[]
  schedule_visit: string[]
}

export interface ClientBuckets {
  new_properties: Property[]
  liked: Property[]
  disliked: Property[]
  considering: Property[]
  schedule_visit: Property[]
}

export interface BucketConfig {
  new_properties: BucketSettings
  liked: BucketSettings
  disliked: BucketSettings
  considering: BucketSettings
  schedule_visit: BucketSettings
}

// Action types for property interactions
export type PropertyAction = 'like' | 'dislike' | 'consider' | 'schedule_visit'

export interface PropertyActionButtonProps {
  propertyId: string
  action: PropertyAction
  onActionClick: (propertyId: string, action: PropertyAction) => void
  disabled?: boolean
}

export interface BucketSettings {
  icon: string
  color: string
  label: string
  description: string
  className: string
}

export interface BucketStats {
  count: number
  averagePrice: number
  priceRange: { min: number; max: number }
  propertyTypes: Record<PropertyType, number>
  locations: string[]
  totalValue: number
  lastUpdated: Date
}

export interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  available: boolean
  agentId: string
  conflictReason?: string
  duration: number
}

export interface BookingForm {
  // Calendar Selection
  selectedDate: string
  selectedTime: string
  timezone: string
  duration: number

  // Visitor Information
  visitorName: string
  emailAddress: string
  phoneNumber: string
  groupSize: number

  // Visit Preferences
  specificQuestions: string[]
  accessibilityNeeds: string
  budgetDiscussion: boolean
  financingDiscussion: boolean

  // Additional Requests
  neighborhoodTour: boolean
  comparableProperties: boolean
  marketAnalysis: boolean
  customNotes: string

  // Communication Preferences
  preferredContact: 'email' | 'phone' | 'text'
  reminderPreferences: ReminderSettings
}

export interface ReminderSettings {
  enabled: boolean
  daysBefore: number[]
  methods: ('email' | 'sms' | 'push')[]
  timeOfDay: string
}

export interface BookingDetails {
  id: string
  propertyId: string
  agentId: string
  visitorInfo: {
    name: string
    email: string
    phone: string
  }
  scheduledDate: string
  scheduledTime: string
  duration: number
  status: BookingStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}

export interface Link {
  id: string
  code: string
  name?: string
  propertyIds: string[]
  agentId: string
  createdAt: Date
  expiresAt?: Date
  isActive: boolean
  viewCount: number
  lastViewed?: Date
}

export interface ClientSession {
  id: string
  linkCode: string
  startTime: Date
  endTime?: Date
  bucketAssignments: BucketData
  visitBookings: string[]
  interactionEvents: InteractionEvent[]
  deviceInfo: DeviceInfo
  analytics: SessionAnalytics
}

export interface InteractionEvent {
  id: string
  type: InteractionType
  propertyId?: string
  bucket?: BucketType
  timestamp: Date
  duration?: number
  metadata?: Record<string, any>
}

export enum InteractionType {
  PROPERTY_VIEW = 'property_view',
  PROPERTY_EXPAND = 'property_expand',
  BUCKET_ASSIGN = 'bucket_assign',
  VISIT_BOOK = 'visit_book',
  CAROUSEL_NAVIGATE = 'carousel_navigate',
  MODAL_OPEN = 'modal_open',
  MODAL_CLOSE = 'modal_close',
  IMAGE_VIEW = 'image_view',
  MAP_INTERACT = 'map_interact',
  SHARE_PROPERTY = 'share_property'
}

export interface DeviceInfo {
  userAgent: string
  screenSize: { width: number; height: number }
  deviceType: 'mobile' | 'tablet' | 'desktop'
  touchCapable: boolean
  platform: string
}

export interface SessionAnalytics {
  totalTimeSpent: number
  propertiesViewed: number
  bucketsUsed: BucketType[]
  mostViewedProperty?: string
  conversionScore: number
  engagementLevel: 'low' | 'medium' | 'high'
}

export interface CarouselState {
  currentIndex: number
  loading: boolean
  error: string | null
  touchStartX: number | null
  preloadedImages: Set<string>
}

export interface ModalState {
  isOpen: boolean
  property: Property | null
  currentImageIndex: number
  zoomLevel: number
  mapExpanded: boolean
  loading: boolean
  error: string | null
}

export interface BucketManagerState {
  currentView: BucketType | 'all'
  selectedProperties: Set<string>
  batchMode: boolean
  sortBy: 'date' | 'price' | 'name'
  sortOrder: 'asc' | 'desc'
  filterBy?: PropertyType
}

// Session state for the client interface
export interface ClientSessionState {
  sessionId: string
  linkCode: string
  startTime: Date
  currentBucket: BucketType
  buckets: ClientBuckets
  viewedProperties: Set<string>
  currentPropertyIndex: number
  isModalOpen: boolean
  selectedProperty: Property | null
}

export interface VisitBookingState {
  step: 'calendar' | 'details' | 'confirmation'
  selectedSlot: TimeSlot | null
  formData: Partial<BookingForm>
  validationErrors: Record<string, string>
  loading: boolean
  availableSlots: TimeSlot[]
}

export interface ClientAnalytics {
  sessionId: string
  linkCode: string
  events: InteractionEvent[]
  bucketAnalytics: {
    mostUsedBucket: BucketType
    averagePropertiesPerBucket: number
    bucketChangeFrequency: number
  }
  organizationPatterns: {
    timeToDecision: number
    reassignmentRate: number
    batchOperationUsage: number
  }
  preferences: {
    preferredViewMode: 'grid' | 'list' | 'comparison'
    averageSessionDuration: number
    mostViewedProperties: string[]
  }
}

export type BatchAction = 
  | 'move_to_liked'
  | 'move_to_considering' 
  | 'move_to_disliked'
  | 'book_visits'
  | 'remove_from_bucket'
  | 'export_properties'

export interface ValidationRules {
  visitorName: {
    required: boolean
    minLength: number
    maxLength: number
  }
  emailAddress: {
    required: boolean
    pattern: RegExp
  }
  phoneNumber: {
    required: boolean
    pattern: RegExp
  }
  selectedDate: {
    required: boolean
    futureDate: boolean
  }
  selectedTime: {
    required: boolean
    businessHours: boolean
  }
  groupSize: {
    required: boolean
    min: number
    max: number
  }
}