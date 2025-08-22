/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SwipeHeader from '../SwipeHeader'

const mockBucketCounts = {
  liked: 5,
  disliked: 3,
  considering: 2,
  remaining: 10
}

describe('SwipeHeader', () => {
  const mockOnUndo = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render progress information', () => {
    // ARRANGE & ACT
    render(
      <SwipeHeader
        currentIndex={5}
        totalProperties={20}
        bucketCounts={mockBucketCounts}
        canUndo={true}
        isProcessing={false}
        onUndo={mockOnUndo}
      />
    )

    // ASSERT
    expect(screen.getByText('6 of 20')).toBeInTheDocument()
  })

  it('should render progress bar with correct width', () => {
    // ARRANGE & ACT
    render(
      <SwipeHeader
        currentIndex={4}
        totalProperties={20}
        bucketCounts={mockBucketCounts}
        canUndo={true}
        isProcessing={false}
        onUndo={mockOnUndo}
      />
    )

    // ASSERT
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveStyle('width: 20%')
  })

  it('should render bucket counts', () => {
    // ARRANGE & ACT
    render(
      <SwipeHeader
        currentIndex={5}
        totalProperties={20}
        bucketCounts={mockBucketCounts}
        canUndo={true}
        isProcessing={false}
        onUndo={mockOnUndo}
      />
    )

    // ASSERT
    expect(screen.getByText('5')).toBeInTheDocument() // liked
    expect(screen.getByText('3')).toBeInTheDocument() // disliked
    expect(screen.getByText('2')).toBeInTheDocument() // considering
  })

  it('should handle undo button click', () => {
    // ARRANGE
    render(
      <SwipeHeader
        currentIndex={5}
        totalProperties={20}
        bucketCounts={mockBucketCounts}
        canUndo={true}
        isProcessing={false}
        onUndo={mockOnUndo}
      />
    )

    // ACT
    fireEvent.click(screen.getByRole('button', { name: /undo/i }))

    // ASSERT
    expect(mockOnUndo).toHaveBeenCalled()
  })

  it('should disable undo button when cannot undo', () => {
    // ARRANGE & ACT
    render(
      <SwipeHeader
        currentIndex={0}
        totalProperties={20}
        bucketCounts={mockBucketCounts}
        canUndo={false}
        isProcessing={false}
        onUndo={mockOnUndo}
      />
    )

    // ASSERT
    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled()
  })

  it('should disable undo button when processing', () => {
    // ARRANGE & ACT
    render(
      <SwipeHeader
        currentIndex={5}
        totalProperties={20}
        bucketCounts={mockBucketCounts}
        canUndo={true}
        isProcessing={true}
        onUndo={mockOnUndo}
      />
    )

    // ASSERT
    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled()
  })
})