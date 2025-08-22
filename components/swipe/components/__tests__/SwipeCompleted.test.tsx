/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SwipeCompleted from '../SwipeCompleted'

const mockBucketCounts = {
  liked: 8,
  disliked: 12,
  considering: 5,
  remaining: 0
}

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

describe('SwipeCompleted', () => {
  const mockOnStartOver = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render completion message', () => {
    // ARRANGE & ACT
    render(
      <SwipeCompleted
        bucketCounts={mockBucketCounts}
        onStartOver={mockOnStartOver}
      />
    )

    // ASSERT
    expect(screen.getByText("You've viewed all properties!")).toBeInTheDocument()
    expect(screen.getByText('Great job exploring the listings. Here\'s what you decided:')).toBeInTheDocument()
  })

  it('should display bucket counts correctly', () => {
    // ARRANGE & ACT
    render(
      <SwipeCompleted
        bucketCounts={mockBucketCounts}
        onStartOver={mockOnStartOver}
      />
    )

    // ASSERT
    expect(screen.getByText('8')).toBeInTheDocument() // liked
    expect(screen.getByText('12')).toBeInTheDocument() // disliked
    expect(screen.getByText('5')).toBeInTheDocument() // considering
    
    expect(screen.getByText('Liked')).toBeInTheDocument()
    expect(screen.getByText('Considering')).toBeInTheDocument()
    expect(screen.getByText('Passed')).toBeInTheDocument()
  })

  it('should handle start over button click', () => {
    // ARRANGE
    render(
      <SwipeCompleted
        bucketCounts={mockBucketCounts}
        onStartOver={mockOnStartOver}
      />
    )

    // ACT
    fireEvent.click(screen.getByRole('button', { name: /start over/i }))

    // ASSERT
    expect(mockOnStartOver).toHaveBeenCalled()
  })

  it('should show celebration emoji', () => {
    // ARRANGE & ACT
    render(
      <SwipeCompleted
        bucketCounts={mockBucketCounts}
        onStartOver={mockOnStartOver}
      />
    )

    // ASSERT
    expect(screen.getByText('🎉')).toBeInTheDocument()
  })

  it('should show category emojis', () => {
    // ARRANGE & ACT
    render(
      <SwipeCompleted
        bucketCounts={mockBucketCounts}
        onStartOver={mockOnStartOver}
      />
    )

    // ASSERT
    expect(screen.getByText('❤️')).toBeInTheDocument()
    expect(screen.getByText('🤔')).toBeInTheDocument()
    expect(screen.getByText('❌')).toBeInTheDocument()
  })
})