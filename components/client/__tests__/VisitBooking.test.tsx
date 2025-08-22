import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VisitBooking from '../VisitBooking'

// Import shared infrastructure following TESTING-GUIDELINES.md
import { 
  setupTest, 
  createMockProperty,
  fixtures
} from '@/test'

// Setup shared utilities
const { getWrapper } = setupTest()

describe('VisitBooking Component', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()
  const mockOnReschedule = jest.fn()

  // Use shared infrastructure for consistent test data
  const mockProperty = createMockProperty({
    id: 'prop-1',
    address: '123 Ocean Drive, Miami Beach, FL 33139',
    price: 850000,
    bedrooms: 3,
    bathrooms: 2.5,
    images: ['image1.jpg', 'image2.jpg']
  })

  const mockAgent = {
    id: 'agent-1',
    name: 'Sarah Johnson',
    phone: '(305) 555-0123',
    email: 'sarah@realty.com',
    avatar: 'agent-avatar.jpg'
  }

  const mockAvailableSlots = [
    { date: '2025-08-25', time: '10:00 AM', available: true },
    { date: '2025-08-25', time: '2:00 PM', available: true },
    { date: '2025-08-26', time: '11:00 AM', available: false },
    { date: '2025-08-26', time: '3:00 PM', available: true }
  ]

  const defaultProps = {
    property: mockProperty,
    agent: mockAgent,
    availableSlots: mockAvailableSlots,
    isOpen: true,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    onReschedule: mockOnReschedule,
    loading: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock Date for consistent testing
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-08-20T10:00:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Rendering', () => {
    it('should render booking modal with property context', () => {
      // ACT
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('visit-booking-modal')).toBeInTheDocument()
      expect(screen.getByTestId('booking-property-context')).toBeInTheDocument()
      expect(screen.getByText(/123 Ocean Drive/)).toBeInTheDocument()
      expect(screen.getByText(/\$850,000/)).toBeInTheDocument()
    })

    it('should display agent information', () => {
      // ACT
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('booking-agent-info')).toBeInTheDocument()
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      expect(screen.getByText('(305) 555-0123')).toBeInTheDocument()
      expect(screen.getByText('sarah@realty.com')).toBeInTheDocument()
    })

    it('should show calendar selection interface', () => {
      // ACT
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('booking-calendar')).toBeInTheDocument()
      expect(screen.getByText(/select a date and time/i)).toBeInTheDocument()
    })

    it('should display available time slots', () => {
      // ACT
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('time-slot-2025-08-25-10:00')).toBeInTheDocument()
      expect(screen.getByTestId('time-slot-2025-08-25-14:00')).toBeInTheDocument()
      expect(screen.getByTestId('time-slot-2025-08-26-15:00')).toBeInTheDocument()
    })

    it('should show unavailable slots as disabled', () => {
      // ACT
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('time-slot-2025-08-26-11:00')).toBeDisabled()
      expect(screen.getByTestId('time-slot-2025-08-26-11:00')).toHaveClass('unavailable')
    })

    it('should not render when isOpen is false', () => {
      // ARRANGE
      const closedProps = { ...defaultProps, isOpen: false }

      // ACT
      render(<VisitBooking {...closedProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.queryByTestId('visit-booking-modal')).not.toBeInTheDocument()
    })
  })

  describe('Calendar Selection', () => {
    it('should allow selecting a date and time slot', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('time-slot-2025-08-25-10:00'))

      // ASSERT
      expect(screen.getByTestId('time-slot-2025-08-25-10:00')).toHaveClass('selected')
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
    })

    it('should show selected date and time in booking summary', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('time-slot-2025-08-25-14:00'))

      // ASSERT
      expect(screen.getByTestId('booking-summary')).toBeInTheDocument()
      expect(screen.getByTestId('booking-summary')).toHaveTextContent(/august 25, 2025/i)
      expect(screen.getByTestId('booking-summary')).toHaveTextContent(/2:00 PM/i)
    })

    it('should handle timezone display correctly', () => {
      // ACT
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('timezone-info')).toBeInTheDocument()
      expect(screen.getByText(/eastern time/i)).toBeInTheDocument()
    })

    it('should prevent selecting past dates', () => {
      // ARRANGE - Add a past date slot
      const pastSlots = [
        { date: '2025-08-19', time: '10:00 AM', available: true }, // Yesterday
        ...mockAvailableSlots
      ]
      const propsWithPastSlots = { ...defaultProps, availableSlots: pastSlots }

      // ACT
      render(<VisitBooking {...propsWithPastSlots} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('time-slot-2025-08-19-10:00')).toBeDisabled()
      expect(screen.getByTestId('time-slot-2025-08-19-10:00')).toHaveClass('past-date')
    })
  })

  describe('Booking Form', () => {
    beforeEach(async () => {
      // Pre-select a time slot for form tests
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })
      await user.click(screen.getByTestId('time-slot-2025-08-25-10:00'))
    })

    it('should render visitor information form fields', () => {
      // ASSERT
      expect(screen.getByTestId('visitor-name-input')).toBeInTheDocument()
      expect(screen.getByTestId('visitor-email-input')).toBeInTheDocument()
      expect(screen.getByTestId('visitor-phone-input')).toBeInTheDocument()
      expect(screen.getByTestId('group-size-select')).toBeInTheDocument()
    })

    it('should show visit preferences options', () => {
      // ASSERT
      expect(screen.getByTestId('special-requirements-textarea')).toBeInTheDocument()
      expect(screen.getByTestId('accessibility-needs-checkbox')).toBeInTheDocument()
      expect(screen.getByTestId('budget-discussion-checkbox')).toBeInTheDocument()
      expect(screen.getByTestId('financing-discussion-checkbox')).toBeInTheDocument()
    })

    it('should display additional requests section', () => {
      // ASSERT
      expect(screen.getByTestId('neighborhood-tour-checkbox')).toBeInTheDocument()
      expect(screen.getByTestId('comparable-properties-checkbox')).toBeInTheDocument()
      expect(screen.getByTestId('market-analysis-checkbox')).toBeInTheDocument()
      expect(screen.getByTestId('custom-notes-textarea')).toBeInTheDocument()
    })

    it('should validate required fields before submission', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

      // ACT - Try to submit without required fields
      await user.click(screen.getByTestId('submit-booking-btn'))

      // ASSERT
      expect(screen.getByTestId('name-error')).toHaveTextContent(/name is required/i)
      expect(screen.getByTestId('email-error')).toHaveTextContent(/email is required/i)
      expect(screen.getByTestId('phone-error')).toHaveTextContent(/phone is required/i)
    })

    it('should validate email format', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

      // ACT
      await user.type(screen.getByTestId('visitor-email-input'), 'invalid-email')
      await user.tab() // Trigger blur validation

      // ASSERT
      expect(screen.getByTestId('email-error')).toHaveTextContent(/invalid email format/i)
    })

    it('should validate phone number format', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

      // ACT
      await user.type(screen.getByTestId('visitor-phone-input'), '123')
      await user.tab() // Trigger blur validation

      // ASSERT
      expect(screen.getByTestId('phone-error')).toHaveTextContent(/invalid phone number/i)
    })

    it('should format phone number input automatically', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

      // ACT
      await user.type(screen.getByTestId('visitor-phone-input'), '3055550123')

      // ASSERT
      expect(screen.getByTestId('visitor-phone-input')).toHaveValue('(305) 555-0123')
    })

    it('should show character count for text areas', () => {
      // ASSERT
      expect(screen.getByTestId('special-requirements-counter')).toHaveTextContent('0/500')
      expect(screen.getByTestId('custom-notes-counter')).toHaveTextContent('0/1000')
    })

    it('should limit text area input to maximum characters', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const longText = 'a'.repeat(600) // Exceeds 500 char limit

      // ACT
      await user.type(screen.getByTestId('special-requirements-textarea'), longText)

      // ASSERT
      const textarea = screen.getByTestId('special-requirements-textarea')
      expect(textarea.value).toHaveLength(500)
      expect(screen.getByTestId('special-requirements-counter')).toHaveTextContent('500/500')
    })
  })

  describe('Multi-property Booking', () => {
    it('should show multi-property booking option when multiple properties liked', () => {
      // ARRANGE
      const multiPropertyProps = {
        ...defaultProps,
        likedProperties: [mockProperty, createMockProperty({ id: 'prop-2' })],
        enableMultiPropertyBooking: true
      }

      // ACT
      render(<VisitBooking {...multiPropertyProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('multi-property-booking')).toBeInTheDocument()
      expect(screen.getByText(/book multiple properties/i)).toBeInTheDocument()
    })

    it('should allow selecting additional properties for group visit', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const multiPropertyProps = {
        ...defaultProps,
        likedProperties: [mockProperty, createMockProperty({ id: 'prop-2', address: '456 Beach Ave' })],
        enableMultiPropertyBooking: true
      }
      render(<VisitBooking {...multiPropertyProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('multi-property-toggle'))
      await user.click(screen.getByTestId('additional-property-prop-2'))

      // ASSERT
      expect(screen.getByTestId('additional-property-prop-2')).toBeChecked()
      expect(screen.getByText(/2 properties selected/i)).toBeInTheDocument()
    })

    it('should adjust time estimates for multiple properties', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const multiPropertyProps = {
        ...defaultProps,
        likedProperties: [mockProperty, createMockProperty({ id: 'prop-2' })],
        enableMultiPropertyBooking: true
      }
      render(<VisitBooking {...multiPropertyProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('multi-property-toggle'))
      await user.click(screen.getByTestId('additional-property-prop-2'))

      // ASSERT
      expect(screen.getByText(/estimated duration: 2 hours/i)).toBeInTheDocument()
    })
  })

  describe('Booking Submission', () => {
    beforeEach(async () => {
      // Pre-fill form for submission tests
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })
      
      await user.click(screen.getByTestId('time-slot-2025-08-25-10:00'))
      await user.type(screen.getByTestId('visitor-name-input'), 'John Doe')
      await user.type(screen.getByTestId('visitor-email-input'), 'john@example.com')
      await user.type(screen.getByTestId('visitor-phone-input'), '3055550123')
    })

    it('should submit booking with correct data structure', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

      // ACT
      await user.click(screen.getByTestId('submit-booking-btn'))

      // ASSERT
      expect(mockOnSubmit).toHaveBeenCalledWith({
        propertyId: 'prop-1',
        date: '2025-08-25',
        time: '10:00 AM',
        visitor: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '(305) 555-0123',
          groupSize: 1
        },
        preferences: {
          specialRequirements: '',
          accessibilityNeeds: false,
          budgetDiscussion: false,
          financingDiscussion: false
        },
        additionalRequests: {
          neighborhoodTour: false,
          comparableProperties: false,
          marketAnalysis: false,
          customNotes: ''
        }
      })
    })

    it('should show loading state during submission', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const loadingProps = { ...defaultProps, loading: true }
      const { rerender } = render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // Fill form first
      await user.click(screen.getAllByTestId('time-slot-2025-08-25-10:00')[0])
      await user.type(screen.getByTestId('visitor-name-input'), 'John Doe')
      await user.type(screen.getByTestId('visitor-email-input'), 'john@example.com')
      await user.type(screen.getByTestId('visitor-phone-input'), '3055550123')

      // ACT - Start loading state
      rerender(<VisitBooking {...loadingProps} />, { wrapper: getWrapper() })

      // ASSERT
      const submitButtons = screen.getAllByTestId('submit-booking-btn')
      const disabledButton = submitButtons.find(btn => btn.disabled)
      expect(disabledButton).toBeDisabled()
      expect(screen.getByText(/submitting booking/i)).toBeInTheDocument()
      expect(screen.getByTestId('booking-loading-spinner')).toBeInTheDocument()
    })

    it('should disable form fields during submission', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      // Render with loading=true and some pre-filled form data
      const loadingProps = {
        ...defaultProps,
        loading: true,
        // Force rendering with initial state to simulate mid-submission
        initialSelectedDate: '2025-08-25',
        initialSelectedTime: '10:00 AM'
      }

      // ACT
      render(<VisitBooking {...loadingProps} />, { wrapper: getWrapper() })

      // First click a slot to trigger form rendering
      await user.click(screen.getAllByTestId('time-slot-2025-08-25-10:00')[0])

      // Wait for form to appear and check disabled state
      await screen.findByTestId('visitor-name-input')

      // ASSERT
      expect(screen.getByTestId('visitor-name-input')).toBeDisabled()
      expect(screen.getByTestId('visitor-email-input')).toBeDisabled()
      expect(screen.getByTestId('visitor-phone-input')).toBeDisabled()
    })
  })

  describe('Booking Confirmation', () => {
    it('should show confirmation screen after successful booking', () => {
      // ARRANGE
      const confirmationProps = {
        ...defaultProps,
        showConfirmation: true,
        confirmedBooking: {
          confirmationNumber: 'BK12345',
          date: '2025-08-25',
          time: '10:00 AM',
          property: mockProperty,
          agent: mockAgent
        }
      }

      // ACT
      render(<VisitBooking {...confirmationProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('booking-confirmation')).toBeInTheDocument()
      expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument()
      expect(screen.getByText(/BK12345/)).toBeInTheDocument()
    })

    it('should display booking details in confirmation', () => {
      // ARRANGE
      const confirmationProps = {
        ...defaultProps,
        showConfirmation: true,
        confirmedBooking: {
          confirmationNumber: 'BK12345',
          date: '2025-08-25',
          time: '10:00 AM',
          property: mockProperty,
          agent: mockAgent
        }
      }

      // ACT
      render(<VisitBooking {...confirmationProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByText(/123 Ocean Drive/)).toBeInTheDocument()
      expect(screen.getByText(/august 25, 2025/i)).toBeInTheDocument()
      expect(screen.getByText('10:00 AM')).toBeInTheDocument()
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
    })

    it('should show add to calendar button', () => {
      // ARRANGE
      const confirmationProps = {
        ...defaultProps,
        showConfirmation: true,
        confirmedBooking: {
          confirmationNumber: 'BK12345',
          date: '2025-08-25',
          time: '10:00 AM',
          property: mockProperty,
          agent: mockAgent
        }
      }

      // ACT
      render(<VisitBooking {...confirmationProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('add-to-calendar-btn')).toBeInTheDocument()
      expect(screen.getByText(/add to calendar/i)).toBeInTheDocument()
    })

    it('should provide rescheduling options', () => {
      // ARRANGE
      const confirmationProps = {
        ...defaultProps,
        showConfirmation: true,
        confirmedBooking: {
          confirmationNumber: 'BK12345',
          date: '2025-08-25',
          time: '10:00 AM',
          property: mockProperty,
          agent: mockAgent
        }
      }

      // ACT
      render(<VisitBooking {...confirmationProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('reschedule-booking-btn')).toBeInTheDocument()
      expect(screen.getByTestId('cancel-booking-btn')).toBeInTheDocument()
    })

    it('should handle calendar integration', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const confirmationProps = {
        ...defaultProps,
        showConfirmation: true,
        confirmedBooking: {
          confirmationNumber: 'BK12345',
          date: '2025-08-25',
          time: '10:00 AM',
          property: mockProperty,
          agent: mockAgent
        }
      }
      render(<VisitBooking {...confirmationProps} />, { wrapper: getWrapper() })

      // Mock calendar API
      Object.defineProperty(window, 'open', { value: jest.fn() })

      // ACT
      await user.click(screen.getByTestId('add-to-calendar-btn'))

      // ASSERT
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('calendar.google.com'),
        '_blank'
      )
    })
  })

  describe('Rescheduling', () => {
    it('should handle reschedule request', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const existingBooking = {
        id: 'booking-1',
        confirmationNumber: 'BK12345',
        date: '2025-08-25',
        time: '10:00 AM',
        property: mockProperty
      }
      const rescheduleProps = {
        ...defaultProps,
        existingBooking,
        isReschedule: true
      }

      render(<VisitBooking {...rescheduleProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('time-slot-2025-08-26-15:00'))
      await user.click(screen.getByTestId('confirm-reschedule-btn'))

      // ASSERT
      expect(mockOnReschedule).toHaveBeenCalledWith('booking-1', {
        date: '2025-08-26',
        time: '3:00 PM'
      })
    })

    it('should show existing booking details when rescheduling', () => {
      // ARRANGE
      const existingBooking = {
        id: 'booking-1',
        confirmationNumber: 'BK12345',
        date: '2025-08-25',
        time: '10:00 AM',
        property: mockProperty
      }
      const rescheduleProps = {
        ...defaultProps,
        existingBooking,
        isReschedule: true
      }

      // ACT
      render(<VisitBooking {...rescheduleProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('current-booking-info')).toBeInTheDocument()
      expect(screen.getAllByText(/current booking: august 25/i)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/BK12345/)[0]).toBeInTheDocument()
    })

    it('should highlight conflicting time slots when rescheduling', () => {
      // ARRANGE
      const existingBooking = {
        id: 'booking-1',
        date: '2025-08-25',
        time: '10:00 AM'
      }
      const rescheduleProps = {
        ...defaultProps,
        existingBooking,
        isReschedule: true
      }

      // ACT
      render(<VisitBooking {...rescheduleProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('time-slot-2025-08-25-10:00')).toHaveClass('current-booking')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      // ACT
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('visit-booking-modal')).toHaveAttribute('role', 'dialog')
      expect(screen.getByTestId('visit-booking-modal')).toHaveAttribute('aria-labelledby', 'booking-title')
      expect(screen.getByTestId('booking-calendar')).toHaveAttribute('role', 'application')
      expect(screen.getByTestId('booking-calendar')).toHaveAttribute('aria-label', 'Calendar for selecting visit date and time')
    })

    it('should trap focus within modal', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.tab()
      
      // ASSERT
      expect(screen.getByTestId('close-modal-btn')).toHaveFocus()
      
      // Should cycle through focusable elements
      await user.tab()
      expect(document.activeElement).toBeInTheDocument()
    })

    it('should announce slot selection to screen readers', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('time-slot-2025-08-25-10:00'))

      // ASSERT
      expect(screen.getByTestId('booking-live-region')).toHaveTextContent(
        'Selected August 25, 2025 at 10:00 AM for property visit'
      )
    })

    it('should support keyboard navigation for time slots', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      const firstSlot = screen.getByTestId('time-slot-2025-08-25-10:00')
      firstSlot.focus()
      await user.keyboard('{ArrowRight}')

      // ASSERT
      expect(screen.getByTestId('time-slot-2025-08-25-14:00')).toHaveFocus()
    })

    it('should provide high contrast mode support', () => {
      // ACT
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ASSERT
      const modal = screen.getByTestId('visit-booking-modal')
      expect(modal).toHaveClass('high-contrast-support')
    })
  })

  describe('Error Handling', () => {
    it('should handle booking submission errors', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      const errorProps = {
        ...defaultProps,
        error: 'Booking failed. Please try again.'
      }
      
      render(<VisitBooking {...errorProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('booking-error')).toBeInTheDocument()
      expect(screen.getByText(/booking failed/i)).toBeInTheDocument()
      expect(screen.getByTestId('retry-booking-btn')).toBeInTheDocument()
    })

    it('should handle network connectivity issues', () => {
      // ARRANGE
      const networkErrorProps = {
        ...defaultProps,
        error: 'Network error. Please check your connection.'
      }

      // ACT
      render(<VisitBooking {...networkErrorProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByTestId('booking-error')).toBeInTheDocument()
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })

    it('should gracefully handle invalid property data', () => {
      // ARRANGE
      const invalidProps = {
        ...defaultProps,
        property: { ...mockProperty, address: undefined, price: undefined }
      }

      // ACT & ASSERT - Should not crash
      expect(() => {
        render(<VisitBooking {...invalidProps} />, { wrapper: getWrapper() })
      }).not.toThrow()

      expect(screen.getByTestId('visit-booking-modal')).toBeInTheDocument()
    })

    it('should handle missing agent information', () => {
      // ARRANGE
      const noAgentProps = {
        ...defaultProps,
        agent: undefined
      }

      // ACT
      render(<VisitBooking {...noAgentProps} />, { wrapper: getWrapper() })

      // ASSERT
      expect(screen.getByText(/agent information unavailable/i)).toBeInTheDocument()
      expect(screen.getByTestId('contact-support-btn')).toBeInTheDocument()
    })
  })

  describe('Modal Controls', () => {
    it('should close modal when cancel button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('cancel-booking-btn'))

      // ASSERT
      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('should close modal when close button is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('close-modal-btn'))

      // ASSERT
      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('should close modal when escape key is pressed', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.keyboard('{Escape}')

      // ASSERT
      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('should close modal when backdrop is clicked', async () => {
      // ARRANGE
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<VisitBooking {...defaultProps} />, { wrapper: getWrapper() })

      // ACT
      await user.click(screen.getByTestId('modal-backdrop'))

      // ASSERT
      expect(mockOnCancel).toHaveBeenCalled()
    })
  })
})