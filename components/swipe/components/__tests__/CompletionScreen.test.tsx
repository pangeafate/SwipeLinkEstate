/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import CompletionScreen from '../CompletionScreen'

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

const mockBucketCounts = {
  liked: 3,
  disliked: 2,
  considering: 1,
  remaining: 0
}

describe('CompletionScreen', () => {
  it('should display completion message and bucket counts', () => {
    // ARRANGE & ACT
    render(
      <CompletionScreen
        bucketCounts={mockBucketCounts}
        onRestart={jest.fn()}
      />
    )

    // ASSERT
    expect(screen.getByText("You've viewed all properties!")).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument() // liked count
    expect(screen.getByText('1')).toBeInTheDocument() // considering count
    expect(screen.getByText('2')).toBeInTheDocument() // disliked count
  })

  it('should call onRestart when Start Over button is clicked', () => {
    // ARRANGE
    const handleRestart = jest.fn()
    render(
      <CompletionScreen
        bucketCounts={mockBucketCounts}
        onRestart={handleRestart}
      />
    )

    // ACT
    fireEvent.click(screen.getByText('Start Over'))

    // ASSERT
    expect(handleRestart).toHaveBeenCalledTimes(1)
  })

  it('should handle empty state when no properties are available', () => {
    // ARRANGE & ACT
    render(
      <CompletionScreen
        bucketCounts={mockBucketCounts}
        onRestart={jest.fn()}
        isEmpty={true}
      />
    )

    // ASSERT
    expect(screen.getByText('No properties available')).toBeInTheDocument()
    expect(screen.getByText('Check back later for new listings')).toBeInTheDocument()
  })
})