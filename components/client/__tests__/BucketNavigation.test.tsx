import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BucketNavigation } from '../BucketNavigation'
import { BucketType } from '../types'

// Mock data for testing
const mockBucketCounts = {
  new_properties: 12,
  liked: 3,
  disliked: 2,
  considering: 5,
  schedule_visit: 1
}

const mockOnBucketChange = jest.fn()

describe('BucketNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders all 5 bucket buttons with correct labels and counts', () => {
      render(
        <BucketNavigation
          currentBucket="new_properties"
          bucketCounts={mockBucketCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      // Check all bucket buttons are rendered
      expect(screen.getByTestId('bucket-new_properties')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-liked')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-disliked')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-considering')).toBeInTheDocument()
      expect(screen.getByTestId('bucket-schedule_visit')).toBeInTheDocument()

      // Check count badges
      expect(screen.getByText('12')).toBeInTheDocument() // new_properties
      expect(screen.getByText('3')).toBeInTheDocument()  // liked
      expect(screen.getByText('2')).toBeInTheDocument()  // disliked
      expect(screen.getByText('5')).toBeInTheDocument()  // considering
      expect(screen.getByText('1')).toBeInTheDocument()  // schedule_visit

      // Check labels
      expect(screen.getByText('New Properties')).toBeInTheDocument()
      expect(screen.getByText('Liked')).toBeInTheDocument()
      expect(screen.getByText('Disliked')).toBeInTheDocument()
      expect(screen.getByText('Considering')).toBeInTheDocument()
      expect(screen.getByText('Schedule Visit')).toBeInTheDocument()
    })

    it('renders with correct icons for each bucket', () => {
      render(
        <BucketNavigation
          currentBucket="new_properties"
          bucketCounts={mockBucketCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      // Check icons are present (using aria-label or text content)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(5)

      // Check for specific icons (assuming they use emoji or specific text)
      expect(screen.getByText(/📦/)).toBeInTheDocument() // new properties
      expect(screen.getByText(/❤️/)).toBeInTheDocument() // liked
      expect(screen.getByText(/👎/)).toBeInTheDocument() // disliked
      expect(screen.getByText(/🤔/)).toBeInTheDocument() // considering
      expect(screen.getByText(/📅/)).toBeInTheDocument() // schedule visit
    })

    it('highlights the current bucket', () => {
      render(
        <BucketNavigation
          currentBucket="liked"
          bucketCounts={mockBucketCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      const likedButton = screen.getByTestId('bucket-liked')
      expect(likedButton).toHaveClass('active')
    })

    it('handles zero counts correctly', () => {
      const zeroCounts = {
        new_properties: 0,
        liked: 0,
        disliked: 0,
        considering: 0,
        schedule_visit: 0
      }

      render(
        <BucketNavigation
          currentBucket="new_properties"
          bucketCounts={zeroCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      // Should still render buttons but with 0 counts
      expect(screen.getAllByText('0')).toHaveLength(5)
    })
  })

  describe('Interactions', () => {
    it('calls onBucketChange when clicking different bucket buttons', async () => {
      render(
        <BucketNavigation
          currentBucket="new_properties"
          bucketCounts={mockBucketCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      const likedButton = screen.getByTestId('bucket-liked')
      fireEvent.click(likedButton)

      await waitFor(() => {
        expect(mockOnBucketChange).toHaveBeenCalledWith('liked')
      })
    })

    it('does not call onBucketChange when clicking current bucket', () => {
      render(
        <BucketNavigation
          currentBucket="liked"
          bucketCounts={mockBucketCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      const likedButton = screen.getByTestId('bucket-liked')
      fireEvent.click(likedButton)

      expect(mockOnBucketChange).not.toHaveBeenCalled()
    })

    it('handles keyboard navigation', async () => {
      render(
        <BucketNavigation
          currentBucket="new_properties"
          bucketCounts={mockBucketCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      const likedButton = screen.getByTestId('bucket-liked')
      likedButton.focus()
      fireEvent.keyDown(likedButton, { key: 'Enter' })

      await waitFor(() => {
        expect(mockOnBucketChange).toHaveBeenCalledWith('liked')
      })
    })

    it('supports space key for activation', async () => {
      render(
        <BucketNavigation
          currentBucket="new_properties"
          bucketCounts={mockBucketCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      const consideringButton = screen.getByTestId('bucket-considering')
      consideringButton.focus()
      fireEvent.keyDown(consideringButton, { key: ' ' })

      await waitFor(() => {
        expect(mockOnBucketChange).toHaveBeenCalledWith('considering')
      })
    })
  })

  describe('Responsive Design', () => {
    it('renders as fixed bottom navigation on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true })
      
      render(
        <BucketNavigation
          currentBucket="new_properties"
          bucketCounts={mockBucketCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      const navigation = screen.getByRole('navigation')
      expect(navigation).toHaveClass('fixed', 'bottom-0')
    })

    it('renders as static navigation on desktop', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
      
      render(
        <BucketNavigation
          currentBucket="new_properties"
          bucketCounts={mockBucketCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      const navigation = screen.getByRole('navigation')
      expect(navigation).not.toHaveClass('fixed', 'bottom-0')
    })

    it('shows abbreviated labels on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true })
      
      render(
        <BucketNavigation
          currentBucket="new_properties"
          bucketCounts={mockBucketCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      // Should show short labels on mobile
      expect(screen.getByText('New')).toBeInTheDocument()
      expect(screen.getByText('Visit')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(
        <BucketNavigation
          currentBucket="new_properties"
          bucketCounts={mockBucketCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      const navigation = screen.getByRole('navigation')
      expect(navigation).toHaveAttribute('aria-label', 'Property bucket navigation')

      // Check each button has proper accessibility attributes
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label')
      })
    })

    it('announces current selection to screen readers', () => {
      render(
        <BucketNavigation
          currentBucket="liked"
          bucketCounts={mockBucketCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      const likedButton = screen.getByTestId('bucket-liked')
      expect(likedButton).toHaveAttribute('aria-current', 'true')
    })

    it('provides live region updates when bucket changes', () => {
      const { rerender } = render(
        <BucketNavigation
          currentBucket="new_properties"
          bucketCounts={mockBucketCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      // Should have live region for announcements
      expect(screen.getByRole('status')).toBeInTheDocument()

      // Change current bucket
      rerender(
        <BucketNavigation
          currentBucket="liked"
          bucketCounts={mockBucketCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toHaveTextContent(/liked/i)
    })
  })

  describe('Badge Counters', () => {
    it('hides badge when count is zero', () => {
      const countsWithZeros = {
        ...mockBucketCounts,
        liked: 0
      }

      render(
        <BucketNavigation
          currentBucket="new_properties"
          bucketCounts={countsWithZeros}
          onBucketChange={mockOnBucketChange}
        />
      )

      const likedButton = screen.getByTestId('bucket-liked')
      const badge = likedButton.querySelector('[data-testid="count-badge"]')
      expect(badge).toHaveClass('hidden')
    })

    it('shows + indicator for counts over 99', () => {
      const highCounts = {
        ...mockBucketCounts,
        new_properties: 150
      }

      render(
        <BucketNavigation
          currentBucket="new_properties"
          bucketCounts={highCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('updates badge counts dynamically', () => {
      const { rerender } = render(
        <BucketNavigation
          currentBucket="new_properties"
          bucketCounts={mockBucketCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      expect(screen.getByText('3')).toBeInTheDocument() // liked count

      const updatedCounts = {
        ...mockBucketCounts,
        liked: 7
      }

      rerender(
        <BucketNavigation
          currentBucket="new_properties"
          bucketCounts={updatedCounts}
          onBucketChange={mockOnBucketChange}
        />
      )

      expect(screen.getByText('7')).toBeInTheDocument()
      expect(screen.queryByText('3')).not.toBeInTheDocument()
    })
  })
})