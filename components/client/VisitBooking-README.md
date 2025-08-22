# VisitBooking Component

## Purpose
The VisitBooking component provides a streamlined interface for clients to schedule property visits directly from the property browsing experience. It integrates with agent calendars, handles booking details, and manages the complete visit scheduling workflow.

## Component Responsibility
This component manages the end-to-end visit booking process, from availability checking to confirmation, including form validation, calendar integration, and booking confirmations with automated follow-ups.

## Public API

| Prop | Type | Required | Default | Purpose |
|------|------|----------|---------|---------|
| property | Property | Yes | - | Property to book visit for |
| isOpen | boolean | Yes | - | Controls modal visibility |
| onClose | () => void | Yes | - | Callback to close booking modal |
| onBookingComplete | (booking: BookingDetails) => void | Yes | - | Callback when booking is successfully created |
| agentId | string | Yes | - | Agent identifier for calendar integration |
| prefilledData | Partial<BookingForm> | No | {} | Pre-populated form data |
| availableTimeSlots | TimeSlot[] | No | [] | Available booking times |
| onTimeSlotRefresh | () => void | No | - | Refresh available time slots |

## Architecture Position

```
┌─────────────────────────────────────────────────┐
│                 CLIENT LINK APP                 │
│  ┌─────────────────────────────────────────────┐ │
│  │            Property Modal                   │ │
│  │  • Detailed property view                  │ │
│  │  • Property information display            │ │
│  │  • Action panel with booking button        │ │
│  └─────────────────┬───────────────────────────┘ │
│                    │ "Book Visit" clicked        │
├────────────────────┼─────────────────────────────┤
│              VISIT BOOKING ⭐ (Modal Overlay)    │
│  ┌─────────────────▼─────────────────────────┐   │
│  │            Booking Modal                 │   │
│  │  ┌─────────────────────────────────────┐ │   │
│  │  │         Property Context            │ │   │
│  │  │  • Property image & details        │ │   │
│  │  │  • Address & key information       │ │   │
│  │  │  • Agent contact information       │ │   │
│  │  └─────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────┐ │   │
│  │  │         Calendar Selection          │ │   │
│  │  │  • Available date/time slots       │ │   │
│  │  │  • Agent availability display      │ │   │
│  │  │  • Timezone handling              │ │   │
│  │  │  • Multi-property booking option   │ │   │
│  │  └─────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────┐ │   │
│  │  │         Visitor Information         │ │   │
│  │  │  • Contact details form            │ │   │
│  │  │  • Group size selection           │ │   │
│  │  │  • Special requirements           │ │   │
│  │  │  • Communication preferences      │ │   │
│  │  └─────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────┐ │   │
│  │  │         Visit Preferences           │ │   │
│  │  │  • Specific questions/interests    │ │   │
│  │  │  • Accessibility needs            │ │   │
│  │  │  • Budget discussion request      │ │   │
│  │  │  • Additional requests           │ │   │
│  │  └─────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────┐ │   │
│  │  │         Confirmation Panel          │ │   │
│  │  │  • Booking summary                 │ │   │
│  │  │  • Calendar integration           │ │   │
│  │  │  • Confirmation email/SMS         │ │   │
│  │  │  • Follow-up actions              │ │   │
│  │  └─────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Booking Workflow

### Complete Booking Flow
```
Visit Booking Process:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Modal Opening   │────▶│  Data Loading    │────▶│  Form Display    │
│ • Property prep  │     │ • Agent calendar │     │ • Initial form   │
│ • Context setup  │     │ • Available slots│     │ • Validation     │
│ • Focus manage   │     │ • Timezone detect│     │ • User guidance  │
└──────────────────┘     └──────────────────┘     └──────────────────┘

Form Completion Flow:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  User Input      │────▶│  Real-time Valid │────▶│  Submission      │
│ • Calendar select│     │ • Field validate │     │ • Create booking │
│ • Contact info   │     │ • Conflict check │     │ • Send notifications│
│ • Preferences    │     │ • Required fields│     │ • Calendar sync  │
└──────────────────┘     └──────────────────┘     └──────────────────┘

Confirmation Flow:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Booking Created │────▶│  Confirmations   │────▶│  Follow-up Setup │
│ • Generate ID    │     │ • Email confirm  │     │ • Reminders      │
│ • Update calendar│     │ • SMS/push notif │     │ • Preparation    │
│ • Agent notify   │     │ • Calendar add   │     │ • Contact info   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## Form Structure & Validation

### Booking Form Schema
```typescript
interface BookingForm {
  // Calendar Selection
  selectedDate: string;
  selectedTime: string;
  timezone: string;
  duration: number; // in minutes
  
  // Visitor Information
  visitorName: string;
  emailAddress: string;
  phoneNumber: string;
  groupSize: number;
  
  // Visit Preferences
  specificQuestions: string[];
  accessibilityNeeds: string;
  budgetDiscussion: boolean;
  financingDiscussion: boolean;
  
  // Additional Requests
  neighborhoodTour: boolean;
  comparableProperties: boolean;
  marketAnalysis: boolean;
  customNotes: string;
  
  // Communication Preferences
  preferredContact: 'email' | 'phone' | 'text';
  reminderPreferences: ReminderSettings;
}

interface ValidationRules {
  visitorName: { required: true, minLength: 2, maxLength: 50 };
  emailAddress: { required: true, pattern: EMAIL_REGEX };
  phoneNumber: { required: true, pattern: PHONE_REGEX };
  selectedDate: { required: true, futureDate: true };
  selectedTime: { required: true, businessHours: true };
  groupSize: { required: true, min: 1, max: 10 };
}
```

### Calendar Integration
```typescript
interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  agentId: string;
  conflictReason?: string;
}

interface CalendarConfig {
  // Business hours
  businessHours: {
    monday: { start: '09:00', end: '18:00' };
    tuesday: { start: '09:00', end: '18:00' };
    wednesday: { start: '09:00', end: '18:00' };
    thursday: { start: '09:00', end: '18:00' };
    friday: { start: '09:00', end: '18:00' };
    saturday: { start: '10:00', end: '16:00' };
    sunday: { start: '12:00', end: '16:00' };
  };
  
  // Booking constraints
  minAdvanceNotice: 2; // hours
  maxAdvanceBooking: 90; // days
  defaultDuration: 60; // minutes
  bufferTime: 15; // minutes between appointments
}
```

## Visual Design Components

### Modal Layout Structure
```
Booking Modal Layout:
├── Header Section
│   ├── Modal title ("Schedule Property Visit")
│   ├── Close button (X)
│   ├── Progress indicator (Step 1 of 3)
│   └── Property context (image + address)
├── Property Context Card
│   ├── Property thumbnail image
│   ├── Full address and neighborhood
│   ├── Agent photo and contact info
│   ├── Property key details (beds/baths/sqft)
│   └── Special showing instructions
├── Calendar Section
│   ├── Date picker (month/week view)
│   ├── Time slot grid (available/unavailable)
│   ├── Selected date/time summary
│   ├── Timezone display and selector
│   └── Multi-property booking option
├── Form Sections
│   ├── Contact Information (required)
│   ├── Visit Details (group size, duration)
│   ├── Special Requests (accessibility, etc.)
│   ├── Discussion Topics (budget, financing)
│   └── Additional Services (neighborhood tour)
├── Summary & Confirmation
│   ├── Booking details review
│   ├── Terms and conditions checkbox
│   ├── Notification preferences
│   └── Action buttons (Cancel, Book Visit)
└── Loading & Success States
    ├── Form submission loading
    ├── Success confirmation screen
    ├── Calendar integration status
    └── Error handling and retry options
```

### Calendar Component
```
Calendar Interface:
├── Month/Week View Toggle
├── Navigation (Previous/Next)
├── Date Grid
│   ├── Available dates (green indicators)
│   ├── Unavailable dates (gray, crossed out)
│   ├── Partially available (orange indicators)
│   └── Selected date (blue highlight)
├── Time Slot Grid
│   ├── Available slots (clickable, green)
│   ├── Booked slots (gray, disabled)
│   ├── Agent blocked time (red, unavailable)
│   └── Selected time (blue highlight)
└── Timezone & Duration Controls
    ├── Timezone selector (auto-detect)
    ├── Visit duration dropdown
    ├── Buffer time indication
    └── Business hours display
```

## Responsive Design

### Mobile Layout (320-767px)
```
Mobile Optimizations:
├── Full-screen modal (100vh)
├── Single-column form layout
├── Large touch targets for calendar
├── Simplified time slot selection
├── Collapsible form sections
├── Sticky action buttons
└── Swipe gestures for calendar navigation
```

### Tablet Layout (768-1023px)
```
Tablet Optimizations:
├── Two-column layout (calendar + form)
├── Enhanced calendar view
├── Larger form fields
├── Better visual hierarchy
├── Multi-touch gesture support
└── Optimized for both orientations
```

### Desktop Layout (1024px+)
```
Desktop Optimizations:
├── Side-by-side calendar and form
├── Advanced calendar features
├── Keyboard shortcuts
├── Hover states and tooltips
├── Multi-step wizard interface
└── Advanced scheduling options
```

## Accessibility Features

### Form Accessibility
- **Labels**: Clear, descriptive labels for all form fields
- **Error Messages**: Associated error messages with field IDs
- **Required Indicators**: Visual and screen reader indicators
- **Tab Order**: Logical progression through form elements

### Calendar Accessibility
- **Keyboard Navigation**: Arrow keys for date navigation
- **Screen Reader**: Date and time slot announcements
- **Focus Indicators**: Clear visual focus on selected elements
- **ARIA Labels**: Comprehensive labeling for calendar components

## Performance Optimizations

### Calendar Performance
```javascript
// Calendar Optimization Strategies
const CALENDAR_OPTIMIZATIONS = {
  // Lazy load availability data
  lazyLoading: {
    loadRange: 30, // days
    preload: 7,    // days ahead
    cacheTime: 300 // seconds
  },
  
  // Debounce API calls
  debouncing: {
    availabilityCheck: 500,  // ms
    conflictValidation: 300  // ms
  },
  
  // Memory management
  cleanup: {
    removeOldSlots: true,
    maxCacheSize: 1000,
    gcInterval: 600000  // 10 minutes
  }
}
```

### Form Performance
- **Field Validation**: Debounced real-time validation
- **Auto-save**: Periodic form state saving
- **Memory Cleanup**: Remove event listeners on unmount
- **Bundle Splitting**: Lazy load calendar libraries

## Integration & APIs

### Calendar Service Integration
```typescript
interface CalendarService {
  // Get available time slots
  getAvailableSlots(agentId: string, dateRange: DateRange): Promise<TimeSlot[]>;
  
  // Create booking
  createBooking(bookingData: BookingForm): Promise<Booking>;
  
  // Check for conflicts
  checkConflicts(agentId: string, dateTime: DateTime): Promise<ConflictCheck>;
  
  // Cancel/reschedule booking
  updateBooking(bookingId: string, updates: Partial<BookingForm>): Promise<Booking>;
}
```

### Notification Service Integration
```typescript
interface NotificationService {
  // Send booking confirmations
  sendBookingConfirmation(booking: Booking, recipients: ContactInfo[]): Promise<void>;
  
  // Schedule reminders
  scheduleReminders(booking: Booking, settings: ReminderSettings): Promise<void>;
  
  // Send calendar invites
  sendCalendarInvite(booking: Booking): Promise<void>;
}
```

## Error Handling

### Booking Errors
- **Calendar Conflicts**: Real-time conflict detection and resolution
- **Validation Errors**: Clear, actionable error messages
- **Network Issues**: Retry mechanisms with exponential backoff
- **Service Unavailable**: Graceful degradation with alternative contact methods

### User Experience Errors
- **Form Errors**: Inline validation with helpful suggestions
- **Submission Failures**: Clear error states with retry options
- **Timeout Handling**: Progress indicators and timeout warnings
- **Data Loss Prevention**: Auto-save and recovery mechanisms

## Testing Strategy

### Unit Testing Focus
- Form validation logic
- Calendar date/time calculations
- Booking creation workflow
- Error handling scenarios
- Timezone conversion accuracy

### Integration Testing Focus
- Calendar service integration
- Notification system workflow
- Form submission and confirmation
- Agent calendar synchronization
- Multi-property booking scenarios

### Accessibility Testing Focus
- Keyboard navigation flow
- Screen reader compatibility
- Form label associations
- Error message accessibility
- Focus management in modal

### Performance Testing Focus
- Calendar loading performance
- Form submission responsiveness
- Memory usage monitoring
- Network resilience testing
- Concurrent booking handling

## Dependencies

### Internal Dependencies
- Property and booking type definitions
- Shared form components and validation utilities
- Calendar integration utilities
- Notification and communication services

### External Dependencies
- React Hook Form for form management
- Date-fns or Moment.js for date manipulation
- React Calendar or custom calendar component
- React Query for API state management
- Timezone handling library (date-fns-tz)

## Future Enhancements

### Planned Features
1. **Group Booking**: Coordinate visits for multiple properties
2. **Video Tours**: Integration with virtual tour platforms
3. **Smart Scheduling**: AI-powered optimal time suggestions
4. **Follow-up Automation**: Automated post-visit engagement
5. **Integration Expansion**: CRM and lead management system integration

### User Experience Improvements
1. **Predictive Input**: Auto-fill based on previous bookings
2. **Smart Notifications**: Context-aware reminder timing
3. **Preference Learning**: Remember user booking preferences
4. **Social Integration**: Share visit plans with family/friends

This README establishes the VisitBooking component as a comprehensive, accessible, and efficient booking system that converts property interest into scheduled visits, completing the CLIENT-LINK-DESIGN user journey.